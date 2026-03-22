# Go Scripts

Go runtime for compiled, type-safe scripts.

## Conventions

- File package must be `inner`
- Export single function called `main`
- Return type: `({return_type}, error)`
- Do not call the main function

## Example

```go
package inner

import "fmt"

func main(name string, count int) (map[string]interface{}, error) {
    result := map[string]interface{}{
        "message": fmt.Sprintf("Hello %s!", name),
        "count":   count,
    }
    return result, nil
}
```
