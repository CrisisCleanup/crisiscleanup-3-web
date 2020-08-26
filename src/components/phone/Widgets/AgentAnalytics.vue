<template>
  <StatsCard
    class="flex flex-col flex-grow"
    card-title="~~My Statistics"
    :metrics="stats"
  />
</template>

<script>
import StatsCard from '@/components/phone/Cards/StatsCard.vue';
import useUser from '@/use/user/useUser';
import { useGetters } from '@u3u/vue-hooks';
import { computed } from '@vue/composition-api';
import _ from 'lodash';

export default {
  name: 'AgentAnalytics',
  components: { StatsCard },
  setup(props, context) {
    const { currentAgentMetrics } = useGetters('phone.controller', [
      'currentAgentMetrics',
    ]);

    const stats = computed(() => {
      const _stats = new Map();
      const setStat = (name, key) =>
        _stats.set(
          context.root.$t(name),
          _.get(currentAgentMetrics.value, key, 0),
        );
      setStat('~~Received Calls', 'total_inbound');
      setStat('~~Made Calls', 'total_outbound');
      setStat('~~Rejected Calls', 'total_rejects');
      setStat('~~Abandoned Calls', 'total_abandons');
      return _stats;
    });
    return {
      ...useUser(),
      stats,
    };
  },
};
</script>
