#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2030,SC2031,SC2016
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

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

export CLAWDBOT_INSTALL_SH_NO_RUN=1
# shellcheck source=../public/install.sh
source "${ROOT_DIR}/public/install.sh"

echo "==> case: direct PATH"
(
  bin="${TMP_DIR}/case-path/bin"
  make_exe "${bin}/openclaw" 'echo "ok" >/dev/null'
  export PATH="${bin}:/usr/bin:/bin"

  got="$(resolve_openclaw_bin)"
  assert_eq "$got" "${bin}/openclaw" "resolve_openclaw_bin (direct PATH)"
)

echo "==> case: npm prefix -g"
(
  root="${TMP_DIR}/case-npm-prefix-direct"
  prefix="${root}/prefix"
  tool_bin="${root}/tool-bin"

  make_exe "${tool_bin}/npm" "if [[ \"\$1\" == \"prefix\" && \"\$2\" == \"-g\" ]]; then echo \"${prefix}\"; exit 0; fi; exit 1"
  make_exe "${prefix}/bin/openclaw" 'echo "ok" >/dev/null'

  export PATH="${tool_bin}:/usr/bin:/bin"

  got="$(resolve_openclaw_bin)"
  assert_eq "$got" "${prefix}/bin/openclaw" "resolve_openclaw_bin (npm prefix -g)"
)

echo "==> case: npm prefix -g fallback"
(
  root="${TMP_DIR}/case-npm-prefix"
  prefix="${root}/prefix"
  tool_bin="${root}/tool-bin"

  make_exe "${tool_bin}/npm" "if [[ \"\$1\" == \"bin\" && \"\$2\" == \"-g\" ]]; then exit 1; fi; if [[ \"\$1\" == \"prefix\" && \"\$2\" == \"-g\" ]]; then echo \"${prefix}\"; exit 0; fi; exit 1"
  make_exe "${prefix}/bin/openclaw" 'echo "ok" >/dev/null'

  export PATH="${tool_bin}:/usr/bin:/bin"

  got="$(resolve_openclaw_bin)"
  assert_eq "$got" "${prefix}/bin/openclaw" "resolve_openclaw_bin (npm prefix -g)"
)

echo "==> case: nodenv rehash shim creation"
(
  root="${TMP_DIR}/case-nodenv"
  shim="${root}/shims"
  tool_bin="${root}/tool-bin"

  mkdir -p "${shim}"
  make_exe "${tool_bin}/npm" "exit 1"
  mkdir -p "${tool_bin}"
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
  make_exe "${tool_bin}/npm" 'if [[ "$1" == "prefix" && "$2" == "-g" ]]; then echo "/tmp/prefix"; exit 0; fi; if [[ "$1" == "bin" && "$2" == "-g" ]]; then echo "/tmp/prefix/bin"; exit 0; fi; exit 1'
  export PATH="${tool_bin}:/usr/bin:/bin"

  out="$(warn_openclaw_not_found 2>&1 || true)"
  assert_nonempty "$out" "warn_openclaw_not_found output"
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

echo "==> case: install_openclaw_npm (auto-install build tools + retry)"
(
  root="${TMP_DIR}/case-install-openclaw-auto-build-tools"
  mkdir -p "${root}"

  export OS="linux"
  install_attempts=0
  auto_install_called=0

  run_npm_global_install_once() {
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

  install_openclaw_npm "openclaw@latest"
  assert_eq "$install_attempts" "2" "install_openclaw_npm retry count"
  assert_eq "$auto_install_called" "1" "install_openclaw_npm auto-install hook"
)

echo "OK"
