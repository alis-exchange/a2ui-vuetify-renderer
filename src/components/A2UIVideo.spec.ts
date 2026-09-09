import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import A2UIVideo from './A2UIVideo.vue';

const vuetify = createVuetify();

function createMockContext() {
  return {
    surfaceId: 'test-surface',
    onAction: vi.fn(),
    processor: { model: { getSurface: vi.fn().mockReturnValue({}) } },
    dataContextPath: '/',
  };
}

describe('A2UIVideo.vue', () => {
  it('renders a video element', () => {
    const mockNode = {
      id: 'video-1',
      type: 'Video',
      properties: { url: 'https://example.com/video.mp4' },
    };

    const wrapper = mount(A2UIVideo, {
      props: { node: mockNode as any },
      global: {
        provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
        plugins: [vuetify],
      },
    });

    const video = wrapper.find('video');
    expect(video.exists()).toBe(true);
    expect(video.attributes('src')).toBe('https://example.com/video.mp4');
    expect(video.attributes('controls')).toBeDefined();
  });
});
