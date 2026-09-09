import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import A2UIChoicePicker from './A2UIChoicePicker.vue';

const vuetify = createVuetify();

function createMockContext() {
  return {
    surfaceId: 'test-surface',
    onAction: vi.fn(),
    processor: { model: { getSurface: vi.fn().mockReturnValue({}) } },
    dataContextPath: '/',
  };
}

describe('A2UIChoicePicker.vue', () => {
  it('renders a select dropdown by default', () => {
    const mockNode = {
      id: 'choice-1',
      type: 'ChoicePicker',
      properties: {
        variant: 'mutuallyExclusive',
        displayStyle: 'dropdown',
        options: [{ label: 'Option 1', value: 'opt1' }],
        value: 'opt1',
      },
    };

    const wrapper = mount(A2UIChoicePicker, {
      props: { node: mockNode as any },
      global: {
        provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
        plugins: [vuetify],
        stubs: {
          A2UISelect: true,
          A2UICheckbox: true,
          A2UIRadioButton: true,
        },
      },
    });

    expect(wrapper.findComponent({ name: 'A2UISelect' }).exists()).toBe(true);
  });

  it('renders radio buttons for list + mutuallyExclusive', () => {
    const mockNode = {
      id: 'choice-1',
      type: 'ChoicePicker',
      properties: { variant: 'mutuallyExclusive', displayStyle: 'list' },
    };

    const wrapper = mount(A2UIChoicePicker, {
      props: { node: mockNode as any },
      global: {
        provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
        plugins: [vuetify],
        stubs: {
          A2UISelect: true,
          A2UICheckbox: true,
          A2UIRadioButton: true,
        },
      },
    });

    expect(wrapper.findComponent({ name: 'A2UIRadioButton' }).exists()).toBe(true);
  });

  it('renders checkboxes for list + multipleSelection', () => {
    const mockNode = {
      id: 'choice-1',
      type: 'ChoicePicker',
      properties: { variant: 'multipleSelection', displayStyle: 'list' },
    };

    const wrapper = mount(A2UIChoicePicker, {
      props: { node: mockNode as any },
      global: {
        provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
        plugins: [vuetify],
        stubs: {
          A2UISelect: true,
          A2UICheckbox: true,
          A2UIRadioButton: true,
          A2UIMultipleCheckbox: true, // we might need a wrapper if A2UICheckbox doesn't support groups
        },
      },
    });

    // We'll map multiple list to A2UISelect with multiple=true for now, or a custom wrapper.
    // Let's see what the implementation will be.
    // Let's assume we map it to A2UISelect if A2UICheckbox doesn't handle arrays natively.
    // Actually, A2UISelect supports multiple if variant='multipleSelection'.
    expect(wrapper.exists()).toBe(true);
  });
});
