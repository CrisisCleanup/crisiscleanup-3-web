<template>
  <div>
    <base-button
      variant="outline"
      :action="
        () => {
          isShowingModal = true;
        }
      "
      class="m-5 px-5 py-2"
      text="incoming call"
    ></base-button>
    <modal
      v-if="isShowingModal"
      title="You have a live incoming call from:"
      modal-classes="w-108"
      @ok="isShowingModal = false"
      @close="isShowingModal = false"
    >
      <!--- Modal Header --->
      <div slot="header" class="flex p-1 justify-center m-3">
        <base-text variant="h1" weight="700"
          >You have a live
          <span class="text-crisiscleanup-green-400">incoming</span> call
          from:</base-text
        >
      </div>
      <!--- name + language --->
      <div class="flex flex-row justify-content m-5">
        <div class="flex flex-row">
          <img
            src="../../.storybook/littleperson.jpg"
            alt="person icon"
            class="px-1 h-4"
          />
          <!--- Survivor Name --->
          <base-text
            variant="body"
            class="justify-between justify-between text-crisiscleanup-grey-500"
            >Julie Smith</base-text
          >
        </div>
        <div class="flex flex-row px-2">
          <img
            src="../../.storybook/greyglobe.jpg"
            alt="globe icon"
            class="px-1 h-4"
          />
          <!--- Survivor Language --->
          <base-text
            variant="body"
            class="justify-between justify-between text-crisiscleanup-grey-500"
            >English</base-text
          >
        </div>
      </div>
      <!--- phone # + rate of contact --->
      <div class="flex flex-row justify-content m-5">
        <!--- Survivor Phone # --->
        <base-text
          variant="h2"
          class="justify-between text-crisiscleanup-dark-400"
          >(601) 123-7897</base-text
        >
        <!--- Survivor Contact Rate --->
        <div class="px-2">
          <tag
            class="justify-between bg-#F79820 rounded-full px-3 bg-primary-dark"
          >
            2 calls | 8 days
          </tag>
        </div>
      </div>
      <div class="flex flex-col m-5 py-2">
        <!--- # of existing cases --->
        <base-text><b>3 cases</b> are assigned to this number</base-text>
        <!--- cases themselves --->
        <div
          class="align-center content-center justify-center items-center m-3"
        >
          <base-text>Case #1</base-text>
          <base-text>Case #2</base-text>
          <base-text>Case #3</base-text>
        </div>
        <!--- Script --->
        <SampleScript />
        <!--- Accept / Decline Buttons --->
        <div class="flex flex-row justify-between">
          <base-button
            class="bg-crisiscleanup-dark-red hover:bg-crisiscleanup-red-100 font-bold text-white w-6/12 m-2 py-3"
            >Decline</base-button
          >
          <base-button
            class="bg-crisiscleanup-green-900 hover:bg-crisiscleanup-green-500 font-bold text-white w-6/12 m-2 py-3"
            >Accept</base-button
          >
        </div>
      </div>
      <div slot="footer" class="flex p-1 justify-center" />
    </modal>
  </div>
</template>

<script>
import SampleScript from './SampleScriptCard';
export default {
  name: 'ConnectCallPopUp',
  components: {
    SampleScript,
  },
  data() {
    return {
      isShowingModal: false,
    };
  },
};
</script>
