<template>
  <div>
    <modal
      v-if="visible"
      modal-classes="w-3/5"
      @ok="visible = false"
      @close="visible = false"
    >
      <header class="w-full border-b border-grey p-4">
        <base-text
          variant="body"
          weight="700"
          class="text-crisiscleanup-dark-500"
        >
          {{ lang.header.text }}
        </base-text>
      </header>
      <div class="flex">
        <div class="flex-col m-3">
          <img
            src="@/assets/call_center_people.png"
            width="200px"
            alt="Call Center Users"
          />
        </div>
        <div class="flex-col m-3 my-8 items-center">
          <!-- Greeting -->
          <base-text weight="900" class="text-xl pb-3">
            {{ lang.subHeader.text }}
          </base-text>
          <base-text class="pb-3">
            {{ lang.subHeader.secondaryText }}
          </base-text>
        </div>
      </div>
      <trainings-card
        v-for="(training, idx) in trainings"
        :key="idx"
        :image-path="training.imagePath"
        :description="training.description"
        :time-to-complete="training.timeToComplete"
      ></trainings-card>
      <!-- Footer -->
      <div class="flex justify-around mt-10"></div>
      <div slot="footer" class="flex p-1 justify-center mb-3">
        <base-button
          variant="solid"
          class="px-3 py-2"
          :action="() => complete()"
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
    </modal>
  </div>
</template>

<script>
import TrainingsCard from './TrainingsCard.vue';

export default {
  name: 'TrainingsModal',
  components: {
    'trainings-card': TrainingsCard,
  },
  props: {
    visible: Boolean,
  },
  data() {
    return {
      isShowingTrainingModal: false,
      trainings: [
        {
          imagePath: require('@/assets/newstrainingss.jpg'),
          description:
            'Then go and tempor incididunt ut labore et dolore magna aliqua.',
          timeToComplete: '10 minutes',
        },
        {
          imagePath: require('@/assets/newstrainingss.jpg'),
          description:
            'Then go and tempor incididunt ut labore et dolore magna aliqua.',
          timeToComplete: '15 minutes',
        },
      ],
    };
  },
  computed: {
    lang() {
      return {
        actions: {
          cancel: {
            text: this.$t('~~Cancel'),
          },
          complete: {
            text: this.$t('~~Complete'),
          },
        },
        header: {
          text: this.$t('~~Start Training'),
        },
        subHeader: {
          text: this.$t('~~Great to see you are ready to start working!'),
          secondaryText: this.$t(
            '~~You must complete the following trainings and read some news before starting.',
          ),
        },
      };
    },
  },
  methods: {
    complete() {
      this.$emit('onComplete', true);
      this.close();
    },
    close() {
      this.visible = false;
      this.$emit('onClose', this.visible);
    },
  },
};
</script>
