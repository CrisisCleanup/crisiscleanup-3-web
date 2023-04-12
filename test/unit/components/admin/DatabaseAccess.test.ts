import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import VueTagsInput from '@sipec/vue3-tags-input';
import axios from 'axios';
import DatabaseAccess from '@/components/admin/DatabaseAccess.vue';
import Modal from '@/components/Modal.vue';
import BaseButton from '@/components/BaseButton.vue';

vi.mock('axios');
describe('DatabaseAccess.vue', () => {
  let wrapper: VueWrapper<any>;

  type AxiosPost = <T = any, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ) => Promise<R>;

  beforeEach(async () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          databaseAccess: {
            add_ip_to_db: 'Add IP to Database',
            add_ip_to_db_for_rds: 'Add IP to Database for RDS',
            database_access: 'Database Access',
            add_ip: 'Add IP',
          },
        },
      },
    });
    wrapper = mount(DatabaseAccess, {
      global: {
        plugins: [i18n],
        components: {
          Modal,
          BaseButton,
          TagInput: VueTagsInput,
        },
        mocks: {
          $toasted: {
            error: vi.fn(),
          },
        },
      },
    });
    await nextTick();
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('opens modal when clicking on the base button', async () => {
    const baseButton = wrapper.findComponent(BaseButton);
    expect(wrapper.findComponent(Modal).exists()).toBe(false);
    await baseButton.trigger('click');
    expect(wrapper.findComponent(Modal).exists()).toBe(true);
  });

  it('saves IP addresses when clicking on the modal ok button', async () => {
    const IP_ADDRESS_1 = '127.0.0.1';
    const IP_ADDRESS_2 = '192.168.1.1';
    (axios.post as MockedFunction<AxiosPost>).mockResolvedValue({
      data: {
        success: true,
      },
    });

    const baseButton = wrapper.findComponent(BaseButton);
    expect(wrapper.findComponent(Modal).exists()).toBe(false);
    await baseButton.trigger('click');

    const tagInput = wrapper.findComponent(VueTagsInput);
    const input = tagInput.find('input');
    await input.setValue(`${IP_ADDRESS_1}, ${IP_ADDRESS_2}`);
    await wrapper.trigger('keydown.enter');
    await wrapper.trigger('keydown.tab');
    await wrapper.trigger('keydown', {
      key: 'enter',
    });
    const modal = wrapper.findComponent(Modal);
    const okButton = modal.findComponent(BaseButton);
    await okButton.trigger('click');
    await wrapper.vm.$nextTick();
    expect(axios.post).toHaveBeenCalledWith(
      `${import.meta.env.VITE_APP_API_BASE_URL}/admins/ip_addresses`,
      {
        addresses: [],
      },
    );
  });
});
