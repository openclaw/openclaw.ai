#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2030,SC2031,SC2016,SC2317,SC2329
set -euo pipefail

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

assert_eq() {
  local got="$1"
  local want="$2"
  local msg="${3:-}"
  if [[ "$got" != "$want" ]]; then
    fail "${msg} expected=${want} got=${got}"
  fi
}

assert_nonempty() {
  local got="$1"
  local msg="${2:-}"
  if [[ -z "$got" ]]; then
    fail "${msg} expected non-empty"
  fi
}

assert_contains() {
  local got="$1"
  local want="$2"
  local msg="${3:-}"
  if [[ "$got" != *"$want"* ]]; then
    fail "${msg} expected to contain=${want} got=${got}"
  fi
}

make_exe() {
  local path="$1"
  shift || true
  mkdir -p "$(dirname "$path")"
  cat >"$path" <<EOF
#!/usr/bin/env bash
set -euo pipefail
$*
EOF
  chmod +x "$path"
}

stub_ui_and_quiet_runner() {
  ui_info() { :; }
  ui_success() { :; }
  ui_warn() { :; }
  ui_error() { :; }
  run_quiet_step() {
    local _title="$1"
    shift
    "$@"
  }
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

export OPENCLAW_INSTALL_SH_NO_RUN=1
export CLAWDBOT_INSTALL_SH_NO_RUN=1
# shellcheck source=../public/install.sh
source "${ROOT_DIR}/public/install.sh"

echo "==> case: resolve_openclaw_bin (direct PATH)"
(
  bin="${TMP_DIR}/case-path/bin"
  make_exe "${bin}/openclaw" 'echo "ok" >/dev/null'
  export PATH="${bin}:/usr/bin:/bin"

  got="$(resolve_openclaw_bin)"
  assert_eq "$got" "${bin}/openclaw" "resolve_openclaw_bin (direct PATH)"
)

echo "==> case: resolve_openclaw_bin (npm prefix -g)"
(
  root="${TMP_DIR}/case-npm-prefix"
  prefix="${root}/prefix"
  tool_bin="${root}/tool-bin"

  make_exe "${tool_bin}/npm" "if [[ \"\$1\" == \"prefix\" && \"\$2\" == \"-g\" ]]; then echo \"${prefix}\"; exit 0; fi; if [[ \"\$1\" == \"config\" && \"\$2\" == \"get\" && \"\$3\" == \"prefix\" ]]; then echo \"${prefix}\"; exit 0; fi; exit 1"
  make_exe "${prefix}/bin/openclaw" 'echo "ok" >/dev/null'

  export PATH="${tool_bin}:/usr/bin:/bin"

  got="$(resolve_openclaw_bin)"
  assert_eq "$got" "${prefix}/bin/openclaw" "resolve_openclaw_bin (npm prefix -g)"
)

echo "==> case: resolve_openclaw_bin (nodenv rehash shim creation)"
(
  root="${TMP_DIR}/case-nodenv"
  shim="${root}/shims"
  tool_bin="${root}/tool-bin"

  mkdir -p "${shim}"
  make_exe "${tool_bin}/npm" "exit 1"
  cat >"${tool_bin}/nodenv" <<EOF
#!/usr/bin/env bash
set -euo pipefail
if [[ "\${1:-}" == "rehash" ]]; then
  cat >"${shim}/openclaw" <<'SHIM'
#!/usr/bin/env bash
set -euo pipefail
echo ok >/dev/null
SHIM
  chmod +x "${shim}/openclaw"
  exit 0
fi
exit 0
EOF
  chmod +x "${tool_bin}/nodenv"

  export PATH="${shim}:${tool_bin}:/usr/bin:/bin"
  command -v openclaw >/dev/null 2>&1 && fail "precondition: openclaw unexpectedly present"

  got="$(resolve_openclaw_bin)"
  assert_eq "$got" "${shim}/openclaw" "resolve_openclaw_bin (nodenv rehash)"
)

echo "==> case: warn_openclaw_not_found (smoke)"
(
  root="${TMP_DIR}/case-warn"
  tool_bin="${root}/tool-bin"
  make_exe "${tool_bin}/npm" 'if [[ "$1" == "prefix" && "$2" == "-g" ]]; then echo "/tmp/prefix"; exit 0; fi; if [[ "$1" == "config" && "$2" == "get" && "$3" == "prefix" ]]; then echo "/tmp/prefix"; exit 0; fi; exit 1'
  export PATH="${tool_bin}:/usr/bin:/bin"

  out="$(warn_openclaw_not_found 2>&1 || true)"
  assert_nonempty "$out" "warn_openclaw_not_found output"
)

echo "==> case: duplicate OpenClaw install warning (multiple npm roots)"
(
  root="${TMP_DIR}/case-duplicate-openclaw"
  mkdir -p "${root}/brew/openclaw" "${root}/fnm/openclaw"
  printf '{"version":"2026.3.7"}\n' > "${root}/brew/openclaw/package.json"
  printf '{"version":"2026.3.1"}\n' > "${root}/fnm/openclaw/package.json"

  collect_openclaw_npm_root_candidates() { printf '%s\n' "${root}/brew" "${root}/fnm"; }
  # shellcheck disable=SC2034
  OPENCLAW_BIN="${root}/fnm/.bin/openclaw"
  ui_warn() { echo "WARN: $*"; }

  out="$(warn_duplicate_openclaw_global_installs 2>&1)"
  assert_contains "$out" "Multiple OpenClaw global installs detected" "duplicate OpenClaw warning header"
  assert_contains "$out" "2026.3.7" "duplicate OpenClaw warning first version"
  assert_contains "$out" "2026.3.1" "duplicate OpenClaw warning second version"
  assert_contains "$out" "${root}/brew/openclaw" "duplicate OpenClaw warning first path"
  assert_contains "$out" "${root}/fnm/openclaw" "duplicate OpenClaw warning second path"
  assert_contains "$out" "Active openclaw:" "duplicate OpenClaw warning active binary"
  assert_contains "$out" "npm uninstall -g openclaw" "duplicate OpenClaw warning cleanup hint"
)

echo "==> case: duplicate OpenClaw install warning (single npm root is quiet)"
(
  root="${TMP_DIR}/case-single-openclaw"
  mkdir -p "${root}/only/openclaw"
  printf '{"version":"2026.3.7"}\n' > "${root}/only/openclaw/package.json"

  collect_openclaw_npm_root_candidates() { printf '%s\n' "${root}/only"; }
  ui_warn() { echo "WARN: $*"; }

  out="$(warn_duplicate_openclaw_global_installs 2>&1 || true)"
  assert_eq "$out" "" "duplicate OpenClaw warning single root output"
)

echo "==> case: ensure_pnpm (existing pnpm command)"
(
  root="${TMP_DIR}/case-pnpm-existing"
  tool_bin="${root}/tool-bin"
  make_exe "${tool_bin}/pnpm" 'if [[ "${1:-}" == "--version" ]]; then echo "10.29.2"; exit 0; fi; exit 0'

  export PATH="${tool_bin}:/usr/bin:/bin"
  PNPM_CMD=()
  stub_ui_and_quiet_runner

  ensure_pnpm
  assert_eq "${PNPM_CMD[*]}" "pnpm" "ensure_pnpm (existing pnpm)"
)

echo "==> case: ensure_pnpm (corepack fallback when pnpm shim missing)"
(
  root="${TMP_DIR}/case-pnpm-corepack-fallback"
  tool_bin="${root}/tool-bin"
  mkdir -p "${tool_bin}"

  cat >"${tool_bin}/corepack" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "enable" ]]; then
  exit 0
fi
if [[ "${1:-}" == "prepare" ]]; then
  exit 0
fi
if [[ "${1:-}" == "pnpm" && "${2:-}" == "--version" ]]; then
  echo "10.29.2"
  exit 0
fi
if [[ "${1:-}" == "pnpm" ]]; then
  shift
  echo "corepack-pnpm:$*" >/dev/null
  exit 0
fi
exit 1
EOF
  chmod +x "${tool_bin}/corepack"

  export PATH="${tool_bin}:/usr/bin:/bin"
  PNPM_CMD=()
  stub_ui_and_quiet_runner

  ensure_pnpm
  assert_eq "${PNPM_CMD[*]}" "corepack pnpm" "ensure_pnpm (corepack fallback)"
  out="$(run_pnpm --version)"
  assert_nonempty "$out" "run_pnpm --version output"
)

echo "==> case: ensure_pnpm_binary_for_scripts (user-local wrapper fallback)"
(
  root="${TMP_DIR}/case-pnpm-user-wrapper"
  tool_bin="${root}/tool-bin"
  home_dir="${root}/home"
  mkdir -p "${tool_bin}" "${home_dir}"

  cat >"${tool_bin}/corepack" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "enable" ]]; then
  exit 0
fi
if [[ "${1:-}" == "prepare" ]]; then
  exit 0
fi
if [[ "${1:-}" == "pnpm" && "${2:-}" == "--version" ]]; then
  echo "10.29.2"
  exit 0
fi
if [[ "${1:-}" == "pnpm" ]]; then
  exit 0
fi
exit 1
EOF
  chmod +x "${tool_bin}/corepack"

  export HOME="${home_dir}"
  export PATH="${tool_bin}:/usr/bin:/bin"
  PNPM_CMD=(corepack pnpm)
  stub_ui_and_quiet_runner

  ensure_pnpm_binary_for_scripts
  got="$(command -v pnpm || true)"
  assert_eq "$got" "${home_dir}/.local/bin/pnpm" "ensure_pnpm_binary_for_scripts wrapper path"
  out="$(pnpm --version)"
  assert_eq "$out" "10.29.2" "ensure_pnpm_binary_for_scripts pnpm --version"
)

echo "==> case: ensure_pnpm (npm fallback install)"
(
  root="${TMP_DIR}/case-pnpm-npm-fallback"
  tool_bin="${root}/tool-bin"
  mkdir -p "${tool_bin}"

  cat >"${tool_bin}/corepack" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
exit 1
EOF
  chmod +x "${tool_bin}/corepack"

  cat >"${tool_bin}/npm" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "install" && "${2:-}" == "-g" && "${3:-}" == "pnpm@10" ]]; then
  cat >"${FAKE_PNPM_BIN_DIR}/pnpm" <<'PNPM'
#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "--version" ]]; then
  echo "10.29.2"
  exit 0
fi
exit 0
PNPM
  chmod +x "${FAKE_PNPM_BIN_DIR}/pnpm"
  exit 0
fi
if [[ "${1:-}" == "prefix" && "${2:-}" == "-g" ]]; then
  echo "${FAKE_PNPM_BIN_DIR%/tool-bin}"
  exit 0
fi
if [[ "${1:-}" == "config" && "${2:-}" == "get" && "${3:-}" == "prefix" ]]; then
  echo "${FAKE_PNPM_BIN_DIR%/tool-bin}"
  exit 0
fi
exit 0
EOF
  chmod +x "${tool_bin}/npm"

  export FAKE_PNPM_BIN_DIR="${tool_bin}"
  export PATH="${tool_bin}:/usr/bin:/bin"
  PNPM_CMD=()
  stub_ui_and_quiet_runner
  fix_npm_permissions() { :; }

  ensure_pnpm
  assert_eq "${PNPM_CMD[*]}" "pnpm" "ensure_pnpm (npm fallback)"
)

echo "==> case: npm_log_indicates_missing_build_tools"
(
  root="${TMP_DIR}/case-build-tools-signature"
  mkdir -p "${root}"

  positive_log="${root}/positive.log"
  negative_log="${root}/negative.log"

  cat >"${positive_log}" <<'EOF'
gyp ERR! stack Error: not found: make
EOF
  cat >"${negative_log}" <<'EOF'
npm ERR! code EEXIST
EOF

  if ! npm_log_indicates_missing_build_tools "${positive_log}"; then
    fail "npm_log_indicates_missing_build_tools should detect missing build tools"
  fi
  if npm_log_indicates_missing_build_tools "${negative_log}"; then
    fail "npm_log_indicates_missing_build_tools false positive"
  fi
)

echo "==> case: bootstrap_gum_temp (auto disable in non-interactive shell)"
(
  # shellcheck disable=SC2034
  GUM=""
  # shellcheck disable=SC2034
  GUM_REASON=""

  is_non_interactive_shell() { return 0; }

  bootstrap_gum_temp || true
  assert_eq "$GUM" "" "bootstrap_gum_temp non-interactive gum path"
  assert_eq "$GUM_REASON" "non-interactive shell (auto-disabled)" "bootstrap_gum_temp non-interactive reason"
)

echo "==> case: print_gum_status (non-interactive skip is silent)"
(
  # shellcheck disable=SC2034
  GUM_STATUS="skipped"
  # shellcheck disable=SC2034
  GUM_REASON="non-interactive shell (auto-disabled)"
  ui_info() { echo "INFO: $*"; }

  out="$(print_gum_status 2>&1 || true)"
  assert_eq "$out" "" "print_gum_status non-interactive skip output"
)

echo "==> case: print_gum_status (other skip reasons still print)"
(
  # shellcheck disable=SC2034
  GUM_STATUS="skipped"
  # shellcheck disable=SC2034
  GUM_REASON="tar not found"
  ui_info() { echo "INFO: $*"; }

  out="$(print_gum_status 2>&1 || true)"
  assert_contains "$out" "gum skipped (tar not found)" "print_gum_status non-silent reason"
)

echo "==> case: ensure_macos_node22_active (prefers Homebrew node@22 bin)"
(
  root="${TMP_DIR}/case-node22-path-fix"
  old_bin="${root}/old-bin"
  brew_bin="${root}/brew-bin"
  node22_prefix="${root}/node22"
  mkdir -p "${old_bin}" "${brew_bin}" "${node22_prefix}/bin"

  make_exe "${old_bin}/node" 'echo "v14.18.0"'
  make_exe "${brew_bin}/brew" "if [[ \"\${1:-}\" == \"--prefix\" && \"\${2:-}\" == \"node@22\" ]]; then echo \"${node22_prefix}\"; exit 0; fi; exit 1"
  make_exe "${node22_prefix}/bin/node" 'echo "v22.22.0"'

  export OS="macos"
  export PATH="${old_bin}:${brew_bin}:/usr/bin:/bin"

  ensure_macos_node22_active
  got="$(node -v)"
  assert_eq "$got" "v22.22.0" "ensure_macos_node22_active active node version"
  got_path="$(command -v node)"
  assert_eq "$got_path" "${node22_prefix}/bin/node" "ensure_macos_node22_active active node path"
)

echo "==> case: ensure_macos_node22_active (fails with guidance when still old node)"
(
  root="${TMP_DIR}/case-node22-path-fail"
  old_bin="${root}/old-bin"
  brew_bin="${root}/brew-bin"
  mkdir -p "${old_bin}" "${brew_bin}"

  make_exe "${old_bin}/node" 'echo "v14.18.0"'
  make_exe "${brew_bin}/brew" "if [[ \"\${1:-}\" == \"--prefix\" && \"\${2:-}\" == \"node@22\" ]]; then echo \"${root}/missing-node22\"; exit 0; fi; exit 1"

  export OS="macos"
  export PATH="${old_bin}:${brew_bin}:/usr/bin:/bin"

  out="$(ensure_macos_node22_active 2>&1 || true)"
  assert_contains "$out" "Node.js v22 was installed but this shell is using v14.18.0" "ensure_macos_node22_active failure message"
  assert_contains "$out" "export PATH=\"${root}/missing-node22/bin:\$PATH\"" "ensure_macos_node22_active guidance"
)

echo "==> case: npm diagnostics extractors"
(
  root="${TMP_DIR}/case-npm-diagnostics"
  mkdir -p "${root}"
  log="${root}/npm.log"

  cat >"${log}" <<'EOF'
npm error code ENOENT
npm error syscall spawn
npm error A complete log of this run can be found in: /Users/test/.npm/_logs/2026-02-22T17_00_00_000Z-debug-0.log
EOF

  got_log="$(extract_npm_debug_log_path "${log}")"
  assert_eq "$got_log" "/Users/test/.npm/_logs/2026-02-22T17_00_00_000Z-debug-0.log" "extract_npm_debug_log_path"
  got_error="$(extract_first_npm_error_line "${log}")"
  assert_eq "$got_error" "npm error code ENOENT" "extract_first_npm_error_line"
)

echo "==> case: print_npm_failure_diagnostics"
(
  root="${TMP_DIR}/case-npm-diagnostics-output"
  mkdir -p "${root}"
  log="${root}/npm.log"

  cat >"${log}" <<'EOF'
npm ERR! code EACCES
npm ERR! syscall rename
npm ERR! errno -13
npm ERR! A complete log of this run can be found in: /tmp/npm-debug.log
EOF

  # shellcheck disable=SC2034
  LAST_NPM_INSTALL_CMD='env SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm --loglevel error --no-fund --no-audit install -g openclaw@latest'
  ui_warn() { echo "WARN: $*"; }
  out="$(print_npm_failure_diagnostics "openclaw@latest" "${log}" 2>&1)"

  assert_contains "$out" "Command: env SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm --loglevel error --no-fund --no-audit install -g openclaw@latest" "print_npm_failure_diagnostics command"
  assert_contains "$out" "Installer log: ${log}" "print_npm_failure_diagnostics installer log"
  assert_contains "$out" "npm code: EACCES" "print_npm_failure_diagnostics code"
  assert_contains "$out" "npm syscall: rename" "print_npm_failure_diagnostics syscall"
  assert_contains "$out" "npm errno: -13" "print_npm_failure_diagnostics errno"
  assert_contains "$out" "npm debug log: /tmp/npm-debug.log" "print_npm_failure_diagnostics debug log"
  assert_contains "$out" "First npm error: npm ERR! code EACCES" "print_npm_failure_diagnostics first error"
)

echo "==> case: install_openclaw_npm (auto-install build tools + retry)"
(
  root="${TMP_DIR}/case-install-openclaw-auto-build-tools"
  mkdir -p "${root}"

  export OS="linux"
  export VERBOSE=0
  export GUM=""

  install_attempts=0
  auto_install_called=0

  run_npm_global_install() {
    local _spec="$1"
    local log="$2"
    install_attempts=$((install_attempts + 1))
    if [[ "$install_attempts" -eq 1 ]]; then
      cat >"${log}" <<'EOF'
gyp ERR! stack Error: not found: make
EOF
      return 1
    fi
    cat >"${log}" <<'EOF'
ok
EOF
    return 0
  }

  auto_install_build_tools_for_npm_failure() {
    local _log="$1"
    auto_install_called=1
    return 0
  }

  ui_info() { :; }
  ui_success() { :; }
  ui_warn() { :; }
  ui_error() { :; }

  install_openclaw_npm "openclaw@latest"
  assert_eq "$install_attempts" "2" "install_openclaw_npm retry count"
  assert_eq "$auto_install_called" "1" "install_openclaw_npm auto-install hook"
)

echo "==> case: install_openclaw_from_git (deps step uses run_pnpm function)"
(
  root="${TMP_DIR}/case-install-git-deps"
  repo="${root}/repo"
  home_dir="${root}/home"

  mkdir -p "${repo}/.git" "${repo}/dist" "${home_dir}"
  : > "${repo}/dist/entry.js"

  export HOME="${home_dir}"
  # shellcheck disable=SC2034
  GIT_UPDATE=0
  # shellcheck disable=SC2034
  SHARP_IGNORE_GLOBAL_LIBVIPS=1

  deps_called=0
  deps_cmd=""

  check_git() { return 0; }
  install_git() { fail "install_git should not be called"; }
  ensure_pnpm() { :; }
  ensure_pnpm_binary_for_scripts() { :; }
  cleanup_legacy_submodules() { :; }
  ensure_user_local_bin_on_path() { mkdir -p "${HOME}/.local/bin"; }
  run_pnpm() { :; }
  ui_info() { :; }
  ui_success() { :; }
  ui_warn() { :; }
  ui_error() { :; }

  run_quiet_step() {
    local _title="$1"
    shift
    if [[ "${_title}" == "Installing dependencies" ]]; then
      deps_called=1
      deps_cmd="${1:-}"
    fi
    "$@" >/dev/null 2>&1 || true
  }

  install_openclaw_from_git "${repo}"
  assert_eq "$deps_called" "1" "install_openclaw_from_git dependencies step"
  assert_eq "$deps_cmd" "run_pnpm" "install_openclaw_from_git dependencies command"
)

echo "==> case: ensure_pnpm_git_prepare_allowlist (known dep added once)"
(
  root="${TMP_DIR}/case-pnpm-git-prepare-allowlist"
  repo="${root}/repo"
  mkdir -p "${repo}"
  cat >"${repo}/pnpm-workspace.yaml" <<'EOF'
packages:
  - .

onlyBuiltDependencies:
  - esbuild
EOF
  cat >"${repo}/package.json" <<'EOF'
{
  "name": "repo",
  "pnpm": {
    "onlyBuiltDependencies": [
      "esbuild"
    ]
  }
}
EOF

  ensure_pnpm_git_prepare_allowlist "${repo}"
  ensure_pnpm_git_prepare_allowlist "${repo}"

  workspace_count="$(grep -c '@tloncorp/api' "${repo}/pnpm-workspace.yaml" || true)"
  package_count="$(grep -c '@tloncorp/api' "${repo}/package.json" || true)"
  assert_eq "$workspace_count" "1" "ensure_pnpm_git_prepare_allowlist workspace count"
  assert_eq "$package_count" "1" "ensure_pnpm_git_prepare_allowlist package count"
)

echo "==> case: install_openclaw_compat_shim (always uses user-local bin)"
(
  root="${TMP_DIR}/case-openclaw-compat-shim"
  home_dir="${root}/home"
  selected_bin_dir="${root}/node22/bin"
  original_bin_dir="${root}/nvm/bin"
  pkg_dir="${root}/npm-root/openclaw/dist"

  mkdir -p "${home_dir}" "${selected_bin_dir}" "${original_bin_dir}" "${pkg_dir}"
  : > "${pkg_dir}/entry.js"

  cat >"${selected_bin_dir}/node" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "-p" ]]; then
  echo "22"
  exit 0
fi
if [[ "${1:-}" == "-v" ]]; then
  echo "v22.12.0"
  exit 0
fi
exit 0
EOF
  chmod +x "${selected_bin_dir}/node"

  cat >"${original_bin_dir}/node" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "-p" ]]; then
  echo "20"
  exit 0
fi
if [[ "${1:-}" == "-v" ]]; then
  echo "v20.18.0"
  exit 0
fi
exit 0
EOF
  chmod +x "${original_bin_dir}/node"

  export HOME="${home_dir}"
  export PATH="/usr/bin:/bin"
  export INSTALL_METHOD="npm"
  export SELECTED_NODE_BIN="${selected_bin_dir}/node"
  export ORIGINAL_PATH="${original_bin_dir}:/usr/bin:/bin"

  ui_warn() { :; }
  ensure_user_local_bin_on_path() {
    mkdir -p "${HOME}/.local/bin"
    export PATH="${HOME}/.local/bin:${PATH}"
  }
  refresh_shell_command_cache() { hash -r 2>/dev/null || true; }
  find_openclaw_entry_path() {
    echo "${pkg_dir}/entry.js"
  }

  install_openclaw_compat_shim

  got="$(command -v openclaw || true)"
  assert_eq "$got" "${home_dir}/.local/bin/openclaw" "install_openclaw_compat_shim wrapper path"
)

echo "OK"
