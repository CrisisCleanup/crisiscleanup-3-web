import { inject } from 'vue';
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import { useAxios } from '@vueuse/integrations/useAxios';

export type UseApiOptions<D = any> = Omit<AxiosRequestConfig<D>, 'baseURL'>;

export type WrappedUseAxiosReturn<
  T = any,
  R = AxiosResponse<T>,
  D = any,
> = Pick<
  ReturnType<typeof useAxios<T, R, D>>,
  | 'response'
  | 'data'
  | 'isFinished'
  | 'isLoading'
  | 'isAborted'
  | 'error'
  | 'abort'
>;

export type UseApiReturn = <T = any, R = AxiosResponse<T>, D = any>(
  url: string,
  options: UseApiOptions,
) => WrappedUseAxiosReturn;

export function useApi(baseUrl?: string): UseApiReturn {
  const apiUrl = baseUrl ?? (import.meta.env.VITE_APP_API_BASE_URL as string);
  const axios = inject<AxiosInstance>('axios');
  if (!axios) {
    throw new Error('Cannot inject axios');
  }
  return <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    options: UseApiOptions,
  ): WrappedUseAxiosReturn<T, R, D> => {
    const axiosConfig = {
      baseURL: apiUrl,
      ...(options as AxiosRequestConfig),
    };
    const r = useAxios<T, R, D>(url, axiosConfig, axios);
    return {
      response: r.response,
      data: r.data,
      isFinished: r.isFinished,
      isLoading: r.isLoading,
      isAborted: r.isAborted,
      error: r.error,
      abort: r.abort,
    };
  };
}

export default useApi;
