import AdminDashboard from '@/pages/admin/AdminDashboard.vue';
import AdminOrganization from '@/pages/admin/AdminOrganization.vue';
import AdminTools from '@/pages/admin/AdminTools.vue';

const routes = [
  {
    path: '/admin',
    component: AdminDashboard,
    name: 'nav.admin',
    meta: {
      layout: 'authenticated',
      admin: true,
    },
  },
  {
    path: '/admin/organization/:organization_id',
    component: AdminOrganization,
    name: 'nav.admin_organization',
    meta: {
      layout: 'authenticated',
      admin: true,
    },
  },
  {
    path: '/admin/tools',
    component: AdminTools,
    name: 'nav.admin_tools',
    meta: {
      layout: 'authenticated',
      admin: true,
    },
  },
];

export default routes;
