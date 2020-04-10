<template>
  <div class="bg-white shadow-crisiscleanup-card">
    <!--- Tabs --->
    <button
      v-for="tab in tabs"
      :key="tab"
      @click="selected = tab"
      :class="['tab-btn', { active: selected === tab }]"
      class="m-1"
    >
      {{ tab }}
    </button>
    <!-- line -->
    <hr class="bg-white" />
    <!--- Content --->
    <div v-if="selected !== 'Trainings'">
      <component :is="selected" class="tab"></component>
    </div>
    <Trainings
      v-for="(training, idx) in trainings"
      :key="idx"
      :image-path="training.imagePath"
      :description="training.description"
      :time-to-complete="trainings.completionTime"
      class="w-full"
    ></Trainings>
    <!-- line -->
    <hr class="bg-white" />
    <!--- See All Button --->
    <div class="m-3 pb-2">
      <base-button
        variant="underline"
        class="text-crisiscleanup-yellow-900"
        :action="toggleAvailable"
      >
        See All
      </base-button>
    </div>
    <trainings-modal
      :visible="isShowingTrainingModal"
      @onClose="isShowingTrainingModal = false"
      @onComplete="onTrainingComplete"
    ></trainings-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { STATES as CCState } from '@/services/acs.service';
import TrainingsModal from '@/components/phone/TrainingsModal';
import NewsCard from '@/components/phone/NewsCard';
import TrainingsCard from '@/components/phone/TrainingsCard';

export default {
  name: 'NewsTrainingCard',
  data() {
    return {
      tabs: ['Training'],
      selected: 'Training',
      isShowingTrainingModal: false,
      trainings: [
        {
          imagePath: require('@/assets/newstrainingss.jpg'),
          description: ' ~~Crisis Cleanup Basic Training',
          completionTime: '10 minutes',
        },
        {
          imagePath: require('@/assets/newstrainingss.jpg'),
          description: '~~Phone System Basic Training',
          completionTime: '~~15 minutes',
        },
      ],
    };
  },
  components: {
    News: NewsCard,
    Trainings: TrainingsCard,
    TrainingsModal,
  },
  methods: {
    ...mapActions('phone', ['setAgentState']),
    async toggleAvailable() {
      if (!this.allTrainingCompleted) {
        this.isShowingTrainingModal = true;
        return this.isShowingTrainingModal;
      }

      if (!this.connectReady) {
        this.showConnectLogin = true;
        return this.showConnectLogin;
      }

      if (this.agentAvailable) {
        return this.setAgentState(CCState.OFFLINE);
      }
      return this.setAgentState(CCState.ROUTABLE);
    },
    async onTrainingComplete() {
      await this.loadTrainingData();
      this.isShowingTrainingModal = false;
    },
  },
  watch: {
    popupOpen(newState, oldState) {
      if (!newState && oldState && this.connectReady) {
        this.showConnectLogin = false;
        this.setAgentState(CCState.ROUTABLE);
      }
    },
  },
};
</script>

<style scoped>
/* tab selection colors */
.tab-btn {
  padding: 6px 10px;
  cursor: pointer;
  margin-bottom: 1rem;
  border: 2px;
  outline: none;
}
.active {
  border-bottom: 3px solid #ffb92f;
}
</style>
