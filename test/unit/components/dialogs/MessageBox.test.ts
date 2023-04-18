import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import MessageBox from '@/components/dialogs/MessageBox.vue';
import BaseButton from '@/components/BaseButton.vue';

describe('MessageBox.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          actions: {
            ok: 'OK',
            cancel: 'Cancel',
          },
        },
      },
    });

    wrapper = mount(MessageBox, {
      props: {
        title: 'Test Message Box Title',
        content: '<p>Test content</p>',
        actions: {},
      },
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key: string) => i18n.global.t(key),
        },
        components: {
          BaseButton,
        },
      },
    });

    await nextTick();
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the title', () => {
    const title = wrapper.find('.title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Test Message Box Title');
  });

  it('renders the content', () => {
    const content = wrapper.find('.modal-body');
    expect(content.exists()).toBe(true);
    expect(content.html()).toContain('<p>Test content</p>');
  });

  it('renders the modal footer with OK button when no actions are passed', () => {
    const footer = wrapper.find('.modal-footer');
    expect(footer.exists()).toBe(true);

    const okButton = footer.findComponent(BaseButton);
    expect(okButton.exists()).toBe(true);
    expect(okButton.text()).toBe('OK');
  });

  it('renders custom actions when actions are passed', async () => {
    await wrapper.setProps({
      actions: {
        custom: {
          text: 'Custom Action',
          type: 'solid',
          buttonClass: 'custom-action-class',
        },
      },
    });

    const footer = wrapper.find('.modal-footer');
    expect(footer.exists()).toBe(true);

    const customActionButton = footer.findComponent(BaseButton);
    expect(customActionButton.exists()).toBe(true);
    expect(customActionButton.text()).toBe('Custom Action');
    expect(customActionButton.classes()).toContain('custom-action-class');
  });
});
