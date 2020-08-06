import AdminPage from '@/pages/admin/Index.vue';
import AdminDashboard from '@/pages/admin/AdminDashboard.vue';
import AdminOrganization from '@/pages/admin/AdminOrganization.vue';
import AdminTools from '@/pages/admin/AdminTools.vue';

const routes = [
  {
    path: '/admin',
    component: AdminPage,
    name: 'nav.admin',
    meta: {
      layout: 'authenticated',
      admin: true,
    },
    children: [
      {
        path: 'home',
        name: 'nav.admin_dashboard',
        component: AdminDashboard,
      },
      {
        path: 'organization/:organization_id',
        name: 'nav.admin_organization',
        component: AdminOrganization,
      },
      {
        path: 'tools',
        name: 'nav.admin_tools',
        component: AdminTools,
      },
    ],
  },
];

export default routes;
