import About from './About.vue';
import Login from './Login.vue';
import Map from './Map.vue';
import Privacy from './Privacy.vue';
import RegisterOrganization from './RegisterOrganization.vue';
import RequestAccess from './RequestAccess.vue';
import RequestPasswordReset from './RequestPasswordReset';
import Terms from './Terms.vue';
import Training from './Training.vue';
import Contributions from './Contributions.vue';
import Survivor from './Survivor.vue';

export default [
  {
    path: '/login',
    component: Login,
    name: 'nav.login',
    meta: { layout: 'unauthenticated', noAuth: true },
  },

  {
    path: '/request_access',
    component: RequestAccess,
    name: 'nav.request_access',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/register',
    component: RegisterOrganization,
    name: 'nav.register',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/terms',
    component: Terms,
    name: 'nav.terms',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/privacy',
    component: Privacy,
    name: 'nav.privacy',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/map',
    component: Map,
    name: 'nav.public_map',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/training',
    component: Training,
    name: 'nav.training',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/about',
    component: About,
    name: 'nav.about',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/password/new',
    component: RequestPasswordReset,
    name: 'nav.request_password_reset',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/contributions',
    component: Contributions,
    name: 'nav.contributions',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/survivor',
    component: Survivor,
    name: 'nav.survivor',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
];
