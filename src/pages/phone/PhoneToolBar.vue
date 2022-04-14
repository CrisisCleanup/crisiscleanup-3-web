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
<script>
import ActiveCall from '@/components/phone/ActiveCall';
import Agent from '@/components/phone/Agent';
import UpdateStatus from '@/components/phone/UpdateStatus';
import { ConnectFirstMixin } from '@/mixins';

export default {
  name: 'PhoneToolBar',
  components: { ActiveCall, Agent, UpdateStatus },
  mixins: [ConnectFirstMixin],
  methods: {
    setTabs(tabs) {
      this.tabs = tabs;
    },
  },
  watch: {
    isOnCall(newValue, oldValue) {
      if (oldValue && !newValue) {
        this.tabs.selectTab(this.$refs.statusTab);
      }
    },
  },
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
};
</script>
