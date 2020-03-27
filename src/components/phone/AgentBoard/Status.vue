<template>
  <div class="status">
    <base-text variant="h3">{{ lang.notes }}</base-text>
    <form-select
      class="select"
      :options="statuses"
      :label="status"
      :value="status"
    />
    <base-input
      class="notes"
      v-model="additonalNotes"
      text-area
      size="large"
      :placeholder="lang.issuesResolved"
    ></base-input>
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'BoardStatus',
  props: {
    lang: VueTypes.objectOf(VueTypes.any),
  },
  data() {
    return {
      status: 'One',
      additonalNotes: '',
      statuses: [
        {
          label: 'One',
          code: 'one',
        },
        {
          label: 'Two',
          code: 'two',
        },
      ],
    };
  },
};
</script>

<style lang="scss">
.board {
  &--grid {
    .grid {
      &--status {
        .status {
          @apply px-16 py-12;
          display: flex;
          flex-direction: column;
          p {
            @apply text-crisiscleanup-dark-500 py-3;
          }
          .notes {
            @apply py-3;
            @apply border-crisiscleanup-dark-300 mb-6;
            border: 1px solid;
            outline: none;
            textarea {
              outline: none;
              &:hover,
              &:focus-visible,
              &:focus-within,
              &:focus {
                outline: none;
              }
            }
          }
          .select {
            @apply py-3;
            @apply border-crisiscleanup-dark-300 mb-6;
            border: 1px solid;
          }
        }
      }
    }
  }
}
</style>
