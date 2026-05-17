const allowedProtocols = new Set(['http:', 'https:', 'mailto:']);

/**
 * Validate that a URL string uses an allowed protocol (http, https, mailto).
 * Returns the URL unchanged when valid, or "#" for dangerous protocols
 * like javascript: or data: that could enable XSS via crafted data files.
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url, 'https://placeholder.invalid');
    return allowedProtocols.has(parsed.protocol) ? url : '#';
  } catch {
    return '#';
  }
}
