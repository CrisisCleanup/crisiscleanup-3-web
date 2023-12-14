import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import VueToastificationPlugin from 'vue-toastification';
import ArcGisUploader from '@/components/admin/ArcGisUploader.vue';
import BaseSelect from '@/components/BaseSelect.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseIcon from '@/components/BaseIcon.vue';

vi.mock('axios');

const apiUrl = (import.meta as any).env.VITE_APP_API_BASE_URL;
describe('ArcGisUploader.vue', () => {
  let wrapper: VueWrapper<any>;

  type AxiosPost = <T = any, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ) => Promise<R>;

  beforeEach(async () => {
    (axios.post as MockedFunction<AxiosPost>).mockClear();

    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {},
      },
    });

    wrapper = mount(ArcGisUploader, {
      global: {
        plugins: [i18n, VueToastificationPlugin],
        components: {
          BaseSelect,
          BaseButton,
          BaseInput,
          'ccu-icon': BaseIcon,
        },
      },
    });
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('imports GIS data when importGis is called', async () => {
    (axios.post as MockedFunction<AxiosPost>).mockResolvedValue({
      data: {
        success: true,
      },
    });

    const { vm } = wrapper;

    vm.url = 'https://example.com/sample-url';
    vm.prefix = 'prefix-';
    vm.incident = '1';

    await vm.importGis();

    expect(axios.post).toHaveBeenCalledWith(`${apiUrl}/arcgis_import`, {
      url: 'https://example.com/sample-url',
      prefix: 'prefix-',
      incident: '1',
    });
  });

  it('shows error toast when importGis fails', async () => {
    (axios.post as MockedFunction<AxiosPost>).mockRejectedValue(
      new Error('Failed to import GIS data'),
    );

    const { vm } = wrapper;

    vm.url = 'https://example.com/sample-url';
    vm.prefix = 'prefix-';
    vm.incident = '1';

    await vm.importGis();

    expect(axios.post).toHaveBeenCalledWith(`${apiUrl}/arcgis_import`, {
      url: 'https://example.com/sample-url',
      prefix: 'prefix-',
      incident: '1',
    });
  });
});
