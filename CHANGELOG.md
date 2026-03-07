# Changelog

## 2026-03-07

- Shoutouts: use the theme-aware card surface token so shoutout cards render correctly in light mode (#100, thanks @zwying0814).
- Sponsors: keep the Vercel logo visible in light mode by excluding the light-theme asset from sponsor inversion rules (#88, thanks @Unmesh100).
- Windows installer: fail fast with a clear Git requirement before npm-based install flows that would otherwise die later with `spawn git` (#94, thanks @ningding97).
- Blog: restore the missing Discord link in the VirusTotal partnership post footer (#96, thanks @gandli).
- Dependencies: bump `@lucide/astro` to `0.577.0` and sync `bun.lock` (#99, thanks @dependabot).
## 2026-02-22

- Installer: make gum behavior fully automatic (interactive TTYs get gum, headless shells get plain status), and remove manual gum toggles.
- Installer: after macOS `node@22` Homebrew install, force-check active `node` major, print active `node`/`npm` paths, and fail with explicit PATH remediation if shell still resolves an older Node.
- Installer: strengthen npm failure diagnostics with parsed `code`/`syscall`/`errno`, exact install command, installer log path, npm debug log path, and first npm error line.
- CI/Tests: expand `install.sh` unit coverage for non-interactive gum disable, macOS Node PATH activation guard, and npm diagnostics parsing/output.
- Triage: close duplicate installer issue `openclaw/openclaw#23069` in favor of `openclaw/openclaw#23066` to keep ioctl troubleshooting centralized.

## 2026-02-13

- Landing page: harden quickstart script null-safety, clipboard fallback behavior, and OS detection; remove redundant npm/pnpm lockfiles for Bun-first workflow (#37, thanks @HemantSudarshan).
- Integrations: replace stale Signal docs link with canonical OpenClaw channel docs URL (#44, thanks @deftdawg).
- Docs: rename README references from old Molt/Clawd names to OpenClaw/openclaw.ai and update Discord invite branding link (#57, thanks @knocte).
- Installer: preinstall Linux native build toolchain before NodeSource setup to reduce npm native-module failures (`make`, `g++`, `cmake`, `python3`) (#45, thanks @wtfloris).
- Installer: auto-detect missing native build toolchain from npm logs, attempt OS-specific install, and retry package install instead of failing early (#49, thanks @knocte).
- Installer: render gum choose header on two lines (real newline, not literal `\n`) for checkout detection prompt (#55, thanks @echoja).
- Showcase: switch to masonry-style multi-column layout with cross-browser card split protection (#42, thanks @reidsolon).
- Links: update ClawHub URLs from `clawhub.com` to `clawhub.ai` across landing, integrations, and showcase pages (#28, thanks @bchelli).
- Blog: add RSS feed at `/rss.xml`, include feed autodiscovery in `<head>`, and align dependency lockfiles with Bun workflow (#33, thanks @Daxik2x).

## 2026-02-10

- Installer: modernize `install.sh` UX with staged progress, quieter command output, optional gum UI controls, and verified-only temporary gum bootstrap (#50, thanks @sebslight).
- CI: add Linux installer matrix workflow and runner script for dry-run/full validation across distro images (#50, thanks @sebslight).
## 2026-01-27

- Home page: keep testimonial links clickable while skipping keyboard focus (#18, thanks @wilfriedladenhauf).
- Fonts: preconnect to Fontshare API/CDN for faster font loading (#16, thanks @wilfriedladenhauf).
- CLI installer: support git-based installs with safer repo directory handling (#41, thanks @travisp).
- Installer: skip sudo usage when running as root (#12, thanks @Glucksberg).
- Integrations: update Microsoft Teams docs link to the channels page (#9, thanks @HesamKorki).
- Integrations: fix Signal documentation link (#13, thanks @RayBB).

## 2026-01-16

- `install.sh`: warn when the user's original shell `PATH` likely won't find the installed `openclaw` binary (common Node/npm global bin issues); link to docs.
- CI: add lightweight unit tests for `install.sh` path resolution.
