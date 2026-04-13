---
description: Analyze past Claude Code conversations and propose new skills/rules
allowed-tools: [Read, Glob, Grep, Bash, Agent]
---

## Context

- Current project: !`pwd`
- Existing rules and config:
  !`ls -1 .claude/rules/*.md CLAUDE.md 2>/dev/null || echo "(none found)"`
- Conversation data:
  !`python3 $SKILL_DIR/scripts/extract_conversations.py --cwd "$(pwd)" --min-turns 2 --max-chars 200000`

## Your task

Analyze the conversation data above for the current project. Follow the mine-conversations
skill to identify recurring patterns and propose actionable rules and skills.

1. **Read existing rules** listed above to understand what is already covered.

2. **Start with the Frequency Analysis section** at the top of the conversation data.
   This contains pre-computed counts across ALL sessions (not just the transcripts below).
   Use these numbers as ground truth for pattern frequency. Do NOT re-count from the
   transcripts — they are a stratified sample.
   - A pattern with high count but only recent dates is less valuable than one with
     moderate count spread across months.
   - Corrections in 1-2 sessions from the same week may be situation-specific.
     Corrections appearing across 3+ months are systemic.

3. **Identify patterns** across sessions — start with the highest-signal markers:
   - `[CORRECTION]` turns first — these are user corrections to Claude (strongest signal for a missing rule)
   - `[TOOLS: ...]` lines — reveal actual workflows (which tools get used together, in what order)
   - Repeated workflows (same task type in 3+ sessions)
   - Domain knowledge repeatedly explained
   - Multi-step procedures that could be skills

4. **Recency check**: Before finalizing proposals, verify each one against the Frequency
   Analysis. If a proposed rule or skill is based on a pattern that appears in fewer than
   3 sessions or only in sessions from the most recent 2 weeks, flag it as "low confidence"
   or drop it in favor of patterns with broader time spread.

5. **Propose rules** (3-8 `.md` files in `.claude/rules/`):
   - Each with short **When**, **Do**, **Don't** bullet sections
   - Under 120 lines per file, kebab-case names
   - General patterns only, no product/feature specifics

6. **Propose skills** (0-6 `SKILL.md` files, only if justified):
   - Each with **When to use** + numbered **Steps** (3-10)

7. **Output format**:
   - File tree first
   - Full file contents for each file
   - Up to 5 lines noting overlaps with existing rules
   - No transcript IDs, counts, quotes, or methodology

For large datasets, use parallel Agent calls to analyze different conversation segments.
