<template>
  <div>
    <div class="flex flex-row m-5 justify-between">
      <!-- PFP -->
      <div class="flex flex-col">
        <img src="" />
      </div>
      <!-- Name / Status / Affiliation -->
      <div class="flex flex-col">
        <div class="flex flex-row">
          <base-text variant="h3">Calvin Baker</base-text>
          <ul class="color-crisiscleanup-green-300">
            <li>Online</li>
          </ul>
        </div>
        <base-text variant="body" class="text-crisiscleanup-grey-300">
          Frozen Titanium Simpletons
        </base-text>
      </div>
      <!-- # of Calls -->
      <div class="flex flex-col">
        <ccu-icon type="call" />
      </div>
      <!-- Chat -->
      <div class="flex flex-col">
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
