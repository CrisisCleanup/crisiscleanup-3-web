<template>
  <div class="accordion">
    <div
      @click="() => toggleCard(card.key)"
      class="accordion__card"
      v-for="card in accordionCards"
      :key="card.key"
    >
      <slot :name="`${card.key}-title`">
        <base-text class="accordion__title" variant="h3">
          {{ card.title }}</base-text
        >
      </slot>
      <div
        :class="`accordion__body ${
          card.key === activeCard ? 'accordion__body--active' : ''
        }`"
      >
        <slot :name="card.key">
          {{ card.title }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
// @flow
import VueTypes from 'vue-types';
import _ from 'lodash';

export type AccordionCardT = {|
  title: string,
  key?: string,
|};

export default {
  name: 'Accordion',
  props: ({
    defaultCard: VueTypes.string.def(null),
    cards: VueTypes.arrayOf<AccordionCardT[]>(
      VueTypes.shape<AccordionCardT>({
        title: VueTypes.string.isRequired,
        key: VueTypes.string,
      }).isRequired,
    ),
  }: {
    defaultCard: string | null,
    cards: AccordionCardT[],
  }),
  data() {
    return {
      activeCard_: this.defaultCard ? this.defaultCard : null,
    };
  },
  methods: {
    toggleCard(key: string) {
      this.activeCard_ = key;
      this.$emit('update:active-card', key);
    },
  },
  computed: {
    activeCard() {
      return _.isNil(this.activeCard_)
        ? this.accordionCards[0].key
        : this.activeCard_;
    },
    accordionCards() {
      return this.cards.map(({ title, key }: AccordionCardT = {}) => ({
        title,
        key: _.defaultTo(key, _.kebabCase(title)),
      }));
    },
  },
};
</script>

<style scoped lang="scss">
.accordion {
  background-color: white;
  min-width: 20rem;

  &__title {
    text-transform: uppercase;
    letter-spacing: 0.15rem;
    padding: 1rem 1.5rem;
    background: theme('colors.crisiscleanup-grey.100');
    cursor: pointer;
    transition: 300ms ease;

    &:hover {
      background: theme('colors.crisiscleanup-dark.500');
      color: white;
    }
  }

  &__body {
    height: 0;
    transition: 300ms ease;
    opacity: 0;
    padding: -1rem -1.5rem -2rem -1.5rem;
    &--active {
      padding: 1rem 1.5rem 2rem 1.5rem;
      margin: 0;
      opacity: 1;
      height: auto;
    }
  }
}
</style>
