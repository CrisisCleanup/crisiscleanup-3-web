<template>
  <div class="phonegrid grid-container">
    <slot name="grid-start"></slot>
    <slot name="grid-main"></slot>
    <slot name="grid-end"></slot>
  </div>
</template>

<script>
export default {
  name: 'PhoneLayout',
};
</script>

<style lang="scss">
$areas: start main end footer;

.phonegrid {
  @apply bg-crisiscleanup-light-grey;
  @apply w-full h-full;
  &.grid-container {
    justify-content: center;
    display: inline-grid;
    gap: 2rem 2rem;
    @apply p-6;
    padding-right: 0;
    grid:
      [r1] 'start main end' [r1end]
      / 1fr 1.75fr 1fr;
    .grid {
      @each $area in $areas {
        &--#{$area} {
          grid-area: $area;
        }
      }
    }
  }
}
</style>
