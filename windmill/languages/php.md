# PHP Scripts

PHP runtime with Composer dependency support.

## Conventions

- Script must start with `<?php`
- Contains at least one function called `main`
- Do not call the main function

## Resource Types

**Redefine** resource types before main function.
Check if class exists using `class_exists` before defining.
Resource type name must be exactly as specified.

```php
<?php

if (!class_exists('stripe')) {
    class stripe {
        public string $api_key;
    }
}

function main(stripe $creds): array {
    // Use credentials
    return ["status" => "ok"];
}
```

## Dependencies

Specify composer packages in comments:

```php
<?php

// require:
// stripe/stripe-php
// guzzlehttp/guzzle@^7.0
```

One package per line. Autoload already included.

## Example

```php
<?php

// require:
// guzzlehttp/guzzle

function main(string $url): array {
    $client = new \GuzzleHttp\Client();
    $response = $client->get($url);

    return [
        "status" => $response->getStatusCode(),
        "body" => json_decode($response->getBody(), true)
    ];
}
```
