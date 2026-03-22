---
name: windmill
description: "Help users create Windmill scripts, workflows, and apps. Use when user mentions workflow automation, creating internal tools, Windmill CLI, or OpenFlow YAML. Supports 23 languages - see languages/ directory for each."
license: MIT
---

# Windmill Skill

Guide agents helping users CREATE Windmill projects (scripts, flows, apps).

## What is Windmill?

Windmill is an open-source developer platform for building internal tools, workflows, API integrations, and UIs. Alternative to Retool, n8n, and Airflow.

**Core Components:**

- **Scripts**: Individual functions (Python, TypeScript, Go, Bash, SQL, Rust, C#, Java, Ruby, Docker, REST/GraphQL, Ansible, etc.)
- **Flows**: YAML-based workflows (OpenFlow standard) - DAGs composing scripts together
- **Apps**: User-facing dashboards and interfaces

**Key Features:**

- Auto-generated UIs from function signatures
- Automatic dependency management
- Resource management for credentials
- Git sync capabilities
- Job scheduling and queuing

## When to Use This Skill

Use this skill when the user:

- Mentions creating workflows, automation, or internal tools
- Asks about Windmill CLI commands or setup
- Wants to write scripts in Windmill-supported languages
- Needs to create OpenFlow YAML workflow specifications
- Asks about deploying or testing Windmill projects

**Example Triggers:**

- "Help me create a Windmill workflow"
- "How do I write a Python script for Windmill?"
- "What's the Windmill CLI command for...?"
- "I need to set up automated data processing with Windmill"
- "How do I create an internal tool with Windmill?"

## Quick Start

### Creating a Script

1. **Ask user for folder path** (e.g., `f/workflows/data_processing/` or `u/username/`)
2. **Prefer CLI bootstrap** (modern approach):
   ```bash
   wmill script bootstrap f/my_folder/my_script python3
   # Creates content file + .yaml metadata + .lock in one command
   ```
3. **Alternative: Helper tool** (if CLI unavailable or template desired):
   ```bash
   ./tools/init-script.sh  # Interactive wizard with language templates
   ```
4. **Or create manually**: Write script following language conventions (see SCRIPT_GUIDANCE.md)
5. **Generate/update metadata** after manual edits:
   ```bash
   wmill script generate-metadata               # all changed scripts
   wmill script generate-metadata f/path/script # single script
   ```
6. **Test**: `wmill script run f/folder/script --data '{"param": "value"}'`
7. **Deploy**: `wmill sync push`

### Creating a Flow

1. **Ask user for folder path** (must end with `.flow`, e.g., `f/workflows/pipeline.flow/`)
2. **Prefer CLI bootstrap** (modern approach):
   ```bash
   wmill flow bootstrap f/workflows/my_flow
   # Scaffolds flow.yaml with basic structure
   ```
3. **Alternative: Helper tool** (for template-based start):
   ```bash
   ./tools/init-flow.sh  # Interactive wizard with 6 flow templates
   ```
4. **Or create manually**: Create `flow.yaml` and inline scripts (see WORKFLOW_GUIDANCE.md)
5. **Generate locks** for inline scripts:
   ```bash
   wmill flow generate-locks --yes  # Creates dependency locks
   ```
6. **Test**: `wmill flow run f/workflows/flow --data '{}'`
7. **Deploy**: `wmill sync push`

### Creating an App

1. Ask user for folder location
2. Use `tools/init-app.sh` for interactive scaffolding
3. Deploy with `wmill sync push`

## Language-Specific Guidance

**IMPORTANT:** When writing scripts, read the language file from `languages/` directory for conventions and examples.

### Language File Lookup

| User wants           | Read file                 |
| -------------------- | ------------------------- |
| TypeScript (fastest) | `languages/bun.md`        |
| TypeScript (Deno)    | `languages/deno.md`       |
| Python               | `languages/python3.md`    |
| Go                   | `languages/go.md`         |
| Rust                 | `languages/rust.md`       |
| Bash/shell           | `languages/bash.md`       |
| PHP                  | `languages/php.md`        |
| PostgreSQL           | `languages/postgresql.md` |
| MySQL                | `languages/mysql.md`      |
| BigQuery             | `languages/bigquery.md`   |
| Snowflake            | `languages/snowflake.md`  |
| SQL Server           | `languages/mssql.md`      |
| GraphQL              | `languages/graphql.md`    |
| PowerShell           | `languages/powershell.md` |
| C# / .NET            | `languages/csharp.md`     |
| Java                 | `languages/java.md`       |
| Ruby                 | `languages/ruby.md`       |
| Docker               | `languages/docker.md`     |
| REST API             | `languages/rest.md`       |
| Ansible              | `languages/ansible.md`    |
| Nu shell             | `languages/nushell.md`    |

Each language file contains: conventions, resource types (if applicable), wmill client API (TypeScript/Python), and examples.

### Default Language Recommendations

- **General automation**: `bun` (TypeScript) or `python3`
- **Database queries**: Use the matching SQL dialect file
- **System scripts**: `bash`
- **Infrastructure**: `ansible` or `docker`

## Comprehensive Guidance Files

This skill includes detailed reference files:

**For Scripts:**

- `SCRIPT_GUIDANCE.md` - General principles, workflow, language index
- `languages/*.md` - Language-specific conventions (23 languages)

**For Flows:**
Read `WORKFLOW_GUIDANCE.md` in this skill directory for:

- Complete OpenFlow YAML specification
- All module types (rawscript, script, flow, loops, branches)
- Input transforms and data flow patterns
- Advanced properties (error handling, retry, suspend/approval)

**For Parallelism:**
Read `PARALLELISM.md` in this skill directory for:

- Flow-level parallelism (forloopflow, branchall)
- Step-level parallelism (Promise.all, asyncio.gather)
- Multi-instance parallelism (separate workflow runs)
- Decision guide for choosing the right approach

**For Apps:**
Read `APP_GUIDANCE.md` in this skill directory for:

- App builder component reference
- Layout patterns and UI composition
- App-script interaction patterns

**For CLI:**
Read `WINDMILL_CLI.md` in this skill directory for:

- Complete CLI command reference
- Common command sequences
- Development workflows

**For Patterns:**
Read `PATTERNS.md` in this skill directory for:

- Development patterns with code examples
- Testing strategies
- Deployment patterns (single env, multi-env, CI/CD)
- Debugging strategies
- Team collaboration workflows

**For Quick Reference:**
Read `QUICKREF.md` in this skill directory for:

- Most common CLI commands (cheat sheet)
- Script conventions at-a-glance
- Flow module types reference

## Helper Tools (Optional)

These tools provide alternative scaffolding options when `wmill bootstrap` commands are unavailable or when you want opinionated templates.

### tools/init-script.sh (Alternative to CLI bootstrap)

Interactive script scaffolding wizard - useful when CLI bootstrap isn't available or you want language-specific templates.

Features:

- 23 language choices (see Language File Lookup table above)
- Interactive prompts for folder path and script name
- Pre-configured templates with best practices
- Automatic metadata generation

**Usage:**

```bash
cd /path/to/windmill/repo
/path/to/skills/windmill/tools/init-script.sh
```

**Note:** Prefer `wmill script bootstrap` for modern CLI-based scaffolding.

### tools/init-flow.sh (Alternative to CLI bootstrap)

Interactive flow scaffolding wizard with 6 production-ready templates.

Features:

- Templates: simple sequential, API integration, data processing, approval workflow, parallel processing, empty
- Auto-generates flow.yaml with inline scripts
- Proper OpenFlow structure
- Automatic lock generation

**Usage:**

```bash
cd /path/to/windmill/repo
/path/to/skills/windmill/tools/init-flow.sh
```

**Note:** Prefer `wmill flow bootstrap` for simple scaffolding; use this tool for template-based workflows.

### tools/init-app.sh

Interactive app scaffolding wizard (no CLI equivalent yet).

Features:

- 6 app templates: dashboard, form, admin panel, real-time, master-detail, blank
- Complete app.yaml and app.json generation
- Production-ready component structures
- Optional workspace push

**Usage:**

```bash
cd /path/to/windmill/repo
/path/to/skills/windmill/tools/init-app.sh
```

## Common CLI Sequences

### Initial Project Setup

```bash
wmill init                    # Bootstrap project with wmill.yaml
wmill workspace add           # Configure workspace
wmill sync pull               # Pull existing resources
```

### Development Loop

```bash
# Make changes to scripts/flows
wmill script generate-metadata  # or wmill flow generate-locks --yes
wmill sync push                 # Deploy changes
```

### Testing

```bash
wmill script run f/folder/script  # Test script execution
wmill flow run f/folder/flow      # Test flow execution
```

### Development Mode (Live Reload)

```bash
wmill dev  # Watch files and auto-sync changes
```

## Best Practices

### Project Organization

- Use folder structure: `f/category/subcategory/`
- Scripts: Individual files in folders
- Flows: Folders ending with `.flow/` containing `flow.yaml`
- Apps: Folders in `f/apps/`
- Resources: Centralize in `f/resources/`

### Development Workflow

1. **Always generate metadata**: Don't create `.lock` or `.yaml` manually
2. **Test before push**: Use `wmill script run` or `wmill flow run`
3. **Use sync**: Prefer `wmill sync push/pull` over individual commands
4. **Development mode**: Use `wmill dev` for rapid iteration
5. **Resource types**: Check available types with `wmill resource-type list --schema`

### Script Best Practices

- Keep scripts focused (single responsibility)
- Use resources for credentials, not hardcoded values
- Use `wmill.getState()` for persistence across runs
- Add proper JSON Schema for parameters
- Return structured data for flow integration

### Flow Best Practices

- Use `rawscript` for simple inline logic
- Use `script` references for reusable code
- Prefer `parallel: true` for independent operations
- Add `failure_module` for critical workflows
- Use meaningful step IDs for debugging

## Agent Usage Guide

### Quick Start for AI Agents

When helping users with Windmill:

1. **Clarify user goal**: script, flow, app, resource, or schedule?
2. **Ask for folder path early** (e.g., `f/integrations/stripe/` or `u/username/`)
3. **For scripts**:
   - Determine language → Read corresponding `languages/*.md` file
   - Use `wmill script bootstrap` OR scaffold manually following language conventions
   - Run `wmill script generate-metadata`
   - Test with `wmill script run`; deploy with `wmill sync push`
4. **For flows**: Use `wmill flow bootstrap` OR scaffold with `init-flow.sh`; author inline scripts; run `wmill flow generate-locks --yes`; test with `wmill flow run`; deploy with sync
5. **For apps**: Use `init-app.sh` for scaffolding; push with `wmill sync push`
6. **Always confirm resource types** via `wmill resource-type list --schema` before assuming names
7. **Encourage dev mode** (`wmill dev`) for iterative development

### Conversation Example

**User:** "Create a Stripe customer creation script"

**Agent workflow:**

1. Ask for target folder (e.g., `f/integrations/stripe/`) and language preference
2. Read the language file (e.g., `languages/bun.md` or `languages/python3.md`)
3. Check resource type existence: `wmill resource-type list --schema | grep -i stripe`
4. Scaffold script following language conventions with Stripe resource parameter
5. Generate metadata: `wmill script generate-metadata`
6. Offer test command with sample data/resource reference
7. Suggest: `wmill sync push` to deploy

### Safety & Secrets

- **Never hardcode credentials** - always use resources or secret variables
- **Remind users** to store API keys as resources or secrets before usage
- **Validate** that returned data excludes secrets
- **Use resources** for database connections, API keys, OAuth tokens
- **Check resource types** before scaffolding: `wmill resource-type list --schema`

### Out of Scope

This skill focuses on USING Windmill (creating scripts/flows/apps). It excludes:

- Contributing to Windmill core platform (Rust backend, Svelte frontend, CLI internals)
- Modifying Windmill source code
- Windmill platform architecture

For platform development questions, refer users to official Windmill contributor documentation.

## Troubleshooting

### Common Issues

**Metadata generation fails:**

- Run from repository root
- Ensure script file exists and has valid syntax
- Check language is supported

**Sync push fails:**

- Verify workspace is configured: `wmill workspace list`
- Check authentication: `wmill user whoami`
- Validate YAML syntax for flows

**Resource type not found:**

- List available types: `wmill resource-type list --schema`
- Check spelling and casing (TypeScript: `RT.Postgresql`, Python: `postgresql`)

**Flow locks not generating:**

- Ensure inline script paths are correct: `!inline path/to/script.ts`
- Check inline script files exist
- Verify YAML syntax is valid

For detailed patterns and examples, read the PATTERNS.md file in this skill directory.

## Additional Resources

- [Platform Docs](https://www.windmill.dev/docs)
- [OpenFlow Standard](https://www.openflow.dev)
- **Script Reference**: Read SCRIPT_GUIDANCE.md
- **Workflow Reference**: Read WORKFLOW_GUIDANCE.md
- **Parallelism Guide**: Read PARALLELISM.md
- **App Reference**: Read APP_GUIDANCE.md
- **CLI Reference**: Read WINDMILL_CLI.md
- **Workflow Patterns**: Read PATTERNS.md
- **Quick Reference**: Read QUICKREF.md
