# Skills

## Repository Purpose

A curated collection of skills for CLI-based AI coding assistants (Claude Code, Codex CLI, Gemini CLI, etc.). Each skill teaches the agent a new capability.

## Project Workflow

Before changing this repository, read and follow `project-workflow/SKILL.md`. This is the skill's source directory; consuming repositories use the installed copy at `.agents/skills/project-workflow/SKILL.md`.

Keep adoption opt-in per repository. Document project-scoped installation for both Codex and Claude Code, and tell users to add the workflow instruction to their existing `AGENTS.md` and `CLAUDE.md`. Preserve each repository's existing instructions.

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
