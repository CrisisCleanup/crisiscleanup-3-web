import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { ref } from 'vue';
import { useApi } from '@/hooks/useApi';
import { useAxios } from '@vueuse/integrations/useAxios';

vi.mock('axios');
vi.mock('@vueuse/integrations/useAxios', () => {
  return {
    useAxios: (
      url: string,
      options: Record<string, any>,
      instance: AxiosInstance,
    ) => {
      const d = {
        id: 1,
        title: 'delectus aut autem',
        completed: false,
      };
      return {
        response: ref(d),
        data: ref(d),
        isFinished: ref(true),
        isLoading: ref(false),
        isAborted: ref(false),
        error: {},
        abort: () => {},
      };
    },
  };
});

describe('useApi', () => {
  const componentOptions = {
    setup() {
      const api = useApi('https://jsonplaceholder.typicode.com');
      return { api };
    },
    template: '<div> Hello world! </div>',
  };

  const globalOptions = {
    provide: {
      axios,
    },
  };

  it('should instantiate', async () => {
    const wrapper = mount(componentOptions, { global: globalOptions });
    const testApi = wrapper.vm.api;
    const result = testApi('/todos/1', { method: 'GET' });
    expect(testApi).toBeDefined();
    expect(testApi).toBeInstanceOf(Function);
    expect(result).toBeDefined();
  });

  it('should throw error if axios is not provided', () => {
    try {
      const wrapper = mount(componentOptions);
      const apiInstance = wrapper.vm.api;
      apiInstance('/users', { method: 'GET' });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('works as expected', () => {
    const wrapper = mount(componentOptions, { global: globalOptions });
    const apiInstance = wrapper.vm.api;
    const r = apiInstance('/todos/1', { method: 'GET' });
    expect(r.response).toBeDefined();
    expect(r.data.value).toBeDefined();
  });
});
