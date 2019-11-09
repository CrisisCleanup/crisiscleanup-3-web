import Vue from 'vue'
import VueRouter from 'vue-router'
import Profile from "@/pages/Profile";
import Cases from "@/pages/Cases";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import store from '@/store/index';

Vue.use(VueRouter);

const routes = [
    {
        path: '/dashboard',
        component: Dashboard,
        name: 'dashboard',
        meta: { layout: "authenticated" }
    },
    {
        path: '/profile',
        component: Profile, name: 'profile',
        meta: { layout: "authenticated" }
    },
    {
        path: '/cases',
        component: Cases,
        name: 'cases',
        meta: { layout: "authenticated" }
    },
    {
        path: '/login',
        component: Login,
        name: 'login',
        meta: { layout: "unauthenticated", noAuth: true }
    },
];

const router = new VueRouter({
    routes
});

router.beforeEach((to, from, next) => {
    if(to.matched.some(record => record.meta.noAuth)) {
        next();
    } else {
        if (store.getters['auth/isLoggedIn']) {
            next();
            return
        }
        next('/login')
    }
});

export default router
