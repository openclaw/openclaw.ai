---
title: "OpenClaw Collaborates with NVIDIA for Improved Skill Security"
description: "Every ClawHub skill now ships with a Skill Card documenting what the skill does and where it came from, and is scanned by SkillSpector for hidden instructions and other agentic risks"
date: 2026-05-27
author: "Patrick Erichsen"
authorHandle: "pat_erichsen"
authorAvatar: "/blog/authors/patrick-erichsen.jpg"
draft: false
tags: ["security", "announcement", "nvidia", "clawhub", "skills"]
image: "/blog/openclaw-nvidia.svg"
---

Every ClawHub skill now ships with a [Skill Card](https://github.com/NVIDIA/Trustworthy-AI/blob/main/Skill%20Card.md) documenting what the skill does and where it came from, and is scanned by [SkillSpector](https://github.com/nvidia/skillspector) for hidden instructions and other agentic risks

ClawHub has a reputation for being insecure.

When we launched, we were immediately targeted by malicious actors who published skills bundling known malware. We quickly [partnered with VirusTotal](https://openclaw.ai/blog/virustotal-partnership) to flag those skills and automatically ban the publishers.

While traditional malware scanning like this is a relatively solved problem, identifying *agentic risk* is not. A malicious skill can claim to summarize your logs while bundling a script that ships them off your machine. A well-meaning skill can point your agent at a CLI that wipes production on the wrong flag.

To mitigate these risks, before installing a skill, you should know three things up front: what it claims to do, whether the bundled code actually matches those claims, and what the blast radius looks like if something goes wrong.

Our initial attempt at providing this information to our users was to prompt a Codex agent to look for [OWASP Agentic Risks](https://owasp.org/www-project-agentic-skills-top-10/). It works well, and we've caught a number of bad actors with it. But it was a closed-source effort, and the agentic risk problem is too new and too fast-moving for any one registry to defend on its own.

We're excited to instead be collaborating with NVIDIA on its [verified agent skills initiative](https://developer.nvidia.com/blog/nvidia-verified-agent-skills-provide-capability-governance-for-ai-agents/), doing this work in the open so the entire skill community can benefit.

Skill Cards are how we make it clear what a skill actually does, and SkillSpector is how we surface agentic risk and catch the bad actors that slip past traditional malware scanning.

## **The ClawScan skill pipeline**

Before diving into the new tools, it’s helpful to have a mental model of what the full security scan pipeline looks like on ClawHub.

When a new skill version is published, a Codex agent running on [BlackSmith](https://www.blacksmith.sh/) receives the output of our static analysis, VirusTotal, and SkillSpector scans as context. It then produces a final verdict (Clean, Review, Warn, Malicious), and a bundled Skill Card.

![][image1]

## **Skill Cards and SkillSpector collaboration**

**Skill Cards**, NVIDIA's open trust-artifact spec, now ship with every skill version. Each card tells you the things you actually need to know before installing a skill: who published it, what it can do, what ClawScan found, and where exactly it came from. All of it is verified by ClawHub rather than taken from the publisher's self-description. You can read the card in a tab on the skill detail page or view it from the terminal with `openclaw skills verify <slug> --card`.

![][image2]

**SkillSpector** is a new NVIDIA project that we're collaborating on to improve agent-skill scanning. It combines static checks and LLM-assisted semantic analysis to flag potential risks such as hidden instructions, risky code paths, overbroad capabilities, dependency issues, and mismatch between declared purpose and actual behavior. In ClawHub, those findings are advisory: a SkillSpector finding does not automatically block a skill. ClawScan weighs it alongside static analysis, VirusTotal, provenance, metadata, and moderation context before making the final registry verdict. The security audit surfaces those findings so users can see which signals informed the final verdict.

![][image3]

## **Open-sourcing our security scan signals**

As one of the most popular skill registries, we are now running the full ClawScan suite on thousands of publish events every single day. This is generating a huge amount of signal that would be invaluable to the security research community, but until now has been locked away inside ClawHub.

We’re excited to announce that as part of our commitment to securing the entire agent skill ecosystem, we’ve open-sourced a HuggingFace dataset of all security scan outcomes on ClawHub: [OpenClaw/clawhub-security-signals](https://huggingface.co/datasets/OpenClaw/clawhub-security-signals-private).

Our hope is that this empowers the broader research community to join us in improving the state of the art in skill security tooling.

A rising tide lifts all claws. 🦞

[image1]: /blog/openclaw-nvidia-skill-security/clawscan-trust-pipeline.png
[image2]: /blog/openclaw-nvidia-skill-security/skill-card.png
[image3]: /blog/openclaw-nvidia-skill-security/skill-spector.png
