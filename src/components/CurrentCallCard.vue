<template>
  <div>
    <div class="flex flex-row justify-between">
      <!--- Survivor Phone # --->
      <div class="flex-col justify-between m-3">
        <base-text
          variant="h2"
          class="justify-between text-crisiscleanup-dark-400"
          >(601) 123-7897</base-text
        >
        <!--- Survivor Contact Rate --->
        <base-text
          variant="bodysm"
          class="justify-between text-crisiscleanup-dark-400"
          >2 calls | 8 days</base-text
        >
      </div>
      <div class="flex flex-col justify-between m-3">
        <div class="flex flex-row">
          <div class="flex-col">
            <img
              src="../../src/assets/littleperson.jpg"
              alt="person icon"
              class="px-1 h-4"
            />
          </div>
          <!--- Survivor Name --->
          <div class="flex-col">
            <base-text
              variant="body"
              class="justify-between justify-between text-crisiscleanup-grey-400"
              >Julie Smith</base-text
            >
          </div>
        </div>
        <div class="flex flex-row">
          <div class="flex-col">
            <img
              src="../../src/assets/greyglobe.jpg"
              alt="globe icon"
              class="px-1 h-4"
            />
          </div>
          <!--- Survivor Language --->
          <div class="flex-col">
            <base-text
              variant="body"
              class="justify-between justify-between text-crisiscleanup-grey-400"
              >English</base-text
            >
          </div>
        </div>
      </div>
      <!--- Action Buttons --->
      <div class="flex flex-row justify-between m-3">
        <div class="flex-col">
          <!--- Mute Mic --->
          <base-button variant="h1" class="px-1">
            <img
              src="../../src/assets/mutemic.jpg"
              alt="mute mic"
              class="px-1 h-8"
            />
          </base-button>
        </div>
        <div class="flex-col">
          <!--- Add Button --->
          <base-button variant="h1" class="px-1">
            <img
              src="../../src/assets/addfriend.jpg"
              alt="add"
              class="px-1 h-8"
            />
          </base-button>
        </div>
        <div class="flex-col">
          <!--- Add Button --->
          <base-button variant="h1" class="px-1">
            <img
              src="../../src/assets/endcall.jpg"
              alt="end call"
              class="px-1 h-8"
            />
          </base-button>
        </div>
      </div>
    </div>
    <!--- Existing Cases --->
    <div class="flex flex-row justify-between">
      <div class="flex-col m-3">
        existing case 1
      </div>
      <div class="flex-col m-3">
        existing case 2
      </div>
      <div class="flex-col m-3">
        existing case 3
      </div>
    </div>
    <!--- info card --->
    <div class="info-card">
      <more-info v-if="toggleOpen" />
    </div>
    <!--- Notes Section --->
    <div class="flex-col justify-between m-3">
      <!--- Title --->
      <base-text variant="h2" class="justify-between py-2">Notes</base-text>
      <!--- Dropdown --->
      <base-button
        variant="outline"
        ccu-icon="updown"
        icon-size="md"
        @click="toggle"
        class="w-full py-1"
        :action="() => (isOpen = !isOpen)"
        >Call Status*</base-button
      >
      <div v-show="isOpen === true" class="content">
        <ul class="list py-1">
          <li>Call Status*</li>
          <li>placeholder</li>
          <li>hold-placer</li>
        </ul>
      </div>
      <!--- Input Field --->
      <base-input placeholder="Issues Resolved" size="large" class="py-2" />
    </div>
  </div>
</template>

<script>
export default {
  Name: 'CurrentCallCard',
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>
