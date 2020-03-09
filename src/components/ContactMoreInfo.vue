<template>
  <div>
    <!--line-->
    <hr class="bg-white" />
    <!--Info Card-->
    <div class="info">
      <div class="flex flex-col">
        <div class="justify-between flex flex-row m-3">
          <base-text class="text-md text-crisiscleanupgrey-200"
            >Languages</base-text
          >
          <base-text class="text-sm" text-crisiscleanupgrey-200>eng</base-text>
        </div>
        <div class="justify-between flex flex-row m-3">
          <base-text :variant="h4" class="text-crisiscleanupgrey-200"
            >Counties</base-text
          >
          <base-text class="text-sm">Texas, Louisiana</base-text>
        </div>
        <div class="justify-between flex flex-row m-3">
          <base-text :variant="h4" class="text-crisiscleanupgrey-200"
            >My Availability</base-text
          >
          <base-button class="text-crisis-cleanup-yellow-900 align-right"
            >Show</base-button
          >
        </div>
      </div>
    </div>
    <!--line-->
    <hr class="bg-white" />
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'Info',
  props: {
    toggleOpen: VueTypes.bool.def(false),
  },
};
</script>

<style>
.show-btn {
  color: #f79820;
  text-align: left;
  text-decoration: underline;
  font-size: 13px;
  padding-left: 10px;
}
</style>
