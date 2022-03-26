import PhoneSystem from './PhoneSystem.vue';

const routes = [
  {
    path: '/phone',
    component: PhoneSystem,
    name: 'nav.phone',
    meta: {
      layout: 'authenticated',
    },
  },
];

export default routes;
