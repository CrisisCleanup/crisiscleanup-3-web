<template>
  <div>
    <div class="flex flex-row justify-between">
      <!---story media/picture--->
      <div class="flex-col m-3">
        <img src="" alt="PFP" />
      </div>
      <!---story--->
      <div class="flex-col justify-between m-3">
        <!---name--->
        <p class="text-lg justify-between font-bold">Jane Smith Story</p>
        <!---Date--->
        <p class="text-sm justify-between">
          On Friday, December 3rd, you talked with Jane Smith (W5832). Team
          Rubicon helped Jane Smith yesterday.
        </p>
        <!---body blurb--->
        <p class="text-sm justify-between">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis
        </p>
        <!---Read Full Story Button--->
        <div id="moreinfobtn" class="more-infobtn">
          <base-button class="text-crisis-cleanup-yellow-900 align-left">
          </base-button>
        </div>
      </div>
    </div>
    <!--line-->
    <hr class="bg-white" />
  </div>
</template>

<script>
export default {
  name: 'IndividualStoriesCard',
};
</script>
