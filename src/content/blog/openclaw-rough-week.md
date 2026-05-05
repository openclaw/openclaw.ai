---
title: "OpenClaw Had a Rough Week"
description: "What happened around the 2026.4.24 and 2026.4.29 releases, why the direction was right, and what we are changing now."
date: 2026-05-05
author: "Peter Steinberger"
authorHandle: "steipete"
draft: false
tags: ["release", "stability", "security", "clawhub"]
---

**TL;DR:** OpenClaw had a rough week. 2026.4.29 made it obvious. Sorry. We are making core smaller, moving optional stuff to [ClawHub](https://clawhub.ai/), and announcing LTS separately later in May.

The trouble started around 2026.4.24. By 2026.4.29 it was obvious enough that nobody could pretend this was just a few weird installs. Gateways got slower. Some installs got stuck in plugin dependency repair loops. Discord, Telegram, WhatsApp and other channels behaved worse than they should. People downgraded. People lost time.

This was not one bug. Plugin dependency repair ran in startup and update paths, bundled and external plugins were half-split, ClawHub artifact metadata was still settling, and gateway cold paths did too much work.

That sucks. I’m sorry.

We’ve been pushing OpenClaw to become smaller, safer and more infrastructure-grade. That means less magic in core, fewer bundled dependencies, clearer plugin boundaries, better scanning, better release hygiene, better security posture. All the boring stuff that matters once people run this as actual infrastructure and not just as my weird lobster playground.

Recent npm ecosystem supply-chain incidents made this feel a lot less theoretical. OpenClaw did not directly depend on [Axios](https://www.microsoft.com/en-us/security/blog/2026/04/01/mitigating-the-axios-npm-supply-chain-compromise/); the relevant risk was the shape of the dependency graph: transitive packages, install-time behavior, postinstall scripts, packages pulling packages pulling packages.

So we started moving things out of core: channels, providers, heavy tools, parsers, optional integrations. The [plugin inventory](https://docs.openclaw.ai/plugins/plugin-inventory) shows what still ships in core, what installs separately, and what is source-checkout only.

The problem: I underestimated how difficult it would be to get this right. For a few releases we ended up in the worst middle state: too much moved toward plugins, while too many plugins were still bundled, repaired, staged, checked, or dependency-loaded in places users feel immediately.

This also exposed an operating problem: OpenClaw was still too founder-driven. Too much release, review, packaging and support work sat with me. Through the OpenClaw Foundation, and with help from OpenAI, we are building a real team around the project.

Going forward, we'll be changing how releases are done, and will soon announce an LTS release next to our faster update cycles.

Thank you to everyone who reported issues, pasted logs, tested betas, downgraded, upgraded again, or just waited while we dug through this.

OpenClaw will keep getting more secure. It will also get smaller. But it has to stay boringly reliable while we do that.
