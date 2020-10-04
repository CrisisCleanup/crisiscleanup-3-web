<template>
  <!-- News 1 -->
  <div class="h-full flex flex-row flex-grow justify-around p-3 news-card">
    <!--- media/picture --->
    <div class="card--img">
      <!-- <img :src="imagePath" alt="Video Preview" /> -->
      <img src="@/assets/news/hurricane.png" class="news-img shadow" title="{{ $t('phoneDashboard.news_1_img_title') }}" />
    </div>
    <div class="card--body">
      <!--- body blurb --->
      <base-text variant="bodysm" v-html="$t('phoneDashboard.news_1')">
      </base-text>
      <div class="flex flex-row justify-between">
        <div class="flex-col">
          <!--- Date --->
          <base-text
            variant="bodysm"
            class="justify-between text-crisiscleanup-grey-800 alight-left"
          >
            {{ $t('phoneDashboard.news_1_date') }}
            <!--{{ [timeToComplete, ''] | duration('humanize') }}-->
          </base-text>
        </div>
      </div>
    </div>
  </div>
  <!-- End News -->
  <!-- News 2 -->
  <div class="h-full flex flex-row flex-grow justify-around p-3 news-card">
    <!--- media/picture --->
    <div class="card--img">
      <!-- <img :src="imagePath" alt="Video Preview" /> -->
      <img src="@/assets/news/list.png" class="news-img shadow" title="{{ $t('phoneDashboard.news_2_img_title') }}" />
    </div>
    <div class="card--body">
      <!--- body blurb --->
      <base-text variant="bodysm" v-html="$t('phoneDashboard.news_2')">
      </base-text>
      <div class="flex flex-row justify-between">
        <div class="flex-col">
          <!--- Date --->
          <base-text
            variant="bodysm"
            class="justify-between text-crisiscleanup-grey-800 alight-left"
          >
            {{ $t('phoneDashboard.news_2_date') }}
            <!--{{ [timeToComplete, ''] | duration('humanize') }}-->
          </base-text>
        </div>
      </div>
    </div>
  </div>
  <!-- End News -->
  <!-- News 3 -->
  <div class="h-full flex flex-row flex-grow justify-around p-3 news-card">
    <!--- media/picture --->
    <div class="card--img">
      <!-- <img :src="imagePath" alt="Video Preview" /> -->
      <img src="@/assets/news/char_3_phone_blue.png" class="news-img shadow" title="{{ $t('phoneDashboard.news_3_img_title') }}" />
    </div>
    <div class="card--body">
      <!--- body blurb --->
      <base-text variant="bodysm" v-html="$t('phoneDashboard.news_3')">
      </base-text>
      <div class="flex flex-row justify-between">
        <div class="flex-col">
          <!--- Date --->
          <base-text
            variant="bodysm"
            class="justify-between text-crisiscleanup-grey-800 alight-left"
          >
            {{ $t('phoneDashboard.news_3_date') }}
            <!--{{ [timeToComplete, ''] | duration('humanize') }}-->
          </base-text>
        </div>
      </div>
    </div>
  </div>
  <!-- End News -->
  <!-- News 4 -->
  <div class="h-full flex flex-row flex-grow justify-around p-3 news-card">
    <!--- media/picture --->
    <div class="card--img">
      <!-- <img :src="imagePath" alt="Video Preview" /> -->
      <img src="@/assets/news/smart_phone.png" class="news-img shadow" title="{{ $t('phoneDashboard.news_4_img_title') }}" />
    </div>
    <div class="card--body">
      <!--- body blurb --->
      <base-text variant="bodysm" v-html="$t('phoneDashboard.news_4')">
      </base-text>
      <div class="flex flex-row justify-between">
        <div class="flex-col">
          <!--- Date --->
          <base-text
            variant="bodysm"
            class="justify-between text-crisiscleanup-grey-800 alight-left"
          >
            {{ $t('phoneDashboard.news_4_date') }}
            <!--{{ [timeToComplete, ''] | duration('humanize') }}-->
          </base-text>
        </div>
      </div>
    </div>
  </div>
  <!-- End News -->
  <!-- News 5 -->
  <div class="h-full flex flex-row flex-grow justify-around p-3 news-card">
    <!--- media/picture --->
    <div class="card--img">
      <!-- <img :src="imagePath" alt="Video Preview" /> -->
      <img src="@/assets/news/photo_lady_phone_computer.png" class="news-img shadow" title="{{ $t('phoneDashboard.news_5_img_title') }}" />
    </div>
    <div class="card--body">
      <!--- body blurb --->
      <base-text variant="bodysm" v-html="$t('phoneDashboard.news_5')">
      </base-text>
      <div class="flex flex-row justify-between">
        <div class="flex-col">
          <!--- Date --->
          <base-text
            variant="bodysm"
            class="justify-between text-crisiscleanup-grey-800 alight-left"
          >
            {{ $t('phoneDashboard.news_5_date') }}
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
