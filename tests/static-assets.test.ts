import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { channels, companionNodes, featuredProviders, gatewayHosts } from '../src/data/integrations';
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
    const integrationsCatalog = readText('src/data/integrations.ts');
    const homepage = readText('src/pages/index.astro');

    expect(integrationsCatalog).toContain('icon: siIcon(siGoogle)');
    expect(integrationsCatalog).toContain('icon: siIcon(siX)');
    expect(homepage).toContain("{ name: 'Twitter', icon: siIcon(siX)");
    expect(homepage).toContain("{ name: 'Browser', icon: siIcon(siGooglechrome)");
    expect(homepage).toContain("{ name: 'Gmail', icon: siIcon(siGmail)");
  });

  test('keeps the integrations catalog off removed and stale capability claims', () => {
    const integrationsCatalog = readText('src/data/integrations.ts');
    const integrationsPage = readText('src/pages/integrations.astro');
    const homepage = readText('src/pages/index.astro');
    const ecosystemPage = readText('src/pages/ecosystem.astro');

    expect(integrationsCatalog).toContain("{ value: '29', label: 'chat channels' }");
    expect(integrationsCatalog).not.toContain('documented chat channels');
    expect(integrationsCatalog).not.toContain("label: 'Catalog snapshot");
    expect(integrationsCatalog).toContain("{ name: 'OpenAI'");
    expect(integrationsCatalog).not.toContain('currentModelExamples');
    expect(integrationsCatalog).not.toContain('BlueBubbles');
    expect(integrationsCatalog).not.toContain('/providers/glm');
    expect(integrationsPage).not.toContain('50+ integrations');
    // The bundled/official/external taxonomy was removed on purpose
    expect(integrationsCatalog).not.toContain('CatalogStatus');
    expect(integrationsPage).not.toContain('statusLabels');
    expect(integrationsPage).not.toContain('status-badge');
    expect(integrationsPage).not.toContain('Official install');
    expect(integrationsPage).not.toContain('Current catalog examples');
    expect(integrationsPage).not.toContain('model-snapshot');
    expect(integrationsPage).not.toContain('class="eyebrow"');
    expect(integrationsPage).not.toContain('.eyebrow');
    expect(homepage).not.toContain('50+ integrations');
    expect(ecosystemPage).not.toContain('100+ community skills');
  });

  test('animates catalog snapshot values while respecting reduced motion', () => {
    const integrationsPage = readText('src/pages/integrations.astro');

    expect(integrationsPage).toContain('data-count-up={stat.value}');
    expect(integrationsPage).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(integrationsPage).toContain('requestAnimationFrame');
  });

  test('keeps automation links clear of their grid dividers', () => {
    const integrationsPage = readText('src/pages/integrations.astro');

    expect(integrationsPage).toMatch(/\.automation-links li \{[\s\S]*?padding-left: 12px;/);
  });

  test('keeps integration examples on current live destinations', () => {
    const integrationsCatalog = readText('src/data/integrations.ts');

    expect(integrationsCatalog).not.toContain('clawhub.ai/steipete/homeassistant');
    expect(integrationsCatalog).not.toContain('clawhub.ai/steipete/bird');
    expect(integrationsCatalog).not.toContain('clawhub.ai/skills?q=home%20assistant');
    expect(integrationsCatalog).toContain('clawhub.ai/skills?q=home+assistant');
    expect(integrationsCatalog).toContain('clawhub.ai/skills?q=twitter');
    expect(integrationsCatalog).toContain('#byteplus-(international)');
    expect(integrationsCatalog).toContain(
      '#providers-via-models.providers-(custom%2Fbase-url)',
    );
  });

  test('sorts channels alphabetically without a status taxonomy', () => {
    const expectedOrder = [...channels].sort((left, right) =>
      left.name.localeCompare(right.name),
    );

    expect(channels.map((channel) => channel.name)).toEqual(
      expectedOrder.map((channel) => channel.name),
    );
    expect(channels.map((channel) => channel.name)).toContain('Raft');
    expect(channels.some((channel) => 'status' in channel)).toBe(false);
  });

  test('collapses the channel catalog after three responsive rows', () => {
    const integrationsPage = readText('src/pages/integrations.astro');

    expect(integrationsPage).toContain('id="channel-catalog"');
    expect(integrationsPage).toContain('aria-controls="channel-catalog"');
    expect(integrationsPage).toContain('data-channel-expander');
    expect(integrationsPage).toContain('See all channels');
    expect(integrationsPage).toContain('Show fewer channels');
    expect(integrationsPage).toContain('<span class="channel-expander-icon"');
    expect(integrationsPage).toMatch(
      /\.channel-expander:focus-visible \{[\s\S]*?outline: none;[\s\S]*?box-shadow: 0 0 0 1px var\(--cyan-bright\);/,
    );
    expect(integrationsPage).toContain('nth-child(n + 13)');
    expect(integrationsPage).toContain('nth-child(n + 10)');
    expect(integrationsPage).toContain('nth-child(n + 7)');
    expect(integrationsPage).toContain('nth-child(n + 4)');
  });

  test('uses real local or vector brand marks for branded integration cards', () => {
    const semanticChannelIcons = new Set(['IRC', 'Raft', 'Voice Call', 'WebChat']);
    const brandedItems = [
      ...channels.filter((item) => !semanticChannelIcons.has(item.name)),
      ...featuredProviders,
      ...gatewayHosts.filter((item) => item.name === 'Windows'),
      ...companionNodes.filter((item) => item.name === 'Windows Hub'),
    ];

    expect(
      brandedItems.filter((item) => item.icon.startsWith('lucide:') && !item.logo),
    ).toEqual([]);

    for (const item of brandedItems) {
      if (!item.logo) continue;
      expect(item.logo.startsWith('/integrations/logos/')).toBe(true);
      expect(existsSync(repoPath(`public${item.logo}`))).toBe(true);
    }
  });

  test('keeps a local outlet icon for every press entry', () => {
    const press = readJson('src/data/press.json') as Array<{ url: string }>;

    expect(press.length).toBeGreaterThan(0);
    for (const article of press) {
      const host = new URL(article.url).hostname.replace(/^www\./, '');
      expect(existsSync(repoPath(`public/press/icons/${host}.png`))).toBe(true);
    }
  });

  test('keeps integration cards neutral at rest', () => {
    const integrationsPage = readText('src/pages/integrations.astro');

    expect(integrationsPage).not.toContain('.catalog-card::before');
    expect(integrationsPage).not.toContain('border-top: 2px solid var(--accent)');
    expect(integrationsPage).not.toContain('.status-included');
    expect(integrationsPage).not.toContain('.status-official');
    expect(integrationsPage).not.toContain('.status-external');
  });

  test('keeps the integrations hero aligned with the site page-header pattern', () => {
    const integrationsPage = readText('src/pages/integrations.astro');

    expect(integrationsPage).not.toContain('hero-kicker');
    expect(integrationsPage).not.toContain('The OpenClaw ecosystem');
    expect(integrationsPage).toContain('<p class="section-kicker">Works with everything</p>');
    expect(integrationsPage).toContain('<h1 class="hero-title">Integrations</h1>');
    expect(integrationsPage).toMatch(/\.hero \{[\s\S]*?text-align: left;/);
    expect(integrationsPage).not.toMatch(/\.hero-title \{[\s\S]*?background: linear-gradient/);
  });

  test('includes integrations in the shared site navigation', () => {
    const topbar = readText('src/components/SiteTopbar.astro');
    const integrationsPage = readText('src/pages/integrations.astro');

    expect(topbar).toContain("| 'integrations'");
    expect(topbar).toContain("{ href: '/integrations', label: 'Integrations' }");
    expect(topbar).toContain("if (active === 'integrations') return item.href === '/integrations'");
    expect(integrationsPage).toContain("import SiteTopbar from '../components/SiteTopbar.astro'");
    expect(integrationsPage).toContain('<SiteTopbar active="integrations" />');
    expect(integrationsPage).not.toContain('Back to home');
    expect(integrationsPage).not.toContain('.back-link');
  });

  test('uses a compact expandable site navigation on mobile', () => {
    const topbar = readText('src/components/SiteTopbar.astro');

    expect(topbar).toContain("import { FileText, Megaphone } from '@lucide/astro'");
    expect(topbar).toContain('class="site-nav site-nav-desktop"');
    expect(topbar).toContain('<details class="site-menu">');
    expect(topbar).toContain('class="site-menu-toggle"');
    expect(topbar).toContain('class="site-burger"');
    expect(topbar).toContain('aria-label="Toggle main navigation"');
    expect(topbar).toContain('class="site-menu-panel"');
    expect(topbar).toMatch(/@media \(max-width: 720px\) \{[\s\S]*?\.site-nav\.site-nav-desktop \{[\s\S]*?display: none;/);
    expect(topbar).toMatch(/@media \(max-width: 720px\) \{[\s\S]*?\.site-menu \{[\s\S]*?display: block;/);
  });

  test('uses a matching lobster icon and install-focused ClawHub CTA', () => {
    const homePage = readText('src/pages/index.astro');

    expect(homePage).toContain('data-icon="clawhub-lobster"');
    expect(homePage).not.toContain('src="/ecosystem/logos/clawhub.png"');
    expect(homePage).toContain('<span class="cta-sub">Install skills and plugins</span>');
    expect(homePage).not.toContain('<span class="cta-sub">Download skills</span>');
  });

  test('omits the redundant integrations section navigation', () => {
    const integrationsPage = readText('src/pages/integrations.astro');

    expect(integrationsPage).not.toContain('aria-label="Integration categories"');
    expect(integrationsPage).not.toContain('class="catalog-nav"');
    expect(integrationsPage).not.toContain('.catalog-nav');
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
