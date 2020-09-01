import TitledCard from '@/components/cards/TitledCard.vue';

export default {
  title: 'Elements/Cards/TitledCard',
  component: TitledCard,
  args: {
    title: 'Card Title',
    loading: false,
  },
};

export const Basic = (args, { argTypes }) => ({
  components: { TitledCard },
  props: Object.keys(argTypes),
  template: `
  <div class="flex flex-grow w-full h-full">
     <TitledCard :title="title" :loading="loading">
      <div class="flex flex-grow bg-white m-6 h-full w-full">
        <div class="div h-full w-full m-12">
          <p>Some content goes here</p>
        </div>
      </div>
    </TitledCard>
</div>
  `,
});
