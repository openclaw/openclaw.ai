---
title: "OpenAI Models in OpenClaw, Done Right"
description: "OpenClaw now runs OpenAI agent turns through the native Codex app-server harness by default, while bringing the lessons back to every model."
date: 2026-05-14
author: "Nik Pash"
authorHandle: "pashmerepat"
draft: false
tags: ["models", "openai", "codex", "agents"]
---

Your ChatGPT subscription can now power an OpenClaw agent that feels much closer to the model it is built on.

OpenClaw already supported OpenAI models, but the old path made OpenClaw drive the model loop itself. That worked, but it also meant OpenClaw was translating between its own harness and the runtime OpenAI is actively building for agentic work.

That changes with the Codex app-server harness becoming the default runtime for OpenAI agent turns.

The short version:

- `openai/gpt-*` agent turns now run through the native Codex app-server path by default.
- OpenClaw still owns the parts that make the assistant yours: channels, persona, memory, sessions, cron, media, browser, gateway, and OpenClaw tools.
- Codex owns the low-level OpenAI loop: native thread state, native tool continuation, compaction, code mode, and dynamic tool search.
- The lessons from this work are already flowing back into the default OpenClaw harness, so every model gets better over time.

To start with the guided path:

```bash
openclaw onboard
```

Or sign in directly:

```bash
openclaw models auth login --provider openai
```

## Why the runtime matters

OpenClaw is not just a chat UI. It is an agent platform that runs where you choose and talks through the channels you already use: Telegram, Discord, Slack, WhatsApp, Matrix, web chat, and more.

That outer layer is where OpenClaw should be opinionated. It knows your channels, your agent config, your memory, your scheduled jobs, your media rules, your tool permissions, and your local gateway.

The inner model loop is a different kind of problem. It is where the model reasons, calls tools, resumes native thread state, handles code execution, and keeps long-running turns coherent.

For OpenAI models, Codex app-server is now the best owner of that loop.

So we moved the boundary:

- Codex owns the OpenAI turn.
- OpenClaw owns the product around the turn.

That sounds small, but it removes a lot of friction.

The model no longer has to choose between duplicated workspace tools. It can use Codex-native read, edit, patch, exec, process, and planning tools directly. OpenClaw no longer has to pretend those are just generic plugin tools. And OpenClaw can keep its own integration tools available without stuffing every schema into the first prompt.

The result is less translation, less hesitation, and more useful action.

## Visible replies are now deliberate

One of the clearest changes is how replies are delivered.

In many agent systems, the final assistant string becomes the visible message by accident. That is fine for a chat box. It is much worse for a multi-channel assistant that might be replying in a group, DM, thread, or scheduled task.

Codex-backed OpenAI turns now prefer the OpenClaw message tool for visible source replies. If the agent wants to say something to you, it calls the tool whose job is to send that message.

That gives the model a cleaner distinction:

- internal reasoning and tool work stay private
- visible replies are intentional
- quiet turns are actually quiet
- rich or media replies have a real delivery path

Heartbeats got the same treatment. Instead of relying on sentinel text like `HEARTBEAT_OK`, tool-capable heartbeat turns can use `heartbeat_respond` with an explicit outcome. The agent can say "nothing to report", "notify the user", or "schedule a follow-up" as structured state rather than as a string that OpenClaw has to guess about.

This matters for personality too. A personal agent should not feel chatty because the transport leaked text. It should interrupt because it has something worth showing you.

## Searchable tools without prompt bloat

The biggest practical win is dynamic tool loading.

OpenClaw agents can have a lot of tools: messaging, sessions, media, cron, browser, nodes, gateway controls, web search, MCP servers, plugin tools, and channel-specific actions.

Putting every full tool schema in the initial prompt is expensive and noisy. The model sees too much, the request gets bigger, and the chance of picking the wrong tool goes up.

Codex gives us a better shape: searchable dynamic tools. OpenClaw passes its product capabilities to Codex as dynamic tools, and Codex can discover the right one on demand through native tool search. Codex-native workspace tools stay native. OpenClaw integration tools live under the OpenClaw namespace.

That means the model can search for the tool it needs, load the schema when it actually needs it, and keep the initial context smaller.

This is also the part that should make non-OpenAI users happy.

OpenClaw should work great with any model. Codex taught us a cleaner pattern for large tool catalogs, and we are bringing that lesson back to the default OpenClaw PI harness. PI Tool Search is experimental today: it gives non-Codex runs a compact search, describe, and call surface instead of preloading every eligible tool schema.

We are not turning that on by default for everyone yet. The bar is high: it needs to be reliable, safe, and model-compatible across providers. But the direction is clear. Codex helped prove the shape, and every model should eventually benefit from it.

## Your ChatGPT subscription, isolated per agent

You should not have to pay twice for the same model.

For the normal OpenAI path, sign in with your ChatGPT/Codex account:

```bash
openclaw models auth login --provider openai
```

That gives OpenClaw a subscription-backed Codex auth profile for OpenAI agent turns. If you want a direct API-key backup, add it explicitly:

```bash
openclaw models auth login --provider openai --method api-key
```

The agent model ref stays canonical:

```bash
openclaw config set agents.defaults.model.primary openai/gpt-5.5
```

The important detail is that `openai/gpt-*` does not automatically mean "bill the OpenAI API key path." For agent turns, OpenClaw routes OpenAI models through the Codex runtime by default. Auth can come from the subscription profile, an ordered backup profile, or an app-server account in the agent's Codex home.

OpenClaw also keeps Codex state isolated per agent. Your OpenClaw agent gets its own Codex home, thread state, account bridge, and migrated plugin setup. Your personal Codex CLI setup is not silently imported into an OpenClaw agent, and OpenClaw agent state does not leak back into your personal CLI state.

## Guardrails stay explicit

Autonomous agents need useful defaults, but they also need understandable safety boundaries.

The Codex harness supports both unchained local execution and reviewed approval modes. OpenClaw keeps unattended local automation practical by default, and lets operators opt into reviewed approvals when the deployment needs that posture.

In reviewed modes, Codex approval requests can route through Codex's reviewer flow, including `auto_review` where supported. OpenClaw still owns the outer approval routing, channel delivery, plugin hooks, and visible failure reporting.

So the model can use the native Codex safety machinery without OpenClaw giving up its own policy layer.

## What comes along for the ride

Once Codex owns the OpenAI loop, OpenClaw can use more of the runtime OpenAI is actively improving:

- native Codex thread resume and compaction
- native code mode and workspace tools
- searchable dynamic tools
- Codex plugin and app support where enabled
- native model discovery through the app-server catalog
- clearer diagnostics when the app-server or auth path fails

OpenClaw still mirrors the transcript, records session state, runs hooks, delivers media, handles channels, and exposes OpenClaw tools. The point is not to make OpenClaw thinner everywhere. The point is to make each layer own the work it is best at.

## The bigger picture

The immediate win is better OpenAI support: less prompt clutter, fewer duplicated tools, cleaner visible replies, subscription-backed auth, and a model loop that matches the runtime OpenAI is building for.

The longer-term win is broader.

OpenClaw is a multi-model platform. Anthropic, Google, local models, OpenRouter, DeepSeek, Kimi, MiniMax, and custom providers all matter. Codex should not become a special island where only OpenAI models get modern agent ergonomics.

That is why the work is two-way. We use Codex where it is the native fit. Then we bring the good ideas back into OpenClaw's own harness: cleaner tool boundaries, deferred catalogs, structured quiet outcomes, better prompt scoping, and fewer duplicated decisions for the model.

Today, Codex-backed OpenAI models get the most complete version of that experience. Tomorrow, the default OpenClaw harness should make every capable model feel less buried under scaffolding and more like an agent that knows what to do.
