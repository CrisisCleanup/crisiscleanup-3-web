<template>
  <div>
    <transition-group
      name="list"
      tag="div"
      class="stacked-cards overflow-hidden"
      ref="stackedCards"
    >
      <EventCard
        v-for="card in cards"
        :key="card.event.id"
        :current-event="card.event"
        class="stacked-card bg-opacity-25 border w-full h-auto rounded my-2 p-3"
        :class="{ [`bg-${getNearestColor(card.color).name}`]: true }"
        :style="{
          // backgroundColor: card.color,
          borderColor: card.strokeColor,
        }"
      ></EventCard>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import EventCard from '@/components/EventCard.vue';
import { getNearestColor } from '@/utils/colors';
import usei18n from '@/use/usei18n';

interface Event {
  past_tense_t: string;
  attr: Record<any, any>;
}

interface EventCardType {
  event: Event;
}

export default defineComponent({
  name: 'CardStack',
  components: { EventCard },
  setup() {
    const { $t } = usei18n();
    const cards = ref<EventCardType[]>([]);
    function clearCards() {
      cards.value = [];
    }
    function getTranslation(tag, attr) {
      const translated_attrs = Object.fromEntries(
        Object.entries(attr).map(([key, value]): [any, any] => [
          key,
          key.endsWith('_t') ? $t(value as string) : value,
        ]),
      );
      return $t(tag, translated_attrs);
    }
    function addCardComponent(card: EventCardType) {
      if (cards.value.length) {
        const currentCardText = getTranslation(
          card.event.past_tense_t,
          card.event.attr,
        );
        const previousCardText = getTranslation(
          cards.value[0].event.past_tense_t,
          cards.value[0].event.attr,
        );

        if (currentCardText === previousCardText) return;
      }
      cards.value.unshift(card);
    }
    return {
      cards,
      getNearestColor,
      addCardComponent,
      clearCards,
    };
  },
});
</script>

<style scoped lang="scss">
.list-move {
  transition: transform 1s;
}
</style>
