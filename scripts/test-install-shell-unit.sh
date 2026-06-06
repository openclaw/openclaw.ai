#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS=("${ROOT_DIR}/public/install.sh" "${ROOT_DIR}/public/install-cli.sh")

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

relative_path() {
  local file="$1"
  case "$file" in
    "${ROOT_DIR}"/*) printf '%s\n' "${file#"${ROOT_DIR}/"}" ;;
    *) printf '%s\n' "$file" ;;
  esac
}

require_contains() {
  local script="$1"
  local pattern="$2"
  if ! grep -Fq "$pattern" "$script"; then
    fail "$(relative_path "$script"): missing pattern: $pattern"
  fi
}

for script in "${SCRIPTS[@]}"; do
  # Moving git refs should avoid tag fetches. Unknown refs fall back to tags
  # only after branch detection has ruled out a branch checkout.
  # shellcheck disable=SC2016
  require_contains "$script" 'fetch --no-tags origin main'
  # shellcheck disable=SC2016
  require_contains "$script" 'fetch --no-tags origin "refs/heads/${ref}:refs/remotes/origin/${ref}"'
  require_contains "$script" 'pull --rebase --no-tags || true'

  branch_check_line="$(grep -nF 'ls-remote --exit-code --heads origin "$ref"' "$script" | head -n1 | cut -d: -f1 || true)"
  tag_fetch_line="$(grep -nF 'fetch --tags origin' "$script" | head -n1 | cut -d: -f1 || true)"
  if [[ -z "$branch_check_line" || -z "$tag_fetch_line" ]]; then
    fail "$(relative_path "$script"): missing branch check or tag fallback fetch"
  fi
  if (( branch_check_line >= tag_fetch_line )); then
    fail "$(relative_path "$script"): tag fallback must happen after branch detection"
  fi
done

echo "install shell unit checks passed"
