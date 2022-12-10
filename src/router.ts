import { createRouter, createWebHistory } from 'vue-router';
import moment from 'moment';
import Dashboard from './pages/Dashboard.vue';
import Work from './pages/Work.vue';
import HomeRoutes from './pages/home/routes';
import PhoneRoutes from './pages/phone/routes';
import { store } from './store';
import AdminRoutes from './pages/admin/routes';

import Affiliates from '@/pages/organization/Affiliates.vue';
import Organization from '@/pages/organization/Index.vue';
import Invitations from '@/pages/organization/Invitations.vue';
import Layers from '@/pages/organization/Layers.vue';
import OrganizationProfile from '@/pages/organization/Profile.vue';
import Users from '@/pages/organization/Users.vue';
import UserView from '@/pages/organization/UserView.vue';
import Teams from '@/pages/organization/Teams.vue';
import TeamDetail from '@/pages/organization/TeamDetail.vue';

const routes = [
  { path: '/', component: Dashboard, name: 'Home' },
  {
    path: '/dashboard',
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
    path: '/incident/:incident_id/work',
    component: Work,
    name: 'nav.work',
    meta: { id: 'work', layout: 'authenticated', noscroll: true },
    children: [
      {
        path: ':id',
        name: 'nav.work_view_case',
        meta: { id: 'work_case_view', noscroll: true },
      },
      {
        path: ':id/edit',
        name: 'nav.work_edit_case',
        meta: { id: 'work_case_edit', noscroll: true },
      },
    ],
  },
  ...HomeRoutes,
  ...PhoneRoutes,
  ...AdminRoutes,
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
];

const router = createRouter({
  history: createWebHistory(),
  routes, // Short for `routes: routes`
});

router.beforeEach((to, from, next) => {
  store.commit('events/addEvent', {
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

      if (store.getters['auth/isOrganizationInactive']) {
        next({ name: 'nav.login' });
        // $toasted.error(t('info.login_org_inactive'));
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
