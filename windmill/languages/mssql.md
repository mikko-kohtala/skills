# Microsoft SQL Server Scripts

SQL scripts for MS SQL Server.

## Conventions

- Arguments: `@P1`, `@P2`, etc.
- Name parameters in comments: `-- @P1 name1 ({type})` or `-- @P2 name2 ({type}) = default`
- Returns query results as structured data

## Example

```sql
-- @P1 user_id (integer)
-- @P2 status (varchar) = 'active'

SELECT id, name, email, created_at
FROM users
WHERE id = @P1
  AND status = @P2
ORDER BY created_at DESC;
```
