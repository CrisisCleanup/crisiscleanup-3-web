import Vue from 'vue'
import VueRouter from 'vue-router'
import Profile from "@/pages/Profile";
import Cases from "@/pages/Cases";
import Dashboard from "@/pages/Dashboard";
Vue.use(VueRouter);

const routes = [
    { path: '/dashboard', component: Dashboard, name: 'dashboard' },
    { path: '/profile', component: Profile, name: 'profile' },
    { path: '/cases', component: Cases, name: 'cases' },
];

const router = new VueRouter({
    routes
});

export default router
