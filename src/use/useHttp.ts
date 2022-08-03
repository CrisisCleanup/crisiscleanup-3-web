import type { AxiosInstance } from 'axios';
import { inject } from 'vue';

export default () => {
  const axios = inject<AxiosInstance>('axios');
  return {
    $http: axios as AxiosInstance,
  };
};
