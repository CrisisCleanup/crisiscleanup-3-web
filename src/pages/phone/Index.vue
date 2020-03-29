<template>
  <component :is="page" />
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { EventBus } from '@/event-bus';
import { EVENTS as CCEvent } from '@/services/acs.service';
import Gateway from './Gateway.vue';
import Dashboard from './Dashboard.vue';
import Controller from './Controller.vue';

export default {
  name: 'PhoneLayout',
  data() {
    return {
      page: Gateway,
    };
  },
  computed: {
    ...mapGetters('phone', ['connectReady', 'agentState']),
  },
  methods: {
    ...mapActions('phone', ['setPopup']),
  },
  created() {
    EventBus.$on(CCEvent.ON_CALL, () => {
      this.page = Controller;
    });
    EventBus.$on(CCEvent.OFF_CALL, () => {
      this.page = Dashboard;
    });
    if (!this.connectReady) {
      this.unsub = this.$store.subscribe((mutation) => {
        switch (mutation.type) {
          case 'phone/setAgentState':
            this.$toasted.success('Success!');
            this.page = Dashboard;
            this.setPopup(false);
            this.unsub();
            break;
          default:
            break;
        }
      });
    } else {
      this.page = Dashboard;
    }
  },
  beforeDestroy() {
    this.unsub();
  },
};
</script>

<style></style>
