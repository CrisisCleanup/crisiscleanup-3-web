<template>
  <div>
    <div class="scriptCordion">
      <!--- Inbound Call Button --->
      <base-button
        variant="text"
        class="w-full py-3 font-bold"
        :action="() => (toggleInbound = !toggleInbound)"
      >
        Inbound Call
        {{ !toggleInbound ? 'down' : 'up' }}
      </base-button>
      <!--- Inbound Call Card --->
      <div class="info-card">
        <inbound-call v-if="toggleInbound" />
      </div>
      <!--- Confirm Help Button --->
      <base-button
        variant="text"
        class="w-full py-3 font-bold"
        :action="() => (toggleHelp = !toggleHelp)"
      >
        Confirm they still need help call
        {{ !toggleHelp ? (variant = 'down') : (variant = 'up') }}
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
