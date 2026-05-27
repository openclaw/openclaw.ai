---
title: "OpenClaw Collaborates with NVIDIA for Improved Skill Security"
description: "ClawHub skills are now analyzed by NVIDIA's SkillSpector, and include a Skill Card for actionable trust metadata."
date: 2026-05-27
author: "Patrick Erichsen"
authorHandle: "pat_erichsen"
authorAvatar: "/blog/authors/patrick-erichsen.jpg"
draft: false
tags: ["security", "announcement", "nvidia", "clawhub", "skills"]
image: "/blog/openclaw-nvidia.svg"
---

In collaboration with NVIDIA's [verified agent skills](https://developer.nvidia.com/blog/nvidia-verified-agent-skills-provide-capability-governance-for-ai-agents/) initiative, ClawHub now ships with two new security capabilities: agentic-risk scanning via [SkillSpector](https://github.com/nvidia/skillspector), and a machine-readable [Skill Card](https://github.com/NVIDIA/Trustworthy-AI/blob/main/Skill%20Card.md) for every skill version.

Agent skills are uniquely tricky to vet. They can look harmless while still containing hidden instructions, overbroad permissions, dangerous code patterns, or behavior that doesn't match the declared purpose. ClawHub defends against this from two angles: SkillSpector flags agentic risks at scan time, and Skill Cards make trust legible to humans and machines.

## **SkillSpector and Skill Cards**

**SkillSpector** is now the source of our agentic-risk findings. It's NVIDIA's open-source security scanner for AI agent skills, combining static checks and LLM-assisted semantic analysis to flag potential risks such as hidden instructions, risky code paths, overbroad capabilities, dependency issues, and mismatch between declared purpose and actual behavior.. Every skill submitted to ClawHub now passes through SkillSpector, and the security audit on each skill surfaces any findings.

![][image1]

**Skill Cards**, NVIDIA's open trust-artifact spec, now ship with every skill version. Each card tells you the things you actually need to know before installing a skill: who published it, what it can do, what our scans found, and where exactly it came from. All of it is verified by ClawHub rather than taken from publisher self-description. You can read the card in a tab on the skill detail page or view it from the terminal with `openclaw skills verify <slug> --card`.

![][image2]

## **How ClawHub Scans Skills**

When a skill version is published, ClawHub scans the complete package with static analysis, VirusTotal, and NVIDIA SkillSpector. Codex workers running on Blacksmith then combine those signals into a final verdict and also produce a verified Skill Card.

![][image3]

## **Strengthening the publisher layer**

Skill security doesn't stop at scan time. A trusted registry also needs to know about the humans publishing skills, and respond when patterns of abuse emerge. To that end, we’ve recently shipped additional security work:

* **Improved spam and abuse moderation.** We've developed an enhanced moderation algorithm to catch coordinated low-effort publishing and spammy bursts.
* **Official publisher badges.** ClawHub now displays an Official badge on select publishers across the UI, API, and CLI install metadata. Look for it when deciding what to install.

## **Opening up our security signals**

Building ClawHub in the open includes the security work behind it. The scan verdicts, SkillSpector findings, and moderation outputs our pipeline generates are being prepared as a community dataset at [`OpenClaw/clawhub-security-signals`](https://huggingface.co/datasets/OpenClaw/clawhub-security-signals-private) on Hugging Face.

The agent skill ecosystem is too new and too fast-moving for any one company to be defending in private. Our goal is for ClawHub to be the most secure registry for agent skills, and the way that happens is by engaging directly with the research community to help us improve.

To the best of our knowledge, this is the most extensive set publicly available skill scanner outcomes published to date.

## **What's next**

Building trust in the emerging skill ecosystem is an industry-wide problem, and we’re excited to continue our collaboration with NVIDIA to develop best practices in the space around scan evidence, skill cards, provenance and verification.

The lobster grows stronger. 🦞

[image1]: /blog/openclaw-nvidia-skill-security/skill-spector.png
[image2]: /blog/openclaw-nvidia-skill-security/skill-card.png
[image3]: /blog/openclaw-nvidia-skill-security/clawscan-trust-pipeline.png
