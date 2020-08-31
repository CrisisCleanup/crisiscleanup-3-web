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
    children: [
      {
        path: '',
        name: 'nav.phone_dashboard',
        component: PhoneDashboard,
      },
      {
        path: '',
        name: 'nav.phone_controller',
        components: PhoneController,
      },
    ],
  },
];

export default routes;
