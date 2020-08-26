<template>
  <div>
    <div id="ccp-embed"></div>
    <!-- <audio id="remote-audio" autoplay></audio> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { EventBus } from '@/event-bus';
import { EVENTS } from '@/services/acs.service';
import { getModule } from 'vuex-module-decorators';
import StreamsStore from '@/store/modules/phone/streams';

export default {
  name: 'CCP',
  methods: {
    async init() {
      if (!connect.core.initialized) {
        this.$log.debug('CCP embed connecting...');
        const htmlEl = document.getElementById('ccp-embed');
        const phStore = getModule(StreamsStore, this.$store);
        try {
          await phStore.init({ element: htmlEl });
        } catch (e) {
          this.$log.error(e);
        }
      }
    },
  },
  computed: {
    ...mapGetters('auth', ['isLoggedIn']),
  },
  created() {
    EventBus.$on(EVENTS.INIT, () => {
      this.$log.info('event init');
      if (!connect.core.initialized) {
        const htmlEl = document.getElementById('ccp-embed');
        const phStore = getModule(StreamsStore, this.$store);
        try {
          phStore
            .init({ element: htmlEl })
            .then(() => this.$log.info('CCP ready!'))
            .catch((e) => this.$log.error(e));
        } catch (e) {
          this.$log.error(e);
        }
      }
    });
  },
};
</script>

<style>
#ccp-embed iframe {
  display: none;
}
</style>
