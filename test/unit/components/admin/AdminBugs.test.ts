import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import AdminBugs from '@/pages/admin/AdminBugs.vue';
import BaseButton from '@/components/BaseButton.vue';

vi.mock('axios');

describe('AdminBugs.vue', () => {
  let wrapper: VueWrapper<any>;
  type AxiosGet = <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ) => Promise<R>;

  beforeEach(async () => {
    (axios.get as MockedFunction<AxiosGet>).mockClear();
    (axios.get as MockedFunction<AxiosGet>).mockResolvedValueOnce({
      data: {
        results: [{ id: 'bug1' }, { id: 'bug2' }],
      },
    });

    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {},
      },
    });

    wrapper = mount(AdminBugs, {
      global: {
        stubs: ['router-link', 'router-view', 'UserDetailsTooltip'],
        plugins: [i18n],
        mocks: {
          $t: (key: string) => key,
        },
        components: {
          BaseButton,
        },
      },
    });

    await nextTick();
    await nextTick();
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders BaseButton with correct text', () => {
    const rows = wrapper.findAll('.js-table-row');
    const firstRow = rows[0];

    const baseButtons = firstRow.findAllComponents(BaseButton);
    expect(baseButtons.length).toBe(4);
    expect(baseButtons[0].props('text')).toBe('~~Show attr');
    expect(baseButtons[1].props('text')).toBe('~~Show states');
    expect(baseButtons[2].props('text')).toBe('~~Show preview');
    expect(baseButtons[3].props('text')).toBe('~~Resolve');
  });
});
