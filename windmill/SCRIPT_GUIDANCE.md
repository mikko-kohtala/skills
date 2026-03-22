# Windmill Script Writing Guide

Complete reference for writing scripts in Windmill. Language-specific guidance is in the `languages/` directory.

## General Principles

On Windmill, scripts are executed in isolated environments with specific conventions:

- Scripts must export a main function
- Do not call the main function
- Libraries are installed automatically - do not show installation instructions
- Credentials and configuration are stored in resources and passed as parameters
- The windmill client (wmill) provides APIs for interacting with the platform
- You can use `wmill resource-type list --schema` to list all resource types available

## Workflow

1. Each script should be placed in a folder. Ask the user in which folder they want the script located before starting.
2. After writing a script, run `wmill script generate-metadata` to create .lock and .yaml files automatically.
3. After writing the script, ask the user if they want to push with `wmill sync push`. Both should be run at the repository root.

## Language Reference

See `languages/` directory for language-specific conventions and examples.

### TypeScript Variants

| Language  | File                                             | Description                         |
| --------- | ------------------------------------------------ | ----------------------------------- |
| bun       | [languages/bun.md](languages/bun.md)             | Fastest runtime, full npm ecosystem |
| deno      | [languages/deno.md](languages/deno.md)           | Secure by default, modern imports   |
| bunnative | [languages/bunnative.md](languages/bunnative.md) | Lightweight Bun runtime             |

### General Purpose

| Language | File                                         | Description                        |
| -------- | -------------------------------------------- | ---------------------------------- |
| python3  | [languages/python3.md](languages/python3.md) | Python with automatic dependencies |
| go       | [languages/go.md](languages/go.md)           | Compiled, type-safe                |
| rust     | [languages/rust.md](languages/rust.md)       | Cargo dependencies support         |
| ruby     | [languages/ruby.md](languages/ruby.md)       | Automatic gem installation         |
| php      | [languages/php.md](languages/php.md)         | Composer dependencies              |

### JVM Languages

| Language | File                                       | Description        |
| -------- | ------------------------------------------ | ------------------ |
| java     | [languages/java.md](languages/java.md)     | Maven dependencies |
| csharp   | [languages/csharp.md](languages/csharp.md) | .NET with NuGet    |

### Shell

| Language   | File                                               | Description               |
| ---------- | -------------------------------------------------- | ------------------------- |
| bash       | [languages/bash.md](languages/bash.md)             | Shell scripts             |
| powershell | [languages/powershell.md](languages/powershell.md) | Windows automation        |
| nushell    | [languages/nushell.md](languages/nushell.md)       | Structured data pipelines |

### SQL Databases

| Language   | File                                               | Description         |
| ---------- | -------------------------------------------------- | ------------------- |
| postgresql | [languages/postgresql.md](languages/postgresql.md) | PostgreSQL queries  |
| mysql      | [languages/mysql.md](languages/mysql.md)           | MySQL queries       |
| bigquery   | [languages/bigquery.md](languages/bigquery.md)     | Google BigQuery     |
| snowflake  | [languages/snowflake.md](languages/snowflake.md)   | Snowflake warehouse |
| mssql      | [languages/mssql.md](languages/mssql.md)           | MS SQL Server       |

### API & Infrastructure

| Language | File                                         | Description               |
| -------- | -------------------------------------------- | ------------------------- |
| rest     | [languages/rest.md](languages/rest.md)       | HTTP REST calls           |
| graphql  | [languages/graphql.md](languages/graphql.md) | GraphQL queries           |
| docker   | [languages/docker.md](languages/docker.md)   | Containerized scripts     |
| ansible  | [languages/ansible.md](languages/ansible.md) | Infrastructure automation |

## Supported Languages

All available language identifiers:

`bun`, `deno`, `bunnative`, `python3`, `go`, `rust`, `bash`, `php`, `postgresql`, `mysql`, `bigquery`, `snowflake`, `mssql`, `graphql`, `powershell`, `csharp`, `java`, `ruby`, `docker`, `rest`, `ansible`, `nushell`
