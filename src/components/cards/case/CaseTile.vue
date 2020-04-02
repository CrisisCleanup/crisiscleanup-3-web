<template>
  <div :class="`case-card ${active ? 'active' : ''}`">
    <div class="case--head">
      <div class="case--svg" v-html="svg" />
      <base-text variant="h3">{{ caseNumber }}</base-text>
    </div>
    <div class="case--body">
      <base-text variant="bodysm">{{ `${address}, ${state}` }}</base-text>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'CaseTile',
  props: {
    id: VueTypes.string,
    caseNumber: VueTypes.string,
    address: VueTypes.string,
    state: VueTypes.string,
    worktype: VueTypes.string,
    svg: VueTypes.string,
    active: VueTypes.bool.def(false),
  },
};
</script>

<style scoped lang="scss">
.case-card {
  @apply bg-crisiscleanup-light-grey p-4 mx-2;
  @apply border-gray-300;
  border-width: 1px;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  width: 12rem;
  height: 8rem;
  cursor: pointer;
  transition: box-shadow 300ms ease;
  &:hover {
    @apply shadow-lg;
  }
  &.active {
    @apply border-primary-light;
    border-width: 2px;
  }
  .case {
    &--head {
      display: flex;
      p {
        @apply px-3 text-crisiscleanup-dark-400;
      }
    }
    &--body {
      display: flex;
      p {
        @apply text-crisiscleanup-dark-400;
      }
    }
  }
}
</style>
