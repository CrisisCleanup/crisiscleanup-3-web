import Loader from '@/components/Loader';

export default {
  title: 'Elements|Loader',
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
