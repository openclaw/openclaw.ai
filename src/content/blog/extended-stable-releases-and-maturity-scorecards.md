---
title: "On the Road to LTS: Extended-Stable Releases and the Maturity Scorecard"
description: "A new long-lived release channel and a public maturity scorecard make it easier to choose OpenClaw features for critical workloads."
date: 2026-07-30
author: "Kevin Lin"
authorAvatar: "/blog/authors/kevin-lin.jpg"
draft: false
tags: ["announcement", "release", "stability", "maturity"]
image: "/blog/extended-stable-releases-and-maturity-scorecards/road-to-lts.png"
---

OpenClaw is maturing.

What started as a side project with a funny name is turning into core infrastructure relied on by individuals and Fortune 500 companies to run increasingly critical workloads. In recognition of OpenClaw's growing importance, we are introducing **[extended-stable releases](https://docs.openclaw.ai/install/development-channels)**. These are long-lived OpenClaw channels with extended support and backported fixes.

Extended-stable releases will roll out once a month. The first, [OpenClaw 2026.6.33](https://github.com/openclaw/openclaw/releases/tag/v2026.6.33), is based on [OpenClaw 2026.6.11](https://github.com/openclaw/openclaw/releases/tag/v2026.6.11) and adds security and reliability fixes backported from later releases. Each month's extended-stable line starts at `YYYY.M.33`. Backported security and reliability fixes increment the patch version by one. A release is supported until the next extended-stable release is cut, for a minimum of one month. Extended-stable releases move us closer to supporting official LTS releases of OpenClaw. They let us harden our release process and iterate towards how to best offer long term support in the agentic era.

To install the extended-stable version of OpenClaw, run the following command:

```bash
npm install -g openclaw@extended-stable
```

This installs the selected release but does not persist the update channel. To persist extended-stable as the update channel for a new or existing package installation:

```bash
openclaw update --channel extended-stable
```

Along with extended-stable releases, we are also announcing the [OpenClaw maturity scorecard](https://docs.openclaw.ai/maturity/scorecard). The scorecard is a full inventory of OpenClaw features and tracks where each feature sits in our maturity model. Features are organized by surface area (broad product capabilities) and category (families of related features within a surface).

Maturity is currently calculated from a combination of quality and completeness. These scores are calculated via outstanding GitHub issues, comparisons with similar services, and human judgment. Issues submitted against mature features will receive a dedicated label and be prioritized by maintainers. Mature features will also have real end-to-end tests that exercise them in production. Our goal is to maintain more than 90% end-to-end test coverage for all stable features.

Extended-stable releases and the maturity scorecard mark another step in OpenClaw's journey from a project used by early adopters to a platform that even hardened enterprises can rely on. We are building OpenClaw into the stable foundation for agents - one stable release at a time.
