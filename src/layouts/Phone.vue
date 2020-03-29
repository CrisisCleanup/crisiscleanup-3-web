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
$areas: start main end;

.phonegrid {
  @apply bg-crisiscleanup-light-grey;
  @apply w-full h-full;
  &.grid-container {
    display: inline-grid;
    grid-column-gap: 2rem;
    @apply h-full p-6;
    grid:
      [r1] 'start main end' [r1end]
      / 1fr 2fr 1fr;
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
