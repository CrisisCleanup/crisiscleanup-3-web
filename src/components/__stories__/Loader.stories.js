/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */
import Loader from '@/components/Loader';

export default {
  title: 'Layouts/Loader',
  component: Loader,
};

export const withDefaults = () => ({
  components: { Loader },
  template: `<Loader />`,
});

export const withCustomSpinner = () => ({
  components: { Loader },
  template: `
    <Loader>
      <template #element>
        <spinner color="red" message="Custom Loader"/>
      </template>
    </Loader>
  `,
});

export const withLayout = () => ({
  components: { Loader },
  data() {
    return {
      loading: true,
    };
  },
  template: `
    <Loader :loading="loading">
      <template #content>
        <div>
          <p>Finished loading!</p>
        </div>
      </template>
    </Loader>
  `,
  async mounted() {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.loading = !this.loading;
    }
  },
});
