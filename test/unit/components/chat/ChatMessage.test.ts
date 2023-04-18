import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import ChatMessage from '@/components/chat/ChatMessage.vue';
import { createStore } from 'vuex';

describe('ChatMessage.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {},
      },
    });

    wrapper = mount(ChatMessage, {
      props: {
        message: {
          content: 'Test message',
          created_by: {
            full_name: 'John Doe',
            profile_picture_file: null,
          },
          created_at: new Date().toISOString(),
          is_favorite: false,
          is_urgent: false,
        },
      },
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key: string) => key,
        },
        stubs: ['UserDetailsTooltip'],
      },
    });

    await nextTick();
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the message content', () => {
    expect(wrapper.text()).toContain('Test message');
  });

  it('renders the message time', () => {
    const messageTime = wrapper.find('.opacity-40.text-xs.ml-1');
    expect(messageTime.exists()).toBe(true);
    expect(messageTime.text()).not.toBe('');
  });

  it('shows favorite star on mouseenter and hides on mouseleave', async () => {
    await wrapper.trigger('mouseenter');
    let favoriteStar = wrapper.find('.absolute.top-1\\/2.right-2.mt-2');
    expect(favoriteStar.exists()).toBe(true);

    await wrapper.trigger('mouseleave');
    favoriteStar = wrapper.find('.absolute.top-1\\/2.right-2.mt-2');
    expect(favoriteStar.exists()).toBe(false);
  });
});
