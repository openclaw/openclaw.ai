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

OpenClaw can read files, run commands, install plugins, talk to the network, and act on a real machine for a real user. Power like that is easy to describe as dangerous. The concern is fair. Powerful does not have to mean blind, unbounded, or impossible to audit.

Some of this has landed. Some is rolling out. Some is still in flight. Some is research. I want to be clear about the difference, because posts that blur those lines mislead readers.

## Filesystem boundaries and fs-safe

OpenClaw runs on your machine. That means it can touch your documents, your codebases, and your photos.

The filesystem risk people usually reach for first is path traversal. That risk is real, but it is also only one symptom of a bigger class of bugs: unclear boundaries. Code thinks it is writing inside one root, then a symlink, absolute path, archive extraction, or sloppy join makes it cross another.

[`fs-safe`](https://fs-safe.io/) is one answer to that. It is the set of [safe filesystem patterns](https://docs.openclaw.ai/gateway/security/secure-file-operations) OpenClaw had already been growing, pulled into a shared library so core code, plugins, and adjacent services can use the same root-bounded primitives.

It is not a sandbox. A plugin that is allowed to run arbitrary shell commands can still do arbitrary shell-command things. `fs-safe` protects against boundary-crossing bugs in filesystem code.

Writing inside a plugin workspace should work. Traversal and absolute-path writes outside that workspace should fail. Plugin authors should not have to reimplement those checks.

<figure class="evidence-figure">
  <img src="/blog/where-openclaw-security-is-heading/fs-safe-boundary-refusal-evidence.png" alt="Terminal output showing fs-safe allowing an in-workspace write and blocking traversal and absolute-path writes with outside-workspace errors." loading="lazy" />
  <figcaption>Writing inside the plugin workspace succeeds. Traversal and absolute-path writes are refused as <code>outside-workspace</code>.</figcaption>
</figure>

The next step is making these primitives the expected pattern for plugins on ClawHub too. Bypassing them is not automatically malicious, but it is security-relevant. Over time, that kind of choice should count against a plugin's trust posture.

The safest filesystem call is still the one we do not make. That is the security motivation behind the in-flight SQLite runtime-state refactor. Sessions, transcripts, scheduler state, and plugin state belong in a typed database with clear ownership and transactions, not loose files. Moving runtime state into SQLite removes whole categories of filesystem access from the runtime path.

## Network egress and Proxyline

Agentic systems make SSRF harder than it is in a normal web service. In a normal service, user-controlled URLs are often the exception. In an agent runtime, user-controlled or model-influenced URLs are normal product behavior. "Fetch this URL because someone, or something, asked for it" is normal work.

We started with the obvious approach: validate the URL before fetching it. That is not enough. Validation resolves DNS, the fetch resolves DNS again, and the answer can change between the two. A host that pointed at a public IP during validation can point at a metadata endpoint by the time the request leaves.

The fix has to move closer to egress.

[Proxyline](https://proxyline.dev/) is our Node-process routing layer for that. It installs process-global routing for Node networking surfaces and sends traffic through the [proxy you configured](https://docs.openclaw.ai/security/network-proxy). The configured proxy is where the connect-time policy should live: block metadata addresses, private ranges, loopback canaries, and whatever else your environment needs blocked.

Proxyline routes. The proxy enforces.

It also gives operators observability. If you already run a managed proxy, you can route OpenClaw through it and watch destinations, rates, and blocked attempts from infrastructure you already trust.

Proxyline is not a perfect cage around every possible byte. Raw sockets, native modules, unusual transports, early-captured agents, and non-OpenClaw child processes can still bypass a Node-level guardrail. But for ordinary OpenClaw network paths, moving the control point from "a wrapper remembered to validate this URL" to "egress flows through a proxy policy" is a much better shape.

The validation path is simple: `example.com` should pass, a loopback canary should fail, and [`openclaw proxy validate`](https://docs.openclaw.ai/cli/proxy) should prove the configured route behaves that way.

<figure class="evidence-figure">
  <img src="/blog/where-openclaw-security-is-heading/proxy-validation-egress-evidence.png" alt="Terminal output showing openclaw proxy validate allowing example.com, denying a loopback canary, and passing validation." loading="lazy" />
  <figcaption>The local filtering proxy allows <code>example.com</code>, blocks the loopback canary, and <code>openclaw proxy validate</code> passes.</figcaption>
</figure>

## Plugin trust on ClawHub

ClawHub has to be the authority for plugin trust and provenance when a plugin comes from ClawHub. OpenClaw should consume those signals during install and update, rather than rely only on local inspection after the fact.

The ClawHub pipeline is a mix of signals: ClawScan, VirusTotal, static analysis, metadata checks, source provenance, and manual moderation. None of those is magic. Scanners are noisy in different ways, and a pipeline that screams about everything teaches users to ignore it.

That is where [ClawHub](https://docs.openclaw.ai/clawhub) can do something a local install flow cannot. It can attach [trust evidence](https://docs.openclaw.ai/clawhub/security-audits) to a specific package version. It can say this release is clean, suspicious, held, quarantined, revoked, or malicious. It can block downloads for [malicious or quarantined releases](https://docs.openclaw.ai/clawhub/moderation). It can show users what changed and why.

[Plugins can come from](https://docs.openclaw.ai/cli/plugins) GitHub, a private registry, or a file someone sends you. That is not going away, and OpenClaw should not pretend users do not own their own machines.

What we can do is make the safe path better. Publish on ClawHub. Get scanned. Attach evidence. Let users weigh that evidence before install.

We are also exploring higher-trust tiers above the baseline: official packages, trusted publishers, and packages held to stricter review expectations. For plugins that live outside ClawHub, we want scanning to reach them too, but the exact product shape still needs work.

If ClawHub marks a release as malicious and quarantined, the ClawHub install path should refuse it. That is the bar.

<figure class="evidence-figure">
  <img src="/blog/where-openclaw-security-is-heading/clawhub-malicious-install-blocked-compact-evidence.png" alt="Terminal output showing OpenClaw refusing to install a ClawHub release flagged as malicious and quarantined." loading="lazy" />
  <figcaption>ClawHub marks a release as malicious and quarantined; OpenClaw refuses the install.</figcaption>
</figure>

## Command approvals and prompt fatigue

Prompts arrive faster than anyone can read them. After a few minutes, users flip on YOLO mode so work can continue. At that point the prompts train the user to stop reading.

Fixing this means fewer prompts, and better prompts.

The accuracy part starts with parsing. String matching is not enough. If an allowlist or blocklist only sees the outer command, wrappers become a bypass. A policy that understands `rm` but cannot see inside `bash -c "rm -rf ~/something"` is not a policy users should trust.

The [shell approval path](https://docs.openclaw.ai/tools/exec-approvals) now evaluates inner command chains for common shell `-c` wrappers. If the inner chain contains an executable that is not allowed, the wrapper should not make it safe. The command highlighter also uses Tree-sitter to surface what OpenClaw found inside wrappers.

<figure class="evidence-figure">
  <img src="/blog/where-openclaw-security-is-heading/command-ast-approval-highlight-evidence.png" alt="OpenClaw exec approval dialog highlighting executables inside a nested bash and Python command, including rm." loading="lazy" />
  <figcaption>The command highlighter identifies executables inside wrapper payloads, including the inner destructive command.</figcaption>
</figure>

PowerShell has its own traps; we fail closed for forms we do not understand, and broader support is on the roadmap.

Parsing is the easier half. The harder half is deciding when to ask.

A static approval policy either prompts on everything that might be risky, or relies on a fixed allow/deny list that cannot tell whether a command fits the current task.

The question users actually care about: did I want this to happen?

That is why we are experimenting with contextual approval. The goal is not "never prompt." The goal is that prompts mean something — and when they do, the user should stop and read.

## Static analysis

OpenClaw has had a lot of GitHub Security Advisories. The first job was plugging holes. The next job is making sure the same bug class does not come back.

After an advisory is patched, it is tempting to call it done. A GHSA is evidence about a bug class, not just one bug. The question after triage is: can we find all the code that looks like this?

For that, we use OpenGrep with a precise rulepack. Each rule is tied to an advisory, report, or review finding. The baseline goal is regression detection: if the same vulnerable shape returns, CI catches it before review does. The better goal is variant detection: catch nearby versions of the same mistake.

Precision is everything. A noisy rule is worse than no rule, because it teaches the team to ignore the channel.

Today the checked-in precise OpenGrep rulepack has 148 rules. It runs on PR diffs, and the full scan can be run manually. New patched advisories become candidates for new rules.

<figure class="evidence-figure">
  <img src="/blog/where-openclaw-security-is-heading/opengrep-ghsa-local-rule-hit-evidence.png" alt="Terminal output showing an OpenGrep rule finding a GHSA-derived unsafe safe-bin profile fallback pattern." loading="lazy" />
  <figcaption>An OpenGrep rule catching a previous GHSA-shaped bug locally.</figcaption>
</figure>

CodeQL runs alongside for deeper semantic coverage. It is slower and noisier to maintain; we use both.

## What This Means for OpenClaw Users

OpenClaw is not becoming less powerful. We are making the boundaries easier to see and defend.

We are not going to promise risk-free agents. Anyone promising that is selling something, or has not shipped enough yet.

What we can promise is the direction. OpenClaw can stay powerful while becoming more defensible. That is what we are building.
