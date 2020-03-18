<template>
  <div>
    <div class="flex flex-row justify-between">
      <div class="flex-col m-3">
        <img :src="profileSrc" alt="PFP" />
      </div>
      <!--- Mobile / Calls / Days --->
      <div class="flex-col justify-between m-3">
        <base-text variant="h1" class="justify-between">{{ mobile }}</base-text>
        <base-text variant="h2" class="justify-between"
          >2 calls | 8 days</base-text
        >
        <!---
        <div id="moreinfobtn" class="more-infobtn">
          <base-button
            class="text-crisiscleanup-dark-blue align-right"
            :action="() => (toggleOpen = !toggleOpen)"
            >{{ !toggleOpen ? 'more' : 'less' }} info
          </base-button>
        </div>
        --->
      </div>
      <!--- Name / Language --->
      <div class="flex-col justify-between m-3">
        <base-text
          variant="body"
          class="justify-between justify-between text-crisiscleanup-grey-400"
          >{{ name }}</base-text
        >
        <base-text
          variant="body"
          class="justify-between text-crisicleanup-grey-400"
          >English</base-text
        >
      </div>
      <!--- Action Buttons --->
      <div class="flex-row justify-between m-3">
        <!--- Convert to Buttons !!!!! --->
        <base-text variant="h1">mic</base-text>
        <!--- add friend button --->
        <base-button
          icon-size="md"
          size="md"
          variant="solid"
          ccu-icon="active"
        />
        <base-text variant="h2" class="justify-between">End</base-text>
      </div>
    </div>
    <!--- info card --->
    <div class="info-card">
      <more-info v-if="toggleOpen" />
    </div>
    <!--- Notes --->
    <div class="flex-col justify-between m-3">
      <base-text variant="h2" class="justify-between">Notes</base-text>
      <!--- spanner thingy --->
      <base-input placeholder="Issues Resolved" size="base" />
    </div>
  </div>
</template>

<script>
export default {
  Name: 'CurrentCallCard',
  Components: {
    //call
  },
};
</script>
