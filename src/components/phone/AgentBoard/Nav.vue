<template>
  <div class="nav">
    <div
      v-for="nav in routes"
      :class="`nav-item ${nav.key === activeKey ? 'active' : ''}`"
      @click="() => setActive(nav.key)"
      :key="`nav_${nav.key}`"
    >
      <base-text variant="h3" :weight="600">{{ lang[nav.key] }}</base-text>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'BoardNav',
  props: {
    activeKey: VueTypes.string,
    lang: VueTypes.objectOf(VueTypes.string),
    routes: VueTypes.arrayOf(
      VueTypes.shape({
        key: VueTypes.string,
      }),
    ),
  },
};
</script>

<style lang="scss">
.board {
  &--grid {
    .grid {
      &--nav {
        .nav {
          display: flex;
          flex-direction: row;
          @apply border-b-gray-400 #{!important};
          border-bottom: 3px solid;
          .nav-item {
            cursor: pointer;
            @apply py-4 px-6;
            position: relative;
            text-align: center;
            p {
              @apply text-crisiscleanup-dark-200;
            }
            &.active {
              p {
                @apply text-crisiscleanup-dark-500;
              }
              &:after {
                content: '';
                height: 3px;
                width: 100%;
                @apply bg-primary-light;
                position: absolute;
                bottom: -3px;
                left: 0;
              }
            }
          }
        }
      }
    }
  }
}
</style>
