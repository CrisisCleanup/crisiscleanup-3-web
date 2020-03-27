import InvitationSignup from './InvitationSignup.vue';
import PreliminaryAssessment from './PreliminaryAssessment.vue';
import PrintToken from './PrintToken.vue';

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
];
