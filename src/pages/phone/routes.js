import PhoneNew from './PhoneNew.vue';

const routes = [
  {
    path: '/phone',
    component: PhoneNew,
    name: 'nav.phone',
    meta: {
      layout: 'authenticated',
    },
  },
];

export default routes;
