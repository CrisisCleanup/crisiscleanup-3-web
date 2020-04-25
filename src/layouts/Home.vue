<template>
  <div class="homegrid grid-container">
    <slot name="grid-overlay" />
    <slot name="grid-logo">
      <div class="grid--logo logo my-8">
        <img src="@/assets/ccu-logo-black-500w.png" alt="Crisis Cleanup" />
      </div>
    </slot>
    <slot name="grid-survivors">
      <div class="grid--survivors">
        <div class="homegrid-survivors">
          <base-text font="display" variant="h1">{{ lang.survive }}</base-text>
          <base-text font="display" variant="h2">
            <span v-html="$t('homeVue.phone_or_website')"></span>
          </base-text>
        </div>
      </div>
    </slot>
    <slot name="grid-content" />
  </div>
</template>

<script>
import SideNav from '@/components/home/SideNav.vue';
import Footer from '@/components/home/Footer.vue';
import Actions from '@/components/home/Actions.vue';

export const HomeNav = SideNav;
export const HomeFooter = Footer;
export const HomeActions = Actions;

export default {
  name: 'HomeLayout',
  data() {
    return {
      lang: {
        survive: this.$t('homeVue.survivors_call'),
      },
    };
  },
};
</script>

<style scoped lang="scss">
$areas: main nav logo actions overlay survivors globe footer;

.homegrid {
  &.grid-container {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 20% auto;
    grid-template-areas:
      'logo . . . . survivors'
      'nav . main main main main'
      'nav . main main main main'
      'actions actions main main main main';

    @apply w-full h-full;
    margin-left: auto;
    margin-right: auto;

    .grid {
      @each $area in $areas {
        &--#{$area} {
          grid-area: $area;
        }
      }

      &--logo.logo {
        max-width: 200px;
        margin-left: 2.8rem;
      }

      &--overlay {
        grid-row: 1 / span 4;
        grid-column: 1 / span 3;
      }

      &--survivors {
        @apply mx-6 my-4;
      }

      &--actions {
        button {
          @apply text-h1;
        }
        display: inline-grid;
        margin-left: 2.8rem;
        align-content: center;
        letter-spacing: 0.35px;
        justify-content: start;
        grid-gap: 1rem;
      }
    }

    .homegrid {
      &-backdrop {
        @apply bg-crisiscleanup-light-grey;
      }
      &-survivors {
        @apply bg-crisiscleanup-yellow-700 my-4 text-center p-4;
        min-width: 205px;

        p {
          letter-spacing: 0.35px;
          &:first-child {
            font-weight: 700;
            @apply text-2xl;
          }
          &:last-child {
            font-weight: 600;
          }
        }
      }
    }
  }
}
</style>
