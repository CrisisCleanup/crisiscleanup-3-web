import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import MessageResponseDialog from '@/components/dialogs/MessageResponseDialog.vue';
import BaseButton from '@/components/BaseButton.vue';

describe('MessageResponseDialog.vue', () => {
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

    wrapper = mount(MessageResponseDialog, {
      props: {
        title: 'Test Message Response Dialog Title',
        content: 'Test content',
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
    expect(title.text()).toBe('Test Message Response Dialog Title');
  });

  it('renders the content', () => {
    const content = wrapper.find('.modal-body');
    expect(content.exists()).toBe(true);
    expect(content.text()).toContain('Test content');
  });

  it('renders the textarea', () => {
    const textarea = wrapper.find('textarea');
    expect(textarea.exists()).toBe(true);
  });

  it('renders the modal footer with OK and Cancel buttons when no actions are passed', () => {
    const footer = wrapper.find('.modal-footer');
    expect(footer.exists()).toBe(true);

    const okButton = footer
      .findAllComponents(BaseButton)
      .filter((button: any) => button.text() === 'OK');
    expect(okButton.length).toBe(1);

    const cancelButton = footer
      .findAllComponents(BaseButton)
      .filter((button: any) => button.text() === 'Cancel');
    expect(cancelButton.length).toBe(1);
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
