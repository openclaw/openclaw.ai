#!/usr/bin/env bash
set -euo pipefail

MODE="dry-run"
USE_GUM=0
IMAGES=()

usage() {
  cat <<'EOF'
Run install.sh in clean Linux containers (matrix style).

Note: gum UI is disabled by default because CI/container logs often render
raw ANSI/OSC control sequences. Use --gum only in a real interactive terminal.

Usage:
  bash scripts/test-install-matrix.sh [options]

Options:
  --mode dry-run|full     Test mode (default: dry-run)
  --image <docker-image>  Image to test (repeatable)
  --gum                   Force gum UI
  --no-gum                Disable gum UI (default)
  --help, -h              Show this help

Examples:
  bash scripts/test-install-matrix.sh
  bash scripts/test-install-matrix.sh --mode full
  bash scripts/test-install-matrix.sh --image ubuntu:24.04 --image fedora:40
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --image)
      IMAGES+=("$2")
      shift 2
      ;;
    --gum)
      USE_GUM=1
      shift
      ;;
    --no-gum)
      USE_GUM=0
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ "$MODE" != "dry-run" && "$MODE" != "full" ]]; then
  echo "Invalid --mode: $MODE (expected dry-run|full)" >&2
  exit 2
fi

if [[ ${#IMAGES[@]} -eq 0 ]]; then
  IMAGES=(
    "ubuntu:22.04"
    "ubuntu:24.04"
    "debian:12"
    "fedora:40"
  )
fi

setup_cmd_for_image() {
  local image="$1"
  case "$image" in
    ubuntu:*|debian:*)
      cat <<'EOF'
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends \
  bash ca-certificates curl sudo tar util-linux
EOF
      ;;
    fedora:*|rockylinux:*|almalinux:*)
      cat <<'EOF'
dnf install -y -q \
  bash ca-certificates curl sudo tar util-linux
EOF
      ;;
    *)
      return 1
      ;;
  esac
}

INSTALL_ARGS=()
build_install_args() {
  INSTALL_ARGS=(--no-onboard --no-prompt)
  if [[ "$MODE" == "dry-run" ]]; then
    INSTALL_ARGS+=(--dry-run)
  fi
  if [[ "$USE_GUM" == "1" ]]; then
    INSTALL_ARGS+=(--gum)
  else
    INSTALL_ARGS+=(--no-gum)
  fi
}

run_case() {
  local image="$1"
  local setup_cmd=""
  setup_cmd="$(setup_cmd_for_image "$image")" || {
    echo "Unsupported image for setup bootstrap: $image" >&2
    return 2
  }

  build_install_args

  local install_cmd=""
  printf -v install_cmd '%q ' bash public/install.sh "${INSTALL_ARGS[@]}"

  echo ""
  echo "============================================================"
  echo "Image: $image"
  echo "Mode:  $MODE"
  echo "GUM:   $([[ "$USE_GUM" == "1" ]] && echo on || echo off)"
  echo "============================================================"

  docker run --rm -t \
    -e TERM=xterm-256color \
    -v "$PWD":/work \
    -w /work \
    "$image" \
    bash -lc "set -euo pipefail; if ! { ${setup_cmd}; } >/tmp/install-matrix-setup.log 2>&1; then echo 'bootstrap setup failed' >&2; tail -n 120 /tmp/install-matrix-setup.log >&2; exit 1; fi; ${install_cmd}"
}

for image in "${IMAGES[@]}"; do
  run_case "$image"
done

echo ""
echo "✅ install matrix completed"
