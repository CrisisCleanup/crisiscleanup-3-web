import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import ComponentDialog from '@/components/dialogs/ComponentDialog.vue';
import BaseButton from '@/components/BaseButton.vue';

describe('ComponentDialog.vue', () => {
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

    wrapper = mount(ComponentDialog, {
      props: {
        id: 'test-dialog',
        title: 'Test Dialog Title',
        component: BaseButton,
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
    expect(title.text()).toBe('Test Dialog Title');
  });

  it('renders the dynamic component', () => {
    const dynamicComponent = wrapper.findComponent(BaseButton);
    expect(dynamicComponent.exists()).toBe(true);
  });

  it('renders the modal footer with OK button', () => {
    const footer = wrapper.find('.modal-footer');
    expect(footer.exists()).toBe(true);

    const okButton = footer.findComponent(BaseButton);
    expect(okButton.exists()).toBe(true);
    expect(okButton.text()).toBe('OK');
  });
});
