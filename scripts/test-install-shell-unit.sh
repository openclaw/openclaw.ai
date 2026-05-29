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
  if grep -Fq 'fetch --tags origin' "$script"; then
    fail "$(relative_path "$script"): exact version checkout must not fetch every tag"
  fi

  # Exact version installs should fetch only the requested tag. Fetching the
  # full tag namespace pulls a very large OpenClaw history pack in clean clones.
  # shellcheck disable=SC2016
  require_contains "$script" 'ls-remote --exit-code --tags origin "refs/tags/${ref}"'
  # shellcheck disable=SC2016
  require_contains "$script" 'fetch --depth 1 --no-tags origin "refs/tags/${ref}:refs/tags/${ref}"'
done

echo "install shell unit checks passed"
