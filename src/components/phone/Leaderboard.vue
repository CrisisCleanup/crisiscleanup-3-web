<template>
  <div class="bg-white shadow-crisiscleanup-card">
    <!-- SET CARD WIDTH TO 2/5 -->
    <div class="flex flex-row p-3 justify-between items-center pt-3">
      <base-text variant="h3">Leaderboard</base-text>
      <!-- all time -->
      <div class="flex flex-col">
        <base-button
          icon-size="sm"
          size="sm"
          variant="outline"
          class="px-2"
          :action="() => (toggleOpen = !toggleOpen)"
          :ccu-icon="!toggleOpen ? 'down' : 'up'"
          >All Time</base-button
        >
        <!-- Other Options -->
        <div class="flex flex-col" v-if="toggleOpen">
          <base-text variant="h3">other</base-text>
          <base-text variant="h3">more</base-text>
        </div>
      </div>
    </div>
    <hr />
    <div class="flex flex-row justify-end">
      <div class="flex flex-col mx-20 pr-6 mt-2">
        <base-text variant="body" weight="300">Calls</base-text>
      </div>
    </div>
    <!-- Profiles -->
    <LeaderboardProfileCard />
  </div>
</template>

<script>
import LeaderboardProfileCard from './LeaderboardProfileCard.vue';
export default {
  name: 'Leaderboard',
  components: {
    LeaderboardProfileCard,
  },
  data() {
    return {
      toggleOpen: false,
    };
  },
};
</script>
