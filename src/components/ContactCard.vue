<template>
  <div>
    <div class="flex flex-row justify-between">
      <div class="flex-col m-3">
        <img src="" alt="PFP" />
      </div>
      <div class="flex-col justify-between m-3">
        <p class="text-lg justify-between">full name</p>
        <p class="text-md justify-between float-right">(601) 123-4567</p>
        <div id="moreinfobtn" class="more-infobtn">
          <base-button
            class="text-crisiscleanup-dark-blue align-right"
            :action="() => (toggleOpen = !toggleOpen)"
            >{{ !toggleOpen ? 'more' : 'less' }} info
          </base-button>
        </div>
      </div>
    </div>
    <!---info card--->
    <div class="info-card">
      <more-info v-if="toggleOpen" />
    </div>
    <!---Buttons--->
    <div class="items-center">
      <base-button
        class="bg-crisiscleanup-dark-red hover:bg-crisiscleanup-red-100 float-left font-bold text-white py-2 px-4 m-3"
      >
        Unavailable
      </base-button>
      <base-button
        class="bg-crisiscleanup-dark-500 hover:bg-crisiscleanup-dark-400 float-right font-bold text-white py-2 px-3 m-3"
      >
        DP
      </base-button>
    </div>
  </div>
</template>

<script>
// import indexOfFrom from '../../cypress/types/lodash/fp/indexOfFrom.vue';
import ContactMoreInfo from './ContactMoreInfo.vue';

export default {
  name: 'CallerCard',
  components: {
    'more-info': ContactMoreInfo,
  },
  data() {
    return {
      toggleOpen: false,
    };
  },
};
</script>

<style></style>
