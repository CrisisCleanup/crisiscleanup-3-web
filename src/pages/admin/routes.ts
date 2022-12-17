import AdminPage from './Index.vue';
import AdminCms from './AdminCms.vue';
// import AdminDashboard from '@/pages/admin/AdminDashboard.vue';
// import AdminOrganization from '@/pages/admin/AdminOrganization.vue';
// import AdminEvents from '@/pages/admin/AdminEvents.vue';
// import AdminEventStream from '@/components/AdminEventStream.vue';
// import AdminTicketDashboard from '@/pages/admin/AdminTicketDashboard.vue';
// import AdminCosts from '@/pages/admin/AdminCosts.vue';
// import AdminCms from '@/pages/admin/AdminCms';
// import AdminIncidentWizard from '@/pages/admin/AdminIncidentWizard';
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
      // {
      //   path: 'home',
      //   name: 'nav.admin_dashboard',
      //   component: AdminDashboard,
      //   alias: '',
      // },
      // {
      //   path: 'organization/:organization_id',
      //   name: 'nav.admin_organization',
      //   component: AdminOrganization,
      // },
      // {
      //   path: 'events',
      //   name: 'nav.admin_events',
      //   component: AdminEvents,
      // },
      // {
      //   path: 'event_stream',
      //   name: 'nav.admin_event_stream',
      //   component: AdminEventStream,
      // },
      // {
      //   path: 'Tickets',
      //   name: 'nav.admin_ticket_dashboard',
      //   component: AdminTicketDashboard,
      // },
      // {
      //   path: 'costs',
      //   name: 'nav.costs',
      //   component: AdminCosts,
      // },
      {
        path: 'cms',
        name: 'nav.cms',
        component: AdminCms,
      },
      // {
      //   path: 'incident_wizard',
      //   name: 'nav.incident_wizard',
      //   component: AdminIncidentWizard,
      // },
      // {
      //   path: 'incident_wizard/:incident_id',
      //   name: 'nav.incident_wizard_detail',
      //   component: AdminIncidentWizard,
      // },
    ],
  },
];

export default routes;
