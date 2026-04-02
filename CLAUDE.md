# Skills

This file provides guidance to CLI-based AI coding assistants when working with code in this repository.

## Repository Purpose

A curated collection of skills for CLI-based AI coding assistants (Claude Code, Codex CLI, Gemini CLI, etc.). Each skill teaches the agent a new capability.

## Repository Structure

```
<repo-root>/
├── <skill-name>/
│   ├── SKILL.md              # Skill definition (required)
│   ├── agents/               # Custom agents (optional)
│   ├── commands/              # Slash commands (optional)
│   ├── scripts/               # Helper scripts (optional)
│   ├── references/            # Reference docs (optional)
│   └── ...                    # Other supporting files
├── CLAUDE.md
├── README.md
└── .gitignore
```

## Skills

| Skill | Description |
|-------|-------------|
| playwright | Browser automation with Playwright |
| tmux | Remote control tmux sessions for interactive CLIs |
| windmill | Windmill platform development assistance |
| gemini-imagegen | Image generation via Gemini API |
| skill-development | Guide for creating Claude Code skills |
| codex | Invoke Codex CLI for code analysis and refactoring |
| docx | Document creation, editing, and analysis (.docx) |
| pptx | Presentation creation, editing, and analysis (.pptx) |
| electron-playwright-test | E2E testing for Electron apps with Playwright |
| code-simplifier | Simplify and refine code for clarity and maintainability |
| reverse-engineer-spec | Reverse engineer specs from git branches |
| harness-engineering | OpenAI Harness Engineering practices for agent workflows |
| excalidraw | Generate architecture diagrams on Excalidraw canvas |
| grill-me | Stress-test plans and designs through relentless questioning |
| linear-way | Linear-style product thinking for analyzing requests |

## Adding New Skills

1. Create `<skill-name>/` directory in the repo root
2. Add `SKILL.md` with YAML frontmatter (name, description)
3. Optionally add `commands/`, `agents/`, `scripts/`, `references/` directories
4. Update README.md with skill description and origin
5. Add install command to README.md Installation section: `npx skills add https://github.com/mikko-kohtala/skills --skill <skill-name>`
6. Update this file's Skills table with the new skill

## Important References

- [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) - Official skill docs
- [Custom Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills/custom_skills) - Examples and guides

## Credits

All skills maintain attribution to original authors. See README.md for current credits.
