<template>
  <div class="flex flex-col">
    <base-text class="p-3" variant="h3">{{
      $t('phoneDashboard.general_statistics')
    }}</base-text>
    <hr />
    <div class="flex flex-col bg-crisiscleanup-light-grey">
      <div class="flex p-2 items-center justify-between">
        <base-text>{{ $t('~~On Phone Now') }}</base-text>
        {{ stats.active || 0 }}
      </div>
      <div class="flex p-2 items-center justify-between">
        <base-text>{{ $t('phoneDashboard.remaining_callbacks') }}</base-text>
        {{ remainingCallbacks || 0 }}
      </div>
      <div class="flex p-2 items-center justify-between">
        <base-text>{{ $t('phoneDashboard.remaining_calldowns') }}</base-text>
        0
      </div>
      <div class="flex p-2 items-center justify-between">
        <ccu-icon with-text type="phone-plus" size="xl">
          <base-text>{{ $t('phoneDashboard.total_people_waiting') }}</base-text>
        </ccu-icon>
        {{ stats.inQueue || 0 }}
      </div>
    </div>
  </div>
</template>

<script>
import { ConnectFirstMixin } from '@/mixins';
import PhoneOutbound from '@/models/PhoneOutbound';

export default {
  name: 'GeneralStats',
  mixins: [ConnectFirstMixin],
  data() {
    return {
      remainingCallbacks: 0,
    };
  },
  async mounted() {
    this.remainingCallbacks =
      await PhoneOutbound.api().getRemainingCallbackCount(
        this.currentIncidentId,
      );
  },
};
</script>

<style scoped></style>
