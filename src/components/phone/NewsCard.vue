<template>
  <!-- News 1 -->
  <div
    v-if="content"
    class="flex flex-row flex-grow justify-start p-3 news-card"
  >
    <!--- media/picture --->
    <div class="card--img">
      <img :src="media.path" class="news-img shadow-md" :alt="media.alt" />
    </div>
    <div class="card--body">
      <!--- body blurb --->
      <base-text v-html="content" variant="bodysm" />
      <div class="flex flex-row justify-between">
        <div class="flex-col">
          <!--- Date --->
          <base-text
            variant="bodysm"
            class="justify-between text-crisiscleanup-grey-800 alight-left"
          >
            {{ date }}
            <!--{{ [timeToComplete, ''] | duration('humanize') }}-->
          </base-text>
        </div>
      </div>
    </div>
  </div>
  <!-- End News -->
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'NewsCard',
  props: {
    completed: VueTypes.bool,
    media: VueTypes.shape({
      path: VueTypes.string,
      alt: VueTypes.string,
    }),
    content: VueTypes.string,
    timeToComplete: VueTypes.string,
    date: VueTypes.string,
  },
  data() {
    return {
      isShowingTrainingModal: false,
    };
  },
};
</script>

<style lang="postcss" scoped>
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
      min-width: 128px;
      img {
        object-fit: cover;
        width: 128px;
        height: 128px;
      }
    }
    &--body {
      @apply pl-3 text-crisiscleanup-dark-500;
    }
  }
}
</style>

<style>
.news-card {
  .card {
    &--body {
      p > a {
        @apply text-primary-dark;
        text-decoration: underline;
        &:hover {
          text-decoration: none;
        }
      }
    }
  }
}
</style>
