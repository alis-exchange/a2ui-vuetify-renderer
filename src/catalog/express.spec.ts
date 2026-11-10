import { ExpressFormat, ExpressPromptGenerator } from '@a2ui/agent';
import { Catalog, MessageProcessor } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import { createVuetify } from 'vuetify';
import catalogV09 from '../../catalog/vuetify-catalog.json';
import catalogV10 from '../../catalog/vuetify-catalog.v1.json';
import { A2UIProvider, CATALOG_ID, CATALOG_ID_V1, ComponentNode, VUETIFY_COMPONENTS, VUETIFY_COMPONENTS_V1, VUETIFY_FUNCTIONS, VUETIFY_FUNCTIONS_V1, registerDefaultComponents } from '../index';

/**
 * A2UI Express is the compact format Google's agent SDK (@a2ui/agent) has the model write
 * instead of JSON. It reads our published catalog documents, as an agent would, shows the model
 * one signature per component and passes arguments by position. These tests run the real SDK
 * against both documents.
 */
const DOCS = [
  ['v0.9', catalogV09, '0.9', 'v0.9'],
  ['v1.0', catalogV10, '1.0', 'v1.0'],
] as const;

describe.each(DOCS)('A2UI Express against the %s catalog', (_, doc, catalogVersion, wireVersion) => {
  const load = () => Catalog.fromJson(structuredClone(doc) as never, catalogVersion);

  it('loads as a catalog document', () => {
    expect(load().components.size).toBe(VUETIFY_COMPONENTS.length);
  });

  it('shows the model each component with its own props first and its description', () => {
    const prompt = new ExpressPromptGenerator([load()]).generate();
    expect(prompt).toMatch(/TextField\(label, value\?/);
    expect(prompt).toMatch(/Button\(label\?, text\?, icon\?/);
    expect(prompt).toContain('A single-line text input bound to the data model.');
    expect(prompt).not.toMatch(/\((weight|accessibility)\?,/);
  });

  it('compiles positional calls into messages our renderer accepts and renders', () => {
    const express = ['root = Column([greeting, name])', 'greeting = Text("Hello")', 'name = TextField("Name", $/user/name)', '$/user/name = "Ada"'].join('\n');
    const messages = new ExpressFormat([load()], { surfaceId: 'express', version: wireVersion }).createParser().compile(express, true);

    const v10 = wireVersion === 'v1.0';
    const processor = v10
      ? new MessageProcessor([new Catalog(CATALOG_ID_V1, '1.0', VUETIFY_COMPONENTS_V1, VUETIFY_FUNCTIONS_V1)])
      : new MessageProcessor([new Catalog(CATALOG_ID, '0.9', VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS)], undefined, { version: 'v0.9' });
    processor.processMessages(messages as never);

    const field = processor.model.getSurface('express')!.componentsModel.get('name')!;
    expect(field.properties.label).toBe('Name');
    expect(field.properties.value).toEqual(v10 ? { '@path': '/user/name' } : { path: '/user/name' });

    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId: 'express', onAction: vi.fn(), onError: vi.fn() },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });
    expect(wrapper.text()).toContain('Hello');
    expect(wrapper.findComponent({ name: 'VTextField' }).props('modelValue')).toBe('Ada');
  });
});

beforeAll(() => registerDefaultComponents());
