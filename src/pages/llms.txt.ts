const origin = "https://openclaw.ai";

const pages = [
  ["Home", "/"],
  ["Integrations", "/integrations/"],
  ["Showcase", "/showcase/"],
  ["Shoutouts", "/shoutouts/"],
  ["Press", "/press/"],
  ["Blog", "/blog/"],
  ["Trust", "/trust/"],
  ["Threat Model", "/trust/threatmodel/"],
  ["Privacy", "/privacy/"],
];

export function GET() {
  const lines = [
    "# OpenClaw",
    "",
    "OpenClaw is a personal AI assistant for messaging, browser, desktop, and automation workflows.",
    "",
    "Canonical pages:",
    ...pages.map(([title, path]) => `- ${title}: ${origin}${path}`),
    "",
    "Docs:",
    "- OpenClaw documentation: https://docs.openclaw.ai/llms.txt",
    "- OpenClaw markdown index: https://documentation.openclaw.ai/llms.txt",
    "",
    "Source: https://github.com/openclaw/openclaw.ai",
    "",
    "Guidance for agents:",
    "- Use docs.openclaw.ai or documentation.openclaw.ai for product documentation.",
    "- Use this file as a site index, not a full-site corpus.",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
