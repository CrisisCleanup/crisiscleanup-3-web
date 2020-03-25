<template>
  <div>
    <!--line-->
    <hr class="bg-white" />
    <!--Info Card-->
    <div class="info">
      <div class="flex flex-col">
        <div class="justify-between flex flex-row m-3">
          <div class="flex flex-col w-1/2">
            <base-text
              variant="h4"
              weight="300"
              class="text-crisiscleanup-grey-800"
              >Languages</base-text
            >
          </div>
          <div class="flex flex-col">
            <div class="align-left">
              <div class="flex flex-row">
                <div class="flex flex-col px-2">
                  <tag
                    class="text-crisiscleanup-red-300 border-crisiscleanup-red-300"
                    >English</tag
                  >
                </div>
                <div class="flex flex-col px-2">
                  <tag
                    class="text-crisiscleanup-dark-blue border-crisiscleanup-dark-blue"
                    >Spanish</tag
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="justify-between flex flex-row m-3">
          <div class="flex flex-col w-1/2">
            <base-text
              variant="h4"
              weight="300"
              class="text-crisiscleanup-grey-800"
              >Counties</base-text
            >
          </div>
          <div class="flex flex-col w-1/2">
            <base-text class="text-sm">Texas, Louisiana</base-text>
          </div>
        </div>
        <div class="flex flex-row m-3">
          <div class="flex flex-col w-1/2">
            <base-text
              variant="h4"
              class="text-crisiscleanup-grey-800"
              weight="300"
              >My Availability</base-text
            >
          </div>
          <div class="flex flex-col w-1/2">
            <base-link class="text-crisis-cleanup-yellow-900">Show</base-link>
          </div>
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
