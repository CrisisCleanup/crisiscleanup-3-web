<template>
  <div class="bg-crisiscleanup-light-grey">
    <div class="flex justify-around bg-white">
      <base-text variant="h2" weight="600" class="m-5"
        >Virtual Call Center Status</base-text
      >
    </div>
    <div v-for="stat in statistics" :key="`metric_${stat.title}`">
      <hr />
      <div class="flex flex-row justify-between m-2">
        <base-text variant="body" :weight="300" class="align-middle">{{
          stat.title
        }}</base-text>
        <base-text variant="h1">{{ stat.value }}</base-text>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { mixin as VueTimers } from 'vue-timers';
import { METRICS } from '@/services/acs.service';

export default {
  name: 'AgentAnalyticsCard',
  mixins: [VueTimers],
  timers: {
    fetchMetrics: {
      // AWS refreshes metrics every
      // 15 seconds, so add a small delay
      // on top of that
      time: 15250,
      autostart: true,
      repeat: true,
      immediate: true,
    },
  },
  computed: {
    ...mapState('phone', ['metrics']),
    statistics() {
      return this.analytics.filter(a => a.title);
    },
  },
  data() {
    return {
      analytics: [],
    };
  },
  methods: {
    ...mapActions('phone', ['getRealtimeMetrics']),
    async fetchMetrics() {
      await this.getRealtimeMetrics();
      this.analytics = Object.keys(this.metrics).map(name => {
        const metric = {
          value: this.metrics[name],
          title: '',
        };
        switch (name) {
          case METRICS.AGENTS_ON_CALL:
            metric.title = '~~On the Phone Right Now';
            break;
          case METRICS.ONLINE:
            metric.title = '~~Volunteers Online';
            break;
          case METRICS.CONTACTS_QUEUED:
            metric.title = '~~People in Queue';
            break;
          case METRICS.NEEDED:
            metric.title = '~~Volunteers Needed';
            break;
          default:
            break;
        }
        metric.title = this.$t(metric.title);
        return metric;
      });
    },
  },
};
</script>
