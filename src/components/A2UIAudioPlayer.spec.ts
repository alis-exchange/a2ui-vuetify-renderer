import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import A2UIAudioPlayer from './A2UIAudioPlayer.vue';

const vuetify = createVuetify();

// No `useDynamicProps` mock: the point of these tests is that the component reads the node's
// `properties` bag, which is where a real ComponentModel keeps them.
function createMockContext() {
  return {
    surfaceId: 'test-surface',
    onAction: vi.fn(),
    processor: { model: { getSurface: vi.fn().mockReturnValue({}) } },
    dataContextPath: '/',
  };
}

describe('A2UIAudioPlayer.vue', () => {
  it('renders an audio element', () => {
    const mockNode = {
      id: 'audio-1',
      type: 'AudioPlayer',
      properties: { url: 'https://example.com/audio.mp3' },
    };

    const wrapper = mount(A2UIAudioPlayer, {
      props: { node: mockNode as any },
      global: {
        provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
        plugins: [vuetify],
      },
    });

    const audio = wrapper.find('audio');
    expect(audio.exists()).toBe(true);
    expect(audio.attributes('src')).toBe('https://example.com/audio.mp3');
    expect(audio.attributes('controls')).toBeDefined();
  });
});
