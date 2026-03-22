# PostgreSQL Scripts

SQL scripts for PostgreSQL databases.

## Conventions

- Arguments: `$1::{type}`, `$2::{type}`, etc.
- Name parameters in comments: `-- $1 name1` or `-- $2 name = default`
- Returns query results as structured data

## Example

```sql
-- $1 user_id (integer)
-- $2 status (text) = 'active'

SELECT id, name, email, created_at
FROM users
WHERE id = $1::integer
  AND status = $2::text
ORDER BY created_at DESC;
```
