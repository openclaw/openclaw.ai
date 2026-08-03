# Hosted installer endpoints

`openclaw.ai` serves three OpenClaw installers. These are product entry points, not installation methods for developing this website repository.

Review downloaded scripts before running them. The macOS/Linux installers require Node.js 22.22.3+, 24.15.0+, 25.9.0+, or a later major; when no supported runtime is active, they install or select one. The Windows installer also supports its bundled Node.js 26 bootstrap path.

## Endpoints

### macOS and Linux

The main installer uses npm by default and offers onboarding after installation:

```sh
curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
```

For a git checkout instead of the published npm package:

```sh
curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --install-method git
```

### macOS and Linux, CLI-only

The CLI installer is non-interactive and skips onboarding by default:

```sh
curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash
```

### Windows

Run the PowerShell installer in the current session:

```powershell
powershell -c "irm https://openclaw.ai/install.ps1 | iex"
```

The script detects Winget, Chocolatey, or Scoop when a supported Node.js runtime is unavailable, with a user-local portable Node.js fallback.

## What the installers manage

Depending on the endpoint and selected method, the installers:

1. install Homebrew on macOS when needed, or detect a Windows package manager;
2. validate or install a supported Node.js runtime;
3. install OpenClaw globally through npm, or build a pnpm-backed git checkout when `--install-method git` is selected;
4. run `openclaw doctor --non-interactive` from the main and Windows flows for migrations on upgrades and git installs; and
5. offer onboarding unless it is disabled or the CLI-only installer is used.

Source checkouts use the OpenClaw pnpm workspace. Run `pnpm install` inside those checkouts; root `npm install` is for packaged installs, not source development.

## Switching install channels

An existing OpenClaw installation can switch between a development checkout and the stable npm package:

```sh
openclaw update --channel dev
openclaw update --channel stable
```

To force the method during installation, rerun the main installer with `--install-method git` or `--install-method npm`.

## Interface behavior

On macOS and Linux, the main installer detects interactive terminals and uses Gum for richer status output when available. Non-interactive sessions fall back to plain output. The Windows installer preserves non-zero exits for direct script-file automation while returning piped `irm ... | iex` failures to the current PowerShell session.

## Troubleshooting

The first Homebrew bootstrap on macOS requires an Administrator account. If it fails with an admin or `sudo` error, use an Administrator account or add the current user to the `admin` group, sign out and back in, then rerun the installer.

Inspect the local command contracts without installing anything:

```sh
bash public/install.sh --help
bash public/install-cli.sh --help
```

The CI workflows exercise dry runs, shell unit tests, Linux distribution matrices, container installs, and Windows installs. See [Install Smoke](https://github.com/openclaw/openclaw.ai/actions/workflows/install-smoke.yml) and [Install Matrix](https://github.com/openclaw/openclaw.ai/actions/workflows/install-matrix.yml).
