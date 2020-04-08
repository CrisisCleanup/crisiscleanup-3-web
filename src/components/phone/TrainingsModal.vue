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
        <div class="flex">
          <div class="flex-col ml-3 mt-16 w-1/4">
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
            </base-text>
            <base-text class="m-3">
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
          title: this.$t('~~Crisis Cleanup Basic Training'),
          description: this.$t(
            '~~In this session, you will learn how the basics of how crisis clean up system works. You will know enough be comfortable creating cases, looking up records, inviting collogues, escalating cases, and asking for help.',
          ),
          timeToComplete: this.$t('~~10 minutes'),
          questions: [
            {
              prompt: this.$t('~~How much does Crisis Cleanup cost?'),
              answers: [
                { text: this.$t('~~An arm and a leg.'), correct: false },
                { text: this.$t('~~Free.'), correct: true },
                { text: this.$t('~~Your firstborn child.'), correct: false },
                { text: this.$t('~~$1,000 per year.'), correct: false },
              ],
            },
            {
              prompt: this.$t('~~When must you claim a case?'),
              answers: [
                {
                  text: this.$t('~~Every time you perform an assessment.'),
                  correct: false,
                },
                {
                  text: this.$t(
                    '~~Whenever ordered by the VOAD or state government.',
                  ),
                  correct: false,
                },
                {
                  text: this.$t('~~Only on Tuesdays at high tide.'),
                  correct: false,
                },
                {
                  text: this.$t('~~Only when convenient for you.'),
                  correct: true,
                },
              ],
            },
            {
              prompt: this.$t(
                '~~Always store as much sensitive personal information on Crisis Cleanup as possible.',
              ),
              answers: [
                { text: this.$t('~~True'), correct: false },
                { text: this.$t('~~False'), correct: true },
              ],
            },
            {
              prompt: this.$t('~~Who may enter cases?'),
              answers: [
                {
                  text: this.$t('~~Any member of the public.'),
                  correct: false,
                },
                {
                  text: this.$t(
                    '~~Any participating organization, including your own.',
                  ),
                  correct: true,
                },
                {
                  text: this.$t(
                    '~~Only 2-1-1 or other authorized call-in centers.',
                  ),
                  correct: false,
                },
                {
                  text: this.$t(
                    '~~Only your state VOAD or system administrator.',
                  ),
                  correct: false,
                },
              ],
            },
            {
              prompt: this.$t(
                '~~What should you do if a fellow relief organization doesn’t complete a case they’ve claimed?',
              ),
              answers: [
                {
                  text: this.$t('~~Fill out a trouble ticket.'),
                  correct: false,
                },
                {
                  text: this.$t('~~Complain about them on social media.'),
                  correct: false,
                },
                { text: this.$t('~~Break their kneecaps.'), correct: false },
                {
                  text: this.$t('~~Contact that organization to offer help.'),
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
          title: this.$t('~~Phone System Basic Training'),
          description: this.$t(
            '~~In this session, you will learn how to work on the front lines of disaster recovery (from home). You will know enough to be comfortable answering calls from survivors and helping them connect to the help they need.',
          ),
          timeToComplete: this.$t('~~15 minutes'),
          questions: [
            {
              prompt: this.$t(
                '~~What are your top three priorities when answering the phone?',
              ),
              answers: [
                {
                  text: this.$t(
                    '~~Solve Problems, Provide Counseling, Promise Results.',
                  ),
                  correct: false,
                },
                {
                  text: this.$t(
                    '~~Guarantee Quick Service, Claim Cases, Work Without a Break.',
                  ),
                  correct: false,
                },
                {
                  text: this.$t(
                    '~~Listen, Manage Expectations, and Enter Requests on Crisis Cleanup.',
                  ),
                  correct: true,
                },
                {
                  text: this.$t(
                    '~~Assign Cases to Other Organizations, Gather Personal Information, Nap.',
                  ),
                  correct: false,
                },
              ],
            },
            {
              prompt: this.$t(
                '~~The caller will be able to see your Caller ID.',
              ),
              answers: [
                { text: this.$t('~~True'), correct: false },
                { text: this.$t('~~False'), correct: true },
              ],
            },
            {
              prompt: this.$t(
                '~~It is better to pace yourself over several weeks than to work many hours over a couple of days.',
              ),
              answers: [
                { text: this.$t('~~True'), correct: true },
                { text: this.$t('~~False'), correct: false },
              ],
            },
            {
              prompt: this.$t(
                '~~If you begin to feel “compassion fatigue,” you should:',
              ),
              answers: [
                {
                  text: this.$t('~~Take a break.'),
                  correct: false,
                },
                {
                  text: this.$t('~~Talk to someone.'),
                  correct: false,
                },
                {
                  text: this.$t(
                    '~~Read stories of people who have been helped.',
                  ),
                  correct: false,
                },
                {
                  text: this.$t('~~All of the above.'),
                  correct: true,
                },
              ],
            },
          ],
        },
        // {
        //   completed: false,
        //   videoUrl: 'https://www.youtube.com/embed/3wumEh8wcak',
        //   imagePath: require('@/assets/newstrainingss.jpg'),
        //   title: this.$t('~~Phone system Special Cases Examples (Optional)'),
        //   description: this.$t(
        //     '~~In this session we present some of the most common out of the ordinary requests you might encounter while working the phone system and how to handle them.',
        //   ),
        //   timeToComplete: this.$t('~~10 minutes'),
        //   questions: [],
        // },
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
