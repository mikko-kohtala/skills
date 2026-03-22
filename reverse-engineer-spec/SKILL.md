---
name: reverse-engineer-spec
description: |
  Reverse engineer a detailed product and technical specification document from a git branch's
  implementation. Use when: (1) a branch has shipped or is in-progress and needs documentation,
  (2) you need to understand what a branch does at product and architecture level, (3) onboarding
  to someone else's feature branch, (4) creating PR descriptions or design docs after the fact,
  (5) user asks to "analyze this branch", "write a spec from the code", or "document what this
  branch does". Produces a structured markdown spec covering problem statement, product requirements,
  architecture, technical design, file inventories, testing strategy, rollout plan, and risks.
author: Codex
version: 1.0.0
date: 2026-02-15
tags: [documentation, git, branch-analysis, spec, reverse-engineering]
---

# Reverse Engineer Spec from Branch Implementation

## Problem

Feature branches often ship without comprehensive documentation. After the fact, teams need
product specs, architectural docs, or onboarding materials that explain what was built and why.
Manually reading every file change is slow and error-prone. This skill systematically extracts
a complete spec from a branch's diff.

## Context / Trigger Conditions

- User asks to "analyze this branch" or "reverse engineer a spec"
- User asks to "document what this branch does"
- User wants a product spec, technical spec, or design doc from existing code
- A branch has many commits and files changed and needs a coherent explanation
- Onboarding to an unfamiliar feature branch

## Solution

### Phase 1: Scope the Branch

Get the full picture of what changed before reading any files.

#### Auto-detect the base branch

Rather than requiring the user to specify `<base>`, auto-detect it:

```bash
# Try to find the merge-base against common default branches
for branch in main master develop; do
  if git rev-parse --verify "$branch" >/dev/null 2>&1; then
    BASE=$(git merge-base "$branch" HEAD)
    echo "Base: $branch ($BASE)"
    break
  fi
done
```

If the user explicitly provides a base branch, use that instead.

#### Gather commit messages

Read commit messages to infer the "why" behind changes:

```bash
# Get commit subjects and bodies for context
git log --format='%h %s%n%b' "$BASE"..HEAD
```

Commit messages often contain intent, ticket references, and design rationale that
pure diffs miss.

#### Check for existing PR context

If a PR exists for this branch, pull existing context:

```bash
# Try to get PR description if one exists
gh pr view --json title,body,labels 2>/dev/null
```

This provides pre-existing context the author already wrote.

#### Get file-level diff stats

```bash
# File-level diff stats
git diff --stat "$BASE"...HEAD

# Count the scale
git diff --stat "$BASE"...HEAD | tail -1
```

From the diff stats, categorize files into groups using language-aware heuristics:

- **Core implementation** (new modules, business logic)
- **Integration points** (modified selectors, reducers, hooks, components)
- **Tests** (unit tests, integration tests, e2e tests)
- **Schema & migrations** (database migrations, schema files, ORM models)
- **API routes** (REST endpoints, GraphQL resolvers, RPC handlers)
- **UI components** (React/Vue/Svelte components, templates, styles)
- **Configuration** (feature flags, env vars, types, configs)
- **Incidental** (formatting, imports, minor refactors)

Use file paths and extensions for categorization:
- `**/migrations/**`, `**/schema.*`, `**/models/**` → Schema & migrations
- `**/api/**`, `**/routes/**`, `**/handlers/**`, `**/resolvers/**` → API routes
- `**/components/**`, `**/*.tsx`, `**/*.vue`, `**/*.svelte` → UI components
- `**/*.test.*`, `**/*.spec.*`, `**/__tests__/**`, `**/e2e/**` → Tests

### Phase 2: Parallel Deep Exploration

Launch 2-4 parallel exploration agents, each focused on a different file group. This is
critical for efficiency — reading 50+ files sequentially is too slow.

**Agent 1: Core Implementation**
- All new files (the heart of the feature)
- Focus on: purpose, key types, exported functions, data flow, inter-module connections

**Agent 2: Integration Points**
- Modified selectors, reducers, hooks, components
- Focus on: what changed, why (inferred), how it connects to core implementation

**Agent 3: Tests**
- All test files (unit, integration, e2e)
- Focus on: what behaviors are validated, key assertions, what product requirements they encode

**Agent 4 (if needed): Configuration & Infrastructure**
- Feature flags, env vars, build configs, type declarations
- Focus on: rollout strategy, gating mechanisms, deployment concerns

Each agent prompt should ask for:
- Purpose of each file
- Key exports and types
- Data flow and dependencies
- How each file connects to others in the group

### Phase 3: Cross-Check for Gaps

After agents return, diff the analyzed files against the full file list:

```bash
# List all non-test changed files
git diff --stat "$BASE"...HEAD -- '*.ts' '*.tsx' | awk '{print $1}' | sort

# Show small diffs for any files not yet analyzed
git diff "$BASE"...HEAD -- <uncovered-files>
```

Read the remaining small diffs directly. These often contain important details:
- Type declarations (new fields on models)
- Feature flag definitions
- Bug fixes discovered during development
- Proxy/compatibility changes in existing code

### Phase 4: Write the Spec Document

Determine the output path. If the user specifies a path, use it. Otherwise default
to `docs/specs/<feature-name>.md`.

**Configurable depth**: Support two modes:

- **Full mode** (default): Complete spec with all sections below.
- **Summary mode** (if user asks for "summary" or "brief"): Produce only sections 1-3
  plus a condensed architecture overview and file inventory.

Structure the spec with these sections (skip sections that don't apply):

```markdown
# [Feature Name]
## Reverse-Engineered Product & Technical Specification

## 1. Problem Statement
Why this feature exists. What user/business pain it addresses.
Infer from the nature of the changes, commit messages, PR description,
and any comments in the code.

## 2. Solution Overview
High-level description of the approach. Key design properties
(transparent, lazy, bounded, etc.).

## 3. Product Requirements
### 3.1 User-Facing Behavior
Table of requirements inferred from tests and UI changes.

### 3.2 Supported Workflows
List of workflows validated by tests.

### 3.3 Scope Boundaries
What is and isn't included.

## 4. Architecture
### 4.1 System Diagram
ASCII diagram showing component relationships and data flow.

### 4.2 Data Lifecycle
Step-by-step flow from initial state through steady state.

## 5. Technical Design
Subsections for each major design decision:
- Feature flags and gating
- Data models / schema changes
- Key algorithms or patterns
- Integration patterns (how existing code was modified)
- Cache/performance design
- Error handling and fallbacks

## 6. New Files
Table: file path, purpose (one line each).

## 7. Modified Files (Key Changes)
Table: file path, what changed (one line each).
Include ALL files — even minor ones. The cross-check in Phase 3
catches files that agents missed.

## 8. Testing Strategy
### Unit Tests
### Integration / E2E Tests
### Instrumentation / Observability

## 9. Rollout Strategy
How the feature is gated, incremental rollout steps, kill switches.

## 10. Risks and Mitigations
Table: risk, mitigation.

## 11. Summary
Key metrics: files added/modified, lines changed, scope of impact.
```

### Phase 5: Verify Completeness

Cross-check the spec against the branch:

1. Every file in `git diff --stat` should appear in Section 6 or 7
2. Every test file should be referenced in Section 8
3. Feature flags mentioned in code should appear in Section 5/9
4. The architecture diagram should match the actual data flow discovered by agents

## Verification

- Every changed file on the branch is accounted for in the spec
- The architecture diagram accurately represents the data flow
- Product requirements match what the tests actually validate
- No significant design decisions are missing from the technical design section

## Notes

- **Parallel agents are essential**: A branch with 50+ files takes too long to analyze
  sequentially. 3-4 parallel agents cut analysis time by 3-4x.
- **Cross-check is critical**: Agents inevitably miss some files. The Phase 3 cross-check
  catches small but important changes (type declarations, bug fixes, compatibility shims).
- **Infer the "why"**: Code shows "what" but not always "why". Use test assertions, comments,
  commit messages, PR descriptions, and the shape of changes to infer product motivation.
- **Don't over-document incidentals**: Formatting changes, import reordering, and trailing
  commas can be mentioned in a single line rather than getting their own subsection.
- **Use tables liberally**: File inventories, feature flags, risks — tables are scannable
  and compact.
