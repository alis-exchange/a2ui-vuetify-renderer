import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { createVuetify } from 'vuetify';
import A2UIVideo from './A2UIVideo.vue';

const vuetify = createVuetify();

vi.mock('../composables/useDynamicProps', async (importOriginal) => {
  const vue = await import('vue');
  return {
    useDynamicProps: (nodeArg: any) => {
      const node = typeof nodeArg === 'function' ? nodeArg() : nodeArg;
      return vue.ref({
        id: node.id || 'video-1',
        url: node.url,
        controls: node.controls !== false,
        autoplay: node.autoplay || false,
      });
    },
  };
});

describe('A2UIVideo.vue', () => {
  it('renders a video element', () => {
    const mockNode = {
      id: 'video-1',
      type: 'Video',
      url: 'https://example.com/video.mp4',
    };

    const wrapper = mount(A2UIVideo, {
      props: { node: mockNode },
      global: {
        plugins: [vuetify],
      },
    });

    const video = wrapper.find('video');
    expect(video.exists()).toBe(true);
    expect(video.attributes('src')).toBe('https://example.com/video.mp4');
    expect(video.attributes('controls')).toBeDefined();
  });
});
