export function serializeJsonLd(value: Record<string, unknown>): string {
  // Script contents are HTML raw text: removing every tag opener prevents an
  // embedded </script> from ending the element while preserving JSON.parse.
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
