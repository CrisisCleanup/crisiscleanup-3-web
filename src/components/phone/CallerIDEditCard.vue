<template>
  <div>
    <base-button
      variant="outline"
      :action="() => (isShowingModal = true)"
      text="Edit Caller ID"
      class="px-3 py-2"
    ></base-button>
    <modal
      v-if="isShowingModal"
      modal-classes="w-108"
      @ok="isShowingModal = false"
      @close="isShowingModal = false"
    >
      <div class="flex flex-col justify-around ml-12 mr-12 mt-8">
        <!-- Greeting -->
        <base-text
          variant="body"
          weight="700"
          class="text-crisiscleanup-dark-500 text-center pb-3"
        >
          Welcome back John!
        </base-text>
        <base-text
          variant="body"
          weight="300"
          class="text-crisiscleanup-dark-300 text-center pb-3"
        >
          Please confirm the number you would like to use today. Don't worry, we
          will hide it on all inbound and outbond calls for your protection
        </base-text>
        <div class="flex flex-col justify-around">
          <!-- Phone # -->
          <base-button
            variant="outline"
            size="medium"
            :ccu-icon="togglePhone ? 'updown' : 'up'"
            :action="() => (togglePhone = !togglePhone)"
            class="pb-3 px-5 text-left"
            >Phone Number</base-button
          >
          <!-- Languages -->
          <div class="flex flex-col justify-start pb-3 m-1 pt-3">
            <base-text
              variant="bodysm"
              weight="300"
              class="text-crisiscleanup-dark-300 pb-3"
            >
              Choose the languages you work with
            </base-text>
            <base-button
              variant="outline"
              size="medium"
              :ccu-icon="toggleLang ? 'updown' : 'up'"
              :action="() => (toggleLang = !toggleLang)"
              class="pt-1 pb-2 px-5"
            >
              <tag closeable>English</tag> <tag closeable>Spanish</tag>
            </base-button>
          </div>
        </div>
      </div>
      <!-- Footer -->
      <div class="flex justify-around"></div>
      <div slot="footer" class="flex p-1 justify-center mb-3">
        <base-button
          variant="solid"
          class="px-3 py-2"
          :action="() => (isShowingModal = false)"
          text="Confirm"
        ></base-button>
      </div>
    </modal>
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'EditCallerID',
  data() {
    return {
      togglePhone: false,
      toggleLang: false,
      toggleStates: false,
    };
  },
  props: {
    isShowingModal: VueTypes.bool.def(false),
  },
};
</script>
