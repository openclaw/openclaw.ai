---
title: "How OpenClaw Got Safer in Public"
description: "The work you do not see behind the world's most-watched open source personal AI agent."
date: 2026-04-30
author: "Peter Steinberger"
authorHandle: "steipete"
draft: false
tags: ["security", "open-source", "nvidia", "clawhub"]
---

OpenClaw started on my Mac in Vienna as an experiment. A lot of people screamed it was so insecure.

Open source is supposed to be the unsafe option because everyone can see the code. Sure.

People used it anyway, loved it, and now companies run it in production. Those same companies are the ones now helping us secure it. Nothing that can run tools, hold credentials and install plugins is safe by default. But being open is why we got safer quickly, in public.

## Why So Many Reports?

OpenClaw launched into a weird moment for open source security. In January, curl killed its bug bounty program after drowning in reports that sounded technical, referenced real functions and contained nothing exploitable. Daniel Stenberg called it "death by a thousand slops."

Plus, we are the most-watched AI agent project in the world. Every CVE against OpenClaw is a career trophy, so of course people look.

As of April 30, GitHub shows [1,309 security advisories](https://github.com/openclaw/openclaw/security/advisories) since January 10. 535 were published. 746 were closed as invalid. The number coming in has dropped significantly over the last few months as we hardened the whole system.

The closer a report sits to "critical", the more likely it is to be nonsense. GitHub currently shows 109 critical reports: 14 published, 95 closed as invalid. That is 87%.

The false positives are often wonderfully dumb: "the agent runs commands, therefore RCE", "plugins execute code", "this dangerous opt-in mode is dangerous", "if I already have the token I can do bad things."

## What Actually Changed

At first I was just annoyed at how the game worked. A security advisory used to be an event: stop everything, reproduce, inspect, patch, disclose, ship. Five times a year was annoying; fifteen times a day breaks the process.

What we needed was a triage tool, not a magical sandbox: a way to decide whether a report describes a real boundary violation or OpenClaw doing expected OpenClaw things. [SECURITY.md](https://github.com/openclaw/openclaw/blob/main/SECURITY.md) defines the trust model, documents expected behavior, and gives maintainers something concrete to point at when closing bad reports.

Real bugs remain. OpenClaw moves fast and does weird stuff. We fixed authentication bugs, privilege confusion, reconnect scope widening, sandbox bypasses, unsafe env handling and approval path mistakes.

Some of this cost regular users features. We tightened allowlists, accepted regressions where the single-machine setup (the Mac Mini on your desk, your laptop) was fine, and shipped fast even when fast hurt. Most of the hardening targets multi-user threats most users never hit. We did it anyway, because the people who do hit them are now running this in production.

## Built for Production

We shrank the core. Over the last few months we pushed more functionality out to [plugins](https://docs.openclaw.ai/plugins/sdk-overview), which means a smaller attack surface, a shorter dependency tree and a clearer trust boundary. A poisoned upstream package has fewer paths to actually reach a user.

Releases used to be just me. Now it's me plus another [OpenClaw Foundation](https://www.openclaw.org/) employee, with each one scripted, gated and signed off. End-to-end testing in CI got leveled up so agent flows run on every PR instead of waiting for someone's laptop.

We added [observability](https://docs.openclaw.ai/gateway/opentelemetry): OpenTelemetry, Prometheus metrics, higher-throughput logging and better signals. Secrets moved away from "please be careful" toward references, so credentials do not end up sitting in prompts, logs, transcripts or agent state.

Plugins can act as harnesses now. Wire OpenAI Codex in as [the harness](https://docs.openclaw.ai/plugins/codex-harness) for GPT models and you inherit its controls, including Guardian for per-action gating, instead of running the agent in accept-each-request or YOLO mode.

## The Team Behind It

OpenClaw is not just me anymore. It's me plus an army of maintainers who triage reports, review patches, ship releases and take calls at stupid hours when something real lands. Most have day jobs. They still show up.

They have help. CodeQL, Semgrep, Codex Security and maintainer-owned checks catch weak commits before they merge. [ClawSweeper](https://github.com/openclaw/clawsweeper) handles issue and PR triage so the team can keep up with the firehose.

[NVIDIA](https://blogs.nvidia.com/blog/what-openclaw-agents-mean-for-every-organization/) showed up early with engineering time, security thinking and work on [NemoClaw](https://docs.nvidia.com/nemoclaw/latest/) and OpenShell.

[Microsoft](https://www.microsoft.com/) and [GitHub](https://github.com/) helped at the platform level through the [GitHub Secure Open Source Fund](https://github.blog/open-source/maintainers/securing-the-ai-software-supply-chain-security-results-across-67-open-source-projects/). [Atlassian](https://www.atlassian.com/) and other enterprise partners pushed on deployment, auditability, identity boundaries and secret handling. [Blacksmith](https://www.blacksmith.sh/) gives us the runner capacity to test agent paths at the rate we ship.

[Tencent](https://www.tencent.com/) added full-time maintainers on security, stability and ClawHub, plus a direct vulnerability-sync line with their internal security team.

[OpenAI](https://openai.com/) continues to support the project with inference, gave us [Codex Security](https://openai.com/index/codex-security-now-in-research-preview/) to proactively find and fix security issues, and has made commitments that help keep OpenClaw open and independent as the Foundation comes together. Inside OpenAI, I run a team called Claw Labs that works on shared product improvements.

## ClawHub

[Convex](https://www.convex.dev/) helped maintain ClawHub while we rebuilt the security posture around it. You do not secure marketplaces once. You keep watching, pruning and making the weird stuff easier to spot.

In the last month alone the team closed more than 700 ClawHub moderation issues, around 460 of them rescan appeals from skill authors whose work the automated suspicious flag had misfired on. We will publish more of the ClawHub security findings soon.

## Agents of Chaos

The [Agents of Chaos](https://arxiv.org/abs/2602.20021) paper that made the rounds in February is the loudest example of the incentive problem. Twenty researchers attacked six OpenClaw agents for two weeks and found ugly failures.

The annoying part is the framing. They ran OpenClaw in sudo mode with disabled guardrails, broad shell access and no sandboxing, then wrote up the results as if this is what users get out of the box. The paper has since added a short acknowledgment that guardrails were disabled; the headlines did not.

The lesson is simpler. OpenClaw is built for one trusted person per agent. Share that agent with people you don't trust, and they share its tool access. That is the design, not a hidden auth bug. For groups or companies, split agents and credentials per trust boundary, and turn on sandboxing.

## Fixes Count

The security industry rewards disclosure, not repair. To researchers: I would much rather read your slightly broken report with a real reproduction than your perfectly formatted slop. "I found and fixed a vulnerability in OpenClaw" should carry more credit than "I filed the scariest GHSA title."

Open and safe are not opposites. Open is how we get to safe at all.

The claw is the law. 🦞
