---
title: "OpenClaw Had a Rough Week"
description: "What happened around the 2026.4.24 and 2026.4.29 releases, why the direction was right, and what we are changing now."
date: 2026-05-03
author: "Peter Steinberger"
authorHandle: "steipete"
draft: false
tags: ["release", "stability", "security", "clawhub"]
---

**TL;DR:** OpenClaw got rough around 2026.4.24, and 2026.4.29 made it obvious. Sorry. We are making core smaller, moving optional stuff to [ClawHub](https://clawhub.ai/), and announcing LTS separately later in May.

The trouble started around 2026.4.24. By 2026.4.29 it was obvious enough that nobody could pretend this was just a few weird installs. Gateways got slower. Some installs got stuck in plugin dependency repair loops. Discord, Telegram, WhatsApp and other channels behaved worse than they should. People downgraded. People lost time.

That sucks. I’m sorry.

The annoying part is that the direction was right. The execution was not.

We’ve been pushing OpenClaw to become smaller, safer and more enterprise-ready. That means less magic in core, fewer bundled dependencies, clearer plugin boundaries, better scanning, better release hygiene, better security posture. All the boring stuff that matters once people run this as actual infrastructure and not just as my weird lobster experiment.

The recent npm supply-chain attacks made this feel a lot less theoretical. The [Axios compromise](https://www.microsoft.com/en-us/security/blog/2026/04/01/mitigating-the-axios-npm-supply-chain-compromise/) was a wake-up call. We did not use Axios directly, but we were still exposed to the same class of risk: transitive npm deps, install-time behavior, postinstall scripts, packages pulling packages pulling packages.

So we started moving things out of core: channels, providers, heavy tools, parsers, optional integrations. The [plugin inventory](https://docs.openclaw.ai/plugins/plugin-inventory) shows what still ships in core, what installs separately, and what is source-checkout only.

The problem: ClawHub was not quite ready to carry all of that weight yet. For a few releases we ended up in the worst middle state: too much moved toward plugins, while too many plugins were still bundled, repaired, staged, checked or loaded in places users feel immediately. Startup. Update. Gateway restart. Doctor.

Core gets smaller. Plugins become explicit. ClawHub becomes the distribution layer.

There’s also a release lesson here. Fast releases are great when we’re building quickly, and we are building very quickly. But not everyone wants to live on the edge with us. Some people run OpenClaw as infrastructure. For them, “latest” should not mean “good luck, see you in Discord.”

We’ll announce LTS separately later in May.

For now the focus is boring stability work. Cut dependency surface. Remove runtime dependency nonsense from startup paths. Make plugin installs more explicit. Make ClawHub ready. Keep security work going, but stop making users pay for internal migration churn.

Thank you to everyone who reported issues, pasted logs, tested betas, downgraded, upgraded again, or just waited while we dug through this. “2026.4.24 got slow.” “2026.4.29 broke my channel.” “Why is it installing plugins again?” That’s the kind of annoying, specific feedback that actually helps.

OpenClaw will keep getting more secure. It will also get smaller.

And next time we move this much furniture around, we need to make sure users don’t wake up with the couch blocking the front door.
