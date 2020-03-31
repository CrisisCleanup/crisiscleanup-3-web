<template>
  <div class="case-card">
    <div class="case--head">
      <div class="case--svg" v-html="svg" />
      <base-text>{{ caseNumber }}</base-text>
    </div>
    <div class="case--body">
      <base-text>{{ fullAddress }}</base-text>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'CaseTile',
  props: {
    caseNumber: VueTypes.string,
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
    @apply bg-crisiscleanup-dark-200 p-2;
    display: flex;
    flex-direction: column;
    &--head {
      display: flex;
      flex-grow: 1;
    }
    &--body {
      display: flex;
      flex-wrap: 1;
      flex-grow: 1;
    }
  }
}
</style>
