import Accordion from '@/components/accordion/Accordion.vue';
import TitledCard from '@/components/cards/TitledCard.vue';

export default {
  title: 'Elements|Accordion',
  component: Accordion,
};

export const withDefaults = () => ({
  components: { Accordion },
  data() {
    return {
      cards: [
        { title: 'One' },
        { title: 'Two' },
        { title: 'Three' },
        { title: 'Four' },
      ],
    };
  },
  template: `<Accordion  :cards="cards" />`,
});

export const withCard = () => ({
  components: { Accordion, TitledCard },
  data() {
    return {
      cards: [{ title: 'One' }, { title: 'Two' }],
    };
  },
  template: `
    <TitledCard title="Example Accordion">
      <div class="m-16">
        <!-- override default card -->
        <Accordion defaultCard="two" :cards="cards" />
      </div>
    </TitledCard>
  `,
});

export const withComponents = () => ({
  components: { Accordion, TitledCard },
  data() {
    return {
      cards: [{ title: 'One' }, { title: 'Two' }],
    };
  },
  template: `
    <TitledCard title="Example with Components">
      <div class="m-16">
        <Accordion :cards="cards">
          <template #one-title>
            <base-text class="bg-blue-500 p-6">Custom Title Component</base-text>
          </template>
          <template #one>
            <base-text>I am a custom component</base-text>
          </template>
        </Accordion>
      </div>
    </TitledCard>
  `,
});
