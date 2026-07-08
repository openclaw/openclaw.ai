import { describe, expect, test } from 'bun:test';
import { renderFullBleedOgSvg } from './blog-og-full-bleed';

describe('renderFullBleedOgSvg', () => {
  test('renders full-bleed artwork with only the wrapped title', () => {
    const svg = renderFullBleedOgSvg(
      'Introducing the OpenClaw Foundation',
      'data:image/png;base64,cover',
    );

    expect(svg).toContain('width="1200" height="630"');
    expect(svg).toContain('<image x="0" y="0" width="1200" height="630"');
    expect(svg).toContain('preserveAspectRatio="xMidYMid slice"');
    expect(svg).toContain('>Introducing the</text>');
    expect(svg).toContain('>OpenClaw Foundation</text>');
    expect(svg).not.toContain('OPENCLAW BLOG');
    expect(svg).not.toContain('description');
    expect(svg).not.toContain('coverPanel');
  });
});
