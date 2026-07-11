import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { load } from 'js-yaml';

const blogDir = new URL('../src/content/blog/', import.meta.url);

describe('js-yaml compatibility', () => {
  test('parses every blog frontmatter document used by the avatar cache', () => {
    const parsed = readdirSync(blogDir)
      .filter((file) => file.endsWith('.md'))
      .map((file) => {
        const source = readFileSync(new URL(file, blogDir), 'utf8');
        const frontmatter = /^---\n([\s\S]*?)\n---/.exec(source)?.[1];
        expect(frontmatter).toBeDefined();
        return load(frontmatter!) as Record<string, unknown>;
      });

    expect(parsed.every((entry) => entry && typeof entry === 'object')).toBe(true);
    expect(parsed.some((entry) => Array.isArray(entry.authors))).toBe(true);
  });
});
