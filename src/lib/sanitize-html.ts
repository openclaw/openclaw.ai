/**
 * Strip dangerous HTML from translation strings while preserving safe
 * formatting tags.  Used by localized trust pages that render i18n JSON
 * via Astro set:html.  Prevents XSS if a malicious translation string
 * is introduced through a contributed PR.
 */

const SAFE_TAGS = new Set([
  "strong",
  "em",
  "b",
  "i",
  "code",
  "br",
  "a",
  "p",
  "span",
  "sup",
  "sub",
  "ul",
  "ol",
  "li",
]);

const SAFE_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target"]),
  span: new Set(["class"]),
};

const SAFE_HREF_RE = /^https:\/\//i;
const SAFE_TARGETS = new Set(["_blank", "_self", "_parent", "_top"]);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sanitize an HTML string: keep only allowlisted tags and attributes,
 * escape everything else.
 */
export function sanitizeTrustHtml(raw: string): string {
  // Replace each tag with either its sanitized form or escaped text.
  return raw.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/g, (match, tag, attrStr) => {
    const lower = (tag as string).toLowerCase();
    if (!SAFE_TAGS.has(lower)) {
      return escapeHtml(match);
    }

    // Self-closing or closing tag
    if (match.startsWith("</")) {
      return `</${lower}>`;
    }

    const allowedAttrs = SAFE_ATTRS[lower];
    if (!allowedAttrs || !attrStr?.trim()) {
      const selfClose = match.endsWith("/>") ? " /" : "";
      return `<${lower}${selfClose}>`;
    }

    const attrs: string[] = [];
    let opensNewWindow = false;
    let targetSeen = false;
    const attrRe = /([a-zA-Z][\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
    let m: RegExpExecArray | null;
    while ((m = attrRe.exec(attrStr)) !== null) {
      const name = m[1]!.toLowerCase();
      const value = m[2] ?? m[3] ?? m[4] ?? "";
      if (!allowedAttrs.has(name)) continue;
      if (name === "href" && !SAFE_HREF_RE.test(value)) continue;
      if (name === "target") {
        if (targetSeen) continue;
        const target = value.toLowerCase();
        if (!SAFE_TARGETS.has(target)) continue;
        targetSeen = true;
        opensNewWindow = target === "_blank";
        attrs.push(`${name}="${target}"`);
        continue;
      }
      attrs.push(`${name}="${escapeHtml(value)}"`);
    }
    if (lower === "a" && opensNewWindow) {
      attrs.push('rel="noopener noreferrer"');
    }

    const selfClose = match.endsWith("/>") ? " /" : "";
    const attrPart = attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
    return `<${lower}${attrPart}${selfClose}>`;
  });
}
