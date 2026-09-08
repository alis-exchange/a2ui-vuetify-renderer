import { DataModel } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { shallowRef } from 'vue';
import { createVuetify } from 'vuetify';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import A2UIButton from './A2UIButton.vue';
import A2UIIconButton from './A2UIIconButton.vue';

const vuetify = createVuetify();

/** In node mode the binder reports check results on the node's resolved props. */
function mountWithNodeProps(component: any, nodeProps: Record<string, unknown> | undefined, properties: Record<string, unknown>) {
  const context = {
    surfaceId: 's',
    onAction: vi.fn(),
    processor: { model: { getSurface: () => ({ id: 's', dataModel: new DataModel({}), catalog: { invoker: () => undefined } }) } },
    dataContextPath: '/',
    nodeProps: shallowRef(nodeProps),
  };
  return mount(component, {
    global: { provide: { [A2UI_CONTEXT_KEY as symbol]: context }, plugins: [vuetify] },
    props: { node: { id: 'btn', type: 'Button', properties } as any },
  });
}

describe.each([
  ['A2UIButton', A2UIButton, { label: 'Go', action: { event: { name: 'go' } } }],
  ['A2UIIconButton', A2UIIconButton, { icon: 'send', action: { event: { name: 'go' } } }],
])('%s check gating', (_name, component, properties) => {
  it('is disabled with the validation message when the checks fail', () => {
    const wrapper = mountWithNodeProps(component, { isValid: false, validationErrors: ['Name is required'] }, properties);
    const btn = wrapper.findComponent({ name: 'VBtn' });
    expect(btn.props('disabled')).toBe(true);
    expect(btn.attributes('title')).toBe('Name is required');
  });

  it('is enabled when the checks pass or there are none', () => {
    expect(mountWithNodeProps(component, { isValid: true, validationErrors: [] }, properties).findComponent({ name: 'VBtn' }).props('disabled')).toBe(false);
    expect(mountWithNodeProps(component, undefined, properties).findComponent({ name: 'VBtn' }).props('disabled')).toBe(false);
  });
});
