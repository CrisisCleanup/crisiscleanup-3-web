import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import Authenticated from './layouts/Authenticated.vue'

import HomeRoutes from './pages/home/routes'


const routes = [
    { path: '/', component: HelloWorld, name: 'Home' },
    { path: '/auth', component: Authenticated, name: 'About' },
    ...HomeRoutes,
]

const router = createRouter({
    history: createWebHistory(),
    routes, // short for `routes: routes`
})

export default router
