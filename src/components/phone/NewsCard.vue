<template>
  <div>
    <div class="flex flex-row justify-between">
      <!--- media/picture --->
      <div class="w-1/6 m-3">
        <img :src="imagePath" alt="Video Preview" />
      </div>
      <div class="w-4/6 my-4">
        <!--- body blurb --->
        <base-text variant="bodysm" class="justify-between">
          {{ description }}
        </base-text>
        <div class="flex flex-row justify-between">
          <div class="flex-col">
            <!--- Date --->
            <base-text
              variant="bodysm"
              class="justify-between text-crisiscleanup-grey-800 alight-left"
            >
              {{ [timeToComplete, ''] | duration('humanize') }}
            </base-text>
          </div>
        </div>
      </div>
    </div>
    <!-- line -->
    <hr class="bg-white" />
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'NewsCard',
  props: {
    completed: VueTypes.bool,
    imagePath: VueTypes.string,
    description: VueTypes.string,
    timeToComplete: VueTypes.string,
  },
  data() {
    return {
      isShowingTrainingModal: false,
    };
  },
  computed: {
    lang() {
      return {
        actions: {
          start: {
            text: this.$t('~~Start'),
          },
        },
      };
    },
  },
  methods: {
    startTraining() {
      this.$emit('onTrainingSelected', true);
    },
  },
};
</script>
