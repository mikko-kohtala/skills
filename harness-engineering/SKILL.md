---
name: harness-engineering
description: Guidelines from OpenAI's Harness Engineering discipline for building repositories, tooling, skills, lints, tests, and reviewer agents so coding agents can do the full job while humans steer. Use when auditing a repo for agent-readiness, designing AGENTS.md and skills, deciding what to document vs. lint vs. test vs. delegate to a reviewer agent, setting up QA plans and application legibility (logs/metrics/traces/UI driving), designing agent-friendly CLIs, encoding non-functional requirements, migrating a human-first repo toward agent-first operation, distributing libraries as specs (ghost libraries), or answering questions about progressive disclosure, slop/entropy control, and "code as a disposable build artifact."
version: 2.1.0
author: Mikko Kohtala
tags: [harness-engineering, agent-workflows, agents-md, openai, codex]
---

# Harness Engineering

The discipline of building repositories, tooling, and feedback loops so coding agents can produce, review, and ship software, while humans spend time on prioritization, intent, and system design.

**Humans steer. Agents execute.** The truly scarce resources are human time, human and model attention, and model context window. Every harness decision should buy back one of these.

## When this skill applies

- Designing or auditing `AGENTS.md`, skills, reviewer agents, custom lints, or structural tests.
- Deciding what belongs in docs, code, a lint, a test, or a reviewer agent.
- Migrating a human-first repo toward agent-first operation.
- Triaging why an agent repeats the same mistake — or why you keep typing *continue*.
- Designing an application-legibility stack (boot, UI driving, logs, metrics, traces).
- Distributing a library as a spec rather than code.

Treat these principles as the baseline. Adapt artifacts to the project; do not impose a template.

## How to use this skill

When invoked inside a repo:

1. **Survey.** Read `AGENTS.md` and `docs/` if they exist. Note what's missing.
2. **Find the leak.** Where is synchronous human time going — review, babysitting, copy-paste? Where is agent time going — flaky tests, long builds, missing tools? The next harness investment goes where the biggest leak is.
3. **Propose the cheapest durable fix,** preferring in this order: doc → lint with remediation message → structural test → reviewer agent → tool/skill. Later options cost more but are harder to bypass.
4. **Migrate, don't annotate.** When a new rule is load-bearing, migrate the whole codebase to comply. Don't leave two ways to do anything.
5. **Never impose a template.** Adapt to the stack, the team's throughput, and what the agent is actually struggling with.

## The core shift

**Code is free. Human attention is scarce.** Models produce as much code as tokens allow. What's left is:

- Deciding what's worth building.
- Designing the environment so agents can succeed without supervision.
- Encoding taste and non-functional requirements into artifacts the agent consumes every run.
- Closing the loop when the agent fails — by patching the environment, not the output.

## Principles

### 1. If the agent can't see it, it doesn't exist

Slack threads, Google Docs, and tacit knowledge are invisible. Move institutional knowledge into the repo as markdown, schemas, plans, and executable specs — including decisions, onboarding norms, and tone/culture preferences. The repo is the system of record.

### 2. Map, not encyclopedia

`AGENTS.md` is a ~100-line table of contents that points into `docs/`. A monolithic manual crowds out the task, rots instantly, and when everything is "important," nothing is. Progressive disclosure — small stable entry point, deeper sources of truth — keeps context cheap.

### 3. Optimize for agent legibility

The repo is read by agents orders of magnitude more than by humans. Make it regular: one logger, one async helper, one ORM, one CI script style, one way to construct an observable command, one programming language per layer. Predictable tokens = less wasted reasoning. Finish migrations; don't leave two ways to do anything.

### 4. Enforce invariants, not implementations

Care about boundaries, correctness, reproducibility. Within those, let the agent choose the expression. Encode caring as custom lints whose error messages are **prompts with remediation steps**, structural tests (file-size caps, package privacy, dependency directions, schema deduplication), parsing at the edge + typed contracts inside, and a layered domain architecture with explicit cross-cutting boundaries. *Boundaries centrally, autonomy locally.*

### 5. Every failure is a context gap

A PR comment, a failing build, a production page, a "please also do X" — each means the agent was missing context. **Every `continue` you type is a harness failure.** The loop:

1. **Capture** the failure.
2. **Bucket** by persona (security, reliability, frontend, accessibility, product sense).
3. **Codify** as a doc, lint, structural test, or reviewer-agent rule (pick the most durable).
4. **Migrate** the codebase to comply.

### 6. Code is a disposable build artifact

The source of truth is prompts, docs, lints, tests, and reviewer agents. Code compiles out of those constraints. Swapping models ≈ swapping codegen backends in a compiler (LLVM → Cranelift); the constraints keep the output valid. Distributing a library as a spec ("ghost library") lets the consumer's agent regenerate the implementation.

### 7. Make the agent the entry point

**Do not build an environment and spawn the agent inside it.** The agent (`codex`, `claude`, …) is the entry point; give it skills and CLIs to boot the app, spin up observability, drive the UI, attach DevTools, and tear it all down. Everything reachable from a clean checkout must be reachable from the agent.

### 8. Prefer CLIs over MCP

MCP tools force-inject tokens every turn and interfere with auto-compaction. Thin CLIs are token-efficient, trivially documented in a skill, and invisible to context until invoked. See **CLI design for agents** below.

### 9. Few skills, better skills

Target 5–10 skills. Hide repo-local complexity behind them so internals can change without updating every prompt. When a class of work isn't covered, extend an existing skill before making a new one.

### 10. Throughput changes merge philosophy

Minimal blocking gates. Short-lived PRs minimize merge conflicts; the agent resolves the ones that occur. Flaky tests are re-run, not debated. Push review effort to agent reviewers; reserve humans for the hardest calls.

### 11. Manage entropy daily

Agents replicate existing patterns, including uneven ones. Write down "golden principles" and schedule **daily** cleanup agents that scan for deviations and open refactor PRs. Tech debt is a high-interest loan: pay it down in small daily increments, not quarterly bursts. Expect auto-compaction during long runs — the lint that fires on patch N is more reliable than the rule in `AGENTS.md` you hope is still in context.

### 12. Observability and app legibility are agent features

If the agent can't query logs, metrics, traces, or the running UI, it can't reason about behavior. See **Application legibility** below.

## Prompt surfaces and just-in-time context

Every piece of guidance you give the agent lives on one of these surfaces:

`AGENTS.md` · `docs/` · skills · lint error messages · structural-test assertions · PR review comments · reviewer-agent output · CI output · exception / error strings.

**Don't frontload all rules.** Put them at the point of failure. A lint message that fires on the offending patch is more robust than an `AGENTS.md` bullet the agent may have compacted out 30 minutes ago. Context *will* get paged out over long runs; design for refresh, not one-shot load.

## Non-functional requirements are the product

The 500 small decisions a senior engineer makes — timeouts, retries, structured logging, naming, observability, boundaries, error shapes — are the real output of taste. Models have seen every possible choice in training; they need to be told which one is acceptable here. Every review comment that corrects a non-functional default is a gap that should become a doc, lint, test, or reviewer agent. If the agent makes the same mistake twice, you owe it a guardrail.

## Reviewer agents

- **One per persona.** Security, reliability, frontend, accessibility, product sense. Each reviews against the relevant `docs/` subset.
- **Trigger on every push.** Post inline PR comments.
- **Priority rubric.** P0 = nukes the codebase if merged; P1 = correctness/security blocker; P2 = merge blocker; P3 = advisory. Reviewers **bias toward merge** — surface P2+ sparingly, leave P3s as FYIs.
- **Authoring agent can push back.** It must acknowledge each comment but may accept, defer (file as follow-up), or reject with reasoning. Without this, reviewers bully the author into infinite revision loops.
- **Humans stay on the hardest calls** — zero-to-one, gnarly refactors, release approval.

## Application legibility

For the agent to reason about behavior, the running app must be inspectable:

- **Boot and drive.** A skill that starts the app, spins up an ephemeral per-worktree observability stack, and tears it down.
- **UI perception.** Agents reason in latent space, not vision — provide *both* DOM snapshots and screenshots. Wire Chrome DevTools Protocol through a thin CLI.
- **Signals.** Logs via LogQL, metrics via PromQL, traces via TraceQL. Prompts like "ensure service startup under 800ms" only work when the agent can measure.
- **Smoke tests.** A skill that runs critical user journeys and produces a pass/fail artifact.
- **QA artifact on the PR.** Screenshot, short video, or checked acceptance-criteria list — the compressed evidence the agent did the work, so the reviewer doesn't replay the session.

## CLI design for agents

- **Silent on success.** No noise to burn tokens parsing.
- **Failure summary at the top** of output, not line 4,212. Wrap tools whose native output buries the error.
- **Remediation in error messages.** Error strings are prompts; write them like a teammate's guidance.
- **Single-purpose shims.** If the agent only uses 3 of Playwright's 30 calls, expose exactly those 3.
- **Clean-checkout callable.** No hidden daemons humans must start first.
- **Structured or parseable output** where natural (JSON, tabular) so downstream tools can chain without fragile regex.

## Existing-repo adoption loop

Brownfield is the common case. Apply in order:

1. **Lock behavior with tests.** The agent moves faster when it can verify it didn't break anything.
2. **Capture** the next 5–10 review comments and build failures the agent actually receives.
3. **Bucket** by persona.
4. **Codify** each bucket into the cheapest durable surface (doc → lint → test → reviewer).
5. **Migrate** the codebase once a rule is load-bearing.
6. **Shrink `AGENTS.md`** to a ~100-line map as `docs/` fills in.
7. **Ratchet.** Set quality budgets (build time, file size, coverage, flake rate); when one is breached, decompose — don't relax the invariant.

## Spec as the real source of truth

For libraries meant to be shared: **distribute the spec, not the code.** The spec plus the consumer's harness regenerates a valid implementation. Refine specs with a Ralph-style loop:

spec → fresh agent implements in isolation → second agent diffs against reference → update spec → repeat until divergence is low.

Swapping models ≈ swapping codegen backends; the spec stays stable.

## What humans still do

- Prioritize work and translate intent into acceptance criteria.
- Define success metrics and reliability targets.
- Resolve hard / new / zero-to-one product judgment.
- Approve high-risk releases and destructive ops.
- **Improve the harness when the agent fails.** The fix is almost never "prompt harder."

Humans do not manually write code.

## Artifacts that tend to appear

Not a template — shapes agent-first repos converge to. Adapt freely.

- **`AGENTS.md`** — ~100-line map into `docs/`.
- **`docs/`** — the knowledge base:
  - `ARCHITECTURE.md`, `core-beliefs.md` (team, product, pilot customers, 12-month vision, tone/culture), `QUALITY_SCORE.md` (grades per domain/layer).
  - `design-docs/` with `index.md` and `core-beliefs.md`.
  - `exec-plans/active/`, `exec-plans/completed/`, `tech-debt-tracker.md`.
  - `product-specs/` with an index.
  - `references/` — vendored `llms.txt` for dependencies, design systems.
  - Cross-cutting: `DESIGN.md`, `FRONTEND.md`, `PLANS.md`, `PRODUCT_SENSE.md`, `RELIABILITY.md`, `SECURITY.md`.
- **Skills** — 5–10, each invocable by name.
- **Custom lints** — error messages written as prompts with remediation.
- **Structural tests** — boundaries, file-size caps, schema uniqueness, naming, dependency direction.
- **Reviewer agents** — persona-based, on every push, with P0–P3 rubric.
- **QA plan template** — required media attachments (screenshot / video / checklist).
- **Execution plans** — first-class artifacts for multi-hour work, checked in.
- **Local observability stack** — ephemeral per-worktree, queryable by the agent.
- **App-legibility shims** — DevTools, screenshots, DOM snapshots, tiny CLI wrappers around Playwright etc.
- **Golden-principles doc + daily garbage-collection agents** — scan, update `QUALITY_SCORE.md`, open small refactor PRs.
- **Ghost-library spec** — if you distribute, distribute the spec.

## Common pitfalls

- **One giant `AGENTS.md`.** Split into `docs/` with a short map.
- **Frontloading every rule.** Put rules at the point of failure, not the top of context.
- **Reviewer agents with no priority rubric.** Without P0–P3, they bully the author into infinite revision.
- **Tools the agent can't parse.** If the failure is on line 4,212, wrap the tool.
- **Letting build time drift.** When the budget is breached, decompose; don't relax.
- **Open-ended migrations.** Finish them; don't leave two ways to do anything.
- **Human dashboards where a direct agent query would do.** You're not the one debugging it.
- **Human-oriented style over agent legibility.** Optimize for the agent; humans adapt.
- **Rebuilding what the coding harness already provides.** Codex/Claude are post-trained with their native tools. Plug in via SDKs and skills; don't wrap them in a bespoke ROS-style scaffold.
- **Feature flags and backwards-compat shims.** In a free-code world, migrate and delete.
- **Babysitting runs.** Every `continue` is a missing guardrail.
- **Blocking on flakes.** Retry, then fix the root cause async.
- **One-off plans over codified rules.** If you say it twice in a prompt, it belongs in a lint or a reviewer agent.
- **Distributing libraries as code** when a spec would do.
- **Depending on tools the agent can't invoke from a clean checkout.**
- **Too many skills.** Extend first; add sparingly.

## Further reading

- OpenAI: "Harness engineering: leveraging Codex in an agent-first world" (Ryan Lopopolo, 2026-02) — https://openai.com/index/harness-engineering/
- AI Engineer talk: "Harness Engineering: How to Build Software When Humans Steer, Agents Execute" (2026-04) — https://www.youtube.com/watch?v=am_oeAoUhew
- Podcast: "Extreme Harness Engineering: 1M LOC, 1B toks/day, 0% human code or review" (2026-04) — https://www.youtube.com/watch?v=CeOXx-XTYek
- Martin Fowler: "Harness Engineering" — https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html
- "Parse, don't validate" (Lexi Lambda) — https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/
- `AGENTS.md` convention — https://agents.md/
- `ARCHITECTURE.md` convention (matklad) — https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html
- Execution plans (OpenAI cookbook) — https://cookbook.openai.com/articles/codex_exec_plans
- "AI is forcing us to write good code" (boundaries) — https://bits.logic.inc/p/ai-is-forcing-us-to-write-good-code
