import EmbedMap from '@/pages/unauthenticated/EmbedMap';
import InvitationSignup from './InvitationSignup.vue';
import PreliminaryAssessment from './PreliminaryAssessment.vue';
import PrintToken from './PrintToken.vue';
import ResetPassword from './ResetPassword';
import PewPew from './PewPew';

export default [
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
];
