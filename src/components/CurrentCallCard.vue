<template>
  <div>
    <div class="flex flex-row justify-between">
      <div class="flex-col m-3">
        <img :src="profileSrc" alt="PFP" />
      </div>
      <!--- Mobile / Calls / Days --->
      <div class="flex-col justify-between m-3">
        <base-text variant="h1" class="justify-between">{{ mobile }}</base-text>
        <base-text variant="h2" class="justify-between"
          >2 calls | 8 days</base-text
        >
        <!---
        <div id="moreinfobtn" class="more-infobtn">
          <base-button
            class="text-crisiscleanup-dark-blue align-right"
            :action="() => (toggleOpen = !toggleOpen)"
            >{{ !toggleOpen ? 'more' : 'less' }} info
          </base-button>
        </div>
        --->
      </div>
      <!--- Name / Language --->
      <div class="flex-col justify-between m-3">
        <base-text variant="h1" class="justify-between">{{ name }}</base-text>
        <base-text variant="h2" class="justify-between">English</base-text>
      </div>
      <!--- Action Buttons --->
      <div class="flex-row justify-between m-3">
        <!--- Convert to Buttons !!!!! --->
        <base-text variant="h1" class="justify-between">mic</base-text>
        <base-text variant="h2" class="justify-between">Add</base-text>
        <base-text variant="h2" class="justify-between">End</base-text>
      </div>
    </div>
    <!--- info card --->
    <div class="info-card">
      <more-info v-if="toggleOpen" />
    </div>
    <!--- Buttons --->
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
export default {
  Name: 'CurrentCallCard',
  Components: {
    //call
  },
};
</script>
