# Nu Shell Scripts

Nu shell scripting with structured data pipelines.

## Conventions

- Use `def main` with typed parameters
- Structured data pipeline approach
- Returns structured data naturally

## Example

```nu
def main [name: string, count: int = 1] {
  {
    message: $"Hello ($name)!"
    count: $count
    name_length: ($name | str length)
  }
}
```

## With Pipelines

```nu
def main [data: list<string>] {
  $data
  | each { |item| $item | str upcase }
  | wrap "processed"
}
```
