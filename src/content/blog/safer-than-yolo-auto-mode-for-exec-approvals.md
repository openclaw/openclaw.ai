---
title: "Safer Than YOLO: Auto Mode for Exec Approvals"
description: "OpenClaw is adding opt-in auto mode for Enterprise-ready host exec guardrails: policy runs first, low-risk misses get reviewed, and humans stay in the loop."
date: 2026-05-31
authors:
  - name: "Vincent Koc"
    title: "Chief Architect"
    org: "OpenClaw Foundation"
    handle: "vincent_koc"
    links:
      - label: "LinkedIn"
        url: "https://www.linkedin.com/in/koconder/"
      - label: "@vincent_koc"
        url: "https://x.com/vincent_koc"
    avatar: "/blog/authors/vince-koc.jpg"
  - name: "Jesse Merhi"
    title: "Core Maintainer"
    org: "OpenClaw / Atlassian"
    links:
      - label: "LinkedIn"
        url: "https://www.linkedin.com/in/jesse-merhi/"
      - label: "@jesse_merhi"
        url: "https://x.com/jesse_merhi"
    avatar: "/blog/authors/jesse-merhi.jpg"
draft: false
tags: ["security", "codex", "approvals", "channels"]
---

YOLO mode made host commands fast by skipping approval prompts. That is useful for trusted local automation and externally sandboxed runs, but it is too blunt as the only good answer for everyday use.

We are not changing the default today.

`auto` is an opt-in path we are testing in public. If it proves useful, we will consider making it the safer default for more users, but the principle stays the same: OpenClaw should protect people without taking away operator choice.

Auto is the mode that fits Enterprise environments best: policy runs first, low-risk misses can be reviewed by a model, and anything uncertain still routes to a human.

Safe, repeatable commands can run without nagging you. Commands that miss policy go to a reviewer first. If the reviewer is not confident, OpenClaw asks you.

OpenAI already ships this pattern as Guardian inside Codex. Through the [Codex harness](https://docs.openclaw.ai/plugins/codex-harness), OpenAI-backed OpenClaw sessions can use Codex-native reviewed approvals. Now we are bringing the same shape to OpenClaw host exec as an opt-in mode for everyone.

## Why This Exists

Codex already made this shift in its own permission presets. Its Guardian-reviewed flow lets common workspace work proceed while still requiring review for escapes such as network access or writes outside the workspace.

OpenClaw is bringing the same shape to [host exec](https://docs.openclaw.ai/tools/exec-approvals). `tools.exec.mode: "auto"` keeps the agent moving without turning every command into a permanent yes.

<section class="mini-card-grid" aria-label="Exec mode comparison">
  <div class="mini-card">
    <span>Ask</span>
    <strong><span>Human</span><span>first</span></strong>
    <p>Allowlist misses stop and wait for an operator. Good for strict setups, noisy for busy agents.</p>
  </div>
  <div class="mini-card">
    <span>Auto</span>
    <strong><span>Reviewer</span><span>first</span></strong>
    <p>Deterministic matches run. Misses go through OpenClaw's native auto reviewer before a human fallback.</p>
  </div>
  <div class="mini-card">
    <span>YOLO</span>
    <strong><span>No</span><span>prompts</span></strong>
    <p>Host exec runs without approval prompts. Useful only when the surrounding environment is already trusted.</p>
  </div>
</section>

## What Auto Does

Host exec starts with OpenClaw config: what the agent is allowed to ask for. Most users only need that setting. Hosts can still apply stricter local policy.

The reviewer model is separate from the main agent model. You can keep the agent on local models for normal work and point exec review at a frontier model such as `openai/gpt-5.5` when you want stronger judgment on approval misses. That gives you the best of both worlds: local-first execution for ordinary turns, higher-confidence review only when host access needs a decision.

In `auto` mode, OpenClaw handles a host command like this:

1. If the command matches the allowlist or a deterministic safe-bin rule, it runs.
2. If the command misses policy, OpenClaw builds a bounded review packet: command, argv, cwd, env key names, host, and parser analysis.
3. The auto reviewer can allow one low-risk execution only.
4. Anything ambiguous, higher-risk, unparseable, timed out, model-unavailable, or reviewer-directed falls back to human approval.
5. If no UI or configured approval client can answer, OpenClaw uses the host's configured fallback.

`auto` does not override local safety settings. A host configured to always ask still asks. A host configured to deny still denies.

## Enabling Auto

For a local gateway-host setup:

```bash
openclaw config set tools.exec.host gateway
openclaw config set tools.exec.mode auto
```

That host has now opted into auto for host exec.

If you want review to use a stronger model than the main agent, set the reviewer model separately:

```bash
openclaw config set tools.exec.reviewer.model openai/gpt-5.5
```

Leave it unset to reuse the current agent model.

If you use the [Codex harness](https://docs.openclaw.ai/plugins/codex-harness), this maps OpenAI-backed sessions onto Codex Guardian-reviewed approvals with workspace-write sandboxing when available.

## What Gets Asked

Human approval is still the final authority when the reviewer cannot safely say yes.

An approval prompt can offer:

- `allow-once`: run this exact request once.
- `allow-always`: persist a durable allowlist entry when the request supports it.
- `deny`: do not run it.

`allow-once` is intentionally narrow. For node-host runs, OpenClaw binds the approval to the canonical command plan, cwd, argv, and session context. If the caller changes the command after the approval request was created, the run is rejected instead of silently executing the changed request.

## Approvals in Chat

Approvals are no longer trapped in a local terminal. OpenClaw can route approval prompts into the places operators already watch, including [Slack](https://docs.openclaw.ai/channels/slack), [Telegram](https://docs.openclaw.ai/channels/telegram), and [iMessage](https://docs.openclaw.ai/channels/imessage).

The detailed setup lives in [Exec approvals - advanced](https://docs.openclaw.ai/tools/exec-approvals-advanced).

## Security Notes

`auto` reduces prompt noise. It still respects the host policy.

The reviewer may only allow one low-risk execution. It is prompted to treat the command text, argv, cwd, env keys, heredocs, strings, filenames, and metadata as untrusted data. If that untrusted data tries to instruct the reviewer or request a decision, OpenClaw defers to a human.

YOLO remains available for environments that are already externally sandboxed or deliberately trusted. For Enterprise environments, `auto` is the better fit: fewer prompts than strict ask mode, more review than full host access, and a human fallback when the reviewer cannot safely say yes. We are not forcing that switch yet.
