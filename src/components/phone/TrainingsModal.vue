<template>
  <div>
    <modal
      v-if="visible"
      modal-classes="w-3/5 overflow-auto"
      @ok="visible = false"
      @close="visible = false"
    >
      <div v-if="!selectedTraining">
        <header class="w-full border-b border-grey p-4">
          <base-text
            variant="body"
            weight="700"
            class="text-crisiscleanup-dark-500"
          >
            {{ lang.header.text }}
          </base-text>
        </header>
        <div class="flex m-3">
          <div class="flex-col ml-2 w-1/4 mt-5">
            <img
              src="@/assets/call_center_people.png"
              width="100%"
              height="auto"
              :alt="$t('phoneDashboard.call_center_users')"
            />
          </div>
          <div class="flex-col ml-3 mr-3 mt-5 my-8 items-center w-3/4">
            <!-- Greeting -->
            <base-text weight="900" variant="h1" class="ml-3 mr-3">
              {{ lang.subHeader.text }}
            </base-text>
            <base-text class="m-3">
              {{ lang.subHeader.secondaryText }}
            </base-text>
          </div>
        </div>
        <template v-if="trainingItems.length">
          <div class="shadow m-5">
            <trainings-card
              v-for="(training, idx) in trainingItems"
              :key="idx"
              :image-path="getTrainingThumbnail(training)"
              :description="training.title_t"
              :time-to-complete="training.settings.completion_seconds"
              :completed="isTrainingCompleted(training)"
              @onTrainingSelected="
                () => {
                  selectedTraining = training;
                }
              "
            ></trainings-card>
          </div>
        </template>
        <!-- Footer -->
        <div class="flex justify-around mt-10"></div>
        <div slot="footer" class="flex p-1 justify-center mb-3">
          <base-button
            v-if="allTrainingCompleted"
            variant="solid"
            class="px-3 py-2"
            :action="() => finishTraining()"
          >
            {{ lang.actions.complete.text }}
          </base-button>
          <base-button
            variant="outline"
            class="px-3 ml-3"
            size="medium"
            :action="() => close()"
          >
            {{ lang.actions.cancel.text }}
          </base-button>
        </div>
      </div>
      <div v-if="selectedTraining">
        <training-detail
          :training="selectedTraining"
          @onCancel="selectedTraining = null"
          @onComplete="
            () => {
              onTrainingCompleted(selectedTraining);
            }
          "
        ></training-detail>
      </div>
      <div slot="footer"></div>
    </modal>
  </div>
</template>

<script>
import { TrainingMixin } from '@/mixins';
import TrainingsCard from '@/components/phone/TrainingsCard.vue';
import Training from '@/components/phone/Training.vue';
import _ from 'lodash';
import VueTypes from 'vue-types';

export default {
  name: 'TrainingsModal',
  mixins: [TrainingMixin],
  components: {
    'trainings-card': TrainingsCard,
    'training-detail': Training,
  },
  props: {
    visible: VueTypes.bool.def(false),
    trainingItems: VueTypes.array,
    userTrainingItems: VueTypes.array,
  },
  data() {
    return {
      isShowingTrainingModal: false,
      ready: false,
      selectedTraining: null,
    };
  },
  computed: {
    lang() {
      return {
        actions: {
          cancel: {
            text: this.$t('actions.cancel'),
          },
          complete: {
            text: this.$t('actions.complete'),
          },
        },
        header: {
          text: this.$t('phoneDashboard.mandatory_training_videos'),
        },
        subHeader: {
          text: this.$t('phoneDashboard.watch_these_videos'),
          secondaryText: this.$t(
            'phoneDashboard.answer_questions_after_videos',
          ),
        },
      };
    },
  },
  methods: {
    isTrainingCompleted(training) {
      return Boolean(
        this.userTrainingItems.find(
          (userTraining) => userTraining.training === training.id,
        ),
      );
    },
    async onTrainingCompleted() {
      await this.loadTrainingData({ force: true });
      this.selectedTraining = null;
      this.userTrainingItems = this.userTrainings;
      this.trainingItems = this.trainings;
    },
    finishTraining() {
      this.$emit('onComplete', true);
      this.close();
    },
    close() {
      this.visible = false;
      this.$emit('onClose', this.visible);
    },
    getTrainingThumbnail({ settings: { videos } }) {
      const video = _.first(videos);
      if (video) {
        const videoId = _.last(video.url.split('/'));
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
      return '';
    },
  },
};
</script>
