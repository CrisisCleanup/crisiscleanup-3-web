import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import CmsViewer from '@/components/cms/CmsViewer.vue';

describe('CmsViewer.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          test_title: 'Test Title',
          test_content: 'Test Content',
        },
      },
    });

    wrapper = mount(CmsViewer, {
      props: {
        title: 'test_title',
        content: 'test_content',
        image: 'https://example.com/image.jpg',
      },
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key: string) => i18n.global.t(key),
        },
      },
    });

    await nextTick();
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the title', () => {
    const title = wrapper.find('.text-2xl.my-1.font-bold');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Test Title');
  });

  it('renders the content', () => {
    const content = wrapper.find('.cms-viewer.cms-viewer__content');
    expect(content.exists()).toBe(true);
    expect(content.text()).toBe('Test Content');
  });

  it('renders the image', () => {
    const image = wrapper.find('img');
    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe('https://example.com/image.jpg');
  });
});
