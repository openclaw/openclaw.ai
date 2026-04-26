# openclaw.ai

Landing page for [OpenClaw](https://github.com/openclaw/openclaw) — your personal AI assistant.

**Live**: [openclaw.ai](https://openclaw.ai)

## Pages

- `/` — Main landing page with Quick Start, features, and testimonials
- `/integrations` — Visual grid of all supported chat providers, AI models, platforms, and tools
- `/shoutouts` — Community testimonials and mentions

## Tech Stack

- [Astro](https://astro.build/) — Static site generator
- GitHub Pages — Hosting
- Custom CSS — No framework, just vibes

## Development

```bash
bun install
bun run dev
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR.

## Build

```bash
bun run build
bun run preview
```

## Deploy

Automatically deployed to GitHub Pages on push to `main`.

## Install Scripts

The landing page hosts installer scripts:

- **macOS/Linux**: `curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash`
- **macOS/Linux (CLI only, no onboarding)**: `curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash`
- **Windows**: `powershell -c "irm https://openclaw.ai/install.ps1 | iex"`

Installer UI controls (macOS/Linux `install.sh`):
- Gum UI is auto-detected; interactive terminals get richer status output, non-interactive shells fall back to plain output automatically.
- Windows `install.ps1` keeps `irm ... | iex` failures in the current PowerShell session while preserving non-zero exits for direct script-file automation.

These scripts:
1. Install Homebrew (macOS) or detect package managers (Windows)
2. Install Node.js 22+ if needed
3. Install openclaw globally via npm, or from a git checkout with `--install-method git`
4. Run `openclaw doctor --non-interactive` for migrations (upgrades only)
5. Prompt to run `openclaw onboard` (new installs)

Switching after install:
- npm package to git checkout: `openclaw update --channel dev`
- git checkout to npm package: `openclaw update --channel stable`
- installer-forced switch: rerun the installer with `--install-method git` or `--install-method npm`

Troubleshooting:
- macOS first-run Homebrew bootstrap needs an Administrator account. If install fails with a sudo/admin error, use an admin account (or add the current user to the `admin` group) and rerun the installer.

## Related

- [OpenClaw](https://github.com/openclaw/openclaw) — Main repository
- [Docs](https://docs.openclaw.ai) — Documentation
- [Discord](https://discord.gg/openclaw) — Community
