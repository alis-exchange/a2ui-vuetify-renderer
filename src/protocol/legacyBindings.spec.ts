import { describe, expect, it } from 'vitest';
import { findLegacyBindings } from './legacyBindings';

describe('findLegacyBindings', () => {
  it('finds v0.9 bindings and calls anywhere in the properties', () => {
    expect(
      findLegacyBindings({
        text: { path: '/name' },
        checks: [{ condition: { call: 'required', args: { value: { '@path': '/name' } } }, message: 'x' }],
        action: { event: { name: 'go', context: { id: { path: '/id' } } } },
      }),
    ).toEqual(['/text', '/checks/0/condition', '/action/event/context/id']);
  });

  it('ignores v1.0 syntax, literals and ChildList templates', () => {
    expect(
      findLegacyBindings({
        text: { '@path': '/name' },
        value: { '@call': 'formatString', args: { value: 'x' } },
        children: { componentId: 'row', path: '/rows' },
        options: [{ label: 'A', value: 'a' }],
        style: { path: '/not-a-binding', color: 'red' },
      }),
    ).toEqual([]);
  });
});
