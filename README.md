# Skills

A curated collection of skills for Claude Code and other CLI-based AI coding assistants.

## Installation

Install individual skills using the `npx skills add` command:

```sh
# General syntax
npx skills add https://github.com/mikko-kohtala/skills --skill <skill-name>

# Individual skills
npx skills add https://github.com/mikko-kohtala/skills --skill playwright
npx skills add https://github.com/mikko-kohtala/skills --skill tmux
npx skills add https://github.com/mikko-kohtala/skills --skill windmill
npx skills add https://github.com/mikko-kohtala/skills --skill gemini-imagegen
npx skills add https://github.com/mikko-kohtala/skills --skill skill-development
npx skills add https://github.com/mikko-kohtala/skills --skill codex
npx skills add https://github.com/mikko-kohtala/skills --skill docx
npx skills add https://github.com/mikko-kohtala/skills --skill pptx
npx skills add https://github.com/mikko-kohtala/skills --skill electron-playwright-test
npx skills add https://github.com/mikko-kohtala/skills --skill code-simplifier
npx skills add https://github.com/mikko-kohtala/skills --skill reverse-engineer-spec
npx skills add https://github.com/mikko-kohtala/skills --skill harness-engineering
npx skills add https://github.com/mikko-kohtala/skills --skill excalidraw
npx skills add https://github.com/mikko-kohtala/skills --skill grill-me
npx skills add https://github.com/mikko-kohtala/skills --skill linear-way
npx skills add https://github.com/mikko-kohtala/skills --skill mine-conversations
npx skills add https://github.com/mikko-kohtala/skills --skill agent-native-repo-playbook
npx skills add https://github.com/mikko-kohtala/skills --skill wait-wtf
npx skills add https://github.com/mikko-kohtala/skills --skill project-workflow
```

### Adopt the project workflow in a repository

`project-workflow` provides the ticket → gwt worktree → verification → PR → merge → cleanup workflow. Install it only in repositories that should follow that process.

From the target repository's working directory (use a worktree when adopting this workflow), run:

```sh
npx skills add https://github.com/mikko-kohtala/skills --skill project-workflow --agent codex claude-code --yes
```

This installs at project scope. The default symlink installation keeps the skill files in `.agents/skills/project-workflow/` for Codex and links `.claude/skills/project-workflow/` to the same copy for Claude Code. Do not add `--global` for repository-specific adoption. See the [skills CLI documentation](https://github.com/vercel-labs/skills#installation-scope) for installer options.

The installer adds the skill files; it does not add the always-on instruction to your agent files. Append the following section to **both** the repository's existing `AGENTS.md` and `CLAUDE.md`, creating either file if absent:

```md
## Project workflow

Before changing this repository, read and follow the repository-root
`.agents/skills/project-workflow/SKILL.md`.

Repository-specific instructions and the user's explicit directions take precedence.
```

Preserve the existing instructions. If `AGENTS.md` and `CLAUDE.md` already point to the same file, add the section once. Commit the installed skill files, the Claude skill link, the generated `skills-lock.json`, and the agent-file changes so fresh clones and worktrees keep the workflow. If the repository ignores any of these paths, adjust its ignore rules as part of adoption.

Codex loads repository instructions automatically, while skills activate when explicitly requested or matched to a task. The instruction above makes reading this workflow part of every change in an adopting repository. See [OpenAI's instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md#how-codex-discovers-guidance) and [skill activation documentation](https://learn.chatgpt.com/docs/build-skills#how-codex-uses-skills).

When migrating from the shared dotfiles setup, remove the old workflow links at `~/.codex/AGENTS.md` and `~/code/mikko/AGENTS.md` / `CLAUDE.md` after the chosen repositories have adopted the skill. Update the dotfiles installer so it does not recreate those links. Preserve any unrelated global preferences. This lets each repository choose whether to adopt the workflow.

## Skills

| Skill                                                     | Description                                                  | Origin                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [playwright](playwright/)                                 | Browser automation with Playwright                           | [lackeyjb](https://github.com/lackeyjb/playwright-skill)                |
| [tmux](tmux/)                                             | Remote control tmux sessions for interactive CLIs            | [Armin Ronacher](https://github.com/mitsuhiko/agent-commands)           |
| [windmill](windmill/)                                     | Windmill platform development assistance                     | Vibecoded                                                               |
| [gemini-imagegen](gemini-imagegen/)                       | Image generation via Gemini API                              | [EveryInc](https://github.com/EveryInc/every-marketplace)               |
| [skill-development](skill-development/)                   | Guide for creating Claude Code skills                        | [Anthropic](https://github.com/anthropics/claude-code)                  |
| [codex](codex/)                                           | Invoke Codex CLI for code analysis and refactoring           | [skills-directory](https://github.com/skills-directory/skill-codex)     |
| [docx](docx/)                                             | Document creation, editing, and analysis (.docx)             | [Anthropic](https://github.com/anthropics/skills)                       |
| [pptx](pptx/)                                             | Presentation creation, editing, and analysis (.pptx)         | [Anthropic](https://github.com/anthropics/skills)                       |
| [electron-playwright-test](electron-playwright-test/)     | E2E testing for Electron apps with Playwright                | Mikko Kohtala                                                           |
| [code-simplifier](code-simplifier/)                       | Simplify and refine code for clarity and maintainability     | [Anthropic](https://github.com/anthropics/claude-plugins-official)      |
| [reverse-engineer-spec](reverse-engineer-spec/)           | Reverse engineer specs from git branches                     | Codex                                                                   |
| [harness-engineering](harness-engineering/)               | OpenAI Harness Engineering practices for agent workflows     | [broomva](https://github.com/broomva/harness-engineering-skill)         |
| [excalidraw](excalidraw/)                                 | Generate architecture diagrams on Excalidraw canvas          | [edwingao28](https://github.com/edwingao28/excalidraw-skill)            |
| [grill-me](grill-me/)                                     | Stress-test plans and designs through relentless questioning | [mattpocock](https://github.com/mattpocock/skills)                      |
| [linear-way](linear-way/)                                 | Linear-style product thinking for analyzing requests         | Mikko Kohtala                                                           |
| [mine-conversations](mine-conversations/)                 | Mine past Claude Code conversations for skill/rule patterns  | Mikko Kohtala                                                           |
| [agent-native-repo-playbook](agent-native-repo-playbook/) | Audit and improve repos for agent-native solo-dev workflows  | [wisdom-in-a-nutshell](https://github.com/wisdom-in-a-nutshell/.agents) |
| [wait-wtf](wait-wtf/)                                     | Plain-language recap of an agent session, its ticket and PR  | Mikko Kohtala                                                           |
| [project-workflow](project-workflow/)                     | Opt-in ticket, worktree, verification, PR, merge, and cleanup workflow | Mikko Kohtala                                                    |

## Reference Links

- [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) - Official skill documentation
- [Custom Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills/custom_skills) - Examples and guides
- [mattpocock/skills](https://github.com/mattpocock/skills) - More skills
- [skillsmp.com](https://skillsmp.com) - Skills marketplace
- [anthropics/skills](https://github.com/anthropics/skills) - Official Anthropic skills
