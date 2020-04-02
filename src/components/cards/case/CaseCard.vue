<template>
  <div class="case-card">
    <div class="case--icon">
      <div class="case--svg" v-html="svg" />
    </div>
    <div class="case--info">
      <base-text :weight="600" variant="h2">{{ caseNumber }}</base-text>
      <base-text variant="body">{{ address }}</base-text>
      <base-text variant="bodysm">{{ state }}</base-text>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'CaseCard',
  props: {
    caseNumber: VueTypes.string,
    address: VueTypes.string,
    fullAddress: VueTypes.string,
    state: VueTypes.string,
    worktype: VueTypes.string,
    svg: VueTypes.string,
  },
};
</script>

<style scoped lang="scss">
.case {
  &-card {
    display: flex;
    flex-grow: 1;
    @apply pb-3;
  }
  &--info {
    @apply px-4;
    p {
      @apply text-crisiscleanup-dark-500;
      &:last-child {
        @apply text-crisiscleanup-dark-300;
      }
    }
  }
  &--icon {
    box-shadow: 0 8px 24px 0 rgba(56, 56, 56, 0.23);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: baseline;
    @apply p-3;
  }
  &--svg svg {
    display: block;
  }
}
</style>
