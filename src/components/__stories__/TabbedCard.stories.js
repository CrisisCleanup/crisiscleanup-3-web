import TabbedCard from '@/components/cards/TabbedCard.vue';
import StoryRouter from 'storybook-vue-router';

export default {
  title: 'Elements/Cards/TabbedCard',
  component: TabbedCard,
  decorators: [StoryRouter()],
  args: {
    tabs: [
      {
        key: 'first',
      },
      {
        key: 'another',
        title: 'Another Page',
      },
      {
        key: 'three',
        title: 'A Third Tab For You',
      },
      {
        key: 'four',
        title: 'Last Tab',
      },
    ],
  },
};

export const Basic = (args, { argTypes }) => ({
  components: { TabbedCard },
  props: Object.keys(argTypes),
  template: `
  <div class="flex flex-grow w-full h-full">
     <TabbedCard :tabs="tabs">
       <template #first>
         <div class="m-12">
           <p>Tab Page One</p>
         </div>
       </template>
       <template #another>
         <div class="m-12">
           <p>Tab Page Two</p>
         </div>
       </template>
       <template #three>
         <div class="m-12">
           <p>A Third Tab</p>
         </div>
       </template>
       <template #four>
         <div class="m-12">
           <p>A Final Larger Tab</p>
         </div>
       </template>
     </TabbedCard>
</div>
  `,
});
