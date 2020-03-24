<template>
  <div>
    <div class="flex flex-row m-5 justify-between">
      <!-- PFP -->
      <div class="flex flex-col w-1/7">
        <img src="../assets/LeaderboardPFPss.jpg" class="h-8" />
      </div>
      <!-- Name / Status / Affiliation -->
      <div class="flex flex-col w-3/7">
        <div class="flex flex-row">
          <base-text variant="h3">Calvin Baker</base-text>
          <base-text variant="h3" class="px-2">
            <span class="text-crisiscleanup-green-300">
              &#8226; Online
            </span>
          </base-text>
        </div>
        <base-text variant="body" class="text-crisiscleanup-grey-500">
          Frozen Titanium Simpletons
        </base-text>
      </div>
      <!-- # of Calls -->
      <div class="flex flex-col w-1/7">
        <base-text variant="h1" class="text-crisiscleanup-dark-500"
          >56</base-text
        >
      </div>
      <!-- Phone -->
      <div class="flex flex-col w-1/7">
        <ccu-icon type="call" />
      </div>
      <!-- Chat -->
      <div class="flex flex-col w-1/7">
        <ccu-icon type="chat" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeaderboardProfileCard',
};
</script>
