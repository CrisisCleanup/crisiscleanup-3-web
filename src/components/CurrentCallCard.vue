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
      <!--- Survivor Name --->
      <div class="flex-col justify-between m-3">
        <base-text
          variant="body"
          class="justify-between justify-between text-crisiscleanup-grey-400"
          >Julie Smith</base-text
        >
        <!--- Language --->
        <base-text
          variant="body"
          class="justify-between text-crisiscleanup-grey-400"
          >English</base-text
        >
      </div>
      <!--- Action Buttons --->
      <div class="flex flex-row justify-between m-3">
        <div class="flex-col">
          <!--- Convert to Buttons !!!!! --->
          <base-button variant="h1" class="px-1">mic</base-button>
        </div>
        <div class="flex-col">
          <!--- add friend button --->
          <div class="px-1">
            <base-button
              icon-size="md"
              size="md"
              ccu-icon="active"
              class="px-1 py-1"
            />
          </div>
        </div>
        <div class="flex-col">
          <base-button variant="h2" class="justify-between px-1"
            >End</base-button
          >
        </div>
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
        class="py-2 px-5 width-full"
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
