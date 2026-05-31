---
title: "Auto Mode Is the Safer Way to Let Agents Run Commands"
description: "OpenClaw is moving host exec from YOLO to auto: deterministic commands run, risky misses get reviewed, and humans stay in the approval loop."
date: 2026-05-31
authors:
  - name: "Vince Koc"
    handle: "vincent_koc"
    avatar: "/blog/authors/vince-koc.jpg"
  - name: "Jesse Merhi"
    links:
      - label: "LinkedIn"
        url: "https://www.linkedin.com/in/jesse-merhi/"
      - label: "@jesse_merhi"
        url: "https://x.com/jesse_merhi"
    avatar: "/blog/authors/jesse-merhi.jpg"
draft: false
tags: ["security", "codex", "approvals", "channels"]
---

YOLO mode made host commands fast by skipping approval prompts. That was useful for trusted local automation, but too blunt for everyday use.

`auto` is the safer default.

Safe, repeatable commands can run without nagging you. Commands that miss policy go to a reviewer first. If the reviewer is not confident, OpenClaw asks you.

We shipped this first through the [Codex harness](https://docs.openclaw.ai/plugins/codex-harness), so OpenAI-backed OpenClaw sessions could already use Codex-style auto approvals. Now we are bringing the same safer default to host exec for everyone.

## Why This Exists

Codex already made this shift in its own permission presets. Its `auto` preset is the default: workspace files are writable, normal commands can run, and approvals are still required for escapes such as network access or writes outside the workspace.

OpenClaw is bringing the same shape to [host exec](https://docs.openclaw.ai/tools/exec-approvals). `tools.exec.mode: "auto"` keeps the agent moving without turning every command into a permanent yes.

<section class="mini-card-grid" aria-label="Exec mode comparison">
  <div class="mini-card">
    <span>Ask</span>
    <strong>Human first</strong>
    <p>Allowlist misses stop and wait for an operator. Good for strict setups, noisy for busy agents.</p>
  </div>
  <div class="mini-card">
    <span>Auto</span>
    <strong>Reviewer first</strong>
    <p>Deterministic matches run. Misses go through OpenClaw's native auto reviewer before a human fallback.</p>
  </div>
  <div class="mini-card">
    <span>YOLO</span>
    <strong>No prompts</strong>
    <p>Host exec runs without approval prompts. Useful only when the surrounding environment is already trusted.</p>
  </div>
</section>

## What Auto Does

Host exec starts with OpenClaw config: what the agent is allowed to ask for. Most users only need that setting. Hosts can still apply stricter local policy.

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

Auto is now active for host exec.

If you use the [Codex harness](https://docs.openclaw.ai/plugins/codex-harness), this is the path OpenAI-backed sessions already use: `tools.exec.mode: "auto"` maps Codex app-server sessions to reviewed approvals with workspace-write sandboxing when available.

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

YOLO remains available for environments that are already externally sandboxed or deliberately trusted. For most users, `auto` is the better default: fewer prompts than strict ask mode, less risk than full host access.
