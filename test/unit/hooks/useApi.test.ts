import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { ref } from 'vue';
import { useAxios } from '@vueuse/integrations/useAxios';
import { useApi } from '@/hooks/useApi';

vi.mock('axios');
vi.mock('@vueuse/integrations/useAxios', () => {
  const libExports = {
    useAxios(
      url: string,
      options: Record<string, any>,
      instance: AxiosInstance,
    ) {
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
        abort() {
          console.log('abort');
        },
      };
    },
  };
  vi.spyOn(libExports, 'useAxios');
  return libExports;
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

  afterEach(() => {
    vi.clearAllMocks();
  });

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
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should call useAxios with correct arguments', async () => {
    const wrapper = mount(componentOptions, { global: globalOptions });
    const testApi = wrapper.vm.api;
    testApi('/todos/1', {
      method: 'GET',
      params: {
        type: 'all',
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer 12345',
      },
    });
    expect(useAxios).toHaveBeenCalled();
    expect(useAxios).toHaveBeenCalledTimes(1);
    expect(useAxios).toHaveBeenCalledWith(
      '/todos/1',
      {
        baseURL: 'https://jsonplaceholder.typicode.com',
        method: 'GET',
        params: { type: 'all' },
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer 12345',
        },
      },
      axios,
    );
  });

  it('should return correct data', async () => {
    const wrapper = mount(componentOptions, { global: globalOptions });
    const apiInstance = wrapper.vm.api;
    const r = apiInstance('/todos/1', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer 12345',
      },
    });
    expect(r.response.value).toBeDefined();
    expect(r.data.value).toBeDefined();
    expect(r.response.value).toMatchInlineSnapshot(`
      {
        "completed": false,
        "id": 1,
        "title": "delectus aut autem",
      }
    `);
    expect(r.data.value).toMatchInlineSnapshot(`
      {
        "completed": false,
        "id": 1,
        "title": "delectus aut autem",
      }
    `);
  });
});
