<template>
  <component :is="page" />
</template>

<script>
import { mapGetters } from 'vuex';
import Gateway from './Gateway.vue';
import Dashboard from './Dashboard.vue';

export default {
  name: 'PhoneLayout',
  data() {
    return {
      page: Gateway,
    };
  },
  computed: {
    ...mapGetters('phone', ['connectReady']),
  },
  created() {
    if (!this.connectReady) {
      this.$store.subscribe(mutation => {
        switch (mutation.type) {
          case 'phone/setAgentState':
            this.$toasted.success('Success!');
            this.page = Dashboard;
            break;
          default:
            break;
        }
      });
    }
  },
};
</script>

<style></style>
