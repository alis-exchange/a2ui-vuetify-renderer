import { scrapeSchemaBehavior } from '@a2ui/web_core/v0_9';
import { describe, expect, it } from 'vitest';
import { VUETIFY_COMPONENTS_V1 } from '../catalog/vuetify-components';
import { findLegacyBindings, type SchemaBehavior } from './legacyBindings';

const behaviorOf = (type: string) => scrapeSchemaBehavior(VUETIFY_COMPONENTS_V1.find((api) => api.name === type)!.schema) as SchemaBehavior;

describe('findLegacyBindings', () => {
  it('finds v0.9 bindings and calls in binding slots', () => {
    expect(
      findLegacyBindings(
        {
          label: { path: '/label' },
          value: { '@call': 'formatString', args: { value: { path: '/name' } } },
          checks: [{ condition: { call: 'required', args: { value: { '@path': '/name' } } }, message: 'x' }],
          action: { event: { name: 'go', context: { id: { path: '/id' }, kind: 'literal' } } },
        },
        behaviorOf('TextField'),
      ),
    ).toEqual(['/label', '/value/args/value', '/action/event/context/id', '/checks/0/condition']);
  });

  it('finds a v0.9 functionCall action', () => {
    expect(findLegacyBindings({ label: 'Docs', action: { functionCall: { call: 'openUrl', args: { url: 'https://x.example' } } } }, behaviorOf('Button'))).toEqual(['/action/functionCall']);
  });

  it('accepts v1.0 syntax', () => {
    expect(findLegacyBindings({ label: { '@path': '/label' }, value: { '@path': '/name' }, checks: [{ condition: { '@path': '/ok' } }] }, behaviorOf('TextField'))).toEqual([]);
  });

  it('leaves { path } alone where it is ordinary data', () => {
    expect(findLegacyBindings({ items: [{ path: '/srv/data' }], columns: [{ title: 'Path', key: 'path' }] }, behaviorOf('Table'))).toEqual([]);
    expect(findLegacyBindings({ options: [{ path: '/x' }], value: 'a' }, behaviorOf('Select'))).toEqual([]);
  });

  it('reports nothing without a schema to read', () => {
    expect(findLegacyBindings({ text: { path: '/name' } }, undefined)).toEqual([]);
  });
});
