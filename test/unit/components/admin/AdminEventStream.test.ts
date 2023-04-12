import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import AdminEventStream from '@/components/admin/AdminEventStream.vue';
import BaseSelect from '@/components/BaseSelect.vue';
import BaseButton from '@/components/BaseButton.vue';

vi.mock('axios');

describe('AdminEventStream.vue', () => {
  let wrapper: VueWrapper<any>;
  type AxiosGet = <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ) => Promise<R>;

  beforeEach(async () => {
    (axios.get as MockedFunction<AxiosGet>).mockClear();
    (axios.get as MockedFunction<AxiosGet>)
      .mockResolvedValueOnce({
        data: {
          results: [{ key: 'event1' }, { key: 'event2' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          results: [],
        },
      });

    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {},
      },
    });

    wrapper = mount(AdminEventStream, {
      global: {
        stubs: ['router-link', 'router-view'],
        plugins: [i18n],
        mocks: {
          $t: (key: string) => key,
        },
        components: {
          BaseSelect,
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

  it('renders BaseSelect with correct properties and event', async () => {
    const baseSelect = wrapper.findComponent(BaseSelect);
    expect(baseSelect.exists()).toBe(true);
    expect(baseSelect.props('multiple')).toBe(true);
    expect(baseSelect.props('searchable')).toBe(true);
    expect(baseSelect.props('options')).toEqual(['event1', 'event2']);

    const updatedValue = ['event1', 'event2', 'event3'];
    await baseSelect.vm.$emit('update:modelValue', updatedValue);
    expect(wrapper.vm.filterEvents).toEqual(updatedValue);
  });

  it('renders BaseButton with sync icon', () => {
    const baseButton = wrapper.findComponent(BaseButton);
    expect(baseButton.exists()).toBe(true);
    expect(baseButton.props('icon')).toBe('sync');
  });

  it('calls getEventLogs on BaseButton click', async () => {
    const baseButton = wrapper.findComponent(BaseButton);
    await baseButton.vm.$emit('click');
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
