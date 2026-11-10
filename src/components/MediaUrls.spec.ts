import { DataModel } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import A2UIAudioPlayer from './A2UIAudioPlayer.vue';
import A2UIAvatar from './A2UIAvatar.vue';
import A2UIImage from './A2UIImage.vue';
import A2UIVideo from './A2UIVideo.vue';

const vuetify = createVuetify();

function mountWith(component: any, properties: Record<string, unknown>) {
  const context = {
    surfaceId: 's',
    onAction: vi.fn(),
    processor: { model: { getSurface: () => ({ id: 's', dataModel: new DataModel({}), defaultCatalog: { invoker: () => undefined } }) } },
    dataContextPath: '/',
  };
  return mount(component, {
    global: { provide: { [A2UI_CONTEXT_KEY as symbol]: context }, plugins: [vuetify] },
    props: { node: { id: 'n', type: 'X', properties } as any },
  });
}

const SAFE = 'https://example.com/media/a';
const UNSAFE = ['javascript:alert(1)', '//evil.example/a'];

describe('media components load only safe URLs', () => {
  it('Image', () => {
    expect(mountWith(A2UIImage, { url: SAFE }).findComponent({ name: 'VImg' }).props('src')).toBe(SAFE);
    for (const url of UNSAFE) expect(mountWith(A2UIImage, { url }).findComponent({ name: 'VImg' }).exists()).toBe(false);
  });

  it('Avatar', () => {
    expect(mountWith(A2UIAvatar, { image: SAFE }).findComponent({ name: 'VAvatar' }).props('image')).toBe(SAFE);
    for (const image of UNSAFE) expect(mountWith(A2UIAvatar, { image }).findComponent({ name: 'VAvatar' }).props('image')).toBeUndefined();
  });

  it.each([
    ['Video', A2UIVideo, 'video'],
    ['AudioPlayer', A2UIAudioPlayer, 'audio'],
  ])('%s', (_, component, tag) => {
    expect(mountWith(component, { url: SAFE }).find(tag).attributes('src')).toBe(SAFE);
    for (const url of UNSAFE) expect(mountWith(component, { url }).find(tag).exists()).toBe(false);
  });
});
