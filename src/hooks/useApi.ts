import { inject } from 'vue';
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import { useAxios } from '@vueuse/integrations/useAxios';

export type UseApiOptions<D = any> = Omit<AxiosRequestConfig<D>, 'baseURL'>;

type UseAxiosReturnType<T = any, R = AxiosResponse<T>, D = any> = ReturnType<
  typeof useAxios<T, R, D>
>;

export interface WrappedUseAxiosReturn<
  T = any,
  R = AxiosResponse<T>,
  D = any,
  E extends UseAxiosReturnType<T, R, D> = UseAxiosReturnType<T, R, D>,
> {
  response: E['response'];
  data: E['data'];
  isFinished: E['isFinished'];
  isLoading: E['isLoading'];
  isAborted: E['isAborted'];
  error: E['error'];
  abort: E['abort'];
  success: E['then'];
}

export type UseApiReturn = <T = any, R = AxiosResponse<T>, D = any>(
  url: string,
  options: UseApiOptions,
) => WrappedUseAxiosReturn<T, R, D>;

/**
 * A wrapper around vueuse/integrations/useAxios hook
 *
 * @param baseUrl - The base URL to use for all requests
 *
 * @example
 * ```ts
 * /////////////////////////////////////////////////////////////
 * // Usage without async/await
 * /////////////////////////////////////////////////////////////
 *
 * const ccuApi = useApi();
 * const {
 *   response: phoneResponse, // Reactive AxiosResponse
 *   data: phoneData, // Reactive AxiosResponse.data
 *   isFinished: phoneIsFinished,
 *   isLoading: phoneIsLoading,
 *   isAborted: phoneIsAborted,
 *   error: phoneError,
 *   abort: phoneAbort, // Method to abort the request
 * } = ccuApi<
 *   PhoneResponse, // AxiosResponse.data type
 * >('/phone/info', { method: 'GET', params: { phone_number: '555-555-5555' } });
 *
 * whenever(phoneIsFinished, () => {
 *   if (phoneIsFinished.value) {
 *     console.log(phoneData.value);
 *   }
 *   if (phoneError.value) {
 *     console.error(phoneError.value);
 *   }
 *   // do something with the response / data
 *   console.log(phoneResponse.value);
 *   console.log(phoneData.value);
 * });
 *
 * /////////////////////////////////////////////////////////////
 * // Usage with async/await using the success method
 * /////////////////////////////////////////////////////////////
 *
 * const ccuApi = useApi();
 * const { success } = ccuApi('/todos/1', {
 *    method: 'GET',
 * });
 * const {
 *   response: todoResponse, // Reactive AxiosResponse
 *   data: todoData, // Reactive AxiosResponse.data
 *   isFinished: todoIsFinished,
 *   isLoading: todoIsLoading,
 *   isAborted: todoIsAborted,
 *   error: todoError,
 *   abort: todoAbort, // Method to abort the request
 * } = await success();
 *
 * // do something with data
 * console.log(todoData.value);
 * ```
 *
 * @see https://vueuse.org/integrations/useAxios/
 */
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
      success: r.then,
    };
  };
}

export default useApi;
