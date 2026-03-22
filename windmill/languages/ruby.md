# Ruby Scripts

Ruby runtime with automatic gem installation.

## Conventions

- Script contains at least one function called `main`
- Libraries are installed automatically
- Do not call the main function

## Resource Types

Add resource type parameter (lowercase) to `main` function.

## Example

```ruby
def main(name, count = 1)
  {
    message: "Hello #{name}!",
    count: count
  }
end
```

## With Dependencies

```ruby
require 'httparty'

def main(url)
  response = HTTParty.get(url)

  {
    status: response.code,
    body: response.parsed_response
  }
end
```
