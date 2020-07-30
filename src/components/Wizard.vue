<template>
  <div>
    <div class="max-w-xl mx-auto my-4">
      <div class="flex py-4 mt-8">
        <div class="flex-1"></div>

        <template v-for="(step, idx) of steps">
          <div class="relative">
            <div
              class="absolute text-center"
              style="top: -2.5em; white-space: nowrap; left: -3em;"
              v-if="idx === currentStepIndex"
            >
              <div class="text-xs">{{ $t('~~Step') }} {{ idx + 1 }}</div>
              <div>{{ step.name }}</div>
            </div>
            <div
              class="w-6 h-6 bg-white mx-auto rounded-full text-lg text-white flex items-center shadow-md flex items-center justify-center"
              :class="
                idx > currentStepIndex
                  ? 'border-2 border-crisiscleanup-grey-300'
                  : ''
              "
            >
              <div
                class="w-3 h-3 rounded-full bg-primary-light"
                v-if="idx === currentStepIndex"
              ></div>
              <font-awesome-icon
                icon="check-circle"
                size="lg"
                class="text-primary-light"
                v-if="idx < currentStepIndex"
              ></font-awesome-icon>
            </div>
          </div>

          <div
            class="w-1/4 align-center items-center align-middle content-center flex"
            v-if="idx !== steps.length - 1"
          >
            <div
              class="w-full bg-crisiscleanup-grey-300 items-center align-middle align-center flex-1"
            >
              <div
                class="bg-green-light text-xs leading-none text-center text-grey-darkest rounded"
                style="width: 100%; padding-top: 1px; padding-bottom: 1px;"
              ></div>
            </div>
          </div>
        </template>
        <div class="flex-1"></div>
      </div>
    </div>

    <div class="body h-120">
      <div v-for="(step, idx) of steps" :key="step.id">
        <slot v-if="idx === currentStepIndex" :name="step.id" />
      </div>
    </div>

    <div class="footer p-3 flex justify-center">
      <base-button
        v-if="currentStepIndex === 0"
        :text="$t('actions.cancel')"
        :alt="$t('actions.cancel')"
        class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
        :action="
          () => {
            $emit('cancel');
          }
        "
      />
      <base-button
        v-if="currentStepIndex > 0"
        :text="$t('actions.back')"
        :alt="$t('actions.back')"
        class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
        :action="previous"
      />
      <base-button
        v-if="currentStepIndex < steps.length - 1"
        variant="solid"
        :text="$t('actions.next')"
        :alt="$t('actions.next')"
        class="ml-2 p-3 px-6 text-xs"
        :action="next"
      />
      <base-button
        v-if="currentStepIndex === steps.length - 1"
        variant="solid"
        :action="
          () => {
            $emit('complete');
          }
        "
        :text="$t('actions.complete')"
        :alt="$t('actions.complete')"
        class="ml-2 p-3 px-6 text-xs"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Wizard',
  data() {
    return {
      currentStepIndex: 0,
    };
  },
  computed: {
    currentStep() {
      return this.steps[this.currentStepIndex];
    },
  },
  methods: {
    next() {
      this.currentStepIndex += 1;
    },
    previous() {
      this.currentStepIndex -= 1;
    },
  },
  props: {
    steps: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
};
</script>

<style scoped>
.box {
  position: relative;
  width: 50px;
  text-align: center;
  display: inline-block;
  border: 2px solid black;
  padding: 2px 5px 2px 5px;
}
#container .box:not(:last-child) {
  margin-right: 25px;
}
#container .box:not(:last-child):after {
  position: absolute;
  content: '';
  right: -50%;
  top: 0%;
  width: 50%;
  height: 50%;
  border-bottom: 2px solid black;
}
</style>
