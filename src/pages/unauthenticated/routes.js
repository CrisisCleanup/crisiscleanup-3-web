import EmbedMap from '@/pages/unauthenticated/EmbedMap.vue';
import InvitationSignup from './InvitationSignup.vue';
import PreliminaryAssessment from './PreliminaryAssessment.vue';
import PrintToken from './PrintToken.vue';
import Survivors from './Survivors.vue';
import ResetPassword from './ResetPassword.vue';
import PewPew from './PewPew.vue';
import DownForMaintenance from './DownForMaintenance.vue';

const routes = [
  {
    path: '/invitation_token/:token',
    component: InvitationSignup,
    name: 'nav.invitation_token',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/print_token/:token',
    component: PrintToken,
    name: 'nav.print_token',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/s/:token',
    component: Survivors,
    name: 'nav.survivors',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/assessment/:incident_id',
    component: PreliminaryAssessment,
    name: 'nav.assessment',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/map/embed/:incident_id',
    component: EmbedMap,
    name: 'nav.map_embed',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/password/reset/:token',
    component: ResetPassword,
    name: 'nav.reset_password',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/pew-pew',
    component: PewPew,
    name: 'nav.pew',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/live',
    component: PewPew,
    name: 'nav.pew',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/donate',
    redirect: () => {
      window.location.href = 'https://www.paypal.com/paypalme/crisiscleanup';
    },
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/maintenance',
    // component: () =>
    //   import(
    //     /* webpackChunkName: "down-for-maintenance" */ './DownForMaintenance.vue'
    //   ),
    component: DownForMaintenance,
    name: 'nav.site_maintenance',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
];

export default routes;
