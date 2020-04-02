<template>
  <div class="status">
    <base-text variant="h3">{{ lang.notes }}</base-text>
    <form-select
      class="select"
      :options="selectValues"
      item-key="value"
      label="name_t"
      :value="status"
      @input="(value) => setCaseStatus({ id: value })"
      placeholder="Call Status "
    />
    <base-input
      class="notes"
      text-area
      size="large"
      @input="(value) => setCaseStatus({ notes: value })"
      :placeholder="lang.issuesResolved"
    ></base-input>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import PhoneStatus from '@/models/PhoneStatus';
import { AgentMixin } from '@/mixins';

export default {
  name: 'BoardStatus',
  mixins: [AgentMixin],
  props: {
    lang: VueTypes.objectOf(VueTypes.any),
  },
  data() {
    return {
      status: null,
      notes: '',
    };
  },

  computed: {
    statuses() {
      return PhoneStatus.all();
    },
    selectValues() {
      return Object.values(this.statuses).map(({ id, status_name_t }) => {
        return {
          value: id,
          name_t: status_name_t,
        };
      });
    },
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
