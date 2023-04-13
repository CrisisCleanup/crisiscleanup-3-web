import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import WorksiteImport from '@/components/admin/WorksiteImport.vue';

describe('WorksiteImport', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {},
    },
  });
  it('should render without crashing', () => {
    const wrapper = mount(WorksiteImport, {
      global: {
        plugins: [i18n],
      },
    });
    expect(wrapper.exists()).toBeTruthy();
  });
});
