<template>
  <div>
    <modal
      v-if="visible"
      modal-classes="w-3/5"
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
            <!-- {{ lang.header.text }} -->
            {{ $t('~~Phone System Training') }}
          </base-text>
        </header>
        <div class="flex">
          <div class="flex-col ml-3 mt-8 w-1/4">
            <img
              src="@/assets/call_center_people.png"
              width="100%"
              height="auto"
              alt="~~Call Center Users"
            />
          </div>
          <div class="flex-col m-3 my-8 items-center w-3/4">
            <!-- Greeting -->
            <base-text weight="900" class="ml-3 mr-3">
              {{ lang.subHeader.text }}
              <!-- {{
                $t('~~Thank you so much for becoming a call center volunteer!')
              }} -->
            </base-text>
            <base-text class="m-3">
              {{ lang.subHeader.secondaryText }}
              <!-- {{
                $t(
                  '~~We are doing our best to make this a rewarding way to help others from your home. We’ve prepared a quick mini course to help you get comfortable with helping survivors over the phone. Did you know that for every hour you spend on the phone, you save 29.5 volunteer hours in the field. That’s worth $2,000. For every 1.5 hours you answer calls, you enable an additional house to get cleaned up or gutted. You are not expected to be an expert, know answers to most questions, or be a professional therapist. Your job is to actively listen and gather useful assessment information. Do not rush. Take time to listen.',
                )
              }} -->
            </base-text>
          </div>
        </div>
        <trainings-card
          v-for="(training, idx) in trainings"
          :key="idx"
          :image-path="training.imagePath"
          :description="training.description"
          :time-to-complete="training.timeToComplete"
          :completed="training.completed"
          @onTrainingSelected="
            () => {
              selectedTraining = training;
            }
          "
        ></trainings-card>
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
import TrainingsCard from './TrainingsCard.vue';
import Training from './Training.vue';

export default {
  name: 'TrainingsModal',
  components: {
    'trainings-card': TrainingsCard,
    'training-detail': Training,
  },
  props: {
    visible: Boolean,
  },
  data() {
    return {
      isShowingTrainingModal: false,
      selectedTraining: null,
      allTrainingCompleted: false,
      trainings: [
        {
          completed: false,
          videoUrl: 'https://www.youtube.com/embed/3wumEh8wcak',
          imagePath: require('@/assets/newstrainingss.jpg'),
          title: '~~Crisis Cleanup Basic Training',
          description:
            '~~In this session, you will learn how the basics of how crisis clean up system works. You will know enough be comfortable creating cases, looking up records, inviting collogues, escalating cases, and asking for help.',
          timeToComplete: '10 minutes',
          questions: [
            {
              prompt: 'How much does Crisis Cleanup cost?',
              answers: [
                { text: 'An arm and a leg.', correct: false },
                { text: 'Free.', correct: true },
                { text: 'Your firstborn child.', correct: false },
                { text: '$1,000 per year.', correct: false },
              ],
            },
            {
              prompt: 'When must you claim a case?',
              answers: [
                {
                  text: 'Every time you perform an assessment.',
                  correct: false,
                },
                {
                  text: 'Whenever ordered by the VOAD or state government.',
                  correct: false,
                },
                { text: 'Only on Tuesdays at high tide.', correct: false },
                { text: 'Only when convenient for you.', correct: true },
              ],
            },
            {
              prompt:
                'Always store as much sensitive personal information on Crisis Cleanup as possible.',
              answers: [
                { text: 'True', correct: false },
                { text: 'False', correct: true },
              ],
            },
            {
              prompt: 'Who may enter cases?',
              answers: [
                { text: 'Any member of the public.', correct: false },
                {
                  text: 'Any participating organization, including your own.',
                  correct: true,
                },
                {
                  text: 'Only 2-1-1 or other authorized call-in centers.',
                  correct: false,
                },
                {
                  text: 'Only your state VOAD or system administrator.',
                  correct: false,
                },
              ],
            },
            {
              prompt:
                'What should you do if a fellow relief organization doesn’t complete a case they’ve claimed?',
              answers: [
                { text: 'Fill out a trouble ticket.', correct: false },
                {
                  text: 'Complain about them on social media.',
                  correct: false,
                },
                { text: 'Break their kneecaps.', correct: false },
                {
                  text: 'Contact that organization to offer help.',
                  correct: true,
                },
              ],
            },
          ],
        },
        {
          completed: false,
          videoUrl: 'https://www.youtube.com/embed/3wumEh8wcak',
          imagePath: require('@/assets/newstrainingss.jpg'),
          title: '~~Phone System Basic Training',
          description:
            '~~In this session, you will learn how to work on the front lines of disaster recovery (from home). You will know enough to be comfortable answering calls from survivors and helping them connect to the help they need.',
          timeToComplete: '15 minutes',
          questions: [
            {
              prompt:
                'What are your top three priorities when answering the phone?',
              answers: [
                {
                  text: 'Solve Problems, Provide Counseling, Promise Results.',
                  correct: false,
                },
                {
                  text:
                    'Guarantee Quick Service, Claim Cases, Work Without a Break.',
                  correct: false,
                },
                {
                  text:
                    'Listen, Manage Expectations, and Enter Requests on Crisis Cleanup.',
                  correct: true,
                },
                {
                  text:
                    'Assign Cases to Other Organizations, Gather Personal Information, Nap.',
                  correct: false,
                },
              ],
            },
            {
              prompt: 'The caller will be able to see your Caller ID.',
              answers: [
                { text: 'True', correct: false },
                { text: 'False', correct: true },
              ],
            },
            {
              prompt:
                'It is better to pace yourself over several weeks than to work many hours over a couple of days.',
              answers: [
                { text: 'True', correct: true },
                { text: 'False', correct: false },
              ],
            },
            {
              prompt: 'If you begin to feel “compassion fatigue,” you should:',
              answers: [
                {
                  text: 'Take a break.',
                  correct: false,
                },
                {
                  text: 'Talk to someone.',
                  correct: false,
                },
                {
                  text: 'Read stories of people who have been helped.',
                  correct: false,
                },
                {
                  text: 'All of the above.',
                  correct: true,
                },
              ],
            },
          ],
        },
      ],
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
          text: this.$t('~~Start Training'),
        },
        subHeader: {
          text: this.$t(
            '~~Thank you so much for becoming a call center volunteer! ',
          ),
          secondaryText: this.$t(
            '~~We are doing our best to make this a rewarding way to help others from your home. We’ve prepared a quick mini course to help you get comfortable with helping survivors over the phone. Did you know that for every hour you spend on the phone, you save 29.5 volunteer hours in the field. That’s worth $2,000. For every 1.5 hours you answer calls, you enable an additional house to get cleaned up or gutted. You are not expected to be an expert, know answers to most questions, or be a professional therapist. Your job is to actively listen and gather useful assessment information. Do not rush. Take time to listen.',
          ),
        },
      };
    },
  },
  methods: {
    onTrainingCompleted(selectedTraining) {
      selectedTraining.completed = true;
      this.selectedTraining = null;
      // Check to see if all trainings are completed.
      const trainingsCompleted = this.trainings.map((t) => t.completed);
      this.allTrainingCompleted = trainingsCompleted.every((b) => b);
    },
    finishTraining() {
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
