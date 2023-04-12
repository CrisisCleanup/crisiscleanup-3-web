import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import MergeOrganizations from '@/components/admin/MergeOrganizations.vue';
import Modal from '@/components/Modal.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseIcon from '@/components/BaseIcon.vue';

describe('MergeOrganizations component', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {},
    },
  });
  it('displays merge modal when merge button is clicked', async () => {
    const wrapper = mount(MergeOrganizations, {
      global: {
        plugins: [i18n],
        components: {
          BaseButton,
          Modal,
        },
      },
    });
    const mergeButton = wrapper.find('.base-button');

    expect(wrapper.vm.showMergeModal).toBe(false);

    await mergeButton.trigger('click');

    expect(wrapper.vm.showMergeModal).toBe(true);
  });

  it('closes merge modal when cancel button is clicked', async () => {
    const wrapper = mount(MergeOrganizations, {
      global: {
        plugins: [i18n],
        components: {
          BaseButton,
          Modal,
          'ccu-icon': BaseIcon,
        },
      },
    });
    const mergeButton = wrapper.find('.base-button');
    await mergeButton.trigger('click');

    expect(wrapper.vm.showMergeModal).toBe(true);

    const cancelButton = wrapper.find('.js-actions-cancel');
    await cancelButton.trigger('click');

    expect(wrapper.vm.showMergeModal).toBe(false);
  });
});
