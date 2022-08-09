import NotFoundPage from '@/pages/NotFound.vue';

export default {
  title: 'Pages/NotFound',
  component: NotFoundPage,
};

export const withDefaults = () => ({
  components: { NotFoundPage },
  template: `<NotFoundPage />`,
});
