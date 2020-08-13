<template>
  <div class="bg-white shadow-crisiscleanup-card card">
    <div class="header" slot="header">
      <div class="header--inner">
        <slot name="header"></slot>
      </div>
    </div>
    <div class="body">
      <div class="body--inner h-full">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
};
</script>

<style lang="scss" scoped>
.card {
  flex-grow: 1;
  .header {
    @apply py-5 px-6;
    position: relative;
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      opacity: 0.2;
      background-color: #979797;
    }
    &--inner {
      display: flex;
      justify-content: space-between;
    }
  }
  .body {
    @apply bg-white;
    display: flex;
    &--inner {
      display: flex;
      flex-grow: 1;
    }
  }
}
</style>
