---
name: mine-conversations
description: >
  This skill should be used when the user asks to "mine conversations",
  "analyze past sessions", "find patterns in my Claude Code usage",
  "suggest new skills from history", "what skills should I create",
  or wants to discover reusable rules and skills from their Claude Code
  conversation history for the current project.
version: 1.0.0
author: Mikko Kohtala
tags: [conversations, mining, skills, rules, meta, claude-code]
---

# Mine Conversations

Analyze past Claude Code conversation transcripts for the current project to identify
recurring patterns, then propose actionable `.md` rules and `SKILL.md` files.

## How It Works

The bundled `scripts/extract_conversations.py` handles all filesystem I/O:

- Finds conversation JSONL files in `~/.claude/projects/` for the current project
- Includes worktree conversations (detects the `-worktrees/` convention automatically)
- Extracts user prompts and assistant text responses (skips tool calls, thinking, subagents)
- Outputs a condensed, token-efficient summary

## Workflow

### Step 1: Extract conversation data

Run the extraction script. It auto-detects the base project path and finds all
related conversations including worktrees.

```bash
python3 $SKILL_DIR/scripts/extract_conversations.py --cwd "$(pwd)" --min-turns 2
```

Useful flags:

- `--exact` — Only match base project + worktrees (excludes sibling projects)
- `--skip-reviews` — Skip automated review/meta agent sessions
- `--since YYYY-MM-DD` — Limit to recent conversations
- `--max-sessions N` — Cap the number of sessions (default: 200)

### Step 2: Check existing rules

Before proposing new rules, read what already exists to avoid duplicates:

- `.claude/rules/*.md`
- `CLAUDE.md`

Say "already covered: <path>" instead of repeating existing content.

### Step 3: Analyze for patterns

Read the extracted conversation data and look for:

- **Repeated workflows** — Same type of task done across 3+ sessions
- **User corrections** — When the user corrects Claude, that signals a missing rule
- **Domain knowledge** — Project-specific terminology, architecture, naming conventions
  that keep being explained
- **Multi-step procedures** — Sequences that could be codified as a skill
- **Tool preferences** — Patterns in how tools are used or should be used
- **Frustration signals** — Repeated clarifications, "I already told you", re-explaining

Weight by frequency: patterns appearing in 3+ sessions are strong candidates.
User corrections are the strongest signal for a missing rule.

### Step 4: Propose rules and skills

**Rules** (`.md` files in `.claude/rules/`) — General patterns applicable across many tasks:

- 3-8 files maximum
- Each file: short **When**, **Do**, **Don't** bullet sections
- Under 120 lines per file
- Kebab-case filenames

**Skills** (`SKILL.md` files) — Reusable multi-step procedures:

- 0-6 folders maximum (only if a real procedure is justified)
- Each file: **When to use** + numbered **Steps** (3-10 steps)

### Step 5: Format output

Output as ready-to-save files:

1. File tree (kebab-case names)
2. Full file contents for each proposed file
3. Optional: up to 5 lines noting overlaps with existing rules

No transcript IDs, counts, quotes, methodology, or evidence sections.

## Script Reference

`scripts/extract_conversations.py` — Python 3 (stdlib only, no dependencies)

```
python3 extract_conversations.py [OPTIONS]

--cwd PATH           Project directory (default: current)
--max-sessions N     Max sessions (default: 200)
--max-chars N        Max output chars (default: 400000)
--since YYYY-MM-DD   Filter by date
--min-turns N        Min user turns per session (default: 2)
--exact              Only base project + worktrees
--skip-reviews       Skip -review- and -meta- directories
```

The script writes progress to stderr and the report to stdout.

## Notes

- The script handles worktrees automatically. Projects using the `<name>-worktrees/<feature>`
  convention are detected by the `-worktrees/` marker in the path.
- Subagent conversations are naturally excluded (they live in subdirectories, not at the
  project directory root).
- For very large projects, use `--since` and `--exact` to narrow the scope.
- The analysis should focus on **general** patterns, not product/feature specifics.
