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
      <div>
        <leaderboard />
        <NewsTrainingCard
          @phone:showTraining="($event) => (isShowingTrainingModal = $event)"
        />
      </div>
      <CallHistory />
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
  },
  data() {
    return {
      loading: false,
      isShowingTrainingModal: false,
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  methods: {
    async onTrainingComplete() {
      this.$emit('phone:showTrainingModal', false);
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
        lost-row: 1/2;
        &:first-child {
          lost-flex-container: row;
          & > div {
            lost-column: 1/2;
          }
        }
      }
    }
  }
}
</style>
