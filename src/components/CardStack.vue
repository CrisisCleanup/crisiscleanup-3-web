<template>
  <div>
    <transition-group
      name="list"
      tag="div"
      class="stacked-cards h-72 overflow-hidden"
      ref="stackedCards"
    >
      <EventCard
        v-for="card in cards"
        :key="card.event.id"
        :current-event="card.event"
        class="stacked-card bg-opacity-25 border w-full h-auto rounded my-2 p-3"
        :class="`bg-${getNearestColor(card.color).name}`"
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
  },
};
</script>

<style scoped lang="scss">
.list-move {
  transition: transform 1s;
}
// After this number, the cards aren't visible
//$maxCards: 10;
//
//.stacked-card {
//  transform-origin: 50% 0;
//  transform: perspective(100px) translateY(75px) scale(0.9) rotateX(-10deg);
//  opacity: 0;
//
//  transition: all 0.4s ease, max-height 0.75s ease;
//
//  &--added {
//    transform: translateY(0px) scale(1);
//    opacity: 1;
//  }
//
//  @for $i from 1 through $maxCards {
//    &:nth-last-of-type(#{$i + 1}) {
//      transform: translate3d(0, #{-$i * 10px}, #{-$i * 32px});
//      opacity: #{1 - (($i - 1) * 0.15)};
//
//      &:hover {
//        transform: translate3d(
//          0,
//          calc(-100% - #{($i - 1) * 10px}),
//          #{-$i * 32px}
//        );
//      }
//    }
//  }
//
//  &:nth-last-of-type(n + #{$maxCards}) {
//    display: none;
//  }
//
//  &:nth-last-of-type(n + 2) {
//    position: absolute;
//    //max-height: 100px;
//    overflow: hidden;
//
//    &:hover {
//      opacity: 1;
//      transition-delay: 0.333s;
//    }
//  }
//}
//
//.stacked-cards {
//  margin-top: 120px;
//  perspective: 1000px;
//  position: relative;
//}
</style>
