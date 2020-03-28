import * as SSO from '@/services/sso.service';
import store from '@/store/index';
import Vue from 'vue';
import Login from './Login.vue';
import Map from './Map.vue';
import Privacy from './Privacy.vue';
import RegisterOrganization from './RegisterOrganization.vue';
import RequestAccess from './RequestAccess.vue';
import Terms from './Terms.vue';
import Training from './Training.vue';
import RequestPasswordReset from './RequestPasswordReset';

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
    name: 'nav.privacy',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/training',
    component: Training,
    name: 'nav.training',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
  {
    path: '/sp/login',
    name: 'SSOLogin',
    beforeEnter: async (to, from, next) => {
      if (store.getters['auth/isLoggedIn']) {
        const creds = await SSO.authenticate();
        // Store AWS Connect Auth Cookies
        Vue.$cookies.set(
          'lily-auth-prod-iad',
          creds.AccessToken,
          '/',
          creds.AccessTokenExpiration,
          'crisiscleanup3.awsapps.com',
          true,
        );
        Vue.$cookies.set(
          'lily-auth-refresh-prod-iad',
          creds.RefreshToken,
          '/connect/auth',
          creds.RefreshTokenExpiration,
          'crisiscleanup3.awsapps.com',
          true,
        );
      }
      next({ name: 'nav.dashboard' });
    },
  },
  {
    path: '/password/new',
    component: RequestPasswordReset,
    name: 'nav.request_password_reset',
    meta: { layout: 'unauthenticated', noAuth: true },
  },
];
