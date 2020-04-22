<template>
  <div class="bg-white shadow-crisiscleanup-card agent-metrics">
    <div class="flex bg-white metrics--title">
      <base-text variant="body" weight="700" class="p-5">{{
        $t('~~General Statistics')
      }}</base-text>
    </div>
    <div
      v-for="[title, value] in statistics.entries()"
      :key="`metric_${title}`"
      class="metrics--body"
    >
      <hr />
      <div class="flex flex-row justify-between p-2 px-5 metric">
        <div>
          <ccu-icon
            with-text
            v-if="title.includes('Total')"
            :type="icons.phone_plus"
            size="xl"
          >
            <base-text variant="body" :weight="600" class="align-middle">{{
              title
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
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { mixin as VueTimers } from 'vue-timers';
import { METRICS } from '@/services/acs.service';
import { LangMixin, UserMixin, IconsMixin } from '@/mixins';

export default {
  name: 'AgentAnalyticsCard',
  mixins: [VueTimers, LangMixin, IconsMixin, UserMixin],
  timers: {
    fetchMetrics: {
      // metrics are updated every 10s
      time: 30000,
      autostart: true,
      repeat: true,
      immediate: true,
    },
  },
  computed: {
    ...mapState('phone', ['metrics']),
    statistics() {
      // reorder stats in correct order
      const stats = new Map();
      stats.set(
        this.lang[METRICS.CONTACTS_QUEUED],
        this.metrics[METRICS.CONTACTS_QUEUED],
      );
      stats.set(
        this.lang[METRICS.CALLBACKS_QUEUED],
        this.metrics[METRICS.CALLBACKS_QUEUED],
      );
      // TODO: callbacks
      stats.set(this.lang['todo:calldowns'], 0);
      stats.set(
        this.lang[METRICS.TOTAL_WAITING],
        this.metrics[METRICS.TOTAL_WAITING],
      );
      stats.set(this.lang[METRICS.ONLINE], this.metrics[METRICS.ONLINE]);
      stats.set(
        this.lang[METRICS.AGENTS_ON_CALL],
        this.metrics[METRICS.AGENTS_ON_CALL],
      );
      stats.set(this.lang[METRICS.NEEDED], this.metrics[METRICS.NEEDED]);
      return stats;
    },
    lang() {
      const metricLang = {};
      metricLang[METRICS.CONTACTS_QUEUED] = '~~On hold now';
      metricLang[METRICS.TOTAL_WAITING] = '~~Total People Waiting';
      metricLang[METRICS.CALLBACKS_QUEUED] = '~~Remaining Callbacks';
      // TODO
      metricLang['todo:calldowns'] = '~~Remaining Calldowns';
      metricLang[METRICS.NEEDED] = '~~Volunteers Needed';
      metricLang[METRICS.ONLINE] = '~~Volunteers Online';
      metricLang[METRICS.AGENTS_ON_CALL] = '~~Volunteers on the Phone';
      return this.getLang(metricLang);
    },
  },
  methods: {
    ...mapActions('phone', ['getRealtimeMetrics']),
    async fetchMetrics() {
      // await this.getRealtimeMetrics();
      await this.$store.dispatch('socket/send', {
        action: 'CLIENT_HEARTBEAT',
        options: {
          includeMeta: true,
        },
        data: {
          userId: this.userId,
          type: this.currentUser.isAdmin ? 'admin' : 'user',
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.agent-metrics {
  .metrics {
    &--title {
      p {
        @apply text-crisiscleanup-dark-400;
      }
    }
    &--body {
      hr {
        padding: 0;
        margin: 0;
      }
      &:nth-child(-n + 5) {
        @apply bg-crisiscleanup-light-grey;
      }
      &:nth-child(5) {
        .metric {
          div p {
            @apply text-crisiscleanup-dark-500;
          }
          p {
            @apply text-crisiscleanup-red-400;
          }
        }
      }
      .metric {
        align-items: center;
        p {
          @apply text-crisiscleanup-dark-400;
        }
      }
    }
  }
}
</style>
