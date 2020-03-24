<template>
  <div>
    <div class="flex flex-row m-5 justify-between">
      <base-text variant="h3">Leaderboard</base-text>
      <!-- all time -->
    </div>
    <hr />
    <div class="flex flex-col">
      <base-text variant="h4">Calls</base-text>
    </div>
    <!-- Profiles -->
    <LeaderboardProfileCard />
  </div>
</template>

<script>
import LeaderboardProfileCard from './LeaderboardProfileCard';
export default {
  name: 'Leaderboard',
  components: {
    LeaderboardProfileCard,
  },
};
</script>
