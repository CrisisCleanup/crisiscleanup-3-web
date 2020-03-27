<template>
  <div class="bg-white shadow-xl">
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
import { LangMixin } from '@/mixins';

export default {
  name: 'AgentAnalyticsCard',
  mixins: [VueTimers, LangMixin],
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
    lang() {
      const metricLang = {};
      metricLang[METRICS.AGENTS_ON_CALL] = '~~On the Phone Right Now';
      metricLang[METRICS.ONLINE] = '~~Volunteers Online';
      metricLang[METRICS.CONTACTS_QUEUED] = '~~Peopled in Queue';
      metricLang[METRICS.NEEDED] = '~~Volunteers Needed';
      return this.getLang(metricLang);
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
        metric.title = this.lang[name];
        return metric;
      });
    },
  },
};
</script>
