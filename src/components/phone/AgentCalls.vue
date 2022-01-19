<template>
  <div class="bg-white w-72 p-2 flex items-center justify-center">
    <base-button
      v-if="isNotTakingCalls"
      variant="solid"
      size="medium"
      :action="loginPhone"
      :text="$t('phoneDashboard.take_call')"
      class="flex-grow mr-4"
    ></base-button>
    <base-button
      v-else-if="!isOnCall"
      variant="solid"
      size="medium"
      :action="logoutPhone"
      :text="$t('phoneDashboard.stop_call')"
      class="flex-grow mr-4"
    ></base-button>
    <base-button
      v-else-if="isOnCall"
      size="medium"
      :disabled="true"
      :text="$t('phoneDashboard.on_call')"
      class="flex-grow mr-4 text-white bg-crisiscleanup-light-grey"
    ></base-button>
  </div>
</template>

<script>
import { ConnectFirstMixin } from '@/mixins';

export default {
  name: 'AgentCalls',
  mixins: [ConnectFirstMixin],
};
</script>

<style scoped></style>
