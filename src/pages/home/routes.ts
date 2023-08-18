import Login from './Login.vue';
import RequestAccess from '@/pages/home/RequestAccess.vue';
import About from '@/pages/home/About.vue';
import Training from '@/pages/home/Training.vue';
import Survivor from '@/pages/home/Survivor.vue';
import Map from '@/pages/home/Map.vue';
import RequestPasswordReset from '@/pages/home/RequestPasswordReset.vue';
import Contributions from '@/pages/home/Contributions.vue';
import Privacy from '@/pages/home/Privacy.vue';
import Terms from '@/pages/home/Terms.vue';
import RegisterOrganization from '@/pages/home/RegisterOrganization.vue';
import PersistentInvitationSignup from "@/pages/home/PersistentInvitationSignup.vue";

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
    path: '/i/:token',
    component: PersistentInvitationSignup,
    name: 'nav.persistent_invitation_signup',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/about',
    component: About,
    name: 'nav.about',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/training',
    component: Training,
    name: 'nav.training',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/survivor',
    component: Survivor,
    name: 'nav.survivor',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/map',
    component: Map,
    name: 'nav.map',
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
    path: '/privacy',
    component: Privacy,
    name: 'nav.privacy',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/terms',
    component: Terms,
    name: 'nav.terms',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/register',
    component: RegisterOrganization,
    name: 'nav.register',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
];
