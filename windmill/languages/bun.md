# Bun TypeScript Scripts

TypeScript runtime using Bun - fastest execution, full npm ecosystem.

## Conventions

- Export a single **async** function called `main`
- Libraries are installed automatically
- Full npm ecosystem available
- Do not call the main function

## Resource Types

Credentials and configuration are stored in resources and passed as parameters to `main`.
Use the `RT` namespace for resource types: `RT.Stripe`, `RT.Postgresql`, etc.

```typescript
import * as wmill from "windmill-client";

export async function main(stripe: RT.Stripe) {
  // Use stripe credentials
}
```

## Windmill Client

```typescript
import * as wmill from "windmill-client";

// Resource operations
wmill.getResource(path?: string, undefinedIfEmpty?: boolean): Promise<any>
wmill.setResource(value: any, path?: string, initializeToTypeIfNotExist?: string): Promise<void>

// State management (persistent across executions)
wmill.getState(): Promise<any>
wmill.setState(state: any): Promise<void>

// Variables
wmill.getVariable(path: string): Promise<string>
wmill.setVariable(path: string, value: string, isSecretIfNotExist?: boolean, descriptionIfNotExist?: string): Promise<void>

// Script execution
wmill.runScript(path?: string | null, hash_?: string | null, args?: Record<string, any> | null, verbose?: boolean): Promise<any>
wmill.runScriptAsync(path: string | null, hash_: string | null, args: Record<string, any> | null, scheduledInSeconds?: number | null): Promise<string>
wmill.waitJob(jobId: string, verbose?: boolean): Promise<any>
wmill.getResult(jobId: string): Promise<any>
wmill.getRootJobId(jobId?: string): Promise<string>

// S3 file operations (if S3 is configured)
wmill.loadS3File(s3object: S3Object, s3ResourcePath?: string | undefined): Promise<Uint8Array | undefined>
wmill.writeS3File(s3object: S3Object | undefined, fileContent: string | Blob, s3ResourcePath?: string | undefined): Promise<S3Object>

// Flow operations
wmill.setFlowUserState(key: string, value: any, errorIfNotPossible?: boolean): Promise<void>
wmill.getFlowUserState(key: string, errorIfNotPossible?: boolean): Promise<any>
wmill.getResumeUrls(approver?: string): Promise<{approvalPage: string, resume: string, cancel: string}>
```

## Example

```typescript
import * as wmill from "windmill-client";

export async function main(name: string, count: number = 1) {
  const state = await wmill.getState() || { runs: 0 };
  state.runs += 1;
  await wmill.setState(state);

  return {
    message: `Hello ${name}!`,
    count,
    totalRuns: state.runs
  };
}
```

## Parallel Execution (Promise.all)

Use `Promise.all` for step-level parallelism - executing multiple async operations concurrently within a single script.

```typescript
export async function main(
  urls: string[],
  api_key: string
) {
  // Execute all requests in parallel
  const results = await Promise.all(
    urls.map(async (url) => {
      const start = Date.now();
      try {
        const response = await fetch(url, {
          headers: { "Authorization": `Bearer ${api_key}` }
        });
        const data = await response.json();
        return {
          url,
          status: "ok",
          data,
          latencyMs: Date.now() - start
        };
      } catch (error) {
        return {
          url,
          status: "error",
          error: String(error),
          latencyMs: Date.now() - start
        };
      }
    })
  );

  return {
    total: results.length,
    succeeded: results.filter(r => r.status === "ok").length,
    results
  };
}
```

### Multi-Model Analysis Pattern

```typescript
export async function main(
  prompt: string,
  models: string[],
  litellm_url: string
) {
  const results = await Promise.all(
    models.map(async (model) => {
      const response = await fetch(`${litellm_url}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      return { model, result: data.choices[0].message.content };
    })
  );
  return results;
}
```

### Triggering Parallel Workflows

```typescript
import * as wmill from "windmill-client";

export async function main(items: string[]) {
  // Trigger separate workflow instances in parallel
  const jobIds = await Promise.all(
    items.map((item) =>
      wmill.runScriptAsync("f/workflows/process_item", null, { item })
    )
  );

  // Wait for all to complete
  const results = await Promise.all(
    jobIds.map((id) => wmill.waitJob(id))
  );

  return results;
}
```

See `PARALLELISM.md` for full parallelism guide including flow-level patterns.
