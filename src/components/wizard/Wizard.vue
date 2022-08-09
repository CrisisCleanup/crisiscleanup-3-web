<template>
  <div class="flex flex-col">
    <div class="steps h-12">
      <div class="flex items-center h-full justify-evenly bg-white">
        <div
          v-for="(step, index) in steps"
          :key="step.name"
          :class="{
            'is-active': step.isActive,
            disabled: step.disabled,
            [stepClasses]: true,
            [stepActiveClasses]: step.isActive,
            [stepDefaultClasses]: true,
          }"
          class="cursor-pointer flex items-center"
          @click="goToStep(step, index)"
        >
          <div
            class="
              mr-1
              w-5
              h-5
              bg-primary-light
              text-black text-xs
              px-1.5
              pt-1
              rounded-full
            "
          >
            <div v-if="step.isCompleted">
              <ccu-icon
                :alt="$t('incidentBuilder.completed')"
                type="completed"
                size="small"
              />
            </div>
            <div v-else>{{ index + 1 }}</div>
          </div>
          <div>{{ step.name }}</div>
          <hr
            v-if="index + 1 !== steps.length"
            class="w-12 ml-12 border-t-4 border-dotted"
          />
        </div>
      </div>
    </div>

    <div class="h-108 flex-grow overflow-auto my-4">
      <div v-show="!loading">
        <slot></slot>
      </div>
      <Loader v-if="loading" :loading="true" class="h-full" />
    </div>

    <div class="p-6 h-12 bg-white flex items-center justify-between">
      <base-button
        :disabled="isFirst"
        :text="$t('actions.previous_step')"
        :alt="$t('actions.previous_step')"
        variant="outline"
        class="p-2"
        :action="previousStep"
      />
      <base-button
        :text="isLast ? $t('Done') : $t('actions.save_next')"
        :alt="isLast ? $t('Done') : $t('actions.save_next')"
        variant="solid"
        class="p-2 w-24"
        :action="nextStep"
      />
    </div>
  </div>
</template>

<script>
import { getErrorMessage } from '@/utils/errors';
import Loader from '@/components/Loader.vue';

export default {
  name: 'Wizard',
  components: { Loader },
  props: {
    stepDefaultClasses: {
      type: String,
      default: 'py-1 px-3 border-b-2 last:flex-grow',
    },
    stepClasses: {
      type: String,
      default: '',
    },
    stepActiveClasses: {
      type: String,
      default: 'border-b-2 border-primary-light',
    },
    stepDetailsClasses: {
      type: String,
      default: 'steps-details mt-2',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { steps: [] };
  },

  mounted() {
    this.steps = [...this.$children].filter(
      (child) => child.$options._componentTag === 'Step',
    );
    this.steps[0].isActive = true;
    this.$emit('mounted', this);
  },
  computed: {
    isFirst() {
      if (this.steps.length > 0) {
        return this.steps[0].isActive === true;
      }
      return false;
    },
    isLast() {
      if (this.steps.length > 0) {
        return this.steps[this.steps.length - 1].isActive === true;
      }
      return false;
    },
    currentStepIndex() {
      return this.steps.findIndex((step) => step.isActive);
    },
    currentStep() {
      return this.steps[this.currentStepIndex];
    },
  },
  methods: {
    selectStep(selectedStep) {
      if (selectedStep.disabled) {
        return;
      }
      this.steps.forEach((step) => {
        step.isActive = step.name === selectedStep.name;
      });
      this.$emit('stepSelected', selectedStep.name);
    },
    async nextStep() {
      try {
        await this.currentStep.onSave();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
        return;
      }
      this.currentStep.isCompleted = true;
      for (let i = 0; i < this.steps.length; i++) {
        if (this.steps[i].isActive === true) {
          this.selectStep(this.steps[i + 1]);
          break;
        }
      }
    },
    async previousStep() {
      for (let i = 0; i < this.steps.length; i++) {
        if (this.steps[i].isActive === true) {
          this.selectStep(this.steps[i - 1]);
        }
      }
    },
    goToStep(step, index) {
      if (this.currentStepIndex >= index || this.steps[index - 1].isCompleted) {
        this.selectStep(step);
      }
    },
  },
};
</script>

<style scoped>
.disabled {
  @apply text-crisiscleanup-grey-900;
}
</style>
