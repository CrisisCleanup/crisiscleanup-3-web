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
import PhoneLegacyRoutes from '@/pages/phone_legacy/routes';
import AdminRoutes from '@/pages/admin/routes';
import Profile from '@/pages/Profile';
import unAuthedRoutes from '@/pages/unauthenticated/routes';
import store from '@/store/index';
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import VueRouter from 'vue-router';
import Reports from '@/pages/Reports';
import OtherOrganizations from '@/pages/OtherOrganizations';
import Teams from '@/pages/organization/Teams';
import TeamDetail from '@/pages/organization/TeamDetail';
import * as UITypes from '@/store/modules/ui/types';
import * as moment from 'moment';

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
    meta: { id: 'cases', layout: 'authenticated', noscroll: true },
    children: [
      {
        path: 'new',
        component: CaseForm,
        name: 'nav.new_case',
        meta: { id: 'case_new', noscroll: true },
      },
      {
        path: ':id',
        component: CaseView,
        name: 'nav.view_case',
        meta: { id: 'case_view', noscroll: true },
      },
      {
        path: ':id/edit',
        component: CaseForm,
        name: 'nav.edit_case',
        meta: { id: 'case_edit', noscroll: true },
      },
      {
        path: ':id/history',
        component: CaseHistory,
        name: 'nav.case_history',
        meta: { id: 'case_history', noscroll: true },
      },
      {
        path: ':id/flag',
        component: CaseFlag,
        name: 'nav.case_flag',
        meta: { id: 'case_flag', noscroll: true },
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
        path: 'teams',
        component: Teams,
        name: 'nav.organization_teams',
        children: [
          {
            path: ':team_id',
            component: TeamDetail,
            name: 'nav.organization_team_detail',
            meta: { id: 'team_detail' },
          },
        ],
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
    path: '/other_organizations',
    component: OtherOrganizations,
    name: 'nav.other_organizations',
    meta: { layout: 'authenticated' },
  },
  {
    path: '/locations/new',
    component: Location,
    name: 'nav.new_location',
    meta: { layout: 'authenticated' },
  },
  {
    path: '/Reports',
    component: Reports,
    name: 'nav.reports',
    meta: { layout: 'authenticated' },
  },
  {
    path: '/locations/:location_id/edit',
    component: Location,
    name: 'nav.edit_location',
    meta: { layout: 'authenticated' },
  },
  ...PhoneRoutes,
  ...PhoneLegacyRoutes,
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
  store.commit(`events/addEvent`, {
    event_key: 'user_ui-read_page',
    created_at: moment().toISOString(),
    attr: {
      api_endpoint: to.fullPath,
    },
  });

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
      // Orphaned Users can't really login this will navigate to a public landing page once it is built
      if (store.getters['auth/isOrphan']) {
        next({ name: 'nav.request_access', query: { orphan: true } });
        return;
      }
      if (to.matched.some((record) => record.meta.banner)) {
        const record = to.matched.find((r) => r.meta.banner);
        store.commit(`ui/${UITypes.SET_BANNER}`, record.meta.banner);
      } else {
        store.commit(`ui/${UITypes.SET_BANNER}`, { enabled: false });
      }
      next();
      return;
    }
    const loginpath = window.location.pathname;
    next({ name: 'nav.login', query: { from: loginpath } });
  }
});

function patchRouterMethod(r, methodName) {
  r[`old${methodName}`] = r[methodName];
  r[methodName] = async function (location) {
    return r[`old${methodName}`](location).catch((error) => {
      if (
        error.message.includes(
          'Avoided redundant navigation to current location',
        )
      ) {
        return this.currentRoute;
      }
      throw error;
    });
  };
}

patchRouterMethod(router, 'push');
patchRouterMethod(router, 'replace');

export default router;
