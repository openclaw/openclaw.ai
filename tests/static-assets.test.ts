import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAuthorProfile } from '../src/lib/authors';
import { getCachedXAvatarSrc, getInitialsAvatarSrc } from '../src/lib/avatars';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function repoPath(relativePath: string): string {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath: string): string {
  return readFileSync(repoPath(relativePath), 'utf8');
}

function readJson(relativePath: string): unknown {
  return JSON.parse(readText(relativePath));
}

function readBytes(relativePath: string): Buffer {
  return readFileSync(repoPath(relativePath));
}

describe('static public assets', () => {
  test('redirects legacy docs paths to the canonical docs host', () => {
    const config = readJson('vercel.json') as {
      redirects?: Array<{
        source?: string;
        has?: Array<{ type?: string; key?: string; value?: string }>;
        destination?: string;
        statusCode?: number;
      }>;
    };

    expect(config.redirects).toContainEqual({
      source: '/docs',
      has: [{ type: 'header', key: 'host', value: 'openclaw.ai' }],
      destination: 'https://docs.openclaw.ai/',
      statusCode: 308,
    });
    expect(config.redirects).toContainEqual({
      source: '/docs/:path*',
      has: [{ type: 'header', key: 'host', value: 'openclaw.ai' }],
      destination: 'https://docs.openclaw.ai/:path*',
      statusCode: 308,
    });
    expect(config.redirects).toContainEqual({
      source: '/docs/',
      has: [{ type: 'header', key: 'host', value: 'openclaw.ai' }],
      destination: 'https://docs.openclaw.ai/',
      statusCode: 308,
    });
    expect(config.redirects).toContainEqual({
      source: '/docs/:path*/',
      has: [{ type: 'header', key: 'host', value: 'openclaw.ai' }],
      destination: 'https://docs.openclaw.ai/:path*/',
      statusCode: 308,
    });
  });

  test('keeps legacy root logo aliases byte-for-byte with the canonical PNG logo', () => {
    const canonicalLogo = readBytes('public/openclaw-logo-text-dark.png');
    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

    expect(canonicalLogo.subarray(0, pngSignature.length).equals(pngSignature)).toBe(true);

    for (const alias of ['public/granola.png', 'public/logo.png']) {
      const bytes = readBytes(alias);

      expect(bytes.byteLength).toBeGreaterThan(0);
      expect(bytes.subarray(0, pngSignature.length).equals(pngSignature)).toBe(true);
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

  test('keeps X avatar lookup on local cached assets before falling back', () => {
    expect(getCachedXAvatarSrc('@steipete')).toBe('/avatars/x/steipete.jpg');
    expect(resolveAuthorProfile({ name: 'Josh Avant' }).avatar).toBe('/avatars/x/joshavant.jpg');
    expect(getCachedXAvatarSrc('not-a-cached-profile', 'Missing Profile')).toBe(
      getInitialsAvatarSrc('Missing Profile'),
    );
  });

  test('keeps Google and X simple-icon assets wired into public pages', () => {
    const integrationsPage = readText('src/pages/integrations.astro');
    const homepage = readText('src/pages/index.astro');

    expect(integrationsPage).toContain("{ name: 'Google', icon: siIcon(siGoogle)");
    expect(integrationsPage).toContain("{ name: 'xAI', icon: siIcon(siX)");
    expect(integrationsPage).toContain("{ name: 'Twitter/X', icon: siIcon(siX)");
    expect(homepage).toContain("{ name: 'Twitter', icon: siIcon(siX)");
    expect(homepage).toContain("{ name: 'Browser', icon: siIcon(siGooglechrome)");
    expect(homepage).toContain("{ name: 'Gmail', icon: siIcon(siGmail)");
  });

  test('keeps Vercel security headers aligned with static site resource origins', () => {
    const config = readJson('vercel.json') as {
      headers?: Array<{
        source?: string;
        headers?: Array<{ key?: string; value?: string }>;
      }>;
    };
    const globalHeaders = config.headers?.find((entry) => entry.source === '/(.*)')?.headers ?? [];
    const headerMap = new Map(globalHeaders.map((header) => [header.key, header.value]));
    const csp = headerMap.get('Content-Security-Policy') ?? '';

    expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headerMap.get('X-Frame-Options')).toBe('DENY');
    expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headerMap.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');

    for (const requiredDirective of [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
      "font-src 'self' https://cdn.fontshare.com",
      "img-src 'self' data: https://ui-avatars.com https://pbs.twimg.com",
      "connect-src 'self' https://vitals.vercel-analytics.com",
      "frame-ancestors 'none'",
      "form-action 'self' https://buttondown.com",
      "base-uri 'self'",
    ]) {
      expect(csp).toContain(requiredDirective);
    }
  });
});
