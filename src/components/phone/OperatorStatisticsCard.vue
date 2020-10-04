<template>
  <div class="shadow-crisiscleanup-card bg-white">
    <div class="bg-white text-base font-semibold content-center m-2 p-2 h-8">
      <header>My Statistics</header>
    </div>
    <div class="h-0 w-auto border" />
    <div class="flex-col p-2">
      <div class="justify-between flex flex-row my-2">
        <p class="text-sm">{{ $t('phoneDashboard.inbound_calls') }}</p>
        <div class="font-semifold" :callsReceived="callsReceived">
          {{ callsReceived }}
        </div>
      </div>
      <div class="h-0 w-auto border" />
      <div class="justify-between flex flex-row my-2">
        <p class="text-sm">{{ $t('phoneDashboard.outbound_calls') }}</p>
        <div class="font-semifold" :callsMade="callsMade">
          {{ callsMade }}
        </div>
      </div>
      <div class="h-0 w-auto border" />
      <div class="justify-between flex flex-row my-2">
        <p class="text-sm">{{ $t('phoneDashboard.total_login_time_this_week') }}</p>
        <div class="font-semibold" :totalLoggedTime="totalLoggedTime">
          {{ totalLoggedTime }}
        </div>
      </div>
      <div class="h-0 w-auto border" />
      <div class="justify-between flex flex-row my-2">
        <p class="text-sm">{{ $t('phoneDashboard.total_talk_time_this_week') }}</p>
        <div
          class="font-semibold"
          :totalConversationTime="totalConversationTime"
        >
          {{ totalConversationTime }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'OPstats',
  props: {
    callsReceived: {
      type: Number,
      default: 47,
    },
    callsMade: {
      type: Number,
      default: 312,
    },
    totalLoggedTime: {
      type: String,
      default: '12:34:56',
    },
    totalConversationTime: {
      type: String,
      default: '12:23:43',
    },
  },
};
</script>
<style scoped></style>
