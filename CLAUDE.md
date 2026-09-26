# Skills

## Repository Purpose

A curated collection of skills for CLI-based AI coding assistants (Claude Code, Codex CLI, Gemini CLI, etc.). Each skill teaches the agent a new capability.

## Adding New Skills

1. Create `<skill-name>/` directory in the repo root
2. Add `SKILL.md` with YAML frontmatter (name, description)
3. Optionally add `commands/`, `agents/`, `scripts/`, `references/` directories
4. Update README.md with skill description and origin
5. Add install command to README.md Installation section: `npx skills add https://github.com/mikko-kohtala/skills --skill <skill-name>`

## Important References

- [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) - Official skill docs
- [Custom Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills/custom_skills) - Examples and guides

## Credits

All skills maintain attribution to original authors. See README.md for current credits.
