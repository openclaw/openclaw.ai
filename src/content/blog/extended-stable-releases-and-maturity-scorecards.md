---
title: "OpenClaw Announces Extended Stable Releases and a Maturity Scorecard"
description: "A new long-lived release channel and a public maturity scorecard make it easier to choose OpenClaw features for critical workloads."
date: 2026-07-28
author: "Kevin Lin"
draft: false
tags: ["announcement", "release", "stability", "maturity"]
---

OpenClaw is maturing.

What started as a side project with a funny name is turning into load-bearing infrastructure relied on by individuals and Fortune 500 companies to run increasingly critical workloads.

In recognition of OpenClaw's growing importance, we are adding the extended-stable release channel. These are long-lived OpenClaw releases with extended support and backported fixes.

Extended-stable releases will roll out once a month. The first is the [OpenClaw 2026.6.33 release](https://github.com/openclaw/openclaw/releases/tag/v2026.6.33).

Each month's extended-stable line starts at `YYYY.M.33`. Backported security and reliability fixes increment the patch version by one. A release is supported for at least one month and until a new extended-stable release has been cut.

To install the extended-stable version of OpenClaw:

```bash
npm install -g openclaw@extended-stable
```

This installs the selected release but does not persist the update channel.

To persist extended-stable as the update channel for a new or existing package installation:

```bash
openclaw update --channel extended-stable
```

The extended-stable channel is package-only, installs in the foreground, and fails closed rather than silently falling back to another release line. See the [release channel documentation](https://docs.openclaw.ai/install/development-channels) for complete channel semantics.

Along with extended-stable releases, we are also announcing the [OpenClaw maturity scorecard](https://docs.openclaw.ai/maturity/scorecard).

The scorecard is a full inventory of OpenClaw features and tracks where each feature sits in our maturity model. Features are organized by surface area, meaning broad product capabilities, and category, meaning families of related features within a surface.

Maturity is currently calculated from a combination of quality and completeness. These scores draw on outstanding GitHub issues, comparisons with similar services, and human judgment. Test coverage is tracked separately through deterministic QA evidence.

Issues submitted against mature features will receive a dedicated label and be prioritized by maintainers. Mature features will also have real end-to-end tests that exercise them in production. Our goal is to maintain more than 90% end-to-end test coverage for all Stable-or-better features.

Extended-stable releases and the maturity scorecard mark another step in OpenClaw's journey from a project used by early adopters to a platform that even hardened enterprises can rely on. This will be a long journey, and we are just getting started.
