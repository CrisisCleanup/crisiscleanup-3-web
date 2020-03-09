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
        <base-text :variant="h2" class="justify-between font-bold"
          >Jane Smith Story</base-text
        >
        <!---Date--->
        <base-text :variant="bodysm" class="justify-between">
          On Friday, December 3rd, you talked with Jane Smith (W5832). Team
          Rubicon helped Jane Smith yesterday.
        </base-text>
        <!---body blurb--->
        <base-text :variant="bodysm" class="justify-between">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis
        </base-text>
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
