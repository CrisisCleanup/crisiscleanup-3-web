import BaseLink from '@/components/BaseLink';
import StoryRouter from 'storybook-vue-router';

export default {
  title: 'Basics|BaseLink',
  component: BaseLink,
  decorators: [StoryRouter()],
};

export const withDefaults = () => `<base-link>Link</base-link>`;

export const withTextVariant = () =>
  `<base-link textVariant="h1">H1 Link</base-link>`;

export const asAnchor = () =>
  `<base-link href="www.google.com">As Anchor</base-link>`;

export const asRouterLink = () =>
  `<base-link to="/">As router-link</base-link>`;
