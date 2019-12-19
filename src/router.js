import Vue from 'vue'
import VueRouter from 'vue-router'
import Profile from "@/pages/Profile";
import Cases from "@/pages/Cases";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import store from '@/store/index';
import Organization from "@/pages/organization/Index";
import Invitations from "@/pages/organization/Invitations";
import Users from "@/pages/organization/Users";
import Layers from "@/pages/organization/Layers";
import InvitationSignup from "@/pages/unauthenticated/InvitationSignup";
import CaseView from "@/pages/CaseView";
import CaseForm from "@/components/CaseForm";
import CaseHistory from "@/components/CaseHistory";

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        component: Dashboard,
        name: 'Home',
        meta: { layout: "authenticated" }
    },
    {
        path: '/incident/:incident_id/dashboard',
        component: Dashboard,
        name: 'Dashboard',
        meta: { layout: "authenticated" }
    },
    {
        path: '/profile',
        component: Profile, name: 'Profile',
        meta: { layout: "authenticated" }
    },
    {
        path: '/incident/:incident_id/cases',
        component: Cases,
        name: 'Cases',
        meta: { layout: "authenticated" },
        children: [{
            path: 'new',
            component: CaseForm,
            name: 'IncidentNewForm',
        },{
            path: ':id',
            component: CaseView,
            name: 'IncidentCaseView',
        },{
            path: ':id/edit',
            component: CaseForm,
            name: 'IncidentEditForm',
        },{
            path: ':id/history',
            component: CaseHistory,
            name: 'IncidentCaseHistory',
        }],
    },
    {
        path: '/organization',
        component: Organization,
        name: 'Organization',
        children: [{
            path: '',
            component: Invitations,
            name: 'Invitations',
        },{
            path: 'invitations',
            component: Invitations,
            name: 'Invitations',
        },{
            path: 'users',
            component: Users,
            name: 'Users',
        },{
            path: 'layers',
            component: Layers,
            name: 'Layers',
        }],
        meta: {layout: "authenticated"}
    },
    {
        path: '/login',
        component: Login,
        name: 'login',
        meta: { layout: "unauthenticated", noAuth: true }
    },
    {
        path: '/invitation_token/:token',
        component: InvitationSignup,
        name: 'invitation_token',
        meta: { layout: "unauthenticated", noAuth: true }
    },
];

const router = new VueRouter({
    mode: 'history',
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
