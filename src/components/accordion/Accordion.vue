<template>
  <div class="accordion">
    <div
      @click="() => toggleCard(card.key)"
      class="accordion__card"
      v-for="card in accordionCards"
      :key="card.key"
    >
      <slot :name="`${card.key}-title`">
        <ccu-icon
          with-text
          fa
          size="sm"
          type="chevron-down"
          :alt="$t('actions.show_details')"
          :ref="`icon-${card.key}`"
          class="primary-dark"
          :class="[
            'accordion__title',
            {
              'accordion__title--active':
                highlightActive && card.key === activeCard,
            },
          ]"
          variant="h3"
        >
          <base-text variant="h3" class="crisiscleanup-dark-400">
            {{ card.title }}
          </base-text>
        </ccu-icon>
      </slot>
      <div
        :class="[
          { 'accordion__body--active': card.key === activeCard },
          'accordion__body',
        ]"
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
import { theme } from '@/../tailwind.config';
import _ from 'lodash';

export type AccordionCardT = {|
  title: string,
  key?: string,
|};

export default {
  name: 'Accordion',
  props: ({
    /** Keep the active card highlighted. */
    highlightActive: VueTypes.bool,
    /** Set default card to be open by key. */
    defaultCard: VueTypes.string.def(null),
    /** Card definitions. */
    cards: VueTypes.arrayOf<AccordionCardT[]>(
      VueTypes.shape<AccordionCardT>({
        title: VueTypes.string.isRequired,
        key: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
      }).isRequired,
    ),
  }: {
    highlightActive: boolean,
    defaultCard: string | null,
    cards: AccordionCardT[],
  }),
  data() {
    return {
      activeCard_: this.defaultCard ? this.defaultCard : null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.cards.map((c) => {
        const compRef = this.$refs[`icon-${c.key}`];
        if (compRef) {
          const svgRef = compRef[0].$el.firstChild;
          svgRef.firstChild.style.fill = theme.extend.colors.primary.dark;
          return svgRef;
        }
        return null;
      });
    });
  },
  methods: {
    toggleCard(key: string) {
      this.activeCard_ = key;
      this.$emit('update:active-card', key);
    },
    getIndicatorStyle(key) {
      const pos = key === this.activeCard ? '90px' : '0px';
      return {
        transform: `rotate(${pos})`,
      };
    },
    animateIndicator(svgRef, direction) {
      const animParams = [
        [{ transform: 'rotate(180deg)' }, { transform: 'rotate(0deg)' }],
        {
          duration: 200,
          fill: 'forwards',
          direction,
        },
      ];
      svgRef.animate(...animParams);
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
  watch: {
    activeCard(newKey, oldKey) {
      const newCard: HTMLElement = this.$refs[`icon-${newKey}`][0].$el;
      const oldCard: HTMLElement = this.$refs[`icon-${oldKey}`][0].$el;
      this.$log.debug('new card:', newCard, oldCard);
      this.animateIndicator(newCard.firstChild, 'normal');
      this.animateIndicator(oldCard.firstChild, 'reverse');
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
    background: theme('colors.crisiscleanup-light-smoke');
    cursor: pointer;
    transition: 300ms ease;

    div > svg {
      color: theme('colors.primary.dark');
    }

    &:hover {
      background: theme('colors.crisiscleanup-grey.100');
      color: white;
    }
  }

  &__body {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height 450ms ease-in-out, opacity 200ms ease,
      padding 250ms ease;
    &--active {
      padding: 1rem 1.5rem 2rem 1.5rem;
      opacity: 1;
      max-height: 100rem;
    }
  }
}
</style>
