import CaseFlag from '@/pages/CaseFlag';
import CaseForm from '@/pages/CaseForm';
import CaseHistory from '@/pages/CaseHistory';
import Cases from '@/pages/Cases';
import CaseView from '@/pages/CaseView';
import Dashboard from '@/pages/Dashboard';
import HomeRoutes from '@/pages/home/routes';
import Location from '@/pages/Location';
import NotFound from '@/pages/NotFound';
import Affiliates from '@/pages/organization/Affiliates';
import Organization from '@/pages/organization/Index';
import Invitations from '@/pages/organization/Invitations';
import Layers from '@/pages/organization/Layers';
import OrganizationProfile from '@/pages/organization/Profile';
import Users from '@/pages/organization/Users';
import UserView from '@/pages/organization/UserView';
import PhoneRoutes from '@/pages/phone/routes';
import AdminRoutes from '@/pages/admin/routes';
import Profile from '@/pages/Profile';
import unAuthedRoutes from '@/pages/unauthenticated/routes';
import store from '@/store/index';
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
Vue.use(VueCookies);

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
        children: [
          {
            path: ':user_id',
            component: UserView,
            name: 'nav.organization_users',
            meta: { id: 'user_detail' },
          },
        ],
      },
      {
        path: 'affiliates',
        component: Affiliates,
        name: 'nav.organization_affiliates',
      },
      {
        path: 'profile',
        component: OrganizationProfile,
        name: 'nav.organization_profile',
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
  ...PhoneRoutes,
  ...AdminRoutes,
  ...HomeRoutes,
  ...unAuthedRoutes,
  {
    path: '*',
    name: 'NotFound',
    component: NotFound,
    meta: { layout: 'unauthenticated', noAuth: true },
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.noAuth)) {
    next();
  } else if (to.matched.some((record) => record.meta.admin)) {
    if (!store.getters['auth/isAdmin']) {
      next({ name: 'nav.dashboard' });
      return;
    }
    next();
  } else {
    if (store.getters['auth/isLoggedIn']) {
      //Orphaned Users can't really login this will navigate to a public landing page once it is built
      if (store.getters['auth/isOrphan']) {
        next({ name: 'nav.login' });
        return;
      }

      next();
      return;
    }
    const loginpath = window.location.pathname;
    next({ name: 'nav.login', query: { from: loginpath } });
  }
});

export default router;
