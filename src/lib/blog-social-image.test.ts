import { describe, expect, test } from 'bun:test';
import { resolveBlogSocialImage } from './blog-social-image';

describe('resolveBlogSocialImage', () => {
  test('returns explicit image metadata unchanged', () => {
    const image = {
      src: '/blog/example/social.png',
      width: 1600,
      height: 900,
      type: 'image/png' as const,
    };

    expect(resolveBlogSocialImage('example', image)).toEqual(image);
  });

  test('falls back to the generated 1200x630 PNG', () => {
    expect(resolveBlogSocialImage('example')).toEqual({
      src: '/og/blog/example.png',
      width: 1200,
      height: 630,
      type: 'image/png',
    });
  });
});
