---
description: Reverse engineer a product & technical spec from the current branch
allowed-tools: [Read, Glob, Grep, Bash, Task]
---

## Context

- Current branch: !`git branch --show-current`
- Auto-detected base branch and merge-base:
  !`for branch in main master develop; do if git rev-parse --verify "$branch" >/dev/null 2>&1; then BASE=$(git merge-base "$branch" HEAD); echo "base=$branch merge_base=$BASE"; break; fi; done`
- Diff stats from base: !`BASE=$(for b in main master develop; do git rev-parse --verify "$b" >/dev/null 2>&1 && git merge-base "$b" HEAD && break; done); git diff --stat "$BASE"...HEAD`
- Commit messages: !`BASE=$(for b in main master develop; do git rev-parse --verify "$b" >/dev/null 2>&1 && git merge-base "$b" HEAD && break; done); git log --format='%h %s' "$BASE"..HEAD`
- PR context (if available): !`gh pr view --json title,body,labels 2>/dev/null || echo "No PR found"`

## Your task

Using the branch context above, reverse engineer a detailed product and technical specification
documenting what this branch implements and why.

Follow the reverse-engineer-spec skill process:

1. **Scope**: Categorize all changed files by type (core logic, integration points, tests,
   schemas, API routes, UI components, config, incidental).

2. **Deep explore**: Use parallel Task agents to read and analyze each file group. Focus on
   purpose, key types/exports, data flow, and inter-file connections.

3. **Cross-check**: Verify every file from `git diff --stat` is accounted for. Read any
   small diffs that agents missed.

4. **Write spec**: Produce a structured markdown spec with: problem statement, solution
   overview, product requirements, architecture (with ASCII diagram), technical design,
   file inventories, testing strategy, rollout plan, and risks.

5. **Verify**: Cross-check spec completeness against the branch diff.

Save the spec to `docs/specs/` (or a user-specified path) and summarize what was documented.
