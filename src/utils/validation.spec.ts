import { describe, expect, it } from 'vitest';
import { createVuetifyRules } from './validation';

describe('createVuetifyRules', () => {
  it('handles empty checks', () => {
    expect(createVuetifyRules(undefined as any)).toEqual([]);
    expect(createVuetifyRules([])).toEqual([]);
  });

  it('handles required check', () => {
    const rules = createVuetifyRules([{ type: 'required', message: 'Needed' }]);
    expect(rules.length).toBe(1);
    expect(rules[0]('')).toBe('Needed');
    expect(rules[0]('Hello')).toBe(true);
  });

  it('handles shorthand required check', () => {
    const rules = createVuetifyRules(['required']);
    expect(rules[0]('')).toBe('Field is required');
  });

  it('handles regex check', () => {
    const rules = createVuetifyRules([{ type: 'regex', pattern: '^\\d+$', message: 'Numbers only' }]);
    expect(rules[0]('123')).toBe(true);
    expect(rules[0]('abc')).toBe('Numbers only');
  });

  it('handles minLength', () => {
    const rules = createVuetifyRules([{ type: 'minLength', value: 3 }]);
    expect(rules[0]('ab')).toBe('Minimum length is 3');
    expect(rules[0]('abc')).toBe(true);
  });

  it('handles maxLength', () => {
    const rules = createVuetifyRules([{ type: 'maxLength', value: 3 }]);
    expect(rules[0]('abcd')).toBe('Maximum length is 3');
    expect(rules[0]('abc')).toBe(true);
  });

  it('allows function checks directly', () => {
    const customRule = (v: any) => v === 'secret' || 'Wrong secret';
    const rules = createVuetifyRules([customRule]);
    expect(rules[0]('bad')).toBe('Wrong secret');
    expect(rules[0]('secret')).toBe(true);
  });
});
