<template>
  <TitledCard
    :loading="!agentMetricsReady"
    :title="$t('phoneDashboard.my_statistics')"
    :body-style="{ minHeight: '10vh' }"
  >
    <div class="flex flex-col flex-grow">
      <div
        v-for="[title, value] in stats.entries()"
        :key="`metric_${title}`"
        class="metrics--body"
      >
        <hr />
        <div class="flex flex-row justify-between p-2 px-5 metric">
          <div>
            <ccu-icon
              with-text
              v-if="title.includes('Total')"
              :type="enums.icons.phone_plus"
              size="xl"
              :alt="$t('phoneDashboard.my_statistics')"
            >
              <base-text variant="body" :weight="600" class="align-middle">{{
                $t(title)
              }}</base-text>
            </ccu-icon>

            <base-text
              v-if="!title.includes('Total')"
              variant="bodysm"
              :weight="500"
              class="align-middle"
              >{{ title }}</base-text
            >
          </div>
          <base-text variant="h1">{{ value }}</base-text>
        </div>
      </div>
    </div>
  </TitledCard>
</template>

<script>
import VueTypes from 'vue-types';
import useUser from '@/use/user/useUser';
import { useGetters } from '@u3u/vue-hooks';
import { computed } from '@vue/composition-api';
import useEnums from '@/use/useEnums';
import _ from 'lodash';
import TitledCard from '../../cards/TitledCard.vue';

export default {
  name: 'StatsCard',
  components: { TitledCard },
  props: {
    cardTitle: VueTypes.string,
    metrics: VueTypes.any,
  },
  setup(props, context) {
    const { currentAgentMetrics, agentMetricsReady } = useGetters(
      'phone.controller',
      ['currentAgentMetrics', 'agentMetricsReady'],
    );

    const stats = computed(() => {
      const _stats = new Map();
      const setStat = (name, key) =>
        _stats.set(
          context.root.$t(name),
          _.get(currentAgentMetrics.value, key, 0),
        );
      setStat('phoneDashboard.inbound_calls', 'total_inbound');
      setStat('phoneDashboard.outbound_calls', 'total_outbound');
      setStat('phoneDashboard.rejected_calls', 'total_rejects');
      setStat('phoneDashboard.abandoned_calls', 'total_abandons');
      return _stats;
    });
    return {
      ...useEnums(),
      ...useUser(),
      stats,
      agentMetricsReady,
    };
  },
};
</script>

<style lang="scss" scoped>
.metrics {
  &--body {
    hr {
      padding: 0;
      margin: 0;
    }
    .metric {
      align-items: center;
      p {
        @apply text-crisiscleanup-dark-400;
      }
    }
  }
}
</style>
