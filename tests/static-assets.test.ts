import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function repoPath(relativePath: string): string {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath: string): string {
  return readFileSync(repoPath(relativePath), 'utf8');
}

function readBytes(relativePath: string): Buffer {
  return readFileSync(repoPath(relativePath));
}

describe('static public assets', () => {
  test('keeps legacy root logo aliases byte-for-byte with the canonical logo', () => {
    const canonicalLogo = readBytes('public/openclaw-logo-text-dark.png');

    for (const alias of ['public/granola.png', 'public/logo.png']) {
      const bytes = readBytes(alias);

      expect(bytes.byteLength).toBeGreaterThan(0);
      expect(bytes.equals(canonicalLogo)).toBe(true);
    }
  });

  test('keeps cached X avatar assets available for rendered testimonial pages', () => {
    const avatarDir = repoPath('public/avatars/x');

    expect(existsSync(repoPath('public/avatars/x/steipete.jpg'))).toBe(true);
    expect(existsSync(repoPath('public/avatars/x/wilcosx.jpg'))).toBe(true);
    expect(readdirSync(avatarDir).filter((file) => file.endsWith('.jpg')).length).toBeGreaterThan(
      200,
    );
    expect(statSync(avatarDir).isDirectory()).toBe(true);
  });

  test('keeps Google and X simple-icon integrations wired into the public pages', () => {
    const integrationsPage = readText('src/pages/integrations.astro');
    const homepage = readText('src/pages/index.astro');

    expect(integrationsPage).toContain('siGoogle');
    expect(integrationsPage).toContain('siX');
    expect(homepage).toContain('siGooglechrome');
    expect(homepage).toContain('siX');
  });
});
