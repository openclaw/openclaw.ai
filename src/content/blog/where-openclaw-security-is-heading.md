---
title: "Where OpenClaw Security Is Heading"
description: "The security roadmap for making OpenClaw a powerful personal assistant runtime users can understand, observe, and trust."
date: 2026-05-15
authors:
  - name: "Jesse Merhi"
    url: "https://www.linkedin.com/in/jesse-merhi/"
    avatar: "/blog/authors/jesse-merhi.jpg"
draft: false
tags: ["security", "open-source", "clawhub", "plugins"]
---

Our goal is for OpenClaw to become a trusted way to run a powerful AI personal assistant.

OpenClaw can read files, run commands, install plugins, talk to the network, and act on a real machine for a real user. Power like that is easy to describe as dangerous, and the concern is not wrong. But powerful does not have to mean blind, unbounded, or impossible to audit.

Some of this has landed. Some is rolling out. Some is still in flight. Some is research. I want to be clear about the difference, because posts that blur those lines mislead readers.

## Filesystem boundaries and fs-safe

**Status: landed for the shared filesystem primitives; in flight for the larger runtime-state move.**

OpenClaw runs on your machine. That means it can touch your documents, your codebases, and your photos.

The filesystem risk people usually reach for first is path traversal. That risk is real, but it is also only one symptom of a bigger class of bugs: unclear boundaries. Code thinks it is writing inside one root, then a symlink, absolute path, archive extraction, or sloppy join makes it cross another.

[`fs-safe`](https://fs-safe.io/) is one answer to that. It is not a new idea bolted onto OpenClaw from the outside. It is the set of safe filesystem patterns OpenClaw had already been growing, pulled into a shared library so core code, plugins, and adjacent services can use the same root-bounded primitives.

It is also not a sandbox. A plugin that is allowed to run arbitrary shell commands can still do arbitrary shell-command things. `fs-safe` protects against boundary-crossing bugs in filesystem code. It does not turn untrusted code into trusted code.

Writing inside a plugin workspace should work. Traversal and absolute-path writes outside that workspace should fail. Plugin authors should not have to reimplement those checks, and reviewers should not have to rediscover every edge case in every package.

The next step is making these primitives the expected pattern for plugins on ClawHub too. Bypassing them is not automatically malicious, but it is security-relevant. Over time, that kind of choice should count against a plugin's trust posture.

The safest filesystem call is still the one we do not make. That is the security motivation behind the in-flight SQLite runtime-state refactor. Sessions, transcripts, scheduler state, and plugin state belong in a typed database with clear ownership and transactions, not sprawled across loose files. `fs-safe` makes required filesystem access safer; moving runtime state into SQLite removes whole categories of filesystem access from the runtime path.

## SSRF, Network Egress, and Proxyline

**Status: rolling out as a Node-process egress guardrail.**

Agentic systems make SSRF harder than it is in a normal web service. In a normal service, user-controlled URLs are often the exception. In an agent runtime, user-controlled or model-influenced URLs are normal product behavior. "Fetch this URL because someone, or something, asked for it" is not an edge case. It is a feature.

We started with the obvious approach: validate the URL before fetching it. That is not enough. Validate-then-fetch has a TOCTOU gap — validation resolves DNS, the fetch resolves DNS again, and the answer can change between. A host that pointed at a public IP during validation can point at a metadata endpoint by the time the request leaves.

The fix has to move closer to egress.

Proxyline is our Node-process routing layer for that. It is not itself the filtering proxy. It installs process-global routing for Node networking surfaces and sends traffic through the proxy you configured. The configured proxy is where the connect-time policy should live: block metadata addresses, private ranges, loopback canaries, and whatever else your environment needs blocked.

Proxyline routes. The proxy enforces.

It also gives operators observability. If you already run a managed proxy, you can route OpenClaw through it and watch destinations, rates, and blocked attempts from infrastructure you already trust.

Proxyline is not a perfect cage around every possible byte. Raw sockets, native modules, unusual transports, early-captured agents, and non-OpenClaw child processes can still bypass a Node-level guardrail. But for ordinary OpenClaw network paths, moving the control point from "a wrapper remembered to validate this URL" to "egress flows through a proxy policy" is a much better shape.

The validation path is simple: `example.com` should pass, a loopback canary should fail, and `openclaw proxy validate` should prove the configured route behaves that way.

## ClawHub Trust, ClawScan, and Plugin Provenance

**Status: landed for ClawHub-hosted package trust signals; still evolving for tiers and off-Hub packages.**

For a while, we tried to secure plugins mostly inside OpenClaw itself. That will never be enough.

ClawHub has to be the authority for plugin trust and provenance when a plugin comes from ClawHub. OpenClaw should consume those signals during install and update, not rely only on local inspection after the fact.

The ClawHub pipeline is a mix of signals: ClawScan, VirusTotal, static analysis, metadata checks, source provenance, and manual moderation. None of those is magic. Scanners are noisy in different ways, and a pipeline that screams about everything teaches users to ignore it.

So the hard work is calibration. Which signal is reliable? Which one false-positives? Which findings should block an install, and which should be shown as evidence without becoming a verdict?

That is where ClawHub can do something a local install flow cannot. It can attach trust evidence to a specific package version. It can say this release is clean, suspicious, held, quarantined, revoked, or malicious. It can block downloads for malicious or quarantined releases. It can show users what changed and why.

Not every OpenClaw plugin will live on ClawHub. Plugins can come from GitHub, a private registry, or a file someone sends you. That is not going away, and OpenClaw should not pretend users do not own their own machines.

What we can do is make the safe path better. Publish on ClawHub. Get scanned. Attach evidence. Let users weigh that evidence before install.

We are also exploring higher-trust tiers above the baseline: official packages, trusted publishers, and packages held to stricter review expectations. For plugins that live outside ClawHub, we want scanning to reach them too, but the exact product shape still needs work.

If ClawHub marks `@openclaw/files@1.4.2` as malicious and quarantined, the ClawHub install path should refuse it. That is the bar.

## Command Authorization and Prompt Fatigue

**Status: landed for stronger shell allowlist analysis; experimenting on contextual approval.**

Anyone who has used an agent harness in approval mode knows the pain.

Prompts arrive faster than anyone can read them. After a few minutes, users flip on YOLO mode so work can continue. At that point the prompts are not protecting anyone. They trained the user to stop reading.

Fixing this means fewer prompts, and better prompts.

The accuracy part starts with parsing. String matching is not enough. If an allowlist or blocklist only sees the outer command, wrappers become a bypass. A policy that understands `rm` but cannot see inside `bash -c "rm -rf ~/something"` is not a policy users should trust.

OpenClaw has been pushing on that. The shell approval path now evaluates inner command chains for common shell `-c` wrappers. If the inner chain contains an executable that is not allowed, the wrapper should not make it safe. The command highlighter also uses Tree-sitter to show users what OpenClaw found, including executables inside wrapper payloads.

PowerShell has its own shape and its own traps. We already fail closed for forms we do not understand, and broader PowerShell support is on the roadmap.

Parsing is the easier half. The harder half is deciding when to ask.

A static approval policy tends to do one of two bad things. It prompts on everything that might be risky, which sends users to YOLO mode. Or it relies on a fixed allow/deny list that cannot tell whether a command fits the current task.

The question users actually care about is simpler: did I want this to happen?

That is why we are experimenting with contextual approval. The goal is not "never prompt." The goal is that prompts mean something. If OpenClaw asks, the user should stop and read. If OpenClaw does not ask, that decision should be one we can defend.

## Static Analysis

**Status: landed and running on PRs.**

OpenClaw has had a lot of GitHub Security Advisories. The first job was plugging holes. The next job is making sure the same bug class does not come back.

After an advisory is patched, it is tempting to call it done. A GHSA is evidence about a bug class, not just one bug. The question after triage is: can we find all the code that looks like this?

For that, we use OpenGrep with a precise rulepack. Each rule is tied to an advisory, report, or review finding. The baseline goal is regression detection: if the same vulnerable shape returns, CI catches it before review does. The better goal is variant detection: catch nearby versions of the same mistake.

Precision is everything. A noisy rule is worse than no rule, because it teaches the team to ignore the channel.

Today the checked-in precise OpenGrep rulepack has 148 rules. It runs on PR diffs, and the full scan can be run manually. New patched advisories become candidates for new rules.

CodeQL covers broader ground alongside it. The challenge there is scale. OpenGrep can scan our focused rulepack quickly. CodeQL gives deeper semantic coverage but takes more time and cleanup. We need both.

## What This Means for OpenClaw Users

OpenClaw is not becoming less powerful. It is becoming more legible. More observable. More explicit about which boundary is being enforced where.

`fs-safe` does not sandbox plugins; it prevents filesystem boundary mistakes. Proxyline does not replace a filtering proxy; it routes Node egress through one. ClawHub does not remove user choice; it gives users package-version evidence before install. Command authorization does not work because prompts exist; it works when prompts are rare enough and accurate enough to matter.

We are not going to promise risk-free agents. Anyone promising that is selling something, or has not shipped enough yet.

What we can promise is the direction. OpenClaw can stay powerful while becoming more defensible. That is the runtime we want to build, and the runtime personal assistants deserve to run on.
