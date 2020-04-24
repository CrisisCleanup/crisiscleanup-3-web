<template>
  <div>
    <div class="flex flex-row p-3 justify-between">
      <!-- PFP -->
      <div class="flex flex-col w-1/7">
        <img src="@/assets/LeaderboardPFPss.jpg" class="h-8" />
      </div>
      <!-- Name / Status / Affiliation -->
      <div class="flex flex-col w-3/7">
        <div class="flex flex-row">
          <base-text variant="h3">{{ name }}</base-text>
          <base-text variant="h3" class="px-2">
            <span :class="`dot ${currentState.replace(' ', '')}`">
              &#8226; {{ currentState | capitalize }}
            </span>
          </base-text>
        </div>
        <base-text variant="body" class="text-crisiscleanup-grey-500">
          {{ orgName }}
        </base-text>
      </div>
      <!-- # of Calls -->
      <div class="flex flex-col w-1/7">
        <base-text variant="h1" class="text-crisiscleanup-dark-500">{{
          calls
        }}</base-text>
      </div>
      <!-- Phone -->
      <div class="flex flex-col w-1/7">
        <ccu-icon type="call" />
      </div>
      <!-- Chat -->
      <div class="flex flex-col w-1/7">
        <ccu-icon type="chat" />
      </div>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { AgentMixin } from '@/mixins';

export default {
  name: 'LeaderboardProfileCard',
  mixins: [AgentMixin],
  props: {
    calls: VueTypes.number,
    name: VueTypes.string,
    orgName: VueTypes.string,
    state: VueTypes.string,
  },
  computed: {
    currentState() {
      return this.getStateFriendlyName(this.state);
    },
  },
};
</script>

<style lang="scss" scoped>
.dot {
  &.offline {
    @apply text-crisiscleanup-red-500;
  }
  &.online {
    @apply text-crisiscleanup-green-300;
  }
  &.oncall {
    @apply text-crisiscleanup-dark-blue;
  }
  &.paused {
    @apply text-crisiscleanup-yellow-500;
  }
}
</style>
