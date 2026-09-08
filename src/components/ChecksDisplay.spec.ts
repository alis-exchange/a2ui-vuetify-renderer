import { DataModel } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { shallowRef } from 'vue';
import { createVuetify } from 'vuetify';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import A2UIChoicePicker from './A2UIChoicePicker.vue';
import A2UIDatePicker from './A2UIDatePicker.vue';
import A2UISlider from './A2UISlider.vue';

const vuetify = createVuetify();

function mountWith(component: any, properties: Record<string, unknown>, data: Record<string, unknown> = {}, nodeProps?: Record<string, unknown>) {
  const context = {
    surfaceId: 's',
    onAction: vi.fn(),
    processor: { model: { getSurface: () => ({ id: 's', dataModel: new DataModel(data), catalog: { invoker: () => undefined } }) } },
    dataContextPath: '/',
    nodeProps: shallowRef(nodeProps),
  };
  return mount(component, {
    global: { provide: { [A2UI_CONTEXT_KEY as symbol]: context }, plugins: [vuetify] },
    props: { node: { id: 'n', type: 'X', properties } as any },
  });
}

const failing = [{ condition: false, message: 'Not allowed' }];

describe('checks on the remaining input components', () => {
  it('Slider passes its checks to v-slider as rules', () => {
    const wrapper = mountWith(A2UISlider, { value: { path: '/vol' }, checks: failing }, { vol: 5 });
    const rules = wrapper.findComponent({ name: 'VSlider' }).props('rules') as any[];
    expect(rules).toHaveLength(1);
    expect(rules[0](5)).toBe('Not allowed');
  });

  it('DatePicker shows failing check messages below the picker', () => {
    const wrapper = mountWith(A2UIDatePicker, { value: { path: '/when' }, checks: failing }, { when: null });
    expect(wrapper.find('.a2ui-date-picker-errors').text()).toBe('Not allowed');
  });

  it('DatePicker shows nothing when its checks pass', () => {
    const wrapper = mountWith(A2UIDatePicker, { value: { path: '/when' }, checks: [{ condition: true, message: 'x' }] }, { when: null });
    expect(wrapper.find('.a2ui-date-picker-errors').exists()).toBe(false);
  });

  it('Slider shows the binder validation errors in node mode', () => {
    const wrapper = mountWith(A2UISlider, { value: { path: '/vol' }, checks: [{ condition: true, message: 'x' }] }, { vol: 5 }, { isValid: false, validationErrors: ['Too low'] });
    expect(wrapper.findComponent({ name: 'VSlider' }).props('errorMessages')).toEqual(['Too low']);
  });

  it('DatePicker prefers the binder validation errors in node mode', () => {
    const wrapper = mountWith(A2UIDatePicker, { value: { path: '/when' }, checks: [{ condition: true, message: 'x' }] }, { when: null }, { isValid: false, validationErrors: ['Pick a weekday'] });
    expect(wrapper.find('.a2ui-date-picker-errors').text()).toBe('Pick a weekday');
  });

  it('ChoicePicker hands its checks to the delegate input', () => {
    const wrapper = mountWith(A2UIChoicePicker, { displayStyle: 'dropdown', options: [{ label: 'A', value: 'a' }], value: { path: '/pick' }, checks: failing }, { pick: 'a' });
    const rules = wrapper.findComponent({ name: 'VSelect' }).props('rules') as any[];
    expect(rules).toHaveLength(1);
    expect(rules[0]('a')).toBe('Not allowed');
  });
});
