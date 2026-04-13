---
description: Analyze past Claude Code conversations and propose new skills/rules
allowed-tools: [Read, Glob, Grep, Bash, Agent]
---

## Context

- Current project: !`pwd`
- Existing rules and config:
  !`ls -1 .claude/rules/*.md CLAUDE.md 2>/dev/null || echo "(none found)"`
- Conversation data:
  !`python3 $SKILL_DIR/scripts/extract_conversations.py --cwd "$(pwd)" --min-turns 2 --max-chars 300000`

## Your task

Analyze the conversation data above for the current project. Follow the mine-conversations
skill to identify recurring patterns and propose actionable rules and skills.

1. **Read existing rules** listed above to understand what is already covered.

2. **Identify patterns** across sessions:
   - Repeated workflows (same task type in 3+ sessions)
   - User corrections to Claude (strongest signal for a missing rule)
   - Domain knowledge repeatedly explained
   - Multi-step procedures that could be skills
   - Tool usage preferences

3. **Propose rules** (3-8 `.md` files in `.claude/rules/`):
   - Each with short **When**, **Do**, **Don't** bullet sections
   - Under 120 lines per file, kebab-case names
   - General patterns only, no product/feature specifics

4. **Propose skills** (0-6 `SKILL.md` files, only if justified):
   - Each with **When to use** + numbered **Steps** (3-10)

5. **Output format**:
   - File tree first
   - Full file contents for each file
   - Up to 5 lines noting overlaps with existing rules
   - No transcript IDs, counts, quotes, or methodology

For large datasets, use parallel Agent calls to analyze different conversation segments.
