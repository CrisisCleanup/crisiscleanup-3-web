<template>
  <div class="h-full flex flex-row flex-grow justify-around p-3 news-card">
    <!--- media/picture --->
    <div class="card--img">
      <!-- <img :src="imagePath" alt="Video Preview" /> -->
      <img src="@/assets/newspicss.png" class="news-img shadow" />
    </div>
    <div class="card--body">
      <!--- body blurb --->
      <base-text variant="bodysm">
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

<style lang="scss" scoped>
.news-card {
  align-items: center;
  position: relative;
  &:after {
    content: '';
    position: absolute;
    background-color: #979797;
    opacity: 0.2;
    width: calc(100% - 0.75rem * 2);
    bottom: 0;
    left: 0.75rem;
    height: 1px;
  }
  .card {
    &--img {
      flex: 1;
    }
    &--body {
      flex: 2.4;
      @apply pl-3 text-crisiscleanup-dark-500;
    }
  }
}
</style>
