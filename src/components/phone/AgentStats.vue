<template>
  <div class="flex flex-col">
    <base-text class="p-3" variant="h3">{{
      $t('phoneDashboard.my_statistics')
    }}</base-text>
    <hr />
    <div>
      <div class="flex flex-col">
        <div class="flex p-2 items-center justify-between">
          <base-text>{{ $t('~~Inbound Count') }}</base-text>
          {{ agentStats.totalCallsHandled - agentStats.totalManualDials || 0 }}
        </div>
        <div class="flex p-2 items-center justify-between">
          <base-text>{{ $t('~~Outbound Count') }}</base-text>
          {{ agentStats.totalManualDials || 0 }}
        </div>
        <div class="flex p-2 items-center justify-between">
          <base-text>{{ $t('~~Total Login Time') }}</base-text>
          {{ (agentStats.totalLoginTime || 0) | formatSeconds }}
        </div>
        <div class="flex p-2 items-center justify-between">
          <base-text>{{ $t('~~Total Call Time') }}</base-text>
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
