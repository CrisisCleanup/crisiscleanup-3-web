<template>
  <div>
    <transition-group
      ref="stackedCards"
      name="list"
      tag="div"
      class="stacked-cards overflow-hidden"
    >
      <EventCard
        v-for="card in cards"
        :key="card.event.id"
        :current-event="card.event"
        class="stacked-card bg-opacity-25 border w-full h-auto rounded my-2 p-3"
        :style="{
          backgroundColor: hexToRgba(card.color, 0.25),
          borderColor: card.strokeColor,
        }"
      ></EventCard>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import hexToRgba from 'hex-to-rgba';
import EventCard from '@/components/live/EventCard.vue';

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
    const { t } = useI18n();
    const $t = (text, attrs) => {
      return text ? t(text, attrs) : null;
    };
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
      if (cards.value.length > 0) {
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

    watch(
      () => cards.value.length,
      (value) => {
        if (value > 10) {
          cards.value = cards.value.slice(0, 10);
        }
      },
    );
    return {
      cards,
      addCardComponent,
      clearCards,
      hexToRgba,
    };
  },
});
</script>

<style scoped lang="scss">
.list-move {
  transition: transform 1s;
}
</style>
