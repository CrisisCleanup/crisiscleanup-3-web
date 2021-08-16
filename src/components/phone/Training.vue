<template>
  <div v-if="training">
    <header class="w-full border-b border-grey p-4">
      <base-text
        variant="body"
        weight="700"
        class="text-crisiscleanup-dark-500"
      >
        {{ $t('phoneDashboard.training') }}
      </base-text>
    </header>

    <div class="overflow-y-visible overflow-y-scroll" style="height: 80vh">
      <!--- Training Video --->
      <div class="video-container">
        <iframe
          class="resp-video"
          width="100%"
          height="400px"
          :src="training.settings.videos[0].embed"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>

      <!--- Training Video Description --->
      <div class="flex-col">
        <h1 class="px-10 my-3 text-3xl font-bold text-crisiscleanup-dark-500">
          {{ training.title }}
        </h1>
        <p class="px-10 text-xl text-crisiscleanup-dark-400">
          {{ training.description }}
        </p>
      </div>

      <div v-for="(test, testIdx) in tests" :key="`${testIdx}`">
        <!-- Questions -->
        <div
          v-for="(question, questionIdx) in test.questions"
          :key="`${testIdx}-${questionIdx}`"
          class="flex-col my-10"
        >
          <h3 class="px-10 my-3 text-lg font-bold text-crisiscleanup-dark-500">
            <font-awesome-icon
              v-if="question.answered && question.answeredCorrectly"
              icon="check"
              class="text-green-600"
            />
            <font-awesome-icon
              v-if="question.answered && !question.answeredCorrectly"
              icon="times"
              class="text-red-600"
            />
            {{ questionIdx + 1 }}. {{ question.question_t }}
          </h3>
          <div class="px-10">
            <div
              v-for="(answer, answerIdx) in question.answers_t.answers"
              :key="`${testIdx}-${questionIdx}-${answerIdx}`"
            >
              <input
                type="radio"
                :name="questionIdx"
                :id="`${testIdx}-${questionIdx}-${answerIdx}`"
                :disabled="question.disabled"
                v-model="question.answeredCorrectly"
                @change="
                  () => {
                    if (answer.is_correct) {
                      question.disabled = true;
                      question.answeredCorrectly = true;
                    } else {
                      question.answeredCorrectly = false;
                    }
                    question.answered = true;
                  }
                "
              />
              <label :for="`${questionIdx}-${answerIdx}`">
                {{ answer.text_t }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-around mt-10"></div>
    <div slot="footer" class="flex p-1 justify-center mb-3">
      <base-button
        v-if="!wrongAnswers.length"
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
        :action="() => cancel()"
      >
        {{ lang.actions.cancel.text }}
      </base-button>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { hash } from '@/utils/promise';
export default {
  name: 'Training',
  props: {
    training: VueTypes.any,
  },
  data() {
    return {
      questionsAnswered: 0,
      tests: [],
      userTests: [],
    };
  },
  async mounted() {
    const testIds = this.training.settings.tests.map((test) => test.id);
    const pageData = await hash({
      tests: this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/tests?id__in=${testIds.join(',')}`,
      ),
      user_tests: this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/user_tests`,
      ),
    });
    this.tests = pageData.tests.data.results;
    this.userTests = pageData.user_tests.data.results;
  },
  computed: {
    wrongAnswers() {
      let questions = [];
      this.tests.forEach((test) => {
        questions = [...questions, ...test.questions];
      });
      return questions.filter((question) => !question.answeredCorrectly);
    },
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
          text: this.$t('actions.start_training'),
        },
      };
    },
  },
  methods: {
    async complete() {
      await this.$http.post(
        `${process.env.VUE_APP_API_BASE_URL}/user_trainings`,
        {
          training: this.training.id,
          viewed_at: this.$moment().toISOString(),
        },
      );
      this.$emit('onComplete', true);
    },
    cancel() {
      this.$emit('onCancel', this.visible);
    },
  },
};
</script>
