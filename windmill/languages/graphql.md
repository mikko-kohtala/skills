# GraphQL Scripts

GraphQL queries and mutations.

## Conventions

- Add needed arguments as query variables
- Configure endpoint and authentication via resources

## Example

```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    posts {
      title
      createdAt
    }
  }
}
```
