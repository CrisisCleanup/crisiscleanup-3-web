import { inject } from 'vue';
import PhoneService from '@/services/phone.service';

export default () => {
  const phoneService = inject<PhoneService>('$phoneService');
  if (!phoneService) {
    throw new Error('PhoneService not found');
  }
  return {
    $phoneService: phoneService,
  };
};
