<template>
  <div v-if="training">
    <header class="w-full border-b border-grey p-4">
      <base-text
        variant="body"
        weight="700"
        class="text-crisiscleanup-dark-500"
      >
        Training
      </base-text>
    </header>

    <div class="overflow-y-visible overflow-y-scroll" style="height: 80vh">
      <!--- Training Video --->
      <div class="video-container">
        <iframe
          class="resp-video"
          width="100%"
          height="400px"
          :src="training.videoUrl"
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

        <!-- <h1 class="px-10 my-6 text-2xl font-bold text-crisiscleanup-dark-500">
          Test Your Crisis Cleanup Knowledge!
        </h1> -->
      </div>

      <!-- Questions -->
      <div
        v-for="(question, questionIdx) in training.questions"
        :key="questionIdx"
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
          {{ questionIdx + 1 }}. {{ question.prompt }}
        </h3>
        <div class="px-10">
          <div
            v-for="(answer, answerIdx) in question.answers"
            :key="`${questionIdx}-${answerIdx}`"
          >
            <input
              type="radio"
              :value="answer.correct"
              :name="questionIdx"
              :id="`${questionIdx}-${answerIdx}`"
              :disabled="question.disabled"
              v-model="question.answeredCorrectly"
              @change="
                () => {
                  if (question.answeredCorrectly) {
                    question.disabled = true;
                    questionsAnswered++;
                  }
                  question.answered = true;
                }
              "
            />
            <label :for="`${questionIdx}-${answerIdx}`">
              {{ answer.text }}
            </label>
          </div>
          <!-- <base-radio
            v-for="(answer, answerIdx) in question.answers"
            :key="`${questionIdx}-${answerIdx}`"
            class="my-1"
            :name="questionIdx"
            :type="question.answerType"
            :v-model="question.answeredCorrectly"
            :label="answer.correct"
            :value="answer.correct"
            @change="question.answeredCorrectly = $event"
          >
            {{ answer.text }} - {{ question.answeredCorrectly }}
          </base-radio> -->
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-around mt-10"></div>
    <div slot="footer" class="flex p-1 justify-center mb-3">
      <base-button
        v-if="questionsAnswered === training.questions.length"
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
  </div>
</template>

<script>
import VueTypes from 'vue-types';
export default {
  name: 'Training',
  props: {
    training: VueTypes.any,
  },
  data() {
    return {
      questionsAnswered: 0,
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
      };
    },
  },
  methods: {
    complete() {
      this.$emit('onComplete', true);
      this.close();
    },
    cancel() {
      this.$emit('onCancel', this.visible);
    },
  },
};
</script>
