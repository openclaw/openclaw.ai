# Vision

`openclaw.ai` is the canonical public front door for OpenClaw. It should help a new user understand the project, start safely, and find the canonical docs, downloads, community, and ecosystem without overstating what the product supports.

## Priorities

1. Keep install, download, docs, and community paths accurate and working.
2. Explain OpenClaw quickly through a focused landing page, concrete examples, and honest technical context.
3. Curate integrations and ecosystem projects without presenting third-party work as core functionality.
4. Preserve a fast, accessible static site and its established visual language.

## Product Boundaries

- Documentation belongs on `docs.openclaw.ai`; this site should summarize and route to the canonical page.
- Hosted installer scripts must stay aligned with their canonical OpenClaw sources and retain built and live-path proof.
- Capability, compatibility, security, and release claims must be current, specific, and evidence-backed.
- Broad redesigns, rebrands, navigation changes, information-architecture changes, and editorial campaigns require maintainer direction before implementation.
- Community examples and testimonials are curated proof of real use, not a completeness or support guarantee.
- Bun is the package manager for this website repository. That does not make Bun a supported OpenClaw runtime or product recommendation.

## Decision Principles

- Prefer a clearer first-run path over more homepage surface area.
- Prefer canonical links and local, tested assets over duplicated or fragile content.
- Prefer focused, reversible improvements over speculative features or framework churn.
- Treat broken install paths, stale claims, missing assets, accessibility regressions, and unsafe links as correctness bugs.
- Require production builds and the closest real deployed-path proof for user-visible changes.

Contribution scope and mechanics live in [CONTRIBUTING.md](./CONTRIBUTING.md).
