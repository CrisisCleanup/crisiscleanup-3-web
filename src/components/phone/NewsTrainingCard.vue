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
    <!-- Training Tab -->
    <div v-if="selected !== 'Trainings'" class="w-full h-auto">
      <component :is="selected" class="tab">
        <Trainings
          v-for="(training, idx) in trainings"
          :key="idx"
          :image-path="training.imagePath"
          :description="training.description"
          :time-to-complete="training.timeToComplete"
          @onTrainingSelected="toggleAvailable"
        ></Trainings>
      </component>
    </div>
    <!-- News Tab -->
    <div v-if="selected === News">
      <component :is="selected" class="tab">
        <News
          v-for="(newss, idx) in news"
          :key="idx"
          :image-path="newss.image"
          :description="newss.description"
          :time-to-complete="newss.timeToComplete"
        />
      </component>
    </div>
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
import TrainingsModal from '@/components/phone/TrainingsModal.vue';
import NewsCard from '@/components/phone/NewsCard.vue';
import TrainingsCard from '@/components/phone/TrainingsCard.vue';

export default {
  name: 'NewsTrainingCard',
  data() {
    return {
      tabs: ['Training', 'News'],
      selected: 'Training',
      isShowingTrainingModal: false,
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
  computed: {
    trainings() {
      return [
        {
          imagePath: require('@/assets/crisiscleanuphand_training.png'),
          description: this.$t(' ~~Crisis Cleanup Basic Training'),
          timeToComplete: this.$t('~~10 minutes'),
        },
        {
          imagePath: require('@/assets/crisiscleanupphone_training.png'),
          description: this.$t('~~Phone System Basic Training'),
          timeToComplete: this.$t('~~15 minutes'),
        },
      ];
    },
    news() {
      return [
        {
          imagePath: require('@/assets/newspicss.png'),
          description: this.$t(
            `~~For those of you who have ever used our call system in the past (as clunky as it was) You're going to LOVE this new system. It is easier to ever! However it is brand new, so if you find bugs, please let us know.`,
          ),
          timeToComplete: this.$t('~~15 minutes'),
        },
      ];
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
