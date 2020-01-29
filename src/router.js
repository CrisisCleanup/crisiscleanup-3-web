import Vue from 'vue';
import VueRouter from 'vue-router';
import Profile from '@/pages/Profile';
import Cases from '@/pages/Cases';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import store from '@/store/index';
import Organization from '@/pages/organization/Index';
import Invitations from '@/pages/organization/Invitations';
import Users from '@/pages/organization/Users';
import Layers from '@/pages/organization/Layers';
import InvitationSignup from '@/pages/unauthenticated/InvitationSignup';
import CaseView from '@/pages/CaseView';
import CaseForm from '@/pages/CaseForm';
import CaseHistory from '@/pages/CaseHistory';
import CaseFlag from '@/pages/CaseFlag';
import Location from '@/pages/Location';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: Dashboard,
    name: 'nav.dashboard',
    meta: { layout: 'authenticated' },
  },
  {
    path: '/incident/:incident_id/dashboard',
    component: Dashboard,
    name: 'nav.dashboard',
    meta: { layout: 'authenticated' },
  },
  {
    path: '/profile',
    component: Profile,
    name: 'nav.profile',
    meta: { layout: 'authenticated' },
  },
  {
    path: '/incident/:incident_id/cases',
    component: Cases,
    name: 'nav.cases',
    meta: { layout: 'authenticated' },
    children: [
      {
        path: 'new',
        component: CaseForm,
        name: 'nav.new_case',
        meta: { id: 'case_new' },
      },
      {
        path: ':id',
        component: CaseView,
        name: 'nav.view_case',
        meta: { id: 'case_view' },
      },
      {
        path: ':id/edit',
        component: CaseForm,
        name: 'nav.edit_case',
        meta: { id: 'case_edit' },
      },
      {
        path: ':id/history',
        component: CaseHistory,
        name: 'nav.case_history',
        meta: { id: 'case_history' },
      },
      {
        path: ':id/flag',
        component: CaseFlag,
        name: 'nav.case_flag',
        meta: { id: 'case_flag' },
      },
    ],
  },
  {
    path: '/organization',
    component: Organization,
    name: 'nav.organization',
    children: [
      {
        path: '',
        component: Invitations,
        name: 'nav.organization_invitations',
        meta: { id: 'invitations' },
      },
      {
        path: 'invitations',
        component: Invitations,
        name: 'nav.organization_invitations',
        meta: { id: 'invitations' },
      },
      {
        path: 'users',
        component: Users,
        name: 'nav.organization_users',
      },
      {
        path: 'layers',
        component: Layers,
        name: 'nav.organization_layers',
      },
    ],
    meta: { layout: 'authenticated' },
  },
  {
    path: '/locations/new',
    component: Location,
    name: 'nav.new_location',
    meta: { layout: 'authenticated' },
  },
  {
    path: '/locations/:location_id/edit',
    component: Location,
    name: 'nav.edit_location',
    meta: { layout: 'authenticated' },
  },
  {
    path: '/login',
    component: Login,
    name: 'nav.login',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/invitation_token/:token',
    component: InvitationSignup,
    name: 'nav.invitation_token',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.noAuth)) {
    next();
  } else {
    if (store.getters['auth/isLoggedIn']) {
      next();
      return;
    }
    const loginpath = window.location.pathname;
    next({ name: 'login', query: { from: loginpath } });
  }
});

export default router;
