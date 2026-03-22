---
description: Simplify recently modified code for clarity and maintainability
allowed-tools: [Read, Edit, Glob, Grep, Bash]
---

## Context

- Current git diff (unstaged changes): !`git diff`
- Current git diff (staged changes): !`git diff --cached`

## Your task

Based on the above changes, simplify and refine the recently modified code for clarity, consistency, and maintainability while preserving all functionality.

Apply the following refinements:

1. **Preserve Functionality**: Never change what the code does - only how it does it. All original features, outputs, and behaviors must remain intact.

2. **Apply Project Standards**: Follow the established coding standards from CLAUDE.md including proper import sorting, naming conventions, error handling patterns, and consistent style.

3. **Enhance Clarity**: Simplify code structure by:
   - Reducing unnecessary complexity and nesting
   - Eliminating redundant code and abstractions
   - Improving readability through clear variable and function names
   - Consolidating related logic
   - Removing unnecessary comments that describe obvious code
   - Avoiding nested ternary operators - prefer switch statements or if/else chains
   - Choosing clarity over brevity

4. **Maintain Balance**: Avoid over-simplification that could reduce clarity, create overly clever solutions, or make the code harder to debug or extend.

Read the changed files, apply refinements directly using the Edit tool, and summarize what was simplified.
