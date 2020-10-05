<template>
  <transition name="slide-fade" appear>
    <div v-if="enabled" :class="`banner--container ${bannerType}`">
      <div class="banner--inner">
        <base-text variant="h2">
          {{ $t(text) }}
        </base-text>
        <component :is="component" />
        <ccu-icon
          @click.native="dismissBanner"
          :type="icons.cancel"
          :invert-color="true"
          size="sm"
          :alt="$t('actions.cancel')"
        />
      </div>
    </div>
  </transition>
</template>

<script>
import VueTypes from 'vue-types';
import { mapActions } from 'vuex';
import { IconsMixin } from '@/mixins';

export default {
  name: 'BannerOverlay',
  mixins: [IconsMixin],
  props: {
    type: VueTypes.oneOf(['ERROR', 'INFO', 'WARN', 'SUCCESS']),
    text: VueTypes.string.def('Banner Message'),
    component: VueTypes.any,
    enabled: VueTypes.bool.def(false),
  },
  computed: {
    bannerType() {
      return this.type.toLowerCase();
    },
  },
  methods: {
    ...mapActions('ui', ['dismissBanner']),
  },
};
</script>

<style scoped lang="scss">
$banner-colors: (
  'error': 'red.300',
  'info': 'dark-blue',
  'warn': 'yellow.900',
  'success': 'green.300',
);

.banner {
  &--container {
    @apply shadow;
    z-index: 9999;
    position: absolute;
    top: 0;
    height: 3rem;
    width: 100vw;
    display: flex;
    align-items: center;
    @each $state, $color in $banner-colors {
      &.#{$state} {
        background-color: theme('colors.crisiscleanup-#{$color}');
      }
    }
  }
  &--inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
    @apply px-12;

    img.ccu-icon {
      cursor: pointer;
    }

    p {
      @apply text-white;
    }
  }
}

.slide-fade {
  &-enter-active {
    transition: all 0.3s ease;
  }
  &-leave-active {
    transition: all 0.3s ease;
  }
  &-enter,
  &-leave-to {
    transform: translateY(-3rem);
    opacity: 0;
  }
}
</style>
