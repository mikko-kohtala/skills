# Python Scripts

Python 3 runtime with automatic dependency management.

## Conventions

- Script contains at least one function called `main`
- Libraries are installed automatically
- Do not call the main function

## Resource Types

Credentials are passed as parameters to `main` using TypedDict definitions.

**Important:**
- **Redefine** resource types as TypedDict before main function
- Resource type name must be **lowercase** (e.g., `stripe`, `postgresql`)
- If an import conflicts with a resource type name, **rename the import, not the type**
- Import `TypedDict` from `typing` if using it

```python
from typing import TypedDict

class stripe(TypedDict):
    api_key: str

def main(stripe_creds: stripe):
    # Use credentials
    pass
```

## Windmill Client

```python
import wmill

# Resource operations
wmill.get_resource(path: str, none_if_undefined: bool = False) -> dict | None
wmill.set_resource(path: str, value: Any, resource_type: str = "any") -> None

# State management
wmill.get_state() -> Any
wmill.set_state(value: Any) -> None
wmill.get_flow_user_state(key: str) -> Any
wmill.set_flow_user_state(key: str, value: Any) -> None

# Variables
wmill.get_variable(path: str) -> str
wmill.set_variable(path: str, value: str, is_secret: bool = False) -> None

# Script execution
wmill.run_script(path: str = None, hash_: str = None, args: dict = None, timeout = None, verbose: bool = False) -> Any
wmill.run_script_async(path: str = None, hash_: str = None, args: dict = None, scheduled_in_secs: int = None) -> str
wmill.wait_job(job_id: str, timeout = None, verbose: bool = False) -> Any
wmill.get_result(job_id: str) -> Any

# S3 operations
wmill.load_s3_file(s3object: S3Object | str, s3_resource_path: str | None = None) -> bytes
wmill.write_s3_file(s3object: S3Object | str | None, file_content: BufferedReader | bytes, s3_resource_path: str | None = None) -> S3Object

# Utilities
wmill.get_workspace() -> str
wmill.whoami() -> dict
wmill.set_progress(value: int, job_id: Optional[str] = None) -> None
```

## Example

```python
from typing import TypedDict
import wmill

class postgresql(TypedDict):
    host: str
    port: int
    user: str
    password: str
    dbname: str

def main(db: postgresql, query: str):
    import psycopg2

    conn = psycopg2.connect(
        host=db["host"],
        port=db["port"],
        user=db["user"],
        password=db["password"],
        dbname=db["dbname"]
    )

    with conn.cursor() as cur:
        cur.execute(query)
        results = cur.fetchall()

    conn.close()
    return {"rows": results}
```

## Parallel Execution (asyncio.gather)

Use `asyncio.gather` for step-level parallelism - executing multiple async operations concurrently within a single script.

```python
import asyncio
import aiohttp
from datetime import datetime

async def main(urls: list[str], api_key: str):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url, api_key) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    # Handle exceptions in results
    processed = []
    for i, r in enumerate(results):
        if isinstance(r, Exception):
            processed.append({"url": urls[i], "status": "error", "error": str(r)})
        else:
            processed.append(r)

    return {
        "total": len(processed),
        "succeeded": len([r for r in processed if r["status"] == "ok"]),
        "results": processed
    }

async def fetch_url(session, url: str, api_key: str):
    import time
    start = time.time()
    try:
        async with session.get(url, headers={"Authorization": f"Bearer {api_key}"}) as resp:
            data = await resp.json()
            return {
                "url": url,
                "status": "ok",
                "data": data,
                "latencyMs": int((time.time() - start) * 1000)
            }
    except Exception as e:
        return {
            "url": url,
            "status": "error",
            "error": str(e),
            "latencyMs": int((time.time() - start) * 1000)
        }
```

### Multi-Model Analysis Pattern

```python
import asyncio
import aiohttp

async def main(prompt: str, models: list[str], litellm_url: str):
    async with aiohttp.ClientSession() as session:
        tasks = [
            call_model(session, litellm_url, model, prompt)
            for model in models
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    return [
        r if not isinstance(r, Exception) else {"error": str(r)}
        for r in results
    ]

async def call_model(session, url: str, model: str, prompt: str):
    async with session.post(
        f"{url}/v1/chat/completions",
        json={"model": model, "messages": [{"role": "user", "content": prompt}]}
    ) as resp:
        data = await resp.json()
        return {"model": model, "result": data["choices"][0]["message"]["content"]}
```

### Triggering Parallel Workflows

```python
import wmill
import asyncio

async def main(items: list[str]):
    # Trigger separate workflow instances in parallel
    job_ids = await asyncio.gather(*[
        asyncio.to_thread(
            wmill.run_script_async,
            path="f/workflows/process_item",
            args={"item": item}
        )
        for item in items
    ])

    # Wait for all to complete
    results = await asyncio.gather(*[
        asyncio.to_thread(wmill.wait_job, job_id)
        for job_id in job_ids
    ])

    return results
```

See `PARALLELISM.md` for full parallelism guide including flow-level patterns.
