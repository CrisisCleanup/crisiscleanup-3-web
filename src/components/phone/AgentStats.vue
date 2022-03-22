<template>
  <div class="flex flex-col">
    <div>
      <div class="flex">
        <div class="flex p-2 items-center text-sm">
          {{ $t('phoneDashboard.inbound_count') }}
          <div class="opacity-40 ml-1">
            {{
              agentStats.totalCallsHandled - agentStats.totalManualDials || 0
            }}
          </div>
        </div>
        <div class="flex p-2 items-center text-sm">
          {{ $t('phoneDashboard.outbound_count') }}
          <div class="opacity-40 ml-1">
            {{ agentStats.totalManualDials || 0 }}
          </div>
        </div>
        <div class="flex p-2 items-center text-sm">
          {{ $t('phoneDashboard.total_login_time') }}
          <div class="opacity-40 ml-1">
            {{ (agentStats.totalLoginTime || 0) | formatSeconds }}
          </div>
        </div>
        <div class="flex p-2 items-center text-sm">
          {{ $t('phoneDashboard.total_call_time') }}
          <div class="opacity-40 ml-1">
            {{ (agentStats.totalTalkTime || 0) | formatSeconds }}
          </div>
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
