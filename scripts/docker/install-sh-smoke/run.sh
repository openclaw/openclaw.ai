#!/usr/bin/env bash
set -euo pipefail

LOCAL_INSTALL_PATH="/opt/clawdbot-install.sh"
if [[ -n "${CLAWDBOT_INSTALL_URL:-}" ]]; then
  INSTALL_URL="$CLAWDBOT_INSTALL_URL"
elif [[ -f "$LOCAL_INSTALL_PATH" ]]; then
  INSTALL_URL="file://${LOCAL_INSTALL_PATH}"
else
  INSTALL_URL="https://clawd.bot/install.sh"
fi

fetch_registry_versions() {
  node - <<'NODE'
const https = require("node:https");

const url = process.env.NPM_REGISTRY_URL || "https://registry.npmjs.org/clawdbot";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestJson() {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { Accept: "application/vnd.npm.install-v1+json" }
    }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`registry status ${res.statusCode}`));
        return;
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on("error", reject);
  });
}

(async () => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const data = await requestJson();
      const tags = data["dist-tags"] || {};
      const time = data.time || {};
      const versions = Object.entries(time)
        .filter(([key]) => key !== "created" && key !== "modified")
        .sort((a, b) => new Date(b[1]) - new Date(a[1]))
        .map(([key]) => key);
      const latest = tags.latest || versions[0] || "";
      const next = tags.next || latest;
      const previous = versions.find((v) => v !== next) || latest || next;
      if (!latest) {
        process.exit(1);
      }
      process.stdout.write(`${latest}\n${next}\n${previous}`);
      return;
    } catch (err) {
      if (attempt === 3) {
        console.error(err.message || err);
        process.exit(1);
      }
      await delay(attempt * 500);
    }
  }
})();
NODE
}

echo "==> Resolve npm versions"
REGISTRY_INFO="$(fetch_registry_versions)"
LATEST_VERSION="$(printf '%s\n' "$REGISTRY_INFO" | sed -n '1p')"
NEXT_VERSION="$(printf '%s\n' "$REGISTRY_INFO" | sed -n '2p')"
PREVIOUS_VERSION="$(printf '%s\n' "$REGISTRY_INFO" | sed -n '3p')"

echo "latest=$LATEST_VERSION next=$NEXT_VERSION previous=$PREVIOUS_VERSION"

curl_install() {
  if [[ "$INSTALL_URL" == file://* ]]; then
    curl -fsSL "$INSTALL_URL"
  else
    curl -fsSL --proto '=https' --tlsv1.2 "$INSTALL_URL"
  fi
}

echo "==> Installer: --help"
curl_install | bash -s -- --help >/tmp/install-help.txt
grep -q -- "--install-method" /tmp/install-help.txt

echo "==> Preinstall previous (forces installer upgrade path)"
npm install -g "clawdbot@${PREVIOUS_VERSION}"

echo "==> Run official installer one-liner"
curl_install | bash -s -- --no-onboard

echo "==> Verify installed version"
INSTALLED_VERSION="$(clawdbot --version 2>/dev/null | head -n 1 | tr -d '\r')"
echo "installed=$INSTALLED_VERSION latest=$LATEST_VERSION next=$NEXT_VERSION"

if [[ "$INSTALLED_VERSION" != "$LATEST_VERSION" && "$INSTALLED_VERSION" != "$NEXT_VERSION" ]]; then
  echo "ERROR: expected clawdbot@$LATEST_VERSION (latest) or @$NEXT_VERSION (next), got @$INSTALLED_VERSION" >&2
  exit 1
fi

echo "==> Sanity: CLI runs"
clawdbot --help >/dev/null

echo "==> Installer: detect source checkout (dry-run)"
TMP_REPO="/tmp/clawdbot-repo-detect"
rm -rf "$TMP_REPO"
mkdir -p "$TMP_REPO"
cat > "$TMP_REPO/package.json" <<'EOF'
{"name":"clawdbot"}
EOF
touch "$TMP_REPO/pnpm-workspace.yaml"

(
  cd "$TMP_REPO"
  set +e
  curl_install | bash -s -- --dry-run --no-onboard --no-prompt >/tmp/repo-detect.out 2>&1
  code=$?
  set -e
  if [[ "$code" -ne 0 ]]; then
    echo "ERROR: expected repo-detect dry-run to succeed without --install-method" >&2
    cat /tmp/repo-detect.out >&2
    exit 1
  fi
  if ! sed -r 's/\x1b\[[0-9;]*m//g' /tmp/repo-detect.out | grep -Eq "Install method([[:space:]]*:)?[[:space:]]+npm"; then
    echo "ERROR: expected repo-detect dry-run to default to npm install" >&2
    cat /tmp/repo-detect.out >&2
    exit 1
  fi
)

echo "==> Installer: dry-run (explicit methods)"
curl_install | bash -s -- --dry-run --no-onboard --install-method npm --no-prompt >/dev/null
curl_install | bash -s -- --dry-run --no-onboard --install-method git --git-dir /tmp/clawdbot-src --no-prompt >/dev/null

echo "OK"
