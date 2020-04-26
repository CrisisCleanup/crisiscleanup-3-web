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
              alt="~~Call Center Users"
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
        <template v-if="trainings.length">
          <div class="shadow m-5">
            <trainings-card
              v-for="(training, idx) in trainings"
              :key="idx"
              :image-path="training.imagePath"
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
            <!-- :action="() => (editCardActive = !editCardActive)" -->
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
      <agent-edit-card
        :active="editCardActive"
        :request="{ phone: true, lang: true }"
        @user-updated="() => (editCardActive = false)"
      />
    </modal>
  </div>
</template>

<script>
import { TrainingMixin } from '@/mixins';
import TrainingsCard from '@/components/phone/TrainingsCard.vue';
import Training from '@/components/phone/Training.vue';
import CallerIDEditCard from '@/components/phone/CallerIDEditCard.vue';

export default {
  name: 'TrainingsModal',
  components: {
    'trainings-card': TrainingsCard,
    'training-detail': Training,
    'agent-edit-card': CallerIDEditCard,
  },
  mixins: [TrainingMixin],
  props: {
    visible: Boolean,
  },
  async mounted() {
    await this.loadTrainingData();
  },
  data() {
    return {
      isShowingTrainingModal: false,
      ready: false,
      selectedTraining: null,
      trainings: [],
      userTrainings: [],
      editCardActive: false,
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
            text: this.$t('~~Complete'),
          },
        },
        header: {
          text: this.$t('~~Mandatory Training Videos'),
        },
        subHeader: {
          text: this.$t(
            '~~Thank you so much for becoming a call center volunteer. Please watch the following short training videos to help familiarize you with the system.',
          ),
          secondaryText: this.$t(
            '~~Answer the questions after each video. After you get all of the questions correct, you can start answering calls. (Hint: you can change your answers).',
          ),
        },
      };
    },
  },
  methods: {
    isTrainingCompleted(training) {
      return Boolean(
        this.userTrainings.find(
          (userTraining) => userTraining.training === training.id,
        ),
      );
    },
    async onTrainingCompleted() {
      await this.loadTrainingData();
      this.selectedTraining = null;
    },
    finishTraining() {
      this.openModal();
      this.$emit('onComplete', true);
    },
    close() {
      this.visible = false;
      this.$emit('onClose', this.visible);
    },
    openModal() {
      this.editCardActive = true;
    },
  },
};
</script>
