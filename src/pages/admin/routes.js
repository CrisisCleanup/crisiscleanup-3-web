import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrganization from '@/pages/admin/AdminOrganization';

const routes = [
  {
    path: '/admin',
    component: AdminDashboard,
    name: 'admin.nav',
    meta: {
      layout: 'authenticated',
      admin: true,
    },
  },
  {
    path: '/admin/organization/:organization_id',
    component: AdminOrganization,
    name: 'admin.organization',
    meta: {
      layout: 'authenticated',
      admin: true,
    },
  },
];

export default routes;
