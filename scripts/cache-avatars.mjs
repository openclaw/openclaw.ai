#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const avatarDir = path.join(root, 'public', 'avatars', 'x');
const args = new Set(process.argv.slice(2));
const refresh = args.has('--refresh');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : Number.POSITIVE_INFINITY;
const unavatarToken = process.env.UNAVATAR_TOKEN;
const dataFiles = [
  'src/data/testimonials.json',
  'src/data/testimonials-extra.json',
  'src/data/showcase.json',
];
const blogDir = path.join(root, 'src', 'content', 'blog');

function normalizeHandle(handle) {
  const normalized = String(handle ?? '').replace(/^@/, '').trim().toLowerCase();
  return /^[a-z0-9_]{1,15}$/.test(normalized) ? normalized : '';
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
}

async function collectBlogHandles(handles) {
  const entries = await fs.readdir(blogDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

    const content = await fs.readFile(path.join(blogDir, entry.name), 'utf8');
    const match = /^---\n([\s\S]*?)\n---/.exec(content);
    if (!match) continue;

    const frontmatter = yaml.load(match[1]) ?? {};
    if (frontmatter.authorHandle) handles.add(normalizeHandle(frontmatter.authorHandle));
    for (const author of frontmatter.authors ?? []) {
      if (author?.handle && !author.avatar) handles.add(normalizeHandle(author.handle));
    }
  }
}

async function collectHandles() {
  const handles = new Set();

  for (const file of dataFiles) {
    const entries = await readJson(file);
    for (const entry of entries) {
      if (!entry.avatar && entry.author) handles.add(normalizeHandle(entry.author));
    }
  }

  await collectBlogHandles(handles);
  handles.delete('');
  return [...handles].sort((a, b) => a.localeCompare(b));
}

async function fetchAvatar(handle) {
  const url = new URL(`https://unavatar.io/x/${encodeURIComponent(handle)}`);
  if (unavatarToken) url.searchParams.set('token', unavatarToken);

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) {
      const error = new Error(`${response.status} ${response.statusText}`);
      error.rateLimited = true;
      throw error;
    }
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`unexpected content-type: ${contentType || 'missing'}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return sharp(buffer)
    .resize(400, 400, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function main() {
  await fs.mkdir(avatarDir, { recursive: true });
  const handles = await collectHandles();
  let fetched = 0;
  let cached = 0;
  let failed = 0;

  for (const handle of handles) {
    if (fetched >= limit) break;

    const destination = path.join(avatarDir, `${handle}.jpg`);
    if (!refresh) {
      try {
        await fs.access(destination);
        cached += 1;
        continue;
      } catch {}
    }

    try {
      const buffer = await fetchAvatar(handle);
      await fs.writeFile(destination, buffer);
      fetched += 1;
      console.log(`fetched: ${handle}`);
    } catch (error) {
      failed += 1;
      console.warn(`failed: ${handle}: ${error.message}`);
      if (error.rateLimited) break;
    }
  }

  console.log(`avatars: handles=${handles.length} fetched=${fetched} cached=${cached} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
