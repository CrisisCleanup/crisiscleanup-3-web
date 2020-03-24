<template>
  <div class="bg-crisiscleanup-light-grey">
    <div class="flex justify-around">
      <base-text variant="h2" weight="600" class="m-5"
        >Virtual Call Center Status</base-text
      >
    </div>
    <hr />
    <div class="flex flex-row justify-between m-2">
      <base-text variant="body" weight="300" class="align-middle"
        >On the Phone Right Now</base-text
      >
      <base-text variant="h1">12</base-text>
    </div>
    <hr />
    <div class="flex flex-row justify-between m-2">
      <base-text variant="body" weight="300">Remaining Callbacks</base-text>
      <base-text variant="h1">132</base-text>
    </div>
    <hr />
    <div class="flex flex-row justify-between m-2">
      <base-text variant="body" weight="300">Remaining Calldowns</base-text>
      <base-text variant="h1">54</base-text>
    </div>
    <hr />
    <div class="flex flex-row justify-between m-2">
      <div class="flex flex-col w-1/8">
        <img src="@/assets/peoplewaitingss.jpg" class="h-8" />
      </div>
      <base-text variant="h3" weight="300">Number of People Waiting</base-text>
      <base-text variant="h1" class="text-crisiscleanup-red-700">144</base-text>
    </div>
    <hr />
    <div class="flex flex-row justify-between text-center align-middle m-2">
      <base-text variant="body" weight="300">Volunteers Online</base-text>
      <base-text variant="h1">12</base-text>
    </div>
    <hr />
    <div class="flex flex-row justify-between m-2">
      <base-text variant="body" weight="300">Volunteers Needed</base-text>
      <base-text variant="h1" class="text-crisiscleanup-red-700">40</base-text>
    </div>
    <!-- <div class="flex justify-around m-2">
      <base-button variant="solid" class="py-2 px-3">
        Recruit More Volunteers
      </base-button>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'AgentAnalyticsCard',
};
</script>
