# REST API Scripts

HTTP REST API calls with configurable methods, headers, and authentication.

## Conventions

- Configure HTTP method, URL, headers, body
- Authentication via resources
- Typically uses fetch-style configuration

## Example

REST scripts define API calls declaratively:

```yaml
method: POST
url: https://api.example.com/users
headers:
  Content-Type: application/json
  Authorization: Bearer ${token}
body:
  name: ${name}
  email: ${email}
```

Arguments are interpolated into the request configuration.
