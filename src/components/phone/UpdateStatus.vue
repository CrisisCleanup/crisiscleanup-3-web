<template>
  <form class="bg-white flex flex-col">
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
      :model-value="callNotes"
      rows="3"
      class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 my-2 resize-none w-full"
      :placeholder="$t('phoneDashboard.notes')"
      @update:modelValue="updateNotes"
    ></textarea>
    <base-button
      class="self-end"
      size="small"
      variant="solid"
      :action="
        () =>
          $emit('onCompleteCall', {
            status: status,
            notes: callNotes,
          })
      "
    >
      {{ $t('phoneDashboard.complete_call') }}
    </base-button>
  </form>
</template>

<script>
import PhoneStatus from '../../models/PhoneStatus';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'UpdateStatus',
  setup() {
    const { t } = useI18n();
    const status = ref(null);
    const callNotes = ref('');
    const statuses = computed(() => PhoneStatus.all());
    const sortedValues = {
      answered: {
        name: t('phoneState.answered'),
        values: [
          {
            name_t: t('phoneStatus.answered_added'),
            value: 1,
          },
          {
            name_t: t('phoneStatus.answered_duplicate-or-updated-existing'),
            value: 2,
          },
          {
            name_t: t('phoneStatus.answered_no-help-wanted'),
            value: 3,
          },
          {
            name_t: t('phoneStatus.answered_hung-up'),
            value: 5,
          },
          {
            name_t: t('phoneStatus.answered_out-of-scope'),
            value: 7,
          },
          {
            name_t: t('phoneStatus.answered_will-call-back'),
            value: 4,
          },
          {
            name_t: t('phoneStatus.answered_other'),
            value: 8,
          },
        ],
        color: '#0FA355',
      },
      noAnswer: {
        name: t('phoneState.no-answer'),
        values: [
          {
            name_t: t('phoneStatus.no-answer_voicemail'),
            value: 15,
          },
          {
            name_t: t('phoneStatus.no-answer_voicemail-full-or-none'),
            value: 16,
          },
          {
            name_t: t('phoneStatus.no-answer_technical-difficulty'),
            value: 17,
          },
          {
            name_t: t('phoneStatus.either_bad-number'),
            value: 19,
          },
        ],
        color: '#FAB92E',
      },
      skipped: {
        name: t('phoneState.skipped'),
        values: [
          {
            name_t: t('phoneStatus.skipped_did-not-outbound'),
            value: 20,
          },
          {
            name_t: t('phoneStatus.skipped_did-not-inbound'),
            value: 22,
          },
        ],
        color: '#F0F032',
      },
    };
    async function updateStatus(statusId) {
      status.value = statusId;
    }
    async function updateNotes(e) {
      callNotes.value = e.target.value;
    }
    return {
      status,
      callNotes,
      statuses,
      sortedValues,
      updateStatus,
      updateNotes,
    };
  },
};
</script>
