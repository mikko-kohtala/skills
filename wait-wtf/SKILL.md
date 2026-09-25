---
name: wait-wtf
description: Give the human a short, plain-language recap of what this agent session did, where the work stands, and what needs them, including the state of any linked ticket, branch, or PR. Use when the user says "wait-wtf", "wait what", "wtf happened", "what did you do", "catch me up", "where are we", or returns to a session and wants to understand it fast.
---

# wait-wtf

The user has lost track of this session and wants to understand it in under a minute. Tell them what happened, not how hard it was.

This skill is read-only. Do not fix, commit, push, or change anything while answering. If you spot a problem, report it under **Needs you**.

## 1. Recall the session

Go through the conversation from the start, including any compaction summary:

- What the user asked for, in their words.
- What was actually done: files changed, commands run, decisions made, and who made them (the user or you).
- What failed, was skipped, or was worked around.
- What is left or still waiting.

If the session has no real history (it's fresh, or it only just loaded this skill), say so in one line and rebuild what you can from step 2. Say that the recap comes from git and PR state, not from memory.

## 2. Check the real state

Check what's actually there rather than trusting what the session said. Run only the commands that apply:

```sh
git branch --show-current
git status --short
git log --oneline -10
git worktree list
gh pr view --json number,title,url,state,isDraft,mergeable,reviewDecision   # PR for the current branch
gh pr checks                                                                # CI status
```

- **Ticket**: find IDs such as `ABC-123` in the conversation, the branch name, the commit messages, and the PR title. If a tracker tool is available (Linear, Jira, GitHub issues), look up each ticket's title and status. If none is available, list the ID without a status.
- **PR**: if `gh pr view` finds nothing, look for PR numbers or URLs in the conversation and run `gh pr view <N>` on them. Note whether the PR is merged, open, or a draft, and whether CI passed.
- If the work happened in another directory or worktree, run the commands there.

If what the session claimed doesn't match what's there (the session said a PR was merged but it's still open, or said tests passed but CI failed), report that. It matters more than anything else in the recap.

## 3. Write the recap

Use this exact shape. Write short, concrete lines in plain words, with no filler, no praise, and no explaining your process. Use file names only when they help. Leave out any section that would be empty.

```
**Goal:** <one line: what the user wanted>
**Status:** <Done | In progress | Blocked | Waiting on you> - <one-line reason>

**Done**
- <what changed, as a result, not as steps>

**Not done**
- <what was skipped, failed, or is left>

**Needs you**
- <decision, review, or action only the human can take>

**Links**
- Ticket: <ID> <title> (<status>)
- PR: #<N> <title> (<open/merged/draft>, CI <green/red/pending>) <url>
- Branch: <branch> (<worktree path if not the main checkout>)
```

Rules:

- Keep it to about 15 lines. If there were many changes, group them by outcome.
- Mark anything that isn't confirmed. For example, "tests pass (not re-run)" differs from "tests pass".
- Report failures plainly, such as "CI failed on lint" or "gave up on the migration". Don't soften them.
- After the recap, stop. Don't add a closing question or offer more help.
