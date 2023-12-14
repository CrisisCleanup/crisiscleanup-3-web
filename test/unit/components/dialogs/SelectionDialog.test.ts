import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import SelectionDialog from '@/components/dialogs/SelectionDialog.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseSelect from '@/components/BaseSelect.vue';

describe('SelectionDialog.vue', () => {
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

    wrapper = mount(SelectionDialog, {
      props: {
        title: 'Test Title',
        content: 'Test Content',
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
        placeholder: 'Select an option',
      },
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key: string) => i18n.global.t(key),
        },
        components: {
          BaseButton,
          BaseSelect,
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
    expect(title.text()).toBe('Test Title');
  });

  it('renders the content', () => {
    const content = wrapper.find('.modal-body div');
    expect(content.exists()).toBe(true);
    expect(content.text()).toBe('Test Content');
  });

  it('renders the base select component', () => {
    const baseSelect = wrapper.findComponent(BaseSelect);
    expect(baseSelect.exists()).toBe(true);
  });

  it('renders the modal footer with OK and Cancel buttons', () => {
    const footer = wrapper.find('.modal-footer');
    expect(footer.exists()).toBe(true);

    const okButton = footer
      .findAllComponents(BaseButton)
      .filter((button) => button.text() === 'OK');
    expect(okButton.length).toBe(1);

    const cancelButton = footer
      .findAllComponents(BaseButton)
      .filter((button) => button.text() === 'Cancel');
    expect(cancelButton.length).toBe(1);
  });
});
