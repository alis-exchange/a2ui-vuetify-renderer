import { Catalog, MessageProcessor, NodeResolver, getValue, type A2uiMessage } from '@a2ui/web_core/v0_9';
import { describe, expect, it } from 'vitest';
import { VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA } from '../catalog';
import { CATALOG_ID } from './constants';
import { findLiveNode } from './liveNodes';

/** Builds a real resolver over a real surface so the props carry genuine web_core nodes. */
function resolveSurface(components: Record<string, unknown>[], data: Record<string, unknown> = {}) {
  const catalog = new Catalog(CATALOG_ID, VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA);
  const processor = new MessageProcessor([catalog], undefined, { version: 'v0.9' });
  processor.processMessages([
    { version: 'v0.9', createSurface: { surfaceId: 's', catalogId: CATALOG_ID } },
    { version: 'v0.9', updateDataModel: { surfaceId: 's', path: '/', value: data } },
    { version: 'v0.9', updateComponents: { surfaceId: 's', components } } as A2uiMessage,
  ]);
  const surface = processor.model.getSurface('s')!;
  const resolver = new NodeResolver(surface, catalog);
  const root = getValue(resolver.rootNode)!;
  return { rootProps: getValue(root.props), resolver };
}

describe('findLiveNode', () => {
  it('finds a single child reference by component id', () => {
    const { rootProps } = resolveSurface([
      { id: 'root', component: 'Card', child: 'body' },
      { id: 'body', component: 'Text', text: 'hi' },
    ]);
    expect(findLiveNode(rootProps, 'body')?.componentId).toBe('body');
  });

  it('finds a child inside a static child list', () => {
    const { rootProps } = resolveSurface([
      { id: 'root', component: 'Column', children: ['a', 'b'] },
      { id: 'a', component: 'Text', text: 'a' },
      { id: 'b', component: 'Text', text: 'b' },
    ]);
    expect(findLiveNode(rootProps, 'b')?.componentId).toBe('b');
  });

  it('distinguishes template items by data path', () => {
    const { rootProps } = resolveSurface(
      [
        { id: 'root', component: 'Column', children: { path: '/items', componentId: 'item' } },
        { id: 'item', component: 'Text', text: { path: 'label' } },
      ],
      { items: [{ label: 'one' }, { label: 'two' }] },
    );
    expect(findLiveNode(rootProps, 'item', '/items/1')?.dataPath).toBe('/items/1');
    expect(findLiveNode(rootProps, 'item')?.dataPath).toBe('/items/0');
  });

  it('finds a child nested inside an array of objects (Tabs tabs)', () => {
    const { rootProps } = resolveSurface([
      { id: 'root', component: 'Tabs', tabs: [{ title: 'One', child: 'one' }] },
      { id: 'one', component: 'Text', text: 'one' },
    ]);
    expect(findLiveNode(rootProps, 'one')?.componentId).toBe('one');
  });

  it('returns undefined for unknown ids or missing props', () => {
    const { rootProps } = resolveSurface([
      { id: 'root', component: 'Card', child: 'body' },
      { id: 'body', component: 'Text', text: 'hi' },
    ]);
    expect(findLiveNode(rootProps, 'nope')).toBeUndefined();
    expect(findLiveNode(undefined, 'body')).toBeUndefined();
  });
});
