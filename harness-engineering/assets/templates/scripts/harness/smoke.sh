#!/usr/bin/env bash
set -euo pipefail

root_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

run_custom_cmd() {
  local raw="$1"
  local -a cmd=()
  if ! mapfile -t cmd < <(printf '%s\n' "$raw" | xargs -n1 printf '%s\n'); then
    echo "error: HARNESS_SMOKE_CMD has invalid quoting." >&2
    return 2
  fi
  if [ "${#cmd[@]}" -eq 0 ]; then
    echo "error: HARNESS_SMOKE_CMD is set but empty." >&2
    return 2
  fi
  "${cmd[@]}"
}

if [ -n "${HARNESS_SMOKE_CMD:-}" ]; then
  cd "$root_dir"
  run_custom_cmd "$HARNESS_SMOKE_CMD"
  exit 0
fi

if [ -f "$root_dir/Cargo.toml" ] && command -v cargo >/dev/null 2>&1; then
  cd "$root_dir"
  cargo check --quiet
  exit 0
fi

if [ -f "$root_dir/package.json" ] && command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  cd "$root_dir"
  if node -e 'const p=require("./package.json"); process.exit(p.scripts&&p.scripts.smoke?0:1)' >/dev/null 2>&1; then
    npm run -s smoke
    exit 0
  fi
  if node -e 'const p=require("./package.json"); process.exit(p.scripts&&p.scripts.build?0:1)' >/dev/null 2>&1; then
    npm run -s build
    exit 0
  fi
fi

if [ -f "$root_dir/pyproject.toml" ] && command -v pytest >/dev/null 2>&1; then
  cd "$root_dir"
  pytest -q -k smoke || pytest -q -k "not integration and not e2e"
  exit 0
fi

echo "No default smoke command detected."
echo "Set HARNESS_SMOKE_CMD (simple command + args) or customize scripts/harness/smoke.sh."
exit 1
