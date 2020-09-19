import TitledCard from '@/components/cards/TitledCard.vue';

export default {
  title: 'Elements/Cards/TitledCard',
  component: TitledCard,
  args: {
    title: 'Card Title',
    loading: false,
    dropdown: null,
  },
};

export const Basic = (args, { argTypes }) => ({
  components: { TitledCard },
  props: Object.keys(argTypes),
  template: `
  <div class="flex flex-grow w-full h-full">
     <TitledCard :title="title" :loading="loading" :dropdown="dropdown">
        <div class="div h-full w-full m-24">
          <p>Some content goes here</p>
        </div>
    </TitledCard>
</div>
  `,
});

export const WithDropdown = Basic.bind({});
WithDropdown.args = {
  title: 'With Dropdown',
  dropdown: {
    label: 'name',
    itemKey: 'name',
    value: 'One',
    placeholder: 'One',
    options: [
      {
        name: 'One',
      },
      {
        name: 'Two',
      },
    ],
  },
};
