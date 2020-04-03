import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrganization from '@/pages/admin/AdminOrganization';

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
];

export default routes;
