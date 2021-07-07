import AdminPage from '@/pages/admin/Index.vue';
import AdminDashboard from '@/pages/admin/AdminDashboard.vue';
import AdminOrganization from '@/pages/admin/AdminOrganization.vue';
import AdminEvents from '@/pages/admin/AdminEvents.vue';
import AdminEventStream from '@/components/AdminEventStream.vue';
import AdminTicketDashboard from '@/pages/admin/AdminTicketDashboard.vue';
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
        alias: '',
      },
      {
        path: 'organization/:organization_id',
        name: 'nav.admin_organization',
        component: AdminOrganization,
      },
      {
        path: 'events',
        name: 'nav.admin_events',
        component: AdminEvents,
      },
      {
        path: 'event_stream',
        name: 'nav.admin_event_stream',
        component: AdminEventStream,
      },
      {
        path: 'Tickets',
        name: 'nav.admin_ticket_dashboard',
        component: AdminTicketDashboard,
      },
    ],
  },
];

export default routes;
