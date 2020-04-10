<template>
  <div>
    <div class="flex flex-row justify-between">
      <!--- media/picture --->
      <div class="w-2/6 m-3">
        <!-- <img :src="imagePath" alt="Video Preview" /> -->
        <img src="@/assets/newspicss.png" class="w-auto h-full" />
      </div>
      <div class="w-4/6 my-4">
        <!--- body blurb --->
        <base-text variant="bodysm" class="justify-between">
          <!-- {{ description }} -->
          {{ this.$t( `~~For those of you who have ever used our call system in the
          past (as clunky as it was) You're going to LOVE this new system. It is
          easier to ever! However it is brand new, so if you find bugs, please
          let us know.`), }}
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
};
</script>
