function escapeSvg(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapTitle(value: string): string[] {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= 22 || !current) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines.slice(0, 2);
}

export function renderFullBleedOgSvg(title: string, coverDataUri: string): string {
  const titleLines = wrapTitle(title);
  const titleText = titleLines
    .map(
      (line, index) =>
        `<text x="72" y="${112 + index * 78}" class="title">${escapeSvg(line)}</text>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="titleVignette" x1="0" y1="0" x2="0.72" y2="0.72">
      <stop offset="0%" stop-color="#02040a" stop-opacity="0.88"/>
      <stop offset="48%" stop-color="#02040a" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#02040a" stop-opacity="0"/>
    </linearGradient>
    <style>
      .title { fill: #f7f4ee; font: 700 68px Arial, sans-serif; letter-spacing: -1px; }
    </style>
  </defs>
  <image x="0" y="0" width="1200" height="630" href="${coverDataUri}" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1200" height="630" fill="url(#titleVignette)"/>
  ${titleText}
</svg>`;
}
