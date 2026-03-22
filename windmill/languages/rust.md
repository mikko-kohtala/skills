# Rust Scripts

Rust runtime with cargo dependencies support.

## Conventions

- Use `anyhow::Result` for error handling
- Define return type with `#[derive(Serialize)]`
- Serde already included
- For async functions, keep main sync and create runtime inside
- Do not call the main function

## Dependencies

Specify cargo dependencies in a doc comment:

```rust
//! ```cargo
//! [dependencies]
//! anyhow = "1.0.86"
//! reqwest = { version = "0.11", features = ["json"] }
//! ```
```

## Example

```rust
//! ```cargo
//! [dependencies]
//! anyhow = "1.0.86"
//! serde = { version = "1.0", features = ["derive"] }
//! ```

use anyhow::anyhow;
use serde::Serialize;

#[derive(Serialize, Debug)]
struct Output {
    message: String,
    count: i32,
}

fn main(name: String, count: i32) -> anyhow::Result<Output> {
    if name.is_empty() {
        return Err(anyhow!("name cannot be empty"));
    }

    Ok(Output {
        message: format!("Hello {}!", name),
        count,
    })
}
```
