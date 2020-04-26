<template>
  <Card>
    <template #header>
      <div :class="`left tabs active-${currentIndex}`">
        <div
          v-for="(t, idx) in tabs"
          :class="`tab-item tab-${idx} ${t.key === currentTab ? 'active' : ''}`"
          :key="t.key"
          @click="() => (currentTab = t.key)"
        >
          <base-text variant="body" weight="700">
            {{ $t(t.title) }}
          </base-text>
        </div>
      </div>
    </template>
    <div
      class="flex flex-grow flex-col"
      v-for="t in tabs"
      v-show="t.key === currentTab"
      :key="t.key"
    >
      <slot :name="t.key" />
    </div>
  </Card>
</template>

<script>
import VueTypes from 'vue-types';
import Card from './Card.vue';

export default {
  name: 'TabbedCard',
  components: { Card },
  data() {
    return {
      currentTab: this.tabs[0].key,
    };
  },
  props: {
    tabs: VueTypes.arrayOf(
      VueTypes.shape({
        key: VueTypes.string,
        title: VueTypes.string,
        component: VueTypes.object,
      }),
    ),
  },
  computed: {
    currentIndex() {
      const tab = this.tabs.find((t) => t.key === this.currentTab);
      return this.tabs.indexOf(tab);
    },
  },
};
</script>

<style lang="scss" scoped>
@keyframes select {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

@for $i from 1 through 10 {
  .tabs.active-#{$i} {
    & .tab-item:first-child:after {
      left: 5.4rem * $i;
    }
  }
}

.tabs {
  display: flex;
  justify-content: flex-start;
  .tab-item {
    @apply pr-6 text-crisiscleanup-dark-200;
    position: relative;
    cursor: pointer;
    transition: color 250ms ease;
    &:first-child:after {
      content: '';
      @apply bg-primary-light;
      height: 4px;
      position: absolute;
      left: -1.5rem;
      bottom: calc(-1.5rem + 4px);
      width: 100%;
      transition: left 250ms ease, width 250ms ease, height 250ms ease;
      z-index: 99;
    }
    &:nth-child(n + 2) {
      @apply pl-6;
      &.active:after {
        left: 0;
        width: 100%;
      }
    }

    &.active {
      @apply text-crisiscleanup-dark-400;
      &:after {
        opacity: 1;
        width: calc(100% + 1.5em);
      }
    }
  }
}
</style>
