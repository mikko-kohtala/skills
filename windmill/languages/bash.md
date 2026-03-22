# Bash Scripts

Shell scripts for system commands and CLI operations.

## Conventions

- Do **not** include `#!/bin/bash` shebang
- Arguments accessed as: `var1="$1"`, `var2="$2"`, etc.
- Return data via stdout (JSON for structured data)

## Example

```bash
# Arguments
name="$1"
count="$2"

# Logic
echo "Hello $name! Count: $count"

# Return JSON
echo "{\"message\": \"Hello $name\", \"count\": $count}"
```
