# PowerShell Scripts

PowerShell for Windows automation and system administration.

## Conventions

- Arguments via `param` function on first line
- Supports typed parameters with defaults

## Example

```powershell
param($Name, $Count = 1, [int]$MaxRetries)

Write-Output "Hello $Name!"
Write-Output "Count: $Count, MaxRetries: $MaxRetries"

@{
    message = "Hello $Name"
    count = $Count
} | ConvertTo-Json
```
