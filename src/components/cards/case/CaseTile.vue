<template>
  <div
    :class="`case-card ${active ? 'active' : ''} ${
      type === 'new' ? 'new' : ''
    }`"
  >
    <div v-if="type === 'new'" class="case--overlay">
      <ccu-icon :type="icons.active" size="xl" />
    </div>
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
import { IconsMixin } from '@/mixins';

export default {
  name: 'CaseTile',
  mixins: [IconsMixin],

  props: {
    id: VueTypes.string,
    caseNumber: VueTypes.string,
    address: VueTypes.string,
    state: VueTypes.string,
    worktype: VueTypes.string,
    svg: VueTypes.string,
    active: VueTypes.bool.def(false),
    type: VueTypes.string,
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
  &.new {
    position: relative;
    .case {
      &--overlay {
        position: absolute;
        display: flex;
        @apply w-full h-full;
        left: 0;
        justify-content: center;
        align-items: center;
      }
      &--head,
      &--body {
        filter: blur(1.5px);
      }
    }
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
