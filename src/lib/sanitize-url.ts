const allowedProtocols = new Set(['http:', 'https:', 'mailto:']);

function normalizeForProtocolCheck(url: string): string {
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    // Malformed escapes still flow through URL parsing below.
  }

  return decoded.replace(/[\x00-\x1f\x7f]/g, '');
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(normalizeForProtocolCheck(url), 'https://openclaw.ai');
    return allowedProtocols.has(parsed.protocol) ? url : '#';
  } catch {
    return '#';
  }
}
