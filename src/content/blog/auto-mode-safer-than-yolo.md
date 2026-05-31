---
title: "Auto Mode Is the Safer Way to Let Agents Run Commands"
description: "OpenClaw is moving host exec from YOLO to auto: deterministic commands run, risky misses get reviewed, and humans stay in the approval loop."
date: 2026-05-31
author: "Peter Steinberger"
authorHandle: "steipete"
draft: false
tags: ["security", "codex", "approvals", "channels"]
---

For a while, the fastest way to let an agent get real work done was also the scariest one: YOLO mode. It let host commands run without approval prompts. Great for trusted local automation, terrible as the default mental model for everyone else.

We now have a better path: `auto`.

`auto` keeps the useful part of automation - letting safe, repeatable commands run without nagging you - while preserving the security property YOLO throws away. When OpenClaw cannot prove a host command is already covered by policy, it asks a reviewer first. If the reviewer is not confident, it asks you.

## Why This Exists

Codex already made this shift in its own permission presets. Its `auto` preset is the default: workspace files are writable, normal commands can run, and approvals are still required for escapes such as network access or writes outside the workspace. The dangerous path still exists under the explicit `--yolo` alias, but it means what it says: bypass approvals and sandboxing.

OpenClaw is bringing the same shape to [host exec](https://docs.openclaw.ai/tools/exec-approvals). Instead of teaching users to choose between "approve everything manually" and "trust everything forever", `tools.exec.mode: "auto"` gives us a middle lane.

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

Host exec has two policy layers.

The first layer is OpenClaw config: what the agent is asking for. The second layer is the local approvals file on the machine that will actually run the command. The effective policy is the stricter merge of both.

In `auto` mode, OpenClaw handles a host command like this:

1. If the command matches the allowlist or a deterministic safe-bin rule, it runs.
2. If the command misses policy, OpenClaw builds a bounded review packet: command, argv, cwd, env key names, host, and parser analysis.
3. The auto reviewer can allow one low-risk execution only.
4. Anything ambiguous, higher-risk, unparseable, timed out, model-unavailable, or reviewer-directed falls back to human approval.
5. If no UI or configured approval client can answer, the host's `askFallback` decides the result.

That last point matters. `auto` is not a secret bypass around your machine's local policy. A host-local `ask: "always"` still asks. A host-local `security: "deny"` still denies.

## Enabling Auto

For a local gateway-host setup:

```bash
openclaw config set tools.exec.host gateway
openclaw config set tools.exec.mode auto

openclaw approvals set --stdin <<'EOF'
{
  "version": 1,
  "defaults": {
    "security": "allowlist",
    "ask": "on-miss",
    "askFallback": "deny"
  }
}
EOF
```

For a node host, set the requested OpenClaw policy the same way, then update the node's approvals file on the node runtime:

```bash
openclaw approvals set --node <id|name|ip> --stdin <<'EOF'
{
  "version": 1,
  "defaults": {
    "security": "allowlist",
    "ask": "on-miss",
    "askFallback": "deny"
  }
}
EOF
```

If you use the [Codex harness](https://docs.openclaw.ai/plugins/codex-harness), the same normalized OpenClaw surface applies. `tools.exec.mode: "auto"` maps Codex app-server sessions to Guardian-reviewed approvals, typically `approvalPolicy: "on-request"`, `approvalsReviewer: "auto_review"`, and `sandbox: "workspace-write"` when the local requirements allow those settings. If you intentionally want no-approval Codex posture, use `tools.exec.mode: "full"` instead.

## What Gets Asked

Human approval is still the final authority when the reviewer cannot safely say yes.

An approval prompt can offer:

- `allow-once`: run this exact request once.
- `allow-always`: persist a durable allowlist entry when the request supports it.
- `deny`: do not run it.

`allow-once` is intentionally narrow. For node-host runs, OpenClaw binds the approval to the canonical command plan, cwd, argv, and session context. If the caller changes the command after the approval request was created, the run is rejected instead of silently executing the changed request.

## Approvals in Chat

Approvals are no longer trapped in a local terminal. OpenClaw can route exec and plugin approvals into the places operators already watch. The full forwarding model lives in [Exec approvals - advanced](https://docs.openclaw.ai/tools/exec-approvals-advanced).

### Slack

[Slack](https://docs.openclaw.ai/channels/slack) can render native Block Kit approval prompts when interactivity is enabled. Exec approvals use `channels.slack.execApprovals.*`; approvers come from `channels.slack.execApprovals.approvers` or `commands.ownerAllowFrom`.

```json5
{
  commands: {
    ownerAllowFrom: ["slack:U12345678"],
  },
  channels: {
    slack: {
      execApprovals: {
        enabled: "auto",
        target: "dm",
      },
    },
  },
}
```

Slack auto-enables native exec approvals when at least one exec approver resolves. Same-chat `/approve` also works in Slack channels and DMs that already support commands. Slack approval UX is button-first, not emoji-reaction-first.

### Telegram

[Telegram](https://docs.openclaw.ai/channels/telegram) supports approver DMs and optional prompts in the originating chat or forum topic. Approvers must be numeric Telegram user IDs.

```json5
{
  commands: {
    ownerAllowFrom: ["telegram:123456789"],
  },
  channels: {
    telegram: {
      execApprovals: {
        enabled: "auto",
        approvers: ["123456789"],
        target: "dm",
      },
      capabilities: {
        inlineButtons: "all",
      },
    },
  },
}
```

Inline approval buttons require `channels.telegram.capabilities.inlineButtons` to allow the target surface. Telegram can also use same-chat `/approve`, but approval authorization still goes through resolved approvers.

### iMessage

[iMessage](https://docs.openclaw.ai/channels/imessage) approval reactions landed. When an exec or plugin approval routes to iMessage, OpenClaw can resolve it from tapbacks:

- `👍` / Like tapback: `allow-once`
- `👎` / Dislike tapback: `deny`
- `allow-always`: still a manual `/approve <id> allow-always` reply

```json5
{
  approvals: {
    exec: {
      enabled: true,
      mode: "targets",
      targets: [
        { channel: "imessage", to: "+15555550123" },
      ],
    },
  },
  channels: {
    imessage: {
      allowFrom: ["+15555550123"],
    },
  },
}
```

The reacting handle must be an explicit approver in `channels.imessage.allowFrom` or the account-level allowlist. OpenClaw ignores cross-device self-tapbacks, so your bot cannot approve itself because your phone mirrored a reaction.

## The Security Model

`auto` is a fatigue reducer, not a new trust boundary.

The reviewer may only allow one low-risk execution. It is prompted to treat the command text, argv, cwd, env keys, heredocs, strings, filenames, and metadata as untrusted data. If that untrusted data tries to instruct the reviewer or request a decision, OpenClaw defers to a human.

YOLO remains available for environments that are already externally sandboxed or deliberately trusted. But for most users, `auto` is the better default: fewer prompts than strict ask mode, much less blast radius than full host access.

That is the migration path we want: not slower agents, not blind trust. Fast when we can prove it, explicit when we cannot.
