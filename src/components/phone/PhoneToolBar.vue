<template>
  <div class="flex">
    <div class="flex-grow">
      <Agent
        @onLoggedIn="onLoggedIn"
        @onToggleOutbounds="onToggleOutbounds"
        class="border-b shadow"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Agent from '../../components/phone/Agent.vue';

export default defineComponent({
  name: 'PhoneToolBar',
  components: { Agent },
  data() {
    return {
      tabs: null,
    };
  },
  props: {
    completeCall: {
      type: Function,
      default: () => {},
    },
    onLoggedIn: {
      type: Function,
      default: () => {},
    },
    onToggleOutbounds: {
      type: Function,
      default: () => {},
    },
    selectCase: {
      type: Function,
      default: () => {},
    },
    worksiteId: {
      type: Function,
      default: () => {},
    },
  },
});
</script>
