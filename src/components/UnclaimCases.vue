<template>
  <div class="p-3 flex flex-col">
    <span class="text-base pb-3">
      {{
        $t('casesVue.bulk_unclaim_reassign_status', {
          length: selectedTableItems.size,
        })
      }}
    </span>
    <base-checkbox
      class="mb-5"
      :value="unchangedStatusOnUnclaim"
      @input="
        () => {
          unchangedStatusOnUnclaim = !unchangedStatusOnUnclaim;
          updateStatusOnUnclaim = !unchangedStatusOnUnclaim;
          $emit('onUnclaimSelect', {
            unchangedStatusOnUnclaim,
            updateStatusOnUnclaim,
          });
        }
      "
      >{{ $t('casesVue.no_change') }}</base-checkbox
    >
    <base-checkbox
      class="mb-5"
      :value="updateStatusOnUnclaim"
      @input="
        () => {
          updateStatusOnUnclaim = !updateStatusOnUnclaim;
          unchangedStatusOnUnclaim = !updateStatusOnUnclaim;
          $emit('onUnclaimSelect', {
            unchangedStatusOnUnclaim,
            updateStatusOnUnclaim,
          });
        }
      "
      >{{ $t('status.open_unassigned') }}</base-checkbox
    >
  </div>
</template>

<script>
import { ref } from '@vue/composition-api';

export default {
  name: 'UnclaimCases',
  props: {
    selectedTableItems: { type: Set, default: null, required: false },
  },
  setup() {
    const unchangedStatusOnUnclaim = ref(true);
    const updateStatusOnUnclaim = ref(false);

    return {
      unchangedStatusOnUnclaim,
      updateStatusOnUnclaim,
    };
  },
};
</script>

<style scoped></style>
