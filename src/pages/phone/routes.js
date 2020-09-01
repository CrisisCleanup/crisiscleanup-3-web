import PhoneDashboard from '@/pages/phone/Dashboard.vue';
import PhoneController from '@/pages/phone/Controller.vue';
import PhoneLayout from './Index.vue';

const routes = [
  {
    path: '/phone',
    component: PhoneLayout,
    name: 'nav.phone',
    meta: {
      layout: 'authenticated',
      can: 'phone_agent',
      fail: '$from',
    },
  },
];

export default routes;
