<template>
  <div>
    <base-button
      variant="outline"
      :action="
        () => {
          isShowingModal = true;
        }
      "
      class="m-3 px-5 py-2"
      text="incoming call"
    ></base-button>
    <modal
      v-if="isShowingModal"
      title="You have a live incoming call from:"
      modal-classes="w-108"
      @ok="isShowingModal = false"
      @close="isShowingModal = false"
    >
      <div class="flex flex-row justify-content">
        <div class="flex flex-row">
          <img
            src="../../.storybook/littleperson.jpg"
            alt="person icon"
            class="px-1 h-4"
          />
          <!--- Survivor Name --->
          <base-text
            variant="body"
            class="justify-between justify-between text-crisiscleanup-grey-400"
            >Julie Smith</base-text
          >
        </div>
        <div class="flex flex-row">
          <img
            src="../../.storybook/greyglobe.jpg"
            alt="globe icon"
            class="px-1 h-4"
          />
          <!--- Survivor Language --->
          <base-text
            variant="body"
            class="justify-between justify-between text-crisiscleanup-grey-400"
            >English</base-text
          >
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
export default {
  name: 'ConnectCallPopUp',
  data() {
    return {
      isShowingModal: false,
    };
  },
};
</script>
