<template>
  <div>
    <base-button
      variant="outline"
      :action="
        () => {
          isShowingModal = true;
        }
      "
      text="Show Modal"
    ></base-button>
    <modal
      v-if="isShowingModal"
      title="Basic Modal"
      modal-classes="w-108"
      @ok="isShowingModal = false"
      @close="isShowingModal = false"
    >
      <div class="flex justify-around">
        <!-- Greeting -->
        <base-text variant="h1" class="text-crisiscleanup-dark-500">
          Welcome back John!
        </base-text>
        <base-text
          variant="h1"
          weight="300"
          class="text-crisiscleanup-dark-200"
        >
          Please confirm the number you would like to use today. <br />
          Don't worry, we will hide it on all inbound and outbond <br />
          calls for your protection
        </base-text>
        <div class="flex flex-col justify-around">
          <!-- Phone # -->
          <base-button
            variant="outline"
            size="medium"
            :icon="togglePhone ? 'updown' : 'up'"
            :action="() => (togglePhone = !togglePhone)"
            >Phone Number</base-button
          >
          <!-- Languages -->
          <base-text
            variant="h1"
            weight="300"
            class="text-crisiscleanup-dark-200"
          >
            Choose the languages you work weight
          </base-text>
          <base-button
            variant="outline"
            size="medium"
            :icon="toggleLang ? 'updown' : 'up'"
            :action="() => (toggleLang = !toggleLang)"
          >
            <tag closeable>English</tag> <tag closeable>Spanish</tag>
          </base-button>
        </div>
      </div>
      <!-- Divider -->
      <hr />
      <div class="flex flex-col justify-around">
        <!-- States -->
        <base-button
          variant="outline"
          size="medium"
          :icon="toggleStates ? 'updown' : 'up'"
          :action="() => (toggleStates = !toggleStates)"
        >
          <tag closeable>Missouri</tag>
        </base-button>
      </div>
      <!-- Footer -->
      <div class="flex justify-around"></div>
      <div slot="footer" class="flex p-1 justify-center">
        <base-button
          variant="solid"
          class="px-3 py-2"
          :action="
            () => {
              isShowingModal = false;
            }
          "
          text="Confirm"
        ></base-button>
      </div>
    </modal>
  </div>
</template>

<script>
export default {
  name: 'EditCallerID',
  data() {
    return {
      togglePhone: false,
      toggleLang: false,
      toggleStates: false,
    };
  },
};
</script>
