import { describe, expect, test } from 'bun:test';
import { sanitizeUrl } from '../src/lib/sanitize-url';

describe('sanitizeUrl', () => {
  test('keeps allowed absolute and relative URLs unchanged', () => {
    expect(sanitizeUrl('https://x.com/openclaw')).toBe('https://x.com/openclaw');
    expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path');
    expect(sanitizeUrl('mailto:security@openclaw.ai')).toBe('mailto:security@openclaw.ai');
    expect(sanitizeUrl('/blog#security')).toBe('/blog#security');
  });

  test('blocks dangerous protocols', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('#');
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#');
    expect(sanitizeUrl('ftp://example.com/file')).toBe('#');
  });

  test('blocks encoded and control-character protocol bypasses', () => {
    expect(sanitizeUrl('%6a%61%76%61%73%63%72%69%70%74:alert(1)')).toBe('#');
    expect(sanitizeUrl('java\u0000script:alert(1)')).toBe('#');
    expect(sanitizeUrl('java\nscript:alert(1)')).toBe('#');
  });

  test('blocks unparsable input', () => {
    expect(sanitizeUrl('http://[::1')).toBe('#');
    expect(sanitizeUrl('javascript:%E0%A4%A')).toBe('#');
  });
});
