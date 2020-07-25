import TitledCard from '@/components/cards/TitledCard.vue';

export default {
  title: 'Elements|TitledCard',
  component: TitledCard,
};

export const withDefaults = () => ({
  components: { TitledCard },
  template: `
  <div class="flex flex-grow w-full h-full">
     <TitledCard :title="'Card Title'">
      <div class="flex flex-grow bg-white m-6">
          <p>Hi</p>
      </div>
    </TitledCard>
</div>
  `,
});
