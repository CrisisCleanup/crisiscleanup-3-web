import Badge from '@/components/Badge';

export default {
  title: 'Elements/Badge',
  component: Badge,
};

export const withDefaults = () => `<badge>15</badge>`;

export const withProps = () =>
  `<badge width="33px" height="33px" class="text-white bg-red-600">25</badge>`;
