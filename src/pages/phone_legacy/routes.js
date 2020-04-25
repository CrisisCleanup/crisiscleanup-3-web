import Index from '@/pages/phone_legacy/Index';
import ConnectFirstIntegration from '@/pages/phone_legacy/ConnectFirstIntegration';

const routes = [
  {
    path: '/caller',
    component: Index,
    name: 'nav.caller',
    meta: {
      id: 'caller',
      layout: 'authenticated',
      can: 'phone_agent',
      fail: '$from',
    },
  },
  {
    path: '/connect_first',
    component: ConnectFirstIntegration,
    name: 'nav.connect_first',
    meta: {
      id: 'connect_first',
      layout: 'authenticated',
      can: 'phone_agent',
      fail: '$from',
    },
  },
];

export default routes;
