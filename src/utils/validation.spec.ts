import { describe, expect, it, vi } from 'vitest';
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

describe('createVuetifyRules with protocol CheckRule shape', () => {
  it('fails with the message when a literal condition is false', () => {
    const rules = createVuetifyRules([{ condition: false, message: 'nope' }]);
    expect(rules.length).toBe(1);
    expect(rules[0]('anything')).toBe('nope');
  });

  it('passes when a literal condition is true', () => {
    const rules = createVuetifyRules([{ condition: true, message: 'nope' }]);
    expect(rules[0]('anything')).toBe(true);
  });

  it('falls back to a generic message', () => {
    const rules = createVuetifyRules([{ condition: false }]);
    expect(rules[0]('anything')).toBe('Invalid value');
  });

  it('resolves a data-binding condition through the resolver', () => {
    const resolveValue = vi.fn().mockReturnValue(false);
    const rules = createVuetifyRules([{ condition: { path: '/ok' }, message: 'nope' }], resolveValue);
    expect(rules[0]('x')).toBe('nope');
    expect(resolveValue).toHaveBeenCalledWith({ path: '/ok' });

    resolveValue.mockReturnValue(true);
    expect(rules[0]('x')).toBe(true);
  });

  it('treats an unresolved (undefined) binding as failing', () => {
    const resolveValue = vi.fn().mockReturnValue(undefined);
    const rules = createVuetifyRules([{ condition: { path: '/missing' }, message: 'nope' }], resolveValue);
    expect(rules[0]('x')).toBe('nope');
  });

  it('resolves a function-call condition through the resolver', () => {
    const condition = { call: 'required', args: { value: { path: '/name' } } };
    const resolveValue = vi.fn().mockReturnValue(true);
    const rules = createVuetifyRules([{ condition, message: 'Name is required' }], resolveValue);
    expect(rules[0]('x')).toBe(true);
    expect(resolveValue).toHaveBeenCalledWith(condition);
  });

  it('never blocks the input when the resolver throws', () => {
    const resolveValue = vi.fn(() => {
      throw new Error('boom');
    });
    const rules = createVuetifyRules([{ condition: { path: '/ok' }, message: 'nope' }], resolveValue);
    expect(rules[0]('x')).toBe(true);
  });

  it('never blocks the input when no resolver is available for a dynamic condition', () => {
    const rules = createVuetifyRules([{ condition: { path: '/ok' }, message: 'nope' }]);
    expect(rules[0]('x')).toBe(true);
  });

  it('keeps legacy shapes working alongside protocol rules', () => {
    const rules = createVuetifyRules([{ type: 'required' }, { condition: false, message: 'x' }], vi.fn());
    expect(rules.length).toBe(2);
    expect(rules[0]('')).toBe('Field is required');
    expect(rules[1]('')).toBe('x');
  });
});
