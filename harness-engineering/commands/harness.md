---
description: Set up or audit OpenAI Harness Engineering practices in the current repository
allowed-tools: [Read, Edit, Glob, Grep, Bash, Task]
---

## Context

- Current repository status: !`git status --short`
- Existing harness files: !`ls -1 AGENTS.md PLANS.md Makefile.harness docs/ARCHITECTURE.md docs/OBSERVABILITY.md scripts/harness/smoke.sh .github/workflows/harness.yml 2>/dev/null || echo "(none found)"`
- Project type detection: !`ls -1 Cargo.toml package.json pyproject.toml 2>/dev/null || echo "(no known project manifest)"`

## Your task

Analyze the current repository and set up harness engineering workflows, docs, and automation following OpenAI Harness Engineering principles.

1. **Baseline**: Identify the language/toolchain, existing checks, scripts, and CI jobs. Note pain points for agent runs (setup drift, unclear docs, flaky tests, missing trace IDs).

2. **Bootstrap**: Run the harness wizard to install templates. Use the `control` profile by default:
   ```bash
   python3 $SKILL_DIR/skills/harness-engineering-skill/scripts/harness_wizard.py init . --profile control
   ```

3. **Customize**: Replace template placeholders in generated files with project-specific values. Adapt `scripts/harness/*.sh` to the actual build/test/lint commands.

4. **Validate**: Run the audit to verify completeness:
   ```bash
   python3 $SKILL_DIR/skills/harness-engineering-skill/scripts/harness_wizard.py audit .
   ```

5. **Report**: Summarize what was set up, what was customized, and any remaining gaps.

If harness files already exist, run an audit and report the current status instead of overwriting.
