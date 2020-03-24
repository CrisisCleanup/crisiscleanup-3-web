import PhoneLayout from './Index.vue';

const routes = [
  {
    path: '/phone',
    component: PhoneLayout,
    name: 'nav.phone',
    meta: {
      layout: 'authenticated',
    },
  },
];

export default routes;
