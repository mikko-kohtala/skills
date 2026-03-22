# Windmill Parallelism Patterns

Complete guide to parallel execution in Windmill. Choose the right pattern based on observability needs, failure handling, and resource requirements.

## Overview

Three levels of parallelism:

| Level | Mechanism | Observability | Best For |
|-------|-----------|---------------|----------|
| **Flow-level** | forloopflow, branchall | Per-iteration jobs | Batch processing with monitoring |
| **Step-level** | Promise.all, asyncio.gather | Single job | Quick API fan-out |
| **Multi-instance** | Separate workflow runs | Per-workflow jobs | Resource isolation |

## Flow-Level Parallelism

### ForLoopFlow (Parallel Loop)

Process array items in parallel with Windmill-managed concurrency.

**When to use:**
- Need per-item observability in UI
- Want automatic retries per iteration
- Need to throttle parallelism (rate limits)
- Items are independent but results need aggregation

**Configuration:**

```yaml
id: parallel_process
value:
  type: forloopflow
  iterator:
    type: javascript
    expr: "flow_input.items"  # Must evaluate to array
  parallel: true              # Enable parallel execution
  parallelism: 4              # Max concurrent iterations (0 = unlimited)
  skip_failures: true         # Continue if some iterations fail
  modules:
    - id: process_item
      value:
        type: rawscript
        content: "!inline process_item.ts"
        language: bun
        input_transforms:
          item:
            type: javascript
            expr: "flow_input.iter.value"  # Current item
          index:
            type: javascript
            expr: "flow_input.iter.index"  # Current index
```

**Accessing loop results:**

```yaml
# After the loop, aggregate results
- id: aggregate
  value:
    type: rawscript
    content: "!inline aggregate.ts"
    language: bun
    input_transforms:
      all_results:
        type: javascript
        expr: "results.parallel_process"  # Array of all iteration outputs
```

**Complete example - Multi-model analysis:**

```yaml
summary: "Analyze repository with multiple AI models"
value:
  modules:
    - id: clone_repo
      value:
        type: rawscript
        content: "!inline clone.ts"
        language: bun
        input_transforms:
          url:
            type: javascript
            expr: "flow_input.repo_url"

    - id: analyze_models
      value:
        type: forloopflow
        iterator:
          type: javascript
          expr: "flow_input.models"  # ["claude-sonnet", "gpt-4", "gemini"]
        parallel: true
        parallelism: 3
        skip_failures: true
        modules:
          - id: analyze
            value:
              type: rawscript
              content: "!inline analyze_with_model.ts"
              language: bun
              input_transforms:
                model:
                  type: javascript
                  expr: "flow_input.iter.value"
                clone_path:
                  type: javascript
                  expr: "results.clone_repo.path"

    - id: aggregate_results
      value:
        type: rawscript
        content: |
          export async function main(results: any[], models: string[]) {
            const aggregated: Record<string, any> = {};
            results.forEach((r, i) => {
              aggregated[models[i]] = r;
            });
            return aggregated;
          }
        language: bun
        input_transforms:
          results:
            type: javascript
            expr: "results.analyze_models"
          models:
            type: javascript
            expr: "flow_input.models"

schema:
  type: object
  properties:
    repo_url:
      type: string
    models:
      type: array
      items:
        type: string
  required: ["repo_url", "models"]
```

### BranchAll (Parallel Branches)

Run different logic paths simultaneously.

**When to use:**
- Different operations that can run in parallel
- Each branch has distinct logic
- Need results from all branches

**Configuration:**

```yaml
id: parallel_operations
value:
  type: branchall
  parallel: true
  branches:
    - summary: "Fetch user data"
      skip_failure: false  # Fail flow if this branch fails
      modules:
        - id: fetch_users
          value:
            type: script
            path: "f/api/fetch_users"
            input_transforms: {}

    - summary: "Fetch analytics"
      skip_failure: true   # Continue even if this fails
      modules:
        - id: fetch_analytics
          value:
            type: script
            path: "f/api/fetch_analytics"
            input_transforms: {}

    - summary: "Fetch notifications"
      skip_failure: true
      modules:
        - id: fetch_notifications
          value:
            type: script
            path: "f/api/fetch_notifications"
            input_transforms: {}
```

**Accessing branch results:**

```yaml
# Results available as object with branch step IDs
- id: combine
  value:
    type: rawscript
    content: |
      export async function main(users: any, analytics: any, notifications: any) {
        return { users, analytics, notifications };
      }
    language: bun
    input_transforms:
      users:
        type: javascript
        expr: "results.fetch_users"
      analytics:
        type: javascript
        expr: "results.fetch_analytics"
      notifications:
        type: javascript
        expr: "results.fetch_notifications"
```

## Step-Level Parallelism (In-Script)

Execute parallel operations within a single script step.

### Promise.all (TypeScript/Bun)

**When to use:**
- Simple fan-out to multiple APIs
- Shared context (computed once, used by all)
- Don't need per-operation observability
- All operations share same timeout

```typescript
// f/analysis/multi_model_analyze.ts
export async function main(
  repo_files: string[],
  key_content: Record<string, string>,
  models: string[],
  litellm_url: string
) {
  // Shared context - computed once
  const prompt = buildPrompt(repo_files, key_content);

  // Parallel execution
  const results = await Promise.all(
    models.map(async (model) => {
      const start = Date.now();
      try {
        const response = await fetch(`${litellm_url}/v1/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await response.json();
        return {
          model,
          status: "ok",
          result: data.choices[0].message.content,
          latencyMs: Date.now() - start,
        };
      } catch (error) {
        return {
          model,
          status: "error",
          error: String(error),
          latencyMs: Date.now() - start,
        };
      }
    })
  );

  return {
    analyzedAt: new Date().toISOString(),
    results,
  };
}

function buildPrompt(files: string[], content: Record<string, string>): string {
  return `Analyze this repository:\n\nFiles: ${files.join(", ")}\n\nKey files:\n${
    Object.entries(content)
      .map(([k, v]) => `--- ${k} ---\n${v}`)
      .join("\n\n")
  }`;
}
```

### asyncio.gather (Python)

**Python equivalent for parallel execution:**

```python
# f/analysis/multi_model_analyze.py
import asyncio
import aiohttp
from datetime import datetime

async def main(
    repo_files: list[str],
    key_content: dict[str, str],
    models: list[str],
    litellm_url: str
):
    # Shared context
    prompt = build_prompt(repo_files, key_content)

    async with aiohttp.ClientSession() as session:
        # Parallel execution
        tasks = [
            analyze_with_model(session, litellm_url, model, prompt)
            for model in models
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    return {
        "analyzedAt": datetime.utcnow().isoformat(),
        "results": [
            r if not isinstance(r, Exception) else {"error": str(r)}
            for r in results
        ]
    }

async def analyze_with_model(session, url, model, prompt):
    import time
    start = time.time()
    try:
        async with session.post(
            f"{url}/v1/chat/completions",
            json={"model": model, "messages": [{"role": "user", "content": prompt}]}
        ) as resp:
            data = await resp.json()
            return {
                "model": model,
                "status": "ok",
                "result": data["choices"][0]["message"]["content"],
                "latencyMs": int((time.time() - start) * 1000)
            }
    except Exception as e:
        return {
            "model": model,
            "status": "error",
            "error": str(e),
            "latencyMs": int((time.time() - start) * 1000)
        }

def build_prompt(files, content):
    file_list = ", ".join(files)
    content_str = "\n\n".join(f"--- {k} ---\n{v}" for k, v in content.items())
    return f"Analyze this repository:\n\nFiles: {file_list}\n\nKey files:\n{content_str}"
```

## Multi-Instance Parallelism

Trigger separate workflow instances for complete isolation.

### When to use:
- Different models need different resources (GPU vs CPU)
- Different timeout requirements per model
- External systems trigger analysis per-model
- Need complete failure isolation

### Triggering via wmill.runScript()

```typescript
// f/orchestrator/parallel_workflows.ts
import * as wmill from "windmill-client";

export async function main(
  repo_url: string,
  models: string[]
) {
  // Trigger workflows in parallel
  const jobIds = await Promise.all(
    models.map((model) =>
      wmill.runScript(
        "f/analysis/single_model_analysis",  // Flow or script path
        null,  // Hash (null = latest)
        { repo_url, model },  // Input arguments
        false  // Not verbose
      )
    )
  );

  // Wait for all to complete and collect results
  const results = await Promise.all(
    jobIds.map(async (jobId, i) => {
      const result = await wmill.waitJob(jobId);
      return {
        model: models[i],
        jobId,
        result,
      };
    })
  );

  return results;
}
```

### Triggering via HTTP API

```bash
# Trigger multiple workflow instances
for model in claude-sonnet gpt-4 gemini-pro; do
  curl -X POST "https://windmill.example.com/api/w/workspace/jobs/run/f/analysis/single_model" \
    -H "Authorization: Bearer $WMILL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"repo_url\": \"$REPO_URL\", \"model\": \"$model\"}" &
done
wait

# Results available in Windmill UI or via API
```

## Decision Guide

```
Need per-item monitoring/retries?
├─ Yes → ForLoopFlow (parallel: true)
└─ No
   ├─ Different logic per branch? → BranchAll
   └─ Same logic, different inputs?
      ├─ Need resource isolation? → Multi-Instance
      └─ Simple fan-out? → Promise.all / asyncio.gather
```

## Comparison Matrix

| Aspect | ForLoopFlow | BranchAll | Promise.all | Multi-Instance |
|--------|-------------|-----------|-------------|----------------|
| **Observability** | Per-iteration | Per-branch | Single job | Per-workflow |
| **Failure isolation** | skip_failures | skip_failure | try-catch | Complete |
| **Retry support** | Native | Native | Manual | Native |
| **Shared context** | Via input_transforms | Via input_transforms | In-memory | None |
| **Timeout control** | Per-iteration | Per-branch | Single | Per-workflow |
| **Throttling** | parallelism: N | N/A | Manual | N/A |
| **Resource isolation** | Same worker pool | Same worker pool | Same worker | Separate workers |
| **Best for** | Batch items | Different ops | API fan-out | Heavy isolation |
