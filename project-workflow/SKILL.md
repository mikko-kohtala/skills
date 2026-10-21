---
name: project-workflow
description: "Use before changing a repository that has adopted this skill, or when the user asks for it. Ticket, gwt worktree, verify, PR, merge, clean up. Skip read-only tasks."
---

# Project workflow

The repository's CLAUDE.md and the owner's directions override this. Skip it for read-only tasks.

1. **Ticket.** Create an issue in the repository's Linear project and move it to In Progress. No project: no ticket. Never create a project or use an unrelated one.
2. **Worktree.** `gwt add <branch>` before editing, and work there; never edit the main checkout. Reuse the task's worktree if it has one. Branch: issue ID plus a few words, e.g. `abc-12-fix-login-redirect`.
3. **Verify.** Run the required checks and the tests the change needs. Visible change: run it and look. Record what passed and what's left.
4. **PR.** Review the diff (`code-review` at `medium` in Claude Code) and fix findings. `gh pr create`; end the title with the issue ID, e.g. `(ABC-12)`. Body: resulting behavior and how it was verified.
5. **Merge.** When verification and required CI pass: `gh pr merge <N> --squash`. Not when the owner wants to review first, or the change touches production data, releases or deploys. Never `--delete-branch`; it skips gwt's cleanup hooks.
6. **Clean up.** After the merge, from the main checkout: `gwt remove -f <branch>`, `git pull --ff-only`, issue to Done. Keep the worktree while a PR awaits review.

A merge is never a release, deploy or version bump; those need separate approval.

If a tool or service is unavailable, name the blocked step and continue independent work. Never bypass the worktree rule or report a step done that wasn't.
