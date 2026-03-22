# Windmill Quick Reference

Cheat sheet for common Windmill operations, CLI commands, and patterns.

## Essential CLI Commands

### Project Setup

```bash
wmill init                          # Bootstrap project
wmill workspace add                 # Add workspace
wmill sync pull                     # Download from workspace
wmill sync push                     # Upload to workspace
```

### Script Commands

```bash
wmill script generate-metadata      # Generate .lock and .yaml (run from repo root)
wmill script run f/folder/script    # Test script
wmill script list                   # List all scripts
wmill script show f/folder/script   # Show script details
```

### Flow Commands

```bash
wmill flow generate-locks --yes     # Generate locks for inline scripts (run from repo root)
wmill flow run f/folder/flow        # Test flow
wmill flow list                     # List all flows
wmill flow show f/folder/flow       # Show flow details
```

### App Commands

```bash
wmill app list                      # List all apps
wmill app show f/apps/dashboard     # Show app details
wmill app push f/apps/dashboard     # Push app to workspace
```

### Resource Commands

```bash
wmill resource-type list --schema   # List all available resource types
wmill resource list                 # List all resources
wmill resource show f/res/db        # Show resource details
```

### Development

```bash
wmill dev                           # Watch mode with auto-sync
wmill user whoami                   # Check authentication
wmill workspace list                # List workspaces
wmill workspace switch prod         # Switch workspace
```

## Script Conventions Cheat Sheet

### TypeScript (Bun - Fastest)

```typescript
export async function main(param: string) {
  return { result: param };
}
```

### TypeScript (Deno)

```typescript
import pkg from "npm:package";
export async function main(param: string) {
  return { result: param };
}
```

### Python

```python
def main(param: str):
    return {"result": param}
```

### Go

```go
package inner
func main(param string) (map[string]string, error) {
    return map[string]string{"result": param}, nil
}
```

### Bash

```bash
# Do NOT include #!/bin/bash
param1="$1"
echo "$param1"
```

### PostgreSQL

```sql
-- $1 param1 (text)
-- $2 param2 (int) = 10
SELECT * FROM table WHERE col = $1::text AND id = $2::int;
```

### Rust

```rust
use anyhow::anyhow;
use serde::Serialize;

fn main(param: String) -> anyhow::Result<String> {
    Ok(param)
}
```

## Resource Types (TypeScript)

```typescript
import * as wmill from "windmill-client";

// Common resource types
type Postgresql = {
  /* ... */
};
type Mysql = {
  /* ... */
};
type Stripe = {
  /* ... */
};

export async function main(
  db: RT.Postgresql, // PostgreSQL connection
  api: RT.Stripe // Stripe API key
) {
  // Use resources
}
```

## Windmill Client (wmill) - Most Used

### TypeScript

```typescript
import * as wmill from "windmill-client";

// State (persistent across runs)
await wmill.getState();
await wmill.setState({ count: 1 });

// Resources
await wmill.getResource("f/res/db");
await wmill.setResource(value, "f/res/db");

// Run scripts
await wmill.runScript("f/folder/script", null, { param: "value" });
await wmill.waitJob(jobId);
```

### Python

```python
import wmill

# State
wmill.get_state()
wmill.set_state({"count": 1})

# Resources
wmill.get_resource("f/res/db")
wmill.set_resource("f/res/db", value)

# Run scripts
wmill.run_script(path="f/folder/script", args={"param": "value"})
wmill.wait_job(job_id)
```

## Flow Module Types

### rawscript (Inline Code)

```yaml
id: step1
value:
  type: rawscript
  content: "!inline script.ts"
  language: bun
  input_transforms:
    param:
      type: javascript
      expr: "flow_input.param"
```

### script (Reference Existing)

```yaml
id: step2
value:
  type: script
  path: "f/folder/script"
  input_transforms:
    param:
      type: javascript
      expr: "results.step1"
```

### forloopflow (Iterate)

```yaml
id: loop
value:
  type: forloopflow
  iterator:
    type: javascript
    expr: "flow_input.items"
  parallel: true
  parallelism: 4
  modules:
    - id: process
      value: { /* ... */ }
```

### branchone (If/Else)

```yaml
id: branch
value:
  type: branchone
  branches:
    - summary: "Condition A"
      expr: "results.step1 > 10"
      modules: [/* ... */]
    - summary: "Condition B"
      expr: "results.step1 <= 10"
      modules: [/* ... */]
```

### branchall (Parallel Branches)

```yaml
id: parallel
value:
  type: branchall
  parallel: true
  branches:
    - summary: "Branch A"
      modules: [/* ... */]
    - summary: "Branch B"
      modules: [/* ... */]
```

## Parallelism Decision Guide

```
Need per-item monitoring/retries?
├─ Yes → ForLoopFlow (parallel: true)
└─ No
   ├─ Different logic per path? → BranchAll
   └─ Same logic, different inputs?
      ├─ Need isolation? → Multi-Instance (wmill.runScript)
      └─ Simple fan-out? → Promise.all / asyncio.gather
```

| Level | Mechanism | Best For |
|-------|-----------|----------|
| Flow-level | `forloopflow`, `branchall` | Batch with monitoring |
| Step-level | `Promise.all`, `asyncio.gather` | Quick API fan-out |
| Multi-instance | `wmill.runScript()` | Resource isolation |

### Step-Level Parallelism (In-Script)

```typescript
// TypeScript - Promise.all
const results = await Promise.all(
  items.map(async (item) => {
    const res = await fetch(url, { body: JSON.stringify({ item }) });
    return res.json();
  })
);
```

```python
# Python - asyncio.gather
import asyncio
results = await asyncio.gather(*[process(item) for item in items])
```

### Multi-Instance (Trigger Parallel Workflows)

```typescript
import * as wmill from "windmill-client";

// Trigger N workflows in parallel
const jobIds = await Promise.all(
  models.map((m) => wmill.runScript("f/flow/path", null, { model: m }))
);
// Wait for results
const results = await Promise.all(jobIds.map((id) => wmill.waitJob(id)));
```

See `PARALLELISM.md` for full guide.

## Flow Data References

```yaml
# Access flow inputs
expr: "flow_input.param_name"

# Access previous step results
expr: "results.step_id"
expr: "results.step_id.property"

# Loop iteration
expr: "flow_input.iter.value"   # Current item
expr: "flow_input.iter.index"   # Current index

# Resource reference
value: "$res:f/resources/db"
```

## Common Patterns

### Script with Resource

```typescript
type Postgresql = {
  /* db config */
};

export async function main(db: RT.Postgresql, query: string) {
  // Use db resource
  return { result: "data" };
}
```

### Script with State

```typescript
export async function main() {
  let state = (await wmill.getState()) || { count: 0 };
  state.count++;
  await wmill.setState(state);
  return state;
}
```

### Sequential Flow

```yaml
value:
  modules:
    - id: step1
      value: { type: rawscript, content: "!inline step1.ts", language: bun }
    - id: step2
      value:
        type: rawscript
        content: "!inline step2.ts"
        language: bun
        input_transforms:
          data:
            type: javascript
            expr: "results.step1"
```

### Parallel Processing Flow

```yaml
value:
  modules:
    - id: fetch
      value: { type: script, path: "f/data/fetch" }
    - id: process
      value:
        type: forloopflow
        parallel: true
        iterator: { type: javascript, expr: "results.fetch" }
        modules:
          - id: item
            value: { type: script, path: "f/data/process" }
```

## Project Structure

```
windmill-project/
├── wmill.yaml              # Project config
├── wmill-lock.yaml         # Lock file (auto-generated)
├── f/
│   ├── scripts/
│   │   ├── data/
│   │   │   ├── process.py
│   │   │   ├── process.lock.yaml
│   │   │   └── process.yaml
│   │   └── api/
│   ├── workflows/
│   │   ├── pipeline.flow/
│   │   │   ├── flow.yaml
│   │   │   ├── step1.ts
│   │   │   └── step1.lock.yaml
│   │   └── etl.flow/
│   ├── apps/
│   │   └── dashboard/
│   │       ├── app.yaml
│   │       └── app.json
│   └── resources/
│       ├── postgres.yaml
│       └── stripe.yaml
```

## Troubleshooting Quick Fixes

| Issue                     | Fix                                                                      |
| ------------------------- | ------------------------------------------------------------------------ |
| Metadata generation fails | Run from repo root: `cd /path/to/repo && wmill script generate-metadata` |
| Resource type not found   | List types: `wmill resource-type list --schema \| grep -i <name>`        |
| Sync push fails           | Check auth: `wmill user whoami`                                          |
| Flow locks not generating | Ensure `!inline path/to/script.ts` paths are correct                     |
| Script syntax error       | Check language conventions in SCRIPT_GUIDANCE.md                         |

## Development Workflow

```
1. Create → 2. Generate → 3. Test → 4. Deploy
   ↓            ↓            ↓         ↓
 Write code   metadata    run local  sync push
              or locks
```

**Scripts:**

```bash
# Edit f/folder/script.py
wmill script generate-metadata
wmill script run f/folder/script --data '{"param": "value"}'
wmill sync push
```

**Flows:**

```bash
# Edit f/folder/flow.flow/flow.yaml
wmill flow generate-locks --yes
wmill flow run f/folder/flow --data '{}'
wmill sync push
```

**Apps:**

```bash
# Edit f/apps/dashboard/app.json
wmill sync push
# Test in UI
```

## Supported Languages (23)

`bun`, `deno`, `python3`, `go`, `bash`, `postgresql`, `mysql`, `bigquery`, `snowflake`, `mssql`, `graphql`, `powershell`, `rust`, `php`, `csharp`, `java`, `ruby`, `docker`, `rest`, `ansible`, `nushell`, `bunnative`

## Important URLs

- **Docs**: [https://www.windmill.dev/docs](https://www.windmill.dev/docs)
- **OpenFlow**: [https://www.openflow.dev](https://www.openflow.dev)
- **Hub**: [https://hub.windmill.dev](https://hub.windmill.dev)
