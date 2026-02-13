#!/usr/bin/env bash
set -euo pipefail

LOCAL_INSTALL_PATH="/opt/clawdbot-install.sh"
LOCAL_CLI_INSTALL_PATH="/opt/clawdbot-install-cli.sh"
if [[ -n "${CLAWDBOT_INSTALL_URL:-}" ]]; then
  INSTALL_URL="$CLAWDBOT_INSTALL_URL"
elif [[ -f "$LOCAL_INSTALL_PATH" ]]; then
  INSTALL_URL="file://${LOCAL_INSTALL_PATH}"
else
  INSTALL_URL="https://clawd.bot/install.sh"
fi

if [[ -n "${CLAWDBOT_INSTALL_CLI_URL:-}" ]]; then
  CLI_INSTALL_URL="$CLAWDBOT_INSTALL_CLI_URL"
elif [[ -f "$LOCAL_CLI_INSTALL_PATH" ]]; then
  CLI_INSTALL_URL="file://${LOCAL_CLI_INSTALL_PATH}"
else
  CLI_INSTALL_URL="https://clawd.bot/install-cli.sh"
fi

curl_install() {
  if [[ "$INSTALL_URL" == file://* ]]; then
    curl -fsSL "$INSTALL_URL"
  else
    curl -fsSL --proto '=https' --tlsv1.2 "$INSTALL_URL"
  fi
}

curl_cli_install() {
  if [[ "$CLI_INSTALL_URL" == file://* ]]; then
    curl -fsSL "$CLI_INSTALL_URL"
  else
    curl -fsSL --proto '=https' --tlsv1.2 "$CLI_INSTALL_URL"
  fi
}

echo "==> Installer: --help"
curl_install | bash -s -- --help >/tmp/install-help.txt
grep -q -- "--install-method" /tmp/install-help.txt

echo "==> CLI installer: --help"
curl_cli_install | bash -s -- --help >/tmp/install-cli-help.txt
grep -q -- "--prefix" /tmp/install-cli-help.txt

echo "==> Pre-flight: ensure git absent"
if command -v git >/dev/null; then
  echo "git is present unexpectedly" >&2
  exit 1
fi

echo "==> Run installer (non-root user)"
curl_install | bash -s -- --no-onboard

# Ensure PATH picks up user npm prefix
export PATH="$HOME/.npm-global/bin:$PATH"

echo "==> Verify git installed"
command -v git >/dev/null

echo "==> Verify clawdbot installed"
CMD_PATH=""
for cmd in clawdbot openclaw; do
  if command -v "$cmd" >/dev/null 2>&1; then
    CMD_PATH="$(command -v "$cmd")"
    break
  fi
done

if [[ -z "$CMD_PATH" ]]; then
  npm_prefix="$(npm prefix -g 2>/dev/null || true)"
  for bin_dir in "$HOME/.npm-global/bin" "$HOME/.local/bin" "$npm_prefix/bin"; do
    for cmd in clawdbot openclaw; do
      if [[ -x "$bin_dir/$cmd" ]]; then
        CMD_PATH="$bin_dir/$cmd"
        break 2
      fi
    done
  done
fi

if [[ -z "$CMD_PATH" ]]; then
  echo "neither clawdbot nor openclaw found on PATH or common user bin paths" >&2
  exit 1
fi

PKG_NAME="clawdbot"
if [[ "$(basename "$CMD_PATH")" == "openclaw" ]]; then
  PKG_NAME="openclaw"
fi

LATEST_VERSION="$(npm view "$PKG_NAME" dist-tags.latest 2>/dev/null || true)"
NEXT_VERSION="$(npm view "$PKG_NAME" dist-tags.next 2>/dev/null || true)"
if [[ -z "$LATEST_VERSION" && "$PKG_NAME" == "openclaw" ]]; then
  PKG_NAME="clawdbot"
  LATEST_VERSION="$(npm view "$PKG_NAME" dist-tags.latest 2>/dev/null || true)"
  NEXT_VERSION="$(npm view "$PKG_NAME" dist-tags.next 2>/dev/null || true)"
fi
if [[ -z "$NEXT_VERSION" ]]; then
  NEXT_VERSION="$LATEST_VERSION"
fi

INSTALLED_VERSION="$("$CMD_PATH" --version 2>/dev/null | head -n 1 | tr -d '\r')"

echo "installed=$INSTALLED_VERSION latest=$LATEST_VERSION next=$NEXT_VERSION"
if [[ "$INSTALLED_VERSION" != "$LATEST_VERSION" && "$INSTALLED_VERSION" != "$NEXT_VERSION" ]]; then
  echo "ERROR: expected ${PKG_NAME}@$LATEST_VERSION (latest) or @$NEXT_VERSION (next), got @$INSTALLED_VERSION" >&2
  exit 1
fi

echo "==> Sanity: CLI runs"
"$CMD_PATH" --help >/dev/null

echo "==> Run CLI installer (should also succeed non-root)"
curl_cli_install | bash -s -- --set-npm-prefix --no-onboard

echo "OK"
