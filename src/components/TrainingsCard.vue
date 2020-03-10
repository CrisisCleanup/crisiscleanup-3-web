<template>
  <div>
    <!---media/picture--->
    <div class="flex-col m-3">
      <img src="" alt="PFP" />
    </div>
    <!---body blurb--->
    <base-text variant="bodysm" class="justify-between">
      Then go and tempor incididunt ut labore et dolore magna aliqua.
    </base-text>
    <!--- Training Start Button --->
    <div id="Trainingbtn">
      <base-button
        class="bg-crisis-cleanup-yellow-900 hover:bg-crisiscleanup-yellow-500 text-black align-right"
        href="https://crisiscleanup.zendesk.com/hc/en-us/articles/360033226251-Mandatory-Phone-System-Training"
      >
        Start
      </base-button>
    </div>
    <!---Date--->
    <base-text
      variant="bodysm"
      class="justify-between text-crisiscleanup-grey-500 alight-left"
    >
      10 Minutes
    </base-text>
  </div>
</template>

<script>
export default {
  name: 'TrainingsCard',
};
</script>
