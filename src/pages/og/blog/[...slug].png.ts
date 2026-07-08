import { getPublishedBlogPosts, type BlogPost } from '../../../lib/blog';
import { renderFullBleedOgSvg } from '../../../lib/blog-og-full-bleed';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

export async function getStaticPaths() {
  const posts = await getPublishedBlogPosts();

  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

function escapeSvg(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapText(value: string, maxChars: number, maxLines: number): string[] {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?-]+$/, '')}...`;
  }

  return lines;
}

function textLines(lines: string[], x: number, y: number, lineHeight: number, className: string): string {
  return lines
    .map((line, index) => `<text x="${x}" y="${y + index * lineHeight}" class="${className}">${escapeSvg(line)}</text>`)
    .join('');
}

async function getPublicImageDataUri(src: string | undefined): Promise<string | null> {
  if (!src?.startsWith('/')) return null;

  try {
    const filePath = join(process.cwd(), 'public', src);
    const image = await readFile(filePath);
    const metadata = await sharp(image).metadata();
    const mimeType = metadata.format === 'jpg' ? 'jpeg' : metadata.format;
    if (!mimeType) return null;
    return `data:image/${mimeType};base64,${image.toString('base64')}`;
  } catch {
    return null;
  }
}

function renderOgSvg(post: BlogPost, coverDataUri: string | null): string {
  const hasCover = Boolean(coverDataUri);
  const titleLines = wrapText(post.data.title, hasCover ? 16 : 28, hasCover ? 5 : 3);
  const descriptionLines = wrapText(post.data.description, hasCover ? 40 : 60, hasCover ? 2 : 2);

  const coverPanel = coverDataUri
    ? `<rect x="650" y="208" width="442" height="232" rx="22" fill="#02040a" stroke="#263249"/>
  <image x="650" y="208" width="442" height="232" href="${coverDataUri}" preserveAspectRatio="xMidYMid slice" clip-path="url(#coverClip)"/>
  <rect x="650" y="208" width="442" height="232" rx="22" fill="none" stroke="#33415f"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#050810"/>
      <stop offset="52%" stop-color="#0a0f1a"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <radialGradient id="coral" cx="16%" cy="14%" r="72%">
      <stop offset="0%" stop-color="#ff4d4d" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#ff4d4d" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cyan" cx="78%" cy="70%" r="64%">
      <stop offset="0%" stop-color="#00e5cc" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#00e5cc" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="coverClip">
      <rect x="650" y="208" width="442" height="232" rx="22"/>
    </clipPath>
    <style>
      .eyebrow { fill: #ff6b6b; font: 700 28px Arial, sans-serif; letter-spacing: 6px; }
      .title { fill: #f0f4ff; font: 700 ${hasCover ? 48 : 68}px Arial, sans-serif; }
      .description { fill: #a9b4d0; font: 400 28px Arial, sans-serif; }
    </style>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#coral)"/>
  <rect width="1200" height="630" fill="url(#cyan)"/>
  <circle cx="88" cy="86" r="6" fill="#ff4d4d" opacity="0.9"/>
  <circle cx="1020" cy="132" r="4" fill="#00e5cc" opacity="0.6"/>
  <circle cx="990" cy="520" r="5" fill="#f0f4ff" opacity="0.42"/>
  <circle cx="214" cy="522" r="3" fill="#f0f4ff" opacity="0.32"/>
  <rect x="58" y="56" width="1084" height="518" rx="32" fill="#0a0f1a" opacity="0.84" stroke="#263249"/>
  <text x="96" y="128" class="eyebrow">OPENCLAW BLOG</text>
  ${textLines(titleLines, 96, hasCover ? 190 : 230, hasCover ? 54 : 78, 'title')}
  ${textLines(descriptionLines, 96, hasCover ? 498 : 472, 38, 'description')}
  ${coverPanel}
</svg>`;
}

export async function GET({ props }: { props: { post: BlogPost } }) {
  const coverDataUri = await getPublicImageDataUri(props.post.data.coverImage ?? props.post.data.image);
  const svg =
    props.post.data.ogLayout === 'full-bleed' && coverDataUri
      ? renderFullBleedOgSvg(props.post.data.title, coverDataUri)
      : renderOgSvg(props.post, coverDataUri);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
