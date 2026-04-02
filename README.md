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
```

## Skills

| Skill                                                 | Description                                                  | Origin                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| [playwright](playwright/)                             | Browser automation with Playwright                           | [lackeyjb](https://github.com/lackeyjb/playwright-skill)            |
| [tmux](tmux/)                                         | Remote control tmux sessions for interactive CLIs            | [Armin Ronacher](https://github.com/mitsuhiko/agent-commands)       |
| [windmill](windmill/)                                 | Windmill platform development assistance                     | Vibecoded                                                           |
| [gemini-imagegen](gemini-imagegen/)                   | Image generation via Gemini API                              | [EveryInc](https://github.com/EveryInc/every-marketplace)           |
| [skill-development](skill-development/)               | Guide for creating Claude Code skills                        | [Anthropic](https://github.com/anthropics/claude-code)              |
| [codex](codex/)                                       | Invoke Codex CLI for code analysis and refactoring           | [skills-directory](https://github.com/skills-directory/skill-codex) |
| [docx](docx/)                                         | Document creation, editing, and analysis (.docx)             | [Anthropic](https://github.com/anthropics/skills)                   |
| [pptx](pptx/)                                         | Presentation creation, editing, and analysis (.pptx)         | [Anthropic](https://github.com/anthropics/skills)                   |
| [electron-playwright-test](electron-playwright-test/) | E2E testing for Electron apps with Playwright                | Mikko Kohtala                                                       |
| [code-simplifier](code-simplifier/)                   | Simplify and refine code for clarity and maintainability     | [Anthropic](https://github.com/anthropics/claude-plugins-official)  |
| [reverse-engineer-spec](reverse-engineer-spec/)       | Reverse engineer specs from git branches                     | Codex                                                               |
| [harness-engineering](harness-engineering/)           | OpenAI Harness Engineering practices for agent workflows     | [broomva](https://github.com/broomva/harness-engineering-skill)     |
| [excalidraw](excalidraw/)                             | Generate architecture diagrams on Excalidraw canvas          | [edwingao28](https://github.com/edwingao28/excalidraw-skill)        |
| [grill-me](grill-me/)                                 | Stress-test plans and designs through relentless questioning | [mattpocock](https://github.com/mattpocock/skills)                  |

## Reference Links

- [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) - Official skill documentation
- [Custom Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills/custom_skills) - Examples and guides
- [mattpocock/skills](https://github.com/mattpocock/skills) - More skills
- [skillsmp.com](https://skillsmp.com) - Skills marketplace
- [anthropics/skills](https://github.com/anthropics/skills) - Official Anthropic skills
