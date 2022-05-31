<template>
  <form class="bg-white flex flex-col">
    <!--    <form-select-->
    <!--      class="status-select"-->
    <!--      :options="selectValues"-->
    <!--      item-key="value"-->
    <!--      label="name_t"-->
    <!--      :value="status"-->
    <!--      @input="updateStatus"-->
    <!--      :placeholder="$t('phoneDashboard.call_status')"-->
    <!--      select-classes="border border-crisiscleanup-dark-100 text-xs h-12"-->
    <!--    />-->
    <div class="flex flex-col flex-wrap h-60 text-center">
      <div v-for="(section, index) in sortedValues" :key="index">
        <div>
          <div class="font-bold">
            {{ section.name }}
          </div>
          <div v-for="(item, idx) in section.values" :key="idx">
            <div
              class="m-1 p-1 rounded cursor-pointer"
              :class="item.value === status ? '' : 'opacity-70'"
              :style="`background: ${section.color}`"
              @click="status = item.value"
            >
              {{ item.name_t }}
            </div>
          </div>
        </div>
      </div>
    </div>
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
    sortedValues() {
      const values = {
        answered: {
          name: this.$t('phoneState.answered'),
          values: [
            {
              name_t: this.$t('phoneStatus.answered_added'),
              value: 1,
            },
            {
              name_t: this.$t('phoneStatus.answered_duplicate-or-updated-existing'),
              value: 2,
            },
            {
              name_t: this.$t('phoneStatus.answered_no-help-wanted'),
              value: 3,
            },
            {
              name_t: this.$t('phoneStatus.answered_hung-up'),
              value: 5,
            },
            {
              name_t: this.$t('phoneStatus.answered_out-of-scope'),
              value: 7,
            },
            {
              name_t: this.$t('phoneStatus.answered_will-call-back'),
              value: 4,
            },
            {
              name_t: this.$t('phoneStatus.answered_other'),
              value: 8,
            },
          ],
          color: '#0FA355',
        },
        noAnswer: {
          name: this.$t('phoneState.no-answer'),
          values: [
            {
              name_t: this.$t('phoneStatus.no-answer_voicemail'),
              value: 15,
            },
            {
              name_t: this.$t('phoneStatus.no-answer_voicemail-full-or-none'),
              value: 16,
            },
            {
              name_t: this.$t('phoneStatus.no-answer_technical-difficulty'),
              value: 17,
            },
            {
              name_t: this.$t('phoneStatus.either_bad-number'),
              value: 19,
            },
          ],
          color: '#FAB92E',
        },
        skipped: {
          name: this.$t('phoneState.skipped'),
          values: [
            {
              name_t: this.$t('phoneStatus.skipped_did-not-outbound'),
              value: 20,
            },
            {
              name_t: this.$t('phoneStatus.skipped_did-not-inbound'),
              value: 22,
            },
          ],
          color: '#F0F032',
        },
      };
      return values;
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
