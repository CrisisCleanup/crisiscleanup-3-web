<template>
  <div class="phone__container">
    <div class="phone__agent">
      <div class="phone__agentcard">
        <AgentCard />
      </div>
      <div class="phone__general">
        <GeneralStatistics />
      </div>
      <div class="phone__agentmetrics">
        <AgentAnalytics />
      </div>
    </div>

    <div class="phone__main">
      <CallVolumeChart
        :calls-dataset="totalCalls"
        :missed-dataset="totalMissed"
        :cases-dataset="newCases"
        :loading="!historicMetricsReady"
      />
      <div>
        <leaderboard />
        <NewsTrainingCard
          @phone:showTraining="($event) => (isShowingTrainingModal = $event)"
        />
      </div>
      <CallHistory class="overflow-auto" />
      <ContactTable v-if="currentUser.isAdmin" />
      <TrainingModal
        v-if="isShowingTrainingModal"
        :visible="isShowingTrainingModal"
        @onClose="isShowingTrainingModal = false"
        @onComplete="onTrainingComplete"
      ></TrainingModal>
    </div>
  </div>
</template>

<script>
import User from '@/models/User';
import Leaderboard from '@/components/phone/Widgets/Leaderboard.vue';
import CallHistory from '@/components/phone/Widgets/CallHistory.vue';
import ContactTable from '@/components/phone/Widgets/ContactTable.vue';
import NewsTrainingCard from '@/components/phone/Widgets/NewsTrainingCard.vue';
import TrainingModal from '@/components/phone/TrainingsModal.vue';
import AgentCard from '@/components/phone/AgentCard.vue';
import GeneralStatistics from '@/components/phone/Widgets/GeneralStatistics.vue';
import AgentAnalytics from '@/components/phone/Cards/StatsCard.vue';
import CallVolumeChart from '@/components/phone/Widgets/CallVolumeChart.vue';
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'PhoneDashboard',
  components: {
    AgentAnalytics,
    AgentCard,
    CallHistory,
    NewsTrainingCard,
    Leaderboard,
    ContactTable,
    TrainingModal,
    GeneralStatistics,
    CallVolumeChart,
  },
  data() {
    return {
      loading: false,
      isShowingTrainingModal: false,
    };
  },
  computed: {
    ...mapState('phone.controller', ['historicMetrics']),
    ...mapGetters('phone.controller', ['historicMetricsReady']),
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    newCases() {
      return this.buildHistoricDataSet('worksites');
    },
    totalCalls() {
      return this.buildHistoricDataSet('total_calls');
    },
    totalMissed() {
      return this.buildHistoricDataSet('missed');
    },
  },
  methods: {
    async onTrainingComplete() {
      this.$emit('phone:showTrainingModal', false);
    },
    buildHistoricDataSet(key) {
      return this.historicMetrics.daily.map(({ day, ...metric }) => ({
        x: day,
        y: metric[key],
      }));
    },
  },
};
</script>

<style scoped lang="postcss">
@lost flexbox flex;

.phone {
  &__container {
    @apply h-full;
    lost-flex-container: row;
    @apply w-full h-full;
    .phone__agent {
      @apply h-full;
      lost-column: 1/4;
      @screen xl {
        lost-column: 1/5;
      }
      lost-flex-container: column;
      box-sizing: border-box;
      & > div {
        margin-bottom: 30px;
      }
    }
    .phone__main {
      lost-flex-container: column;
      lost-column: 3/4;
      @screen xl {
        lost-column: 4/5;
      }
      box-sizing: border-box;
      & > div {
        lost-row: 1/3;
        &:nth-child(2) {
          lost-flex-container: row;
          lost-row: 1/4;
          & > div {
            lost-column: 1/2;
          }
        }
      }
    }
  }
}
</style>
