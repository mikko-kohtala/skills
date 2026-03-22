# BigQuery Scripts

SQL scripts for Google BigQuery.

## Conventions

- Arguments: `@name1`, `@name2`, etc. (named parameters)
- Name parameters in comments: `-- @name1 ({type})` or `-- @name2 ({type}) = default`
- Returns query results as structured data

## Example

```sql
-- @user_id (integer)
-- @status (string) = 'active'

SELECT id, name, email, created_at
FROM `project.dataset.users`
WHERE id = @user_id
  AND status = @status
ORDER BY created_at DESC;
```
