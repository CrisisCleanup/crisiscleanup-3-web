<template>
  <div class="flex flex-col">
    <base-text class="p-3" variant="h3">{{
      $t('phoneDashboard.my_statistics')
    }}</base-text>
    <hr />
    <div>
      <div class="flex flex-col">
        <div class="flex p-2 items-center justify-between">
          <base-text>{{ $t('phoneDashboard.inbound_count') }}</base-text>
          {{ agentStats.totalCallsHandled - agentStats.totalManualDials || 0 }}
        </div>
        <div class="flex p-2 items-center justify-between">
          <base-text>{{ $t('phoneDashboard.outbound_count') }}</base-text>
          {{ agentStats.totalManualDials || 0 }}
        </div>
        <div class="flex p-2 items-center justify-between">
          <base-text>{{ $t('phoneDashboard.total_login_time') }}</base-text>
          {{ (agentStats.totalLoginTime || 0) | formatSeconds }}
        </div>
        <div class="flex p-2 items-center justify-between">
          <base-text>{{ $t('phoneDashboard.total_call_time') }}</base-text>
          {{ (agentStats.totalTalkTime || 0) | formatSeconds }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ConnectFirstMixin } from '@/mixins';

export default {
  name: 'AgentStats',
  mixins: [ConnectFirstMixin],
};
</script>

<style scoped></style>
