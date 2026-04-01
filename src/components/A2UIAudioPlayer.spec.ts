import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import A2UIAudioPlayer from './A2UIAudioPlayer.vue';

const vuetify = createVuetify();

vi.mock('../composables/useDynamicProps', async (importOriginal) => {
  const vue = await import('vue');
  return {
    useDynamicProps: (nodeArg: any) => {
      const node = typeof nodeArg === 'function' ? nodeArg() : nodeArg;
      return vue.ref({
        id: node.id || 'audio-1',
        url: node.url,
        controls: node.controls !== false,
        autoplay: node.autoplay || false,
      });
    },
  };
});

describe('A2UIAudioPlayer.vue', () => {
  it('renders an audio element', () => {
    const mockNode = {
      id: 'audio-1',
      type: 'AudioPlayer',
      url: 'https://example.com/audio.mp3',
    };

    const wrapper = mount(A2UIAudioPlayer, {
      props: { node: mockNode },
      global: {
        plugins: [vuetify],
      },
    });

    const audio = wrapper.find('audio');
    expect(audio.exists()).toBe(true);
    expect(audio.attributes('src')).toBe('https://example.com/audio.mp3');
    expect(audio.attributes('controls')).toBeDefined();
  });
});
