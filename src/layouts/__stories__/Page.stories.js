import Page from '@/layouts/page/Page.vue';
import StoryRouter from 'storybook-vue-router';

const Tab = (val) => ({
  template: `<div>${val}</div>`,
});

export default {
  title: 'Layouts|Page',
  component: Page,
  decorators: [
    StoryRouter(
      {},
      {
        routes: [
          {
            path: '/',
            component: Tab('One'),
            name: 'nav.some_tab',
          },
          {
            path: '/two',
            component: Tab('Two'),
            name: 'nav.another_tab',
          },
          {
            path: '/three',
            component: Tab('Two'),
            name: 'nav.three',
          },
          {
            path: '/two',
            component: Tab('Two'),
            name: 'nav.four',
          },
        ],
      },
    ),
  ],
};

export const withDefaults = () => ({
  components: { Page },
  template: `
    <Page>
      <h1>Hi</h1>
    </Page>
  `,
});

export const withTabs = () => ({
  components: { Page },
  data() {
    return {
      tabs: [
        {
          key: 'nav.some_tab',
          title: 'One',
        },
        {
          key: 'nav.another_tab',
          title: 'Two',
        },
        {
          key: 'nav.three',
          title: 'Really Long Title Tab',
        },
        {
          key: 'nav.four',
          title: 'Average Size',
        },
      ],
    };
  },
  template: `
    <Page :tabs="tabs" />
  `,
});
