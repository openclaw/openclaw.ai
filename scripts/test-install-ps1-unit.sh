#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS=("${ROOT_DIR}/public/install.ps1")
if [[ -f "${ROOT_DIR}/dist/install.ps1" ]]; then
  SCRIPTS+=("${ROOT_DIR}/dist/install.ps1")
fi

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
  exit_lines="$(grep -nE '^[[:space:]]*exit\b' "$script" || true)"
  # shellcheck disable=SC2016
  if [[ "$exit_lines" != *'exit $script:InstallExitCode'* ]]; then
    fail "$(relative_path "$script"): expected the only installer exit to live in Complete-Install"
  fi
  if [[ "$(printf '%s\n' "$exit_lines" | sed '/^$/d' | wc -l | tr -d ' ')" != "1" ]]; then
    printf '%s\n' "$exit_lines" >&2
    fail "$(relative_path "$script"): unexpected extra exit usage"
  fi

  main_body="$(awk '
    /^function Main \{/ { in_main = 1; next }
    /^\$mainResults = @\(Main\)/ { in_main = 0 }
    in_main { print }
  ' "$script")"

  if grep -E '^[[:space:]]*exit\b' <<<"$main_body" >/dev/null; then
    fail "$(relative_path "$script"): Main must not call exit"
  fi

  require_contains "$script" 'function Fail-Install {'
  require_contains "$script" 'function Complete-Install {'
  require_contains "$script" 'function Test-BooleanSuccessResult {'
  require_contains "$script" 'function Resolve-NpmOpenClawInstallSpec {'
  # shellcheck disable=SC2016
  require_contains "$script" '$npmInstallArguments = @("install", "-g") + $freshnessArgs + @("$installSpec")'
  # shellcheck disable=SC2016
  require_contains "$script" 'Invoke-NpmCommand -Arguments $npmInstallArguments'
  # shellcheck disable=SC2016
  require_contains "$script" 'return "$PackageName@$trimmedTag"'
  require_contains "$script" 'return (Fail-Install -Code 2)'
  require_contains "$script" 'return (Fail-Install)'
  # shellcheck disable=SC2016
  require_contains "$script" '$mainResults = @(Main)'
  # shellcheck disable=SC2016
  require_contains "$script" '$installSucceeded = Test-BooleanSuccessResult -Results $mainResults'
  # shellcheck disable=SC2016
  require_contains "$script" 'Complete-Install -Succeeded:$installSucceeded'
  # shellcheck disable=SC2016
  require_contains "$script" 'throw "OpenClaw installation failed with exit code $($script:InstallExitCode)."'
done

echo "install.ps1 unit checks passed"
