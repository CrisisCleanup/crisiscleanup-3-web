import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import OrganizationApprovalDialog from '@/components/dialogs/OrganizationApprovalDialog.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseSelect from '@/components/BaseSelect.vue';
import BaseInput from '@/components/BaseInput.vue';

describe('OrganizationApprovalDialog.vue', () => {
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
          adminOrganization: {
            approve_or_reject: 'Approve or Reject',
            rejection_note: 'Rejection Note',
          },
          orgApprovalTable: {
            give_approve_reason: 'Give a reason for approval/rejection',
          },
        },
      },
    });

    wrapper = mount(OrganizationApprovalDialog, {
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key: string) => i18n.global.t(key),
        },
        components: {
          BaseButton,
          BaseSelect,
          BaseInput,
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
    expect(title.text()).toBe('Approve or Reject');
  });

  it('renders the base select component', () => {
    const baseSelect = wrapper.findComponent(BaseSelect);
    expect(baseSelect.exists()).toBe(true);
  });

  it('renders the base input component', () => {
    const baseInput = wrapper.findComponent(BaseInput);
    expect(baseInput.exists()).toBe(true);
  });

  it('renders the modal footer with OK and Cancel buttons', () => {
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
});
