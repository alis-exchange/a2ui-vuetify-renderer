import { describe, expect, it } from 'vitest';
import { safeMediaUrl } from './mediaUrl';

describe('safeMediaUrl', () => {
  it.each([
    ['https://example.com/a.png', 'https://example.com/a.png'],
    ['HTTP://Example.com/a.png', 'http://example.com/a.png'],
    ['data:image/png;base64,AAAA', 'data:image/png;base64,AAAA'],
    ['/img/a.png', '/img/a.png'],
    ['img/a.png', 'img/a.png'],
    ['../a.png?x=1', '../a.png?x=1'],
  ])('allows %s', (input, expected) => {
    expect(safeMediaUrl(input)).toBe(expected);
  });

  it.each(['javascript:alert(1)', 'java\tscript:alert(1)', ' JavaScript:alert(1)', 'file:///etc/passwd', 'blob:https://example.com/x', 'ftp://example.com/a.png', '//evil.example/a.png', '/\\evil.example/a.png', 'https://', '', '   '])(
    'rejects %j',
    (input) => {
      expect(safeMediaUrl(input)).toBeUndefined();
    },
  );

  it('rejects non-strings', () => {
    expect(safeMediaUrl(undefined)).toBeUndefined();
    expect(safeMediaUrl({ path: '/x' })).toBeUndefined();
  });
});
