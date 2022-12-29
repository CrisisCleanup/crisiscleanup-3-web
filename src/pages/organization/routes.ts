import { h } from 'vue';
import Affiliates from '@/pages/organization/Affiliates.vue';
import Organization from '@/pages/organization/Index.vue';
import Invitations from '@/pages/organization/Invitations.vue';
// Import Layers from '@/pages/organization/Layers.vue';
// import OrganizationProfile from '@/pages/organization/Profile.vue';
import Users from '@/pages/organization/Users.vue';
import UserView from '@/pages/organization/UserView.vue';
// Import Teams from '@/pages/organization/Teams.vue';
// import TeamDetail from '@/pages/organization/TeamDetail.vue';

const mockComponent = (title: string, content: string) => ({
  name: title,
  render: () =>
    h('div', { class: 'mock-component' }, [h('h1', title), h('p', content)]),
});
export const routes = [
  {
    path: '/organization',
    component: Organization,
    name: 'nav.organization',
    children: [
      {
        path: '',
        component: Invitations,
        name: 'nav.organization_invitations',
        meta: { id: 'invitations' },
      },
      {
        path: 'invitations',
        component: Invitations,
        name: 'nav.organization_invitations',
        meta: { id: 'invitations' },
      },
      {
        path: 'users',
        component: Users,
        name: 'nav.organization_users',
        children: [
          {
            path: ':user_id',
            component: UserView,
            name: 'nav.organization_users',
            meta: { id: 'user_detail' },
          },
        ],
      },
      {
        path: 'affiliates',
        component: Affiliates,
        name: 'nav.organization_affiliates',
        meta: { id: 'affiliates' },
      },
      {
        path: 'profile',
        // Component: OrganizationProfile,
        component: mockComponent('OrganizationProfile', 'OrganizationProfile'),
        name: 'nav.organization_profile',
      },
      {
        path: 'teams',
        // Component: Teams,
        component: mockComponent('Teams', 'Teams'),
        name: 'nav.organization_teams',
        children: [
          {
            path: ':team_id',
            // Component: TeamDetail,
            component: mockComponent('TeamDetail', 'TeamDetail'),
            name: 'nav.organization_team_detail',
            meta: { id: 'team_detail' },
          },
        ],
      },
      {
        path: 'layers',
        // Component: Layers,
        component: mockComponent('Layers', 'Layers'),
        name: 'nav.organization_layers',
      },
    ],
    meta: { layout: 'authenticated' },
  },
];

export default routes;
