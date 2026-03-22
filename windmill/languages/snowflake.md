# Snowflake Scripts

SQL scripts for Snowflake data warehouse.

## Conventions

- Arguments: `?` placeholders (positional)
- Name parameters in comments: `-- ? name1 ({type})` or `-- ? name2 ({type}) = default`
- Returns query results as structured data

## Example

```sql
-- ? user_id (integer)
-- ? status (text) = 'active'

SELECT id, name, email, created_at
FROM users
WHERE id = ?
  AND status = ?
ORDER BY created_at DESC;
```
