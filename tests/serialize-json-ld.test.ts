import { describe, expect, test } from 'bun:test';
import { serializeJsonLd } from '../src/lib/serialize-json-ld';

const breakoutPayloads = [
  '</script><script id="breakout">alert(1)</script>',
  '</ScRiPt><script>alert(1)</script>',
  '</script\n><script>alert(1)</script>',
  '<!--</script><script>alert(1)</script>-->',
  '<script><!--</script><img src=x onerror=alert(1)>',
  '<\\/script></script>',
  'plain text & > text — 日本語',
];

describe('serializeJsonLd', () => {
  test.each(breakoutPayloads)('keeps script-breakout payload parseable: %s', (payload) => {
    const value = { nested: { payload }, list: [payload, { payload }] };
    const serialized = serializeJsonLd(value);

    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual(value);
  });

  test('emits a literal JSON Unicode escape instead of decoding it to a less-than sign', () => {
    expect(serializeJsonLd({ value: '<' })).toBe('{"value":"\\u003c"}');
  });

  test('round-trips deterministic property payloads without raw tag openers', () => {
    let state = 0x5eed1234;
    const alphabet = '</script>ScRiPt!&—日本語\\u003c\n\t"';

    for (let sample = 0; sample < 512; sample += 1) {
      let payload = '';
      for (let index = 0; index < 96; index += 1) {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        payload += alphabet[Math.abs(state) % alphabet.length];
      }

      const value = { sample, payload, nested: [{ payload }] };
      const serialized = serializeJsonLd(value);
      expect(serialized).not.toContain('<');
      expect(JSON.parse(serialized)).toEqual(value);
    }
  });
});
