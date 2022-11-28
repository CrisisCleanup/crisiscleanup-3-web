import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "./pages/Dashboard.vue";
import HomeRoutes from "./pages/home/routes";
import { store } from "./store";
import moment from "moment";

const routes = [
  { path: "/", component: Dashboard, name: "Home" },
  ...HomeRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes, // short for `routes: routes`
});

router.beforeEach((to, from, next) => {
  store.commit(`events/addEvent`, {
    event_key: "user_ui-read_page",
    created_at: moment().toISOString(),
    attr: {
      api_endpoint: to.fullPath,
    },
  });

  if (to.matched.some((record) => record.meta.noAuth)) {
    next();
  } else if (to.matched.some((record) => record.meta.admin)) {
    if (!store.getters["auth/isAdmin"]) {
      next({ name: "nav.dashboard" });
      return;
    }
    next();
  } else {
    if (store.getters["auth/isLoggedIn"]) {
      // Orphaned Users can't really login this will navigate to a public landing page once it is built
      if (store.getters["auth/isOrphan"]) {
        next({ name: "nav.request_access", query: { orphan: true } });
        return;
      }
      if (store.getters["auth/isOrganizationInactive"]) {
        next({ name: "nav.login" });
        // $toasted.error(t('info.login_org_inactive'));
        return;
      }
      next();
      return;
    }
    const loginpath = window.location.pathname;
    next({ name: "nav.login", query: { from: loginpath } });
  }
});

export default router;
