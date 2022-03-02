<template>
  <form>
    <form-select
      class="status-select"
      :options="selectValues"
      item-key="value"
      label="name_t"
      :value="status"
      @input="updateStatus"
      :placeholder="$t('phoneDashboard.call_status')"
      select-classes="border border-crisiscleanup-dark-100 text-xs h-12"
    />
    <textarea
      :value="callNotes"
      rows="3"
      class="
        text-base
        border border-crisiscleanup-dark-100
        placeholder-crisiscleanup-dark-200
        outline-none
        p-2
        my-2
        resize-none
        w-full
      "
      :placeholder="$t('phoneDashboard.notes')"
      @input="updateNotes"
      required
    ></textarea>
    <base-button
      class="self-end"
      size="small"
      variant="solid"
      :action="
        () =>
          $emit('onCompleteCall', {
            status: this.status,
            notes: this.callNotes,
          })
      "
    >
      {{ $t('phoneDashboard.complete_call') }}
    </base-button>
  </form>
</template>

<script>
import PhoneStatus from '@/models/PhoneStatus';
import { ConnectFirstMixin } from '@/mixins';

export default {
  name: 'UpdateStatus',
  mixins: [ConnectFirstMixin],
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
  methods: {
    async updateStatus(statusId) {
      this.status = statusId;
    },
    async updateNotes(e) {
      this.callNotes = e.target.value;
    },
  },
  data() {
    return {
      status: null,
      callNotes: '',
    };
  },
};
</script>

<style>
.status-select .vs__selected {
  @apply text-xs bg-white !important;
}
</style>
