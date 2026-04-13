#!/usr/bin/env python3
"""Extract and summarize Claude Code conversation transcripts for a project.

Finds all conversations for the current project (including worktrees),
parses JSONL transcripts, and outputs a condensed summary suitable for
pattern analysis.

Usage:
    python3 extract_conversations.py [OPTIONS]

Options:
    --cwd PATH           Project directory (default: current directory)
    --max-sessions N     Maximum sessions to include (default: 200)
    --max-chars N        Maximum output characters (default: 400000)
    --since YYYY-MM-DD   Only sessions after this date
    --min-turns N        Minimum user turns per session (default: 2)
    --exact              Only match base project + worktrees (not sibling projects)
    --skip-reviews       Skip directories with -review- or -meta- in name
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path


CLAUDE_PROJECTS_DIR = os.path.expanduser("~/.claude/projects")

SKIP_RECORD_TYPES = {
    "file-history-snapshot",
    "permission-mode",
    "attachment",
    "pr-link",
    "progress",
}


def resolve_base_project_path(cwd: str) -> str:
    """Resolve the base project path, stripping worktree suffixes.

    If cwd contains '-worktrees/', extracts the path before that marker.
    E.g. /code/proj-worktrees/feat-x -> /code/proj
    """
    cwd = os.path.realpath(cwd)
    marker = "-worktrees/"
    idx = cwd.find(marker)
    if idx != -1:
        return cwd[:idx]
    if cwd.endswith("-worktrees"):
        return cwd[: -len("-worktrees")]
    return cwd


def encode_project_path(path: str) -> str:
    """Encode a path to Claude Code's project directory naming.

    /Users/mikko/code/proj -> -Users-mikko-code-proj
    """
    return "-" + path.lstrip("/").replace("/", "-")


def find_project_directories(encoded_base: str, exact: bool = False, skip_reviews: bool = False) -> list[str]:
    """Find all Claude project directories matching the encoded base prefix."""
    if not os.path.isdir(CLAUDE_PROJECTS_DIR):
        return []

    matches = []
    for entry in sorted(os.listdir(CLAUDE_PROJECTS_DIR)):
        full = os.path.join(CLAUDE_PROJECTS_DIR, entry)
        if not os.path.isdir(full):
            continue

        if exact:
            if entry != encoded_base and not entry.startswith(encoded_base + "-worktrees-"):
                continue
        else:
            if not entry.startswith(encoded_base):
                continue

        if skip_reviews and ("-review-" in entry or "-meta-" in entry):
            continue

        matches.append(full)

    return matches


def collect_sessions(
    project_dirs: list[str],
    max_sessions: int = 200,
    since: str | None = None,
    min_turns: int = 2,
) -> list[dict]:
    """Collect JSONL session files from project directories.

    Only collects top-level .jsonl files (not in subagent subdirectories).
    """
    sessions = []
    since_ts = None
    if since:
        since_ts = datetime.fromisoformat(since).timestamp()

    for proj_dir in project_dirs:
        dir_name = os.path.basename(proj_dir)
        try:
            entries = os.listdir(proj_dir)
        except PermissionError:
            continue

        for entry in entries:
            if not entry.endswith(".jsonl"):
                continue
            full = os.path.join(proj_dir, entry)
            if not os.path.isfile(full):
                continue

            mtime = os.path.getmtime(full)
            if since_ts and mtime < since_ts:
                continue

            session_id = entry.removesuffix(".jsonl")
            sessions.append({
                "path": full,
                "project_dir_name": dir_name,
                "session_id": session_id,
                "mtime": mtime,
            })

    sessions.sort(key=lambda s: s["mtime"], reverse=True)

    # Pre-filter by min_turns if needed (quick scan)
    if min_turns > 1:
        filtered = []
        for s in sessions:
            if len(filtered) >= max_sessions * 3:  # scan up to 3x to find enough
                break
            turn_count = _count_user_turns(s["path"])
            if turn_count >= min_turns:
                s["user_turns"] = turn_count
                filtered.append(s)
        sessions = filtered

    return sessions[:max_sessions]


def _count_user_turns(path: str) -> int:
    """Quick scan to count real user turns in a JSONL file."""
    count = 0
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if rec.get("type") != "user":
                    continue
                msg = rec.get("message", {})
                if not isinstance(msg, dict):
                    continue
                content = msg.get("content", "")
                if isinstance(content, str) and content and not content.startswith("<"):
                    count += 1
    except (OSError, PermissionError):
        pass
    return count


def extract_session(path: str, max_assistant_chars: int = 800) -> dict | None:
    """Parse a JSONL session file and extract conversation turns.

    Returns session metadata and a list of (role, text) turns.
    Skips thinking, tool_use, tool_result, and system messages.
    """
    turns = []
    metadata = {
        "session_id": Path(path).stem,
        "branch": None,
        "timestamp": None,
        "cwd": None,
        "project_dir": os.path.basename(os.path.dirname(path)),
    }
    metadata_extracted = False

    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    continue

                rec_type = rec.get("type", "")

                if rec_type in SKIP_RECORD_TYPES:
                    continue
                if rec.get("isSidechain"):
                    continue

                # Extract metadata from first user message
                if not metadata_extracted and rec_type == "user":
                    metadata["branch"] = rec.get("gitBranch")
                    metadata["timestamp"] = rec.get("timestamp")
                    metadata["cwd"] = rec.get("cwd")
                    metadata_extracted = True

                if rec_type == "user":
                    text = _extract_user_text(rec)
                    if text:
                        turns.append(("USER", text))

                elif rec_type == "assistant":
                    text = _extract_assistant_text(rec, max_assistant_chars)
                    if text:
                        turns.append(("ASSISTANT", text))

    except (OSError, PermissionError):
        return None

    if not turns:
        return None

    metadata["turns"] = turns
    return metadata


def _filter_skill_injection(text: str) -> str | None:
    """Filter out injected skill SKILL.md content from user messages.

    When a skill is invoked, Claude Code injects the full SKILL.md as a user
    message starting with "Base directory for this skill:". The actual user
    intent is in the ARGUMENTS: line at the end. Extract only that.
    """
    if not text.startswith("Base directory for this skill:"):
        return text

    # Look for ARGUMENTS: line — contains the actual user intent
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if line.startswith("ARGUMENTS:"):
            args = line[len("ARGUMENTS:"):].strip()
            if args:
                return f"[skill invocation] {args}"
            return None
    # Skill injection with no arguments — skip entirely
    return None


def _extract_user_text(rec: dict) -> str | None:
    """Extract text from a user message record."""
    msg = rec.get("message", {})
    if not isinstance(msg, dict):
        return None
    content = msg.get("content", "")

    if isinstance(content, str):
        if content.startswith("<"):
            return None
        text = content.strip()
        if not text:
            return None
        return _filter_skill_injection(text)

    if isinstance(content, list):
        # Skip if all blocks are tool_result
        has_non_tool = False
        text_parts = []
        for block in content:
            if not isinstance(block, dict):
                continue
            if block.get("type") == "text":
                has_non_tool = True
                text_parts.append(block.get("text", ""))
            elif block.get("type") != "tool_result":
                has_non_tool = True

        if not has_non_tool:
            return None
        combined = "\n".join(text_parts).strip()
        if not combined or combined.startswith("<"):
            return None
        return _filter_skill_injection(combined)

    return None


def _extract_assistant_text(rec: dict, max_chars: int) -> str | None:
    """Extract text blocks from an assistant message, truncating if needed."""
    msg = rec.get("message", {})
    if not isinstance(msg, dict):
        return None
    content = msg.get("content", [])
    if not isinstance(content, list):
        return None

    text_parts = []
    for block in content:
        if not isinstance(block, dict):
            continue
        if block.get("type") == "text":
            text_parts.append(block.get("text", ""))

    if not text_parts:
        return None

    combined = "\n".join(text_parts).strip()
    if not combined:
        return None

    if len(combined) > max_chars:
        combined = combined[:max_chars] + " [...]"
    return combined


def decode_project_dir_name(dir_name: str) -> str:
    """Decode a Claude project directory name back to a readable path.

    -Users-mikko-code-proj -> /Users/mikko/code/proj
    """
    return "/" + dir_name.lstrip("-").replace("-", "/")


def format_timestamp(ts: str | None) -> str:
    """Format an ISO timestamp to a short date string."""
    if not ts:
        return "unknown"
    try:
        if isinstance(ts, (int, float)):
            dt = datetime.fromtimestamp(ts / 1000 if ts > 1e12 else ts)
        else:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d %H:%M")
    except (ValueError, TypeError, OSError):
        return "unknown"


CLAUDE_PLANS_DIR = os.path.expanduser("~/.claude/plans")


def collect_plans(base_project_path: str, max_plans: int = 50) -> list[dict]:
    """Collect plan files related to the project from ~/.claude/plans/.

    Plans are matched by searching for the project's directory name or
    common identifiers (repo name, ticket prefix) in the file content.
    """
    if not os.path.isdir(CLAUDE_PLANS_DIR):
        return []

    # Derive search terms from the project path
    # e.g. /Users/mikko/code/dna/dna-sampo -> ["dna-sampo", "dna/dna-sampo"]
    project_name = os.path.basename(base_project_path)
    search_terms = [project_name.lower()]

    plans = []
    try:
        entries = sorted(os.listdir(CLAUDE_PLANS_DIR))
    except (OSError, PermissionError):
        return []

    for entry in entries:
        if not entry.endswith(".md"):
            continue
        full = os.path.join(CLAUDE_PLANS_DIR, entry)
        if not os.path.isfile(full):
            continue

        try:
            with open(full, "r", encoding="utf-8", errors="replace") as f:
                content = f.read(8000)  # Read first 8KB for matching
        except (OSError, PermissionError):
            continue

        content_lower = content.lower()
        if not any(term in content_lower for term in search_terms):
            continue

        # Extract title (first # heading) and context
        title = entry.removesuffix(".md")
        context_snippet = ""
        for line in content.split("\n"):
            if line.startswith("# "):
                title = line[2:].strip()
                continue
            if line.startswith("## Context") or line.startswith("## context"):
                # Grab the next ~500 chars as context
                idx = content.index(line) + len(line)
                context_snippet = content[idx:idx + 500].strip()
                break

        mtime = os.path.getmtime(full)
        plans.append({
            "path": full,
            "filename": entry,
            "title": title,
            "context": context_snippet,
            "mtime": mtime,
        })

    plans.sort(key=lambda p: p["mtime"], reverse=True)
    return plans[:max_plans]


def format_plans_section(plans: list[dict]) -> str:
    """Format collected plans into a summary section."""
    if not plans:
        return ""

    parts = ["\n# Plans Summary\n\n"]
    parts.append(f"Related plans found: {len(plans)}\n\n")

    for plan in plans:
        ts = format_timestamp(plan["mtime"])
        parts.append(f"### {plan['title']} ({ts})\n")
        if plan["context"]:
            # Trim to first meaningful paragraph
            ctx = plan["context"].strip()
            if len(ctx) > 400:
                ctx = ctx[:400] + "..."
            parts.append(f"{ctx}\n\n")
        else:
            parts.append("\n")

    return "".join(parts)


def format_output(sessions: list[dict], max_chars: int, plans: list[dict] | None = None) -> str:
    """Format extracted sessions into structured text output."""
    if not sessions:
        return "# Conversation Mining Report\n\nNo conversations found for this project.\n"

    # Collect stats
    dates = []
    for s in sessions:
        ts = s.get("timestamp")
        if ts:
            dates.append(ts)

    # Count unique project dirs
    proj_dirs = set(s.get("project_dir", "") for s in sessions)

    header = (
        "# Conversation Mining Report\n"
        f"Sessions included: {len(sessions)}\n"
        f"Project directories: {len(proj_dirs)}\n"
    )
    if plans:
        header += f"Related plans: {len(plans)}\n"
    header += "---\n\n"

    output_parts = [header]
    current_chars = len(header)

    # Plans first — they're higher-signal (decisions, approaches, context)
    if plans:
        plans_text = format_plans_section(plans)
        if current_chars + len(plans_text) < max_chars:
            output_parts.append(plans_text)
            current_chars += len(plans_text)
        else:
            available = max_chars - current_chars - 100
            if available > 500:
                output_parts.append(plans_text[:available] + "\n\n[plans truncated]\n")
                current_chars += available + 25

    budget_exhausted = False

    for session in sessions:
        if budget_exhausted:
            break

        branch = session.get("branch") or "unknown"
        ts = format_timestamp(session.get("timestamp"))
        proj_dir = session.get("project_dir", "")
        turns = session.get("turns", [])

        session_header = f"=== Branch: {branch} | Date: {ts} | Dir: {proj_dir} ===\n\n"

        if current_chars + len(session_header) + 50 > max_chars:
            break

        output_parts.append(session_header)
        current_chars += len(session_header)

        for role, text in turns:
            remaining = max_chars - current_chars
            if remaining < 200:
                budget_exhausted = True
                break
            line = f"[{role}] {text}\n\n"
            if len(line) > remaining - 50:
                # Truncate this turn to fit
                available = remaining - 60
                if available > 100:
                    line = f"[{role}] {text[:available]} [...]\n\n"
                else:
                    budget_exhausted = True
                    break
            output_parts.append(line)
            current_chars += len(line)

        output_parts.append("---\n\n")
        current_chars += 5

    return "".join(output_parts)


def main():
    parser = argparse.ArgumentParser(description="Extract Claude Code conversation transcripts")
    parser.add_argument("--cwd", default=os.getcwd(), help="Project directory")
    parser.add_argument("--max-sessions", type=int, default=200, help="Max sessions to include")
    parser.add_argument("--max-chars", type=int, default=200000, help="Max output characters")
    parser.add_argument("--since", default=None, help="Only sessions after YYYY-MM-DD")
    parser.add_argument("--min-turns", type=int, default=2, help="Min user turns per session")
    parser.add_argument("--exact", action="store_true", help="Only match base + worktrees")
    parser.add_argument("--skip-reviews", action="store_true", help="Skip review/meta directories")
    parser.add_argument("--no-plans", action="store_true", help="Exclude plan files from ~/.claude/plans/ (included by default)")

    args = parser.parse_args()

    base_path = resolve_base_project_path(args.cwd)
    encoded_base = encode_project_path(base_path)

    print(f"Base project: {base_path}", file=sys.stderr)
    print(f"Encoded prefix: {encoded_base}", file=sys.stderr)

    project_dirs = find_project_directories(encoded_base, exact=args.exact, skip_reviews=args.skip_reviews)
    print(f"Project directories found: {len(project_dirs)}", file=sys.stderr)

    if not project_dirs:
        print("No matching project directories found in ~/.claude/projects/", file=sys.stderr)
        print("# Conversation Mining Report\n\nNo conversations found for this project.\n")
        sys.exit(0)

    sessions_meta = collect_sessions(
        project_dirs,
        max_sessions=args.max_sessions,
        since=args.since,
        min_turns=args.min_turns,
    )
    print(f"Sessions after filtering: {len(sessions_meta)}", file=sys.stderr)

    sessions = []
    for i, meta in enumerate(sessions_meta):
        if (i + 1) % 20 == 0:
            print(f"Processing session {i + 1}/{len(sessions_meta)}...", file=sys.stderr)
        session = extract_session(meta["path"])
        if session:
            sessions.append(session)

    print(f"Sessions with content: {len(sessions)}", file=sys.stderr)

    plans = None
    if not args.no_plans:
        plans = collect_plans(base_path)
        print(f"Related plans found: {len(plans)}", file=sys.stderr)

    output = format_output(sessions, args.max_chars, plans=plans)
    print(output)


if __name__ == "__main__":
    main()
