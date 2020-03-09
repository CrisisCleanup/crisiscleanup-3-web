import NotFoundPage from '@/pages/NotFound';

export default {
  title: 'Pages|NotFound',
  component: NotFoundPage,
};

export const withDefaults = () => ({
  components: { NotFoundPage },
  template: `<NotFoundPage />`,
});
