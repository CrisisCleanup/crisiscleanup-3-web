<template>
  <StatsCard
    class="flex flex-col flex-grow"
    card-title="~~My Statistics"
    :metrics="metrics"
  />
</template>

<script>
import StatsCard from '@/components/phone/Cards/StatsCard.vue';
import { mapGetters } from 'vuex';
import { UserMixin } from '@/mixins';

export default {
  name: 'AgentAnalytics',
  mixins: [UserMixin],
  components: { StatsCard },
  computed: {
    ...mapGetters('phone', ['agentBoard']),
    currentAgent() {
      if (!this.agentBoard.length) return [];
      return this.agentBoard.find((a) => a.user.id === this.currentUser.id);
    },
    metrics() {
      const stats = new Map();
      const {
        total_inbound = 0,
        total_outbound = 0,
        total_abandons = 0,
        total_rejects = 0,
      } = this.currentAgent;
      stats.set('~~Received Calls', total_inbound);
      stats.set('~~Made Calls', total_outbound);
      stats.set('~~Rejected Calls', total_rejects);
      stats.set('~~Abandoned Calls', total_abandons);
      const TStats = new Map();
      stats.forEach((value, key) => TStats.set(this.$t(key), value));
      return TStats;
    },
  },
};
</script>
