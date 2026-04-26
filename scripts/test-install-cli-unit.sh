#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2030,SC2031,SC2016,SC2329,SC2317
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

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

export OPENCLAW_INSTALL_CLI_SH_NO_RUN=1
# shellcheck source=../public/install-cli.sh
source "${ROOT_DIR}/public/install-cli.sh"

echo "==> case: ensure_home_env repairs root HOME"
(
  root="${TMP_DIR}/case-home-env"
  home_dir="${root}/home"
  tool_bin="${root}/tool-bin"
  mkdir -p "${home_dir}" "${tool_bin}"

  cat >"${tool_bin}/id" <<EOF
#!/usr/bin/env bash
set -euo pipefail
if [[ "\${1:-}" == "-un" ]]; then
  echo vmroot
  exit 0
fi
exit 1
EOF
  chmod +x "${tool_bin}/id"

  cat >"${tool_bin}/getent" <<EOF
#!/usr/bin/env bash
set -euo pipefail
if [[ "\${1:-}" == "passwd" && "\${2:-}" == "vmroot" ]]; then
  echo 'vmroot:x:0:0:VM Root:${home_dir}:/bin/bash'
  exit 0
fi
exit 1
EOF
  chmod +x "${tool_bin}/getent"

  export PATH="${tool_bin}:/usr/bin:/bin"
  export HOME="/"

  ensure_home_env
  assert_eq "$HOME" "${home_dir}" "ensure_home_env root HOME"
)

echo "==> case: ensure_pnpm_binary_for_scripts installs prefix wrapper"
(
  root="${TMP_DIR}/case-pnpm-wrapper"
  prefix="${root}/prefix"
  fake_node="${root}/node/bin"
  mkdir -p "${prefix}" "${fake_node}"

  cat >"${fake_node}/corepack" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "pnpm" && "${2:-}" == "--version" ]]; then
  echo "10.29.2"
  exit 0
fi
if [[ "${1:-}" == "pnpm" ]]; then
  shift
  exec "${BASH_SOURCE%/*}/pnpm-real" "$@"
fi
exit 1
EOF
  chmod +x "${fake_node}/corepack"

  cat >"${fake_node}/pnpm-real" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "--version" ]]; then
  echo "10.29.2"
  exit 0
fi
echo "wrapped:$*"
EOF
  chmod +x "${fake_node}/pnpm-real"

  export PREFIX="${prefix}"
  export PATH="/usr/bin:/bin"
  set_pnpm_cmd "${fake_node}/corepack" pnpm

  ensure_pnpm_binary_for_scripts

  got="$(command -v pnpm || true)"
  assert_eq "$got" "${prefix}/bin/pnpm" "ensure_pnpm_binary_for_scripts wrapper path"
  out="$(pnpm --version)"
  assert_eq "$out" "10.29.2" "ensure_pnpm_binary_for_scripts wrapper version"
)

echo "==> case: ensure_pnpm_git_prepare_allowlist appends known dep"
(
  root="${TMP_DIR}/case-allowlist"
  repo="${root}/repo"
  prefix="${root}/prefix"
  fake_node_dir="${prefix}/tools/node-v${NODE_VERSION}/bin"
  mkdir -p "${repo}" "${fake_node_dir}"
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
  cat >"${fake_node_dir}/node" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
python3 - "$@" <<'PY'
import json
import pathlib
import sys

package_file = pathlib.Path(sys.argv[2])
dep = sys.argv[3]
data = json.loads(package_file.read_text())
pnpm = data.setdefault("pnpm", {})
deps = pnpm.setdefault("onlyBuiltDependencies", [])
if dep not in deps:
    deps.insert(0, dep)
package_file.write_text(json.dumps(data, indent=2) + "\n")
PY
EOF
  chmod +x "${fake_node_dir}/node"

  export PREFIX="${prefix}"
  ensure_pnpm_git_prepare_allowlist "${repo}"
  ensure_pnpm_git_prepare_allowlist "${repo}"

  workspace_count="$(grep -c '@tloncorp/api' "${repo}/pnpm-workspace.yaml" || true)"
  package_count="$(grep -c '@tloncorp/api' "${repo}/package.json" || true)"
  assert_eq "$workspace_count" "1" "ensure_pnpm_git_prepare_allowlist workspace count"
  assert_eq "$package_count" "1" "ensure_pnpm_git_prepare_allowlist package count"
)

echo "==> case: install_openclaw keeps a single package root under toolchain"
(
  root="${TMP_DIR}/case-install-npm"
  prefix="${root}/prefix"
  fake_bin="${root}/bin"
  fake_npm="${fake_bin}/npm"
  toolchain_dir="${prefix}/tools/node-v${NODE_VERSION}"
  entry_js="${toolchain_dir}/lib/node_modules/openclaw/dist/entry.js"
  mkdir -p "${fake_bin}" "${toolchain_dir}/bin" "$(dirname "${entry_js}")"
  printf 'console.log("ok")\n' > "${entry_js}"
  printf 'legacy-bin\n' > "${toolchain_dir}/bin/openclaw"

  cat >"${fake_npm}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" > "${FAKE_NPM_ARGS_FILE}"
EOF
  chmod +x "${fake_npm}"

  export PREFIX="${prefix}"
  export FAKE_NPM_ARGS_FILE="${root}/npm-args.txt"
  export SHARP_IGNORE_GLOBAL_LIBVIPS=1
  export OPENCLAW_VERSION=latest
  export NPM_LOGLEVEL=error

  npm_bin() { echo "${fake_npm}"; }
  log() { :; }
  emit_json() { :; }
  fix_npm_prefix_if_needed() { :; }

  install_openclaw

  args="$(cat "${FAKE_NPM_ARGS_FILE}")"
  assert_eq "$args" "install -g --prefix ${toolchain_dir} --loglevel error --no-fund --no-audit openclaw@latest" "install_openclaw npm prefix"
  test -x "${prefix}/bin/openclaw"
  test -e "${toolchain_dir}/bin/openclaw"
  wrapper_target="$(python3 - <<'PY' "${prefix}/bin/openclaw"
import pathlib
import sys
print(pathlib.Path(sys.argv[1]).read_text().splitlines()[-1])
PY
)"
  assert_eq "$wrapper_target" "exec \"${prefix}/tools/node/bin/node\" \"${toolchain_dir}/lib/node_modules/openclaw/dist/entry.js\" \"\$@\"" "install_openclaw wrapper target"
)

echo "==> case: install_openclaw_from_git uses run_pnpm"
(
  root="${TMP_DIR}/case-install-git"
  repo="${root}/repo"
  prefix="${root}/prefix"
  home_dir="${root}/home"
  mkdir -p "${repo}/.git" "${repo}/dist" "${prefix}" "${home_dir}"
  : > "${repo}/dist/entry.js"

  export HOME="${home_dir}"
  export PREFIX="${prefix}"
  export GIT_UPDATE=0
  export SHARP_IGNORE_GLOBAL_LIBVIPS=1

  deps_cmd=""
  build_cmd=""

  ensure_git() { :; }
  ensure_pnpm() { set_pnpm_cmd echo pnpm; }
  ensure_pnpm_binary_for_scripts() { :; }
  cleanup_legacy_submodules() { :; }
  log() { :; }
  emit_json() { :; }
  fail() { echo "FAIL: $*" >&2; exit 1; }
  run_pnpm() {
    if [[ -z "$deps_cmd" ]]; then
      deps_cmd="$1"
    else
      build_cmd="$1"
    fi
    return 0
  }

  install_openclaw_from_git "${repo}"
  assert_eq "$deps_cmd" "-C" "install_openclaw_from_git deps command entry"
  assert_nonempty "$build_cmd" "install_openclaw_from_git build command entry"
  test -x "${prefix}/bin/openclaw"
)

echo "PASS"
