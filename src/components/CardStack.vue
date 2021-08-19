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

<script>
import EventCard from '@/components/EventCard';
import { getNearestColor } from '@/utils/colors';
export default {
  name: 'CardStack',
  components: { EventCard },
  data() {
    return {
      cards: [],
      getNearestColor,
    };
  },
  methods: {
    addCardComponent(card) {
      this.cards.unshift(card);
    },
    clearCards() {
      this.cards = [];
    },
  },
};
</script>

<style scoped lang="scss">
.list-move {
  transition: transform 1s;
}
</style>
