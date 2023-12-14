<template>
  <Home>
    <div class="grid--main mb-60 sm:mb-0" data-testid="testTrainingDiv">
      <!--- Title --->
      <div class="flex flex-col m-5 pb-8">
        <h1 class="text-5xl px-0.5 text-crisiscleanup-dark-500 font-bold">
          {{ $t('training.training') }}
        </h1>
        <!--- Description --->
        <p class="text-xl px-0.5">
          {{ $t('training.please_complete_training') }}
        </p>
      </div>
      <!--- Content --->
      <div class="flex flex-col sm:flex-row justify-between sm:m-5">
        <!--- Training Video --->
        <div class="flex-col sm:w-1/2">
          <div class="video-container">
            <iframe
              class="resp-video"
              data-testid="testMandatoryTrainingVideoIframe"
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/ot4LZjtK0xo"
              frameborder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>
        <!--- Training Video Description --->
        <div class="flex-col sm:w-1/2">
          <h1 class="px-10 text-3xl font-bold text-crisiscleanup-dark-500">
            {{ $t('training.mandatory_training_video') }}
          </h1>
          <p class="px-10 text-xl text-crisiscleanup-dark-400">
            {{ $t('training.mandatory_training_video_intro') }}
          </p>
        </div>
        <!--- /Training Video Description --->
      </div>
      <!--- /Content --->

      <!--- Content --->
      <div class="flex flex-col sm:flex-row justify-between sm:m-5">
        <!--- Training Video --->
        <div class="flex-col sm:w-1/2">
          <div class="video-container">
            <iframe
              class="resp-video"
              data-testid="testSupplimentPhoneTrainingIframe"
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dp_1A1qVSog"
              frameborder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>
        <!--- Training Video Description --->
        <div class="flex-col sm:w-1/2">
          <h1 class="px-10 text-3xl font-bold text-crisiscleanup-dark-500">
            {{ $t('training.suppliment_phone_training') }}
          </h1>
          <p class="px-10 text-xl text-crisiscleanup-dark-400">
            {{ $t('training.suppliment_phone_training_intro') }}
          </p>
        </div>
        <!--- /Training Video Description --->
      </div>
      <!--- /Content --->

      <!--- Content --->
      <div class="flex flex-col sm:flex-row justify-between m-5">
        <!--- Training Video --->
        <div class="flex-col sm:w-1/2">
          <div class="video-container">
            <iframe
              class="resp-video"
              data-testid="testCalldownTrainingIframe"
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/HqXm2s5Dy3c"
              frameborder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>
        <!--- Training Video Description --->
        <div class="flex-col sm:w-1/2">
          <h1 class="px-10 text-3xl font-bold text-crisiscleanup-dark-500">
            {{ $t('training.calldown_training') }}
          </h1>
          <p class="px-10 text-xl text-crisiscleanup-dark-400">
            {{ $t('training.calldown_training_intro') }}
          </p>
        </div>
        <!--- /Training Video Description --->
      </div>
      <!--- /Content --->

      <home-footer />
    </div>
  </Home>
</template>

<script lang="ts">
import Home from '@/layouts/Home.vue';

export default defineComponent({
  name: 'TrainingPage',
  components: {
    Home,
  },
});
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid:
      [r1] 'logo . main main main main survivors' 20% [r1end]
      [r2] 'nav . main main main main main' [r2end]
      [r3] 'actions . main main main main main' [r3end]
      [r4] '. . . . footer footer .' [r4end]
      / auto;

    .grid {
      &--main {
        align-self: center;
        @apply sm:mx-10 h-full;
        overflow: auto;
        grid-row: main-start / span actions-end;
      }
      &--overlay {
        grid-column: 1 / span 5;
      }
      &--footer {
        height: auto;
        display: flex;
        justify-content: space-evenly;
        @apply my-1;
      }
    }
  }
}
@media only screen and (max-width: 640px) {
  .homegrid {
    height: 100vh;
    &.grid-container {
      grid:
        [r1] 'logo survivors' [r1end]
        [r4] 'nav nav' [r4end]
        [r2] 'main main' [r2end]
        [r3] 'actions actions' [r3end]
        / auto;
      grid-template-rows: 0.5fr 0.5fr 4fr 1fr;
    }
  }
}
.resp-video {
  position: absolute;
  top: 0;
  left: 0;
  border: 0;
  width: 100%;
  height: 100%;
}
.video-container {
  position: relative;
  overflow: hidden;
  padding-top: 56.25%;
}
</style>
