<template>
  <div class="flex flex-col">
    <div class="steps h-12">
      <div
        class="flex items-center h-full justify-evenly bg-white"
        data-testid="testStepsDiv"
      >
        <div
          v-for="(step, index) in steps"
          :key="step.props.name"
          :class="{
            'is-active': index === selectedIndex,
            disabled: step.props.disabled,
            [stepClasses]: true,
            [stepActiveClasses]: index === selectedIndex,
            [stepDefaultClasses]: true,
          }"
          class="cursor-pointer flex items-center"
          @click="goToStep(index)"
        >
          <div
            class="mr-1 w-5 h-5 bg-primary-light text-black text-xs px-1.5 pt-1 rounded-full"
          >
            <div v-if="completedSteps.has(selectedIndex)">
              <ccu-icon
                :alt="$t('incidentBuilder.completed')"
                data-testid="testIncidentBuilderCompletedIcon"
                type="completed"
                size="small"
              />
            </div>
            <div v-else>{{ index + 1 }}</div>
          </div>
          <div>{{ step.props.name }}</div>
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
      <div v-if="loading" class="flex h-full items-center justify-center">
        <spinner show-quote/>
      </div>
    </div>

    <div class="p-6 h-12 bg-white flex items-center justify-between">
      <base-button
        :disabled="isFirst"
        :text="$t('actions.previous_step')"
        :alt="$t('actions.previous_step')"
        data-testid="testPreviousStepButton"
        variant="outline"
        class="p-2"
        :action="previousStep"
      />
      <base-button
        :text="isLast ? $t('Done') : $t('actions.save_next')"
        :alt="isLast ? $t('Done') : $t('actions.save_next')"
        data-testid="testSaveOrNextButton"
        variant="solid"
        class="p-2"
        :action="nextStep"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { VNode } from 'vue';
import {
  computed,
  onBeforeMount,
  onMounted,
  provide,
  reactive,
  toRefs,
} from 'vue';
import { useToast } from 'vue-toastification';
import { getErrorMessage } from '@/utils/errors';

interface StepProps {
  name: string;
  disabled: boolean;
  onSave: Function;
}
export default defineComponent({
  name: 'Wizard',
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

  setup(_, { slots, emit }) {
    const $toasted = useToast();

    const state = reactive({
      selectedIndex: 0,
      steps: [] as VNode<StepProps>[],
      count: 0,
      completedSteps: new Set(),
    });

    provide('StepsProvider', state);

    const selectStep = (i: number) => {
      state.selectedIndex = i;
      emit('stepSelected', state.steps[i].props.name);
    };

    function goToStep(index: number) {
      if (state.selectedIndex >= index || state.completedSteps.has(index)) {
        selectStep(index);
      }
    }

    onBeforeMount(() => {
      if (slots.default) {
        state.steps = slots
          .default()
          .filter((child: any) => child.type.name === 'Step');
      }
    });

    onMounted(() => {
      selectStep(0);
      emit('mounted', this);
    });

    const isFirst = computed(() => {
      if (state.steps.length > 0) {
        return state.selectedIndex === 0;
      }

      return false;
    });

    const isLast = computed(() => {
      if (state.steps.length > 0) {
        return state.selectedIndex === state.steps.length - 1;
      }

      return false;
    });

    const currentStep = computed(() => {
      return state.steps[state.selectedIndex];
    });

    async function nextStep() {
      try {
        const onSave = currentStep?.value?.props['on-save'];
        if (onSave) {
          await onSave();
        }
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
        return;
      }

      state.completedSteps.add(state.selectedIndex);
      for (let i = 0; i < state.steps.length; i++) {
        if (i === state.selectedIndex) {
          selectStep(i + 1);
          break;
        }
      }
    }

    async function previousStep() {
      for (let i = 0; i < state.steps.length; i++) {
        if (i === state.selectedIndex) {
          selectStep(i - 1);
        }
      }
    }

    return {
      ...toRefs(state),
      goToStep,
      isFirst,
      isLast,
      currentStep,
      nextStep,
      previousStep,
    };
  },
});
</script>

<style scoped>
.disabled {
  @apply text-crisiscleanup-grey-900;
}
</style>
