# Changelog

## Unreleased

- Security: prevent blog and author JSON-LD metadata from breaking out of its script element (#208, thanks @SebTardif).
- Testimonials: prune 20 low-signal shoutouts into the backup file, and add Windows chief @pavandavuluri's "Clawfather" Build shoutout and @rodrigofarinha on agent speed.

- Testimonials: add 5 more shoutouts — GitHub's @ashleywolf on the fastest-growing project celebration, plus @bartslodyczka, @nelsonlopes_, @morganlinton, and @mronge — with cached avatars.
- Testimonials: add 4 more shoutouts from the archive — @satyanadella on the Windows partnership, @ycombinator's Startup School announcement, Microsoft's @jennifermarsman on MXC sandboxing, and @BradGroux — with cached avatars.

- Press: show outlet favicons on press cards (homepage and press page) with locally cached icons, and add Lenny's Newsletter's "From skeptic to true believer" and Axios' story of the OpenClaw agent that almost got itself a job.
- Press: add Semafor's enterprise piece with Jensen Huang's "every company needs an OpenClaw strategy" quote (featured), Semafor's Anthropic-builds-its-own-OpenClaw exclusive, and MIT Technology Review on China's OpenClaw gold rush.
- Press: sort coverage strictly newest-first with machine-readable dates, demote the Moltbook social-network story from the homepage highlights, and add Microsoft's Build 2026 keynote announcement of OpenClaw running natively on Windows (featured).
- Integrations: add the ClickClack and Raft channels, list ClawRouter, Gradium, Inworld, OpenCode Go, and the Claude Max API proxy in the provider directory, and update catalog stats (29 chat channels, 62 provider entries) to match current docs.
- Press: expand the press page with 7 more verified pieces — Fast Company's AI 20 profile of the creator (featured), Business Insider on Google's 'Remy' answer to OpenClaw, GeekWire inside Microsoft's Project Lobster, BBC News and Fortune on China's lobster craze, and two VentureBeat analyses of the OpenClaw moment.
- Press: refresh Featured In with 2026 Q2 coverage — TechCrunch on Microsoft's OpenClaw-inspired Scout, the iOS/Android launch, Red Hat's enterprise-hardening work, and CNBC on China's lobster rush; new homepage highlight order.
- Testimonials: add 11 new shoutouts from the archive, including @sama, @elonmusk, @garrytan, @growing_daniel, @donasarkar, and @OmarShahine, with cached avatars.
- Website: homepage facelift — hero call-to-action buttons, aurora glow and film-grain texture, larger section headers with chevron markers, refined feature and blog cards, glowing quick-start terminal, cleaner sponsor logo wall, and a wider 960px layout with more breathing room between sections.
- Dependencies: update Astro to 7.0.4, js-yaml to 5.2.0, RSS to 4.0.19, Simple Icons to 16.24.1, and Sharp to 0.35.3; add Astro 7-compatible Lucide icons and preserve the existing generated HTML whitespace behavior (#172, #176, thanks @dependabot).
- Ecosystem: add ClawScan, a composable security scanning harness for agent skills (#177, thanks @Patrick-Erichsen).
- Ecosystem: render the Crabline card from its existing SVG banner instead of requesting a missing PNG.
- Ecosystem: add ffmpeg-wasm, imsgcrawl, and photoscrawl to the project directory.
- Website: redirect `openclaw.ai/docs` to the canonical `docs.openclaw.ai` host while preserving deeper paths and queries.
- Ecosystem: add libterminal to the TypeScript libraries section with terminal banner art.
- Website: add Discord to the top navigation and align Blog, Docs, and GitHub links with inline icons.
- Blog: credit Josh Avant on the auto mode exec approvals post.
- Ecosystem: promote clawpdf into the TypeScript libraries section with its canonical site link.
- Website: sanitize data-driven external links before rendering them into `href` attributes (#143, thanks @SebTardif).
- Website: stop serving the stale GitHub Pages `CNAME` file now that Vercel owns the site, and update the hosting docs (#148, thanks @SebTardif).
- Website: keep root logo compatibility assets available for older `granola.png` and `logo.png` embeds.
- Installer: fetch only the requested git tag during source installs instead of downloading the full OpenClaw tag history.
- Website: move the Discord shortcut into Vercel routing so `/discord` redirects correctly (#147, thanks @SebTardif).
- Ecosystem: tune project card banner art visibility.
- Ecosystem: quiet the final contribution CTA button colors.
- Ecosystem: add a visual project directory with generated banners, real project logos, canonical site links, and local static assets.
- Website: redirect `blog.openclaw.ai` to the canonical blog at `openclaw.ai/blog`.
- Blog: refine the article docs CTA panel colors.
- Blog: cool down the featured post card border and background so the warm coral accent stops dominating the blog index hero.
- CI: drop the stale GitHub Pages deploy workflow; the site has been served by Vercel for a while and Pages was no longer enabled.
- Blog: capitalize tag labels on the blog landing page.
- Blog: simplify the blog landing page headline.
- Website: merge the product/docs/blog visual language, make the homepage quick-start first, and retire the standalone Trust pages in favor of `/blog#security`.
- Website: cache X avatar lookups under local static assets and stop emitting Unavatar URLs in generated pages.
- Integrations: point provider, platform, automation, and ClawHub cards at canonical target pages, and fix the WhatsApp docs link (#137, thanks @Tilakraj0308).
- Shoutouts: URL-encode testimonial avatar fallbacks so contributor names cannot break the inline fallback URL (#142, thanks @SebTardif).
- Blog: trim and tighten the "Where OpenClaw Security Is Heading" post, drop redundant status preambles, fix dangling phrasing, and add an Auto Review reference for codex users.
- Blog: widen the article card with a solid backdrop for readability, and round evidence images while cropping their baked-in decorative frame.
- Installer: after Linux NodeSource installs, prefer the newly installed supported Node binary when an older `/usr/local/bin/node` still shadows it on PATH.
- Installer: when redirecting an unwritable Linux npm global prefix, create or prepend the `.bashrc` PATH hint so fresh non-interactive shells can find `openclaw`.

## 2026-05-03

- Installer: sync `public/install.sh` with canonical `scripts/install.sh` from openclaw/openclaw, bringing progress indicators during quiet steps, progress during npm install in non-interactive `curl | bash` mode, Arch Linux support, Node version handling improvements, gum spinner fixes, and removal of legacy options. Fixes hosted installer drift (openclaw/openclaw#73837, thanks @SebTardif).

## 2026-04-26

- Installer: normalize `HOME` when headless VM execution reports `/`, preventing npm from trying to use `/.npm` on macOS Parallels guests.
- Installer: keep `install-cli.sh` package installs under the prefix-local Node toolchain so `openclaw update` does not create a second package root (#118, thanks @AISymbiote).
- Integrations: add QQ Bot to the chat provider list with the canonical docs link (#119, thanks @sliverp).
- Integrations: point Notion, Bear Notes, GitHub, Image Gen, and Camera cards to their specific ClawHub skill pages (#117, thanks @DJStompZone).
- Dependencies: update Astro to 6.1.9, migrate blog content to Astro 6 content collections, refresh RSS/icons/analytics packages, and bump pinned GitHub Actions.
- Windows installer: route PowerShell install failures through a top-level handler so `irm ... | iex` returns control to the current shell while direct script-file runs still exit non-zero. Fixes openclaw/openclaw#38054, thanks @PwrSrg.
- Installer: warn when multiple npm global roots contain OpenClaw installs, showing active Node/npm/openclaw plus each install path and version so stale version-manager installs are visible. Fixes openclaw/openclaw#40839, thanks @zhixianio.

## 2026-03-16

- Integrations: correct MS Teams docs link to the canonical `/channels/msteams` path (#109, thanks @SidU).
- Showcase/press: add curated community builds and a press page, and surface standout examples on the homepage (#108, thanks @jchopard69).

## 2026-03-07

- Shoutouts: use the theme-aware card surface token so shoutout cards render correctly in light mode (#100, thanks @zwying0814).
- Sponsors: keep the Vercel logo visible in light mode by excluding the light-theme asset from sponsor inversion rules (#88, thanks @Unmesh100).
- Windows installer: fail fast with a clear Git requirement before npm-based install flows that would otherwise die later with `spawn git` (#94, thanks @ningding97).
- Blog: restore the missing Discord link in the VirusTotal partnership post footer (#96, thanks @gandli).
- Dependencies: bump `@lucide/astro` to `0.577.0` and sync `bun.lock` (#99, thanks @dependabot).
- CI: update Bun setup pin and move the install-smoke Node setup to the pinned `actions/setup-node` v6 SHA (#98, thanks @dependabot).
- Installer: recover from older PATH-bound Node runtimes after install, but keep the fallback `openclaw` shim in `~/.local/bin` instead of mutating version-manager bins (#68, thanks @rolandkakonyi).
- Dependencies: update `astro` to `5.18.0` and `simple-icons` to `16.10.0`; add workflow concurrency so stale install jobs on `main` cancel instead of queueing indefinitely.
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
