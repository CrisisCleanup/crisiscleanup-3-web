import type { AxiosInstance } from 'axios';
import { inject } from 'vue';

export default () => {
  const axios = inject<AxiosInstance>('$axios');
  if (!axios) {
    throw new Error('$axios not found');
  }
  return {
    $http: axios,
  };
};
