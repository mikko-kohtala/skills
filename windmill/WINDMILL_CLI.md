# Windmill CLI Commands Reference

Complete reference for the `wmill` CLI tool. This reference is extracted from the Windmill codebase guidance files.

## Global Options

All commands support these global options:

- `--workspace <workspace>` - Specify target workspace
- `--token <token>` - Specify API token
- `--base-url <url>` - Specify Windmill instance URL
- `--config-dir <dir>` - Custom configuration directory
- `--debug` / `--verbose` - Enable debug logging
- `--show-diffs` - Show detailed diff information during sync

## Core Commands

### `wmill init`

Bootstrap a new Windmill project with a `wmill.yaml` configuration file

**Options:**

- `--use-default` - Use default settings without checking backend
- `--use-backend` - Use backend git-sync settings if available
- `--repository <repo>` - Specify repository path when using backend settings (e.g., `u/user/repo`)
- `--bind-profile` - Automatically bind active workspace profile to current Git branch
- `--no-bind-profile` - Skip workspace profile binding prompt

**Usage:**

```bash
wmill init                    # Interactive setup
wmill init --use-default      # Skip backend check
wmill init --bind-profile     # Auto-bind workspace to branch
```

**Creates:**

- `wmill.yaml` - Project configuration file
- `wmill-lock.yaml` - Lock file for tracking state
- `.cursor/rules/script.mdc` - Script guidance for Cursor IDE
- `.cursor/rules/flow.mdc` - Flow guidance for Cursor IDE
- `CLAUDE.md` - Claude AI guidance file

### `wmill version`

Display CLI and backend version information

```bash
wmill version
```

Shows:

- Current CLI version
- Checks for available updates
- Backend version (if workspace configured)

### `wmill upgrade`

Upgrade the CLI to the latest version available on npm

```bash
wmill upgrade
```

## Authentication & Workspace Management

### `wmill workspace`

Manage Windmill workspaces

**Subcommands:**

- `add` - Add a new workspace configuration
- `list` - List all configured workspaces
- `switch <workspace>` - Switch to a specific workspace
- `remove <workspace>` - Remove a workspace configuration

**Usage:**

```bash
wmill workspace add           # Interactive workspace setup
wmill workspace list          # Show all workspaces
wmill workspace switch prod   # Switch to 'prod' workspace
wmill workspace remove dev    # Remove 'dev' workspace
```

### `wmill user`

User management operations

**Subcommands:**

- `list` - List users in the workspace
- `whoami` - Show current user information

**Usage:**

```bash
wmill user whoami            # Check authentication
wmill user list              # List workspace users
```

## Script & Flow Management

### `wmill script`

Manage Windmill scripts

**Subcommands:**

- `push <file>` - Push a script file to the workspace
- `list` - List all scripts in the workspace
- `show <path>` - Show script details
- `run <path>` - Execute a script
- `generate-metadata <file>` - Generate metadata for a script

**Usage:**

```bash
wmill script generate-metadata   # Generate .lock and .yaml files
wmill script push f/utils/helper.ts
wmill script run f/utils/helper
wmill script list
wmill script show f/utils/helper
```

**Important:** Always run `generate-metadata` after writing a script. Do NOT create `.lock` and `.yaml` files manually. Run from repository root.

### `wmill flow`

Manage Windmill flows

**Subcommands:**

- `push <path>` - Push a flow to the workspace
- `list` - List all flows
- `show <path>` - Show flow details
- `run <path>` - Execute a flow
- `generate-locks` - Generate dependency locks for flow inline scripts

**Usage:**

```bash
wmill flow generate-locks --yes  # Generate locks for all inline scripts
wmill flow push f/workflows/data_pipeline.flow
wmill flow run f/workflows/data_pipeline
wmill flow list
wmill flow show f/workflows/data_pipeline
```

**Important:** Always run `generate-locks --yes` after writing a flow. Run from repository root.

### `wmill app`

Manage Windmill applications

**Subcommands:**

- `push <path>` - Push an app to the workspace
- `list` - List all apps
- `show <path>` - Show app details

**Usage:**

```bash
wmill app push f/dashboards/analytics
wmill app list
wmill app show f/dashboards/analytics
```

## Resource Management

### `wmill resource`

Manage resources (database connections, API keys, credentials, etc.)

**Subcommands:**

- `list` - List all resources
- `push <file>` - Push a resource definition
- `show <path>` - Show resource details

**Usage:**

```bash
wmill resource list
wmill resource push f/resources/postgres_db.yaml
wmill resource show f/resources/postgres_db
```

### `wmill resource-type`

Manage custom resource types

**Subcommands:**

- Operations for defining and managing custom resource schemas

**Usage:**

```bash
wmill resource-type list --schema    # List all available resource types
```

**Important:** Use `wmill resource-type list --schema` to discover available resource types before using them in scripts. Use `grep` to filter output if needed.

### `wmill variable`

Manage workspace variables and secrets

**Subcommands:**

- `list` - List all variables
- `push <file>` - Push a variable definition
- `show <path>` - Show variable details

**Usage:**

```bash
wmill variable list
wmill variable push f/config/api_key.yaml
wmill variable show f/config/api_key
```

## Scheduling & Automation

### `wmill schedule`

Manage scheduled jobs

**Subcommands:**

- `list` - List all schedules
- `push <file>` - Push a schedule definition

**Usage:**

```bash
wmill schedule list
wmill schedule push f/schedules/daily_backup.yaml
```

Operations for managing cron-based job scheduling.

### `wmill trigger`

Manage event triggers

Operations for managing webhooks and event-based triggers.

## Synchronization

### `wmill sync`

Synchronize local files with Windmill workspace

**Subcommands:**

- `pull` - Download resources from workspace to local files
- `push` - Upload local files to workspace

**Usage:**

```bash
wmill sync pull              # Download from workspace
wmill sync push              # Upload to workspace
```

**Features:**

- Bidirectional sync with conflict resolution
- Works with `wmill.yaml` configuration
- Supports selective sync
- Shows diffs with `--show-diffs`

**Workflow:**

```bash
# Initial setup
wmill init
wmill workspace add
wmill sync pull              # Get existing resources

# Make changes locally
# ...

# Deploy changes
wmill sync push

# Get latest from workspace
wmill sync pull
```

### `wmill gitsync-settings`

Manage git synchronization settings

**Operations:**

- Configure automatic git sync for the workspace
- Pull/push git sync configurations

**Usage:**

```bash
wmill gitsync-settings pull
wmill gitsync-settings push
```

## Development Tools

### `wmill dev`

Start development mode with live reloading

```bash
wmill dev
```

**Features:**

- Watches local files for changes
- Automatically syncs changes to workspace
- Provides real-time feedback during development
- Hot reload for rapid iteration

**Recommended for:**

- Active development sessions
- Testing changes quickly
- Iterative workflow development

### `wmill hub`

Interact with Windmill Hub

**Subcommands:**

- `pull` - Pull resources from the public Windmill Hub

**Usage:**

```bash
wmill hub pull <resource-path>
```

Access community-shared scripts, flows, and resource types from the public Windmill Hub.

## Infrastructure Management

### `wmill instance`

Manage Windmill instance settings (Enterprise)

**Operations:**

- Configure instance-level settings
- Manage global configurations

### `wmill worker-groups`

Manage worker groups for job execution

**Operations:**

- Configure worker pool settings
- Manage worker group assignments

### `wmill workers`

Manage individual workers

**Operations:**

- Monitor worker instances
- Configure worker settings

### `wmill queues`

Manage job queues

**Operations:**

- Monitor job execution queues
- Configure queue settings

## Utility Commands

### `wmill folder`

Manage workspace folders and organization

**Operations:**

- Create and organize folders
- Manage folder permissions

### `wmill completions`

Generate shell completion scripts

**Supported shells:**

- bash
- zsh
- fish
- PowerShell

**Usage:**

```bash
wmill completions bash > ~/.bash_completions/wmill
```

## Common Command Sequences

### Initial Project Setup

```bash
wmill init                    # Bootstrap project
wmill workspace add           # Configure workspace
wmill sync pull               # Pull existing resources
```

### Script Development

```bash
# 1. Create script file
# 2. Generate metadata
wmill script generate-metadata
# 3. Test
wmill script run f/folder/script
# 4. Deploy
wmill sync push
```

### Flow Development

```bash
# 1. Create flow.yaml and inline scripts
# 2. Generate locks
wmill flow generate-locks --yes
# 3. Test
wmill flow run f/folder/flow
# 4. Deploy
wmill sync push
```

### Development Loop

```bash
# Option 1: Manual sync
# Make changes...
wmill sync push
wmill script run f/folder/script  # or wmill flow run

# Option 2: Auto-sync (recommended)
wmill dev
# Make changes... (auto-synced)
```

## Configuration Files

### wmill.yaml

Project configuration file created by `wmill init`. Contains:

- Default sync options
- Git branch mappings
- Workspace bindings
- Include/exclude patterns

### wmill-lock.yaml

Lock file for tracking synced state. Auto-generated and managed by CLI.

## Tips & Best Practices

1. **Always use `wmill init`** to bootstrap projects
2. **Run metadata/lock generation from repository root**
3. **Use `wmill dev`** for active development sessions
4. **Check resource types** before using: `wmill resource-type list --schema`
5. **Test before deploying**: Use `wmill script run` or `wmill flow run`
6. **Use sync for bulk operations**: Prefer `wmill sync push/pull` over individual commands
7. **Bind workspaces to branches**: Use `--bind-profile` during init for branch-specific workspaces
