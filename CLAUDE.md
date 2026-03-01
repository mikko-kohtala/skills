# Agent Tools

This file provides guidance to CLI-based AI coding assistants when working with code in this repository.

## Repository Purpose

This is a curated collection of plugins for CLI-based AI coding assistants (Claude Code, Codex CLI, Gemini CLI, etc.). The repository serves as a marketplace of reusable plugins that extend what AI agents can do.

## Repository Structure

```
<repo-root>/
├── .claude-plugin/
│   └── marketplace.json       # Marketplace index listing all plugins
├── plugins/
│   └── <plugin-name>/
│       ├── .claude-plugin/
│       │   └── plugin.json    # Plugin metadata
│       ├── commands/          # Custom slash commands (optional)
│       ├── agents/            # Custom agents (optional)
│       ├── skills/            # Agent skills
│       │   └── <skill-name>/
│       │       └── SKILL.md
│       └── hooks/             # Event handlers (optional)
└── skills-archive/            # Reference implementations (not active)
```

## Plugin Structure

Each plugin follows Claude Code's plugin specification:

- `.claude-plugin/plugin.json` - Required plugin metadata
- `skills/<skill-name>/SKILL.md` - Skill documentation with YAML frontmatter
- `commands/` - Optional slash command definitions
- `agents/` - Optional custom agent definitions
- `hooks/` - Optional event handlers

## Active Plugins

| Plugin | Description |
|--------|-------------|
| playwright-plugin | Browser automation with Playwright |
| tmux-plugin | Remote control tmux sessions for interactive CLIs |
| windmill-plugin | Windmill platform development assistance |
| gemini-imagegen-plugin | Image generation via Gemini API |
| skill-development-plugin | Guide for creating Claude Code skills |
| code-simplifier-plugin | Simplifies and refines code for clarity and maintainability |
| harness-engineering-plugin | OpenAI Harness Engineering practices for autonomous agent workflows |
| excalidraw-plugin | Generate architecture diagrams on a live Excalidraw canvas via MCP |

## Adding New Plugins

1. Create `plugins/<plugin-name>/` directory
2. Add `.claude-plugin/plugin.json` with plugin metadata
3. Create `skills/<skill-name>/SKILL.md` for any skills
4. Optionally add `commands/`, `agents/`, `hooks/` directories
5. Update `.claude-plugin/marketplace.json` to list the new plugin
6. Update README.md with plugin description and origin

## Important References

- [Plugins Overview](https://code.claude.com/docs/en/plugins.md) - Official plugin docs
- [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) - Official skill docs

## Credits

All plugins maintain attribution to original authors. See README.md for current credits.
