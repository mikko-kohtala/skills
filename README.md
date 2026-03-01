# Agent Tools

A curated collection of plugins for Claude Code and other CLI-based AI coding assistants.

## About

This repository provides reusable plugins that extend the capabilities of AI coding assistants. Each plugin can contain skills, commands, agents, and hooks.

## Installation

### Add Marketplace from GitHub

```bash
claude plugin marketplace add mikko-kohtala/agent-tools
```

Then install plugins:

```bash
claude plugin install playwright-plugin
claude plugin install tmux-plugin
claude plugin install windmill-plugin
claude plugin install docx-plugin
claude plugin install pptx-plugin
claude plugin install code-simplifier-plugin
claude plugin install harness-engineering-plugin
claude plugin install excalidraw-plugin
```

### Install Individual Plugins Directly

```bash
claude plugin install github:mikko-kohtala/agent-tools/plugins/playwright-plugin
claude plugin install github:mikko-kohtala/agent-tools/plugins/tmux-plugin
claude plugin install github:mikko-kohtala/agent-tools/plugins/windmill-plugin
claude plugin install github:mikko-kohtala/agent-tools/plugins/docx-plugin
claude plugin install github:mikko-kohtala/agent-tools/plugins/pptx-plugin
claude plugin install github:mikko-kohtala/agent-tools/plugins/code-simplifier-plugin
claude plugin install github:mikko-kohtala/agent-tools/plugins/harness-engineering-plugin
claude plugin install github:mikko-kohtala/agent-tools/plugins/excalidraw-plugin
```

## Plugins

| Plugin                                                        | Skills                  | Commands | Agents | Hooks | Origin                                                        |
| ------------------------------------------------------------- | ----------------------- | -------- | ------ | ----- | ------------------------------------------------------------- |
| [playwright-plugin](plugins/playwright-plugin/)               | playwright-skill        | -        | -      | -     | [lackeyjb](https://github.com/lackeyjb/playwright-skill)      |
| [tmux-plugin](plugins/tmux-plugin/)                           | tmux-skill              | -        | -      | -     | [Armin Ronacher](https://github.com/mitsuhiko/agent-commands) |
| [windmill-plugin](plugins/windmill-plugin/)                   | windmill-skill          | -        | -      | -     | Vibecoded                                                     |
| [gemini-imagegen-plugin](plugins/gemini-imagegen-plugin/)     | gemini-imagegen-skill   | -        | -      | -     | [EveryInc](https://github.com/EveryInc/every-marketplace)     |
| [skill-development-plugin](plugins/skill-development-plugin/) | skill-development-skill | -        | -      | -     | [Anthropic](https://github.com/anthropics/claude-code)        |
| [codex-plugin](plugins/codex-plugin/)                         | codex-skill             | -        | -      | -     | [skills-directory](https://github.com/skills-directory/skill-codex) |
| [docx-plugin](plugins/docx-plugin/)                           | docx-skill              | -        | -      | -     | [Anthropic](https://github.com/anthropics/skills)             |
| [pptx-plugin](plugins/pptx-plugin/)                           | pptx-skill              | -        | -      | -     | [Anthropic](https://github.com/anthropics/skills)             |
| [code-simplifier-plugin](plugins/code-simplifier-plugin/)     | code-simplifier-skill   | simplify | code-simplifier | -     | [Anthropic](https://github.com/anthropics/claude-plugins-official) |
| [harness-engineering-plugin](plugins/harness-engineering-plugin/) | harness-engineering-skill | harness | harness-engineer | - | [broomva](https://github.com/broomva/harness-engineering-skill) |
| [excalidraw-plugin](plugins/excalidraw-plugin/) | excalidraw | - | - | - | [edwingao28](https://github.com/edwingao28/excalidraw-skill) |

## Reference Links

### Claude Code Documentation

- [Plugins Overview](https://code.claude.com/docs/en/plugins.md) - Official plugin documentation
- [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) - Official skill documentation
- [Custom Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills/custom_skills) - Examples and guides

### Plugin Marketplaces

- https://skillsmp.com
- https://www.aitmpl.com/skills
- https://github.com/ComposioHQ/awesome-claude-skills
- https://github.com/anthropics/skills
