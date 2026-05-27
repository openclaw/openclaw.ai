---
title: "OpenClaw Collaborates with NVIDIA for Improved Skill Security"
description: "ClawHub skills now ship with Skill Cards, while NVIDIA's new SkillSpector project adds advisory agentic-risk signals to ClawScan."
date: 2026-05-27
author: "Patrick Erichsen"
authorHandle: "pat_erichsen"
authorAvatar: "/blog/authors/patrick-erichsen.jpg"
draft: false
tags: ["security", "announcement", "nvidia", "clawhub", "skills"]
image: "/blog/openclaw-nvidia.svg"
---

ClawHub skills now ship with [Skill Cards](https://github.com/NVIDIA/Trustworthy-AI/blob/main/Skill%20Card.md): machine-readable trust artifacts that capture the publisher, package, capabilities, scan results, and provenance for each skill version.

We're also collaborating with NVIDIA on [SkillSpector](https://github.com/nvidia/skillspector), a new project from its [verified agent skills](https://developer.nvidia.com/blog/nvidia-verified-agent-skills-provide-capability-governance-for-ai-agents/) work for identifying agentic risk in AI agent skills. In ClawHub, SkillSpector findings are advisory inputs to our custom ClawScan analysis, not the final verdict.

Agent skills are uniquely tricky to vet. They can look harmless while still containing hidden instructions, overbroad permissions, dangerous code patterns, or behavior that doesn't match the declared purpose. Skill Cards make trust evidence legible to humans and machines, and SkillSpector adds a specialized agentic-risk lens that helps us jointly improve skill scanning security without replacing ClawScan's final decision.

## **Skill Cards and SkillSpector collaboration**

**Skill Cards**, NVIDIA's open trust-artifact spec, now ship with every skill version. Each card tells you the things you actually need to know before installing a skill: who published it, what it can do, what ClawScan found, and where exactly it came from. All of it is verified by ClawHub rather than taken from publisher self-description. You can read the card in a tab on the skill detail page or view it from the terminal with `openclaw skills verify <slug> --card`.

![][image1]

**SkillSpector** is a new NVIDIA project that we're collaborating on to improve agent-skill scanning. It combines static checks and LLM-assisted semantic analysis to flag potential risks such as hidden instructions, risky code paths, overbroad capabilities, dependency issues, and mismatch between declared purpose and actual behavior. In ClawHub, those findings are advisory: a SkillSpector finding does not automatically block a skill. ClawScan weighs it alongside static analysis, VirusTotal, provenance, metadata, and moderation context before making the final registry verdict. The security audit surfaces those findings so users can see which signals informed the final verdict.

![][image2]

## **How ClawHub Scans Skills**

When a skill version is published, ClawScan runs custom analysis over the complete package. It combines static analysis, VirusTotal, advisory NVIDIA SkillSpector findings, provenance, metadata, and Codex-on-Blacksmith review into a final verdict, then produces a verified Skill Card for the version users can install.

![][image3]

## **Strengthening the publisher layer**

Skill security doesn't stop at scan time. A trusted registry also needs to know about the humans publishing skills, and respond when patterns of abuse emerge. To that end, we’ve recently shipped additional security work:

* **Improved spam and abuse moderation.** We've developed an enhanced moderation algorithm to catch coordinated low-effort publishing and spammy bursts.
* **Official publisher badges.** ClawHub now displays an Official badge on select publishers across the UI, API, and CLI install metadata. Look for it when deciding what to install.

## **Opening up our security signals**

Building ClawHub in the open includes the security work behind it. The Skill Cards, ClawScan verdicts, advisory SkillSpector findings, and moderation outputs our pipeline generates are being prepared as a community dataset at [`OpenClaw/clawhub-security-signals`](https://huggingface.co/datasets/OpenClaw/clawhub-security-signals-private) on Hugging Face.

The agent skill ecosystem is too new and too fast-moving for any one company to be defending in private. Our goal is for ClawHub to be the most secure registry for agent skills, and the way that happens is by engaging directly with the research community to help us improve.

## **What's next**

Building trust in the emerging skill ecosystem is an industry-wide problem, and we’re excited to continue collaborating with NVIDIA on Skill Cards, scan evidence, provenance, verification, and the future of agent-skill scanning.

The lobster grows stronger. 🦞

[image1]: /blog/openclaw-nvidia-skill-security/skill-card.png
[image2]: /blog/openclaw-nvidia-skill-security/skill-spector.png
[image3]: /blog/openclaw-nvidia-skill-security/clawscan-trust-pipeline.png
