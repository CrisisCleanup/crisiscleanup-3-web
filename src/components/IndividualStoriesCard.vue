<template>
  <div>
    <div class="flex flex-row justify-between">
      <!---story media/picture--->
      <div class="flex-col m-3">
        <img src="" alt="PFP" />
      </div>
      <!---story--->
      <div class="flex-col justify-between m-3">
        <p class="text-lg justify-between">Jane Smith Story</p>
        <p class="text-sm justify-between">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum
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
