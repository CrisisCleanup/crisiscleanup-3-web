<template>
  <div class="flex-wrap m-3 p-3">
    <div class="flex flex-row">
      <div class="flex-col">
        <font-awesome-icon
          class="content-center mx-1 phone-icon"
          icon="phone-alt"
        />
      </div>
      <div class="flex-col">
        <div class="justify-between flex flex-row">
          <div class="">{{ stats.contactsInQueue }}</div>
          <button class="text-sm">show all</button>
        </div>
        <p class="justify-center">Number of People waiting</p>
      </div>
    </div>
    <div class="flex flex-row row-span-3 justify-between my-3">
      <div class="text-base">
        <p class="justify-start">Remaining Calls</p>
      </div>
      <div class="text-base font-semibold">
        <div class="justify-end">
          {{ remainingCallbacks }}
        </div>
      </div>
    </div>
    <div class="flex flex-row justify-between my-3">
      <p class="justify-start">Remaining Calldowns</p>
      <div class="text-base font-semibold">
        {{ remainingCalldowns }}
      </div>
    </div>
    <div class="flex flex-row justify-between my-3">
      <p class="justify-start">On the phone now</p>
      <div class="text-base font-semibold">
        {{ stats.agentsOnContact }}
      </div>
    </div>
    <div class="flex flex-row justify-between my-3">
      <p class="justify-start">Volunteers Available</p>
      <div class="text-base font-semibold">
        {{ stats.agentsAvailable }}
      </div>
    </div>
    <div class="flex flex-row justify-between my-3">
      <p class="justify-start">Volunteers Needed</p>
      <div class="text-base font-semibold">
        {{ volunteersNeeded }}
      </div>
    </div>
    <div class="flex justify-center my-3">
      <button
        id="display-Modal"
        class="text-sm font-semibold button mx-3 px-3"
        @click="displayModal = true"
      >
        Recruit More Volunteers
      </button>
      <modal v-if="displayModal" @close="displayModel = false">
        I was here.
      </modal>
    </div>
  </div>
</template>
<script>
import VueTypes from 'vue-types';

export default {
  name: 'StatsCard',
  props: {
    stats: VueTypes.shape({
      agentsAvailable: VueTypes.integer,
      agentsOnContact: VueTypes.integer,
      contactsInQueue: VueTypes.integer,
    }),
  },
};
</script>

<style scoped>
.genstatscard-container {
  display: flex-box;
}

.button {
  background-color: orange;
  border: solid 2px orange;
  overflow: 0;
}
</style>
