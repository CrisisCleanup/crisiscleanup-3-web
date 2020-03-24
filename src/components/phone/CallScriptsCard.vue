<template>
  <div>
    <div class="scripts-accordion">
      <!--- Inbound Call Button --->
      <base-button
        variant="text"
        class="w-full py-3 font-bold text-crisiscleanup-dark-400"
        :action="() => (toggleInbound = !toggleInbound)"
        :ccu-icon="toggleInbound ? 'up' : 'down'"
      >
        Inbound Call
      </base-button>
      <!--- Inbound Call Card --->
      <div class="info-card">
        <inbound-call v-if="toggleInbound" />
      </div>
      <!--- Confirm Help Button --->
      <base-button
        variant="text"
        class="w-full py-3 font-bold text-left text-crisiscleanup-dark-400"
        :action="() => (toggleHelp = !toggleHelp)"
        :ccu-icon="toggleHelp ? 'up' : 'down'"
      >
        Confirm they still need help call
      </base-button>
      <!--- Confirm Help Card --->
      <div class="info-card">
        <confirm-help v-if="toggleHelp" />
      </div>
    </div>
  </div>
</template>

<script>
import InboundCallsCard from './InboundCallsCard';
import ConfirmHelpCard from './ConfirmHelpCard';

export default {
  name: 'CallScriptsCard',
  components: {
    'inbound-call': InboundCallsCard,
    'confirm-help': ConfirmHelpCard,
  },
  data() {
    return {
      toggleInbound: false,
      toggleHelp: false,
    };
  },
};
</script>
