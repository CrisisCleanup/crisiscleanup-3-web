<template>
  <div class="homegrid grid-container">
    <slot name="grid-overlay" />
    <slot name="grid-logo">
      <div class="grid--logo logo my-8">
        <img src="@/assets/ccu-logo-black-500w.png" alt="CrisisCleanup" />
      </div>
    </slot>
    <slot name="grid-survivors">
      <div class="grid--survivors">
        <div class="homegrid-survivors">
          <base-text font="display" variant="h1">Survivors Call</base-text>
          <base-text font="display" variant="h2">1 (800) 451 1954</base-text>
        </div>
      </div>
    </slot>
    <slot name="grid-content" />
  </div>
</template>

<script>
export default {
  name: 'HomeLayout',
  data() {
    return {
      /**
       * @todo HomeLayout Translations
       * @body Translate text in HomeLayout
       */
      lang: {
        survive: 'Survivors Call',
      },
    };
  },
};
</script>

<style scoped lang="scss">
$areas: main nav logo actions overlay survivors;

.homegrid {
  &.grid-container {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 20% auto;
    grid-template-areas:
      'logo . . . . survivors'
      'nav . main main . .'
      'nav . main main . .'
      'actions actions . . . .';

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

      &--nav {
        display: grid;
        align-items: center;
        margin-left: 2.8rem;
        @apply py-16 my-20;
      }

      &--actions {
        display: grid;
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
