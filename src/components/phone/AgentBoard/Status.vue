<template>
  <div class="status">
    <modal
      v-if="confirmModal"
      :title="$t('~~Are you sure?')"
      modal-classes="bg-white max-w-md shadow"
    >
      <div class="modal--body">
        <base-text variant="body">
          {{ $t('~~You have not saved any changes to any worksites yet!') }}
        </base-text>
        <base-text variant="body">
          {{ $t('~~Are you sure you want to close this case?') }}
        </base-text>
      </div>
      <template #footer>
        <div class="modal--footer flex flex-row p-2">
          <base-button
            size="medium"
            variant="solid"
            :action="() => (confirmModal = false)"
            >{{ $t('~~Keep Editing') }}</base-button
          >
          <base-button
            size="medium"
            variant="solid"
            :action="() => closeContact(true)"
            >{{ $t('~~End Call') }}</base-button
          >
        </div>
      </template>
    </modal>
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
    <base-button
      class="save-exit"
      size="large"
      variant="solid"
      :action="() => closeContact()"
    >
      {{ $t('~~Save & End Call') }}
    </base-button>
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
      confirmModal: false,
    };
  },
  methods: {
    async closeContact(force = false) {
      if (!this.modifiedCases.length && !force) {
        this.confirmModal = true;
        return;
      }
      try {
        await this.$store.dispatch('phone/closeContact');
      } catch (e) {
        this.$toasted.error(this.$t(e.message));
      }
    },
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
          .modal {
            &--body {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              @apply px-8;
            }
            &--footer {
              flex-grow: 1;
              justify-content: space-around;
            }
          }

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
