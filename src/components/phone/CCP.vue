<template>
  <div>
    <div id="ccp-embed"></div>
    <!-- <audio id="remote-audio" autoplay></audio> -->
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { EventBus } from '@/event-bus';
import { EVENTS } from '@/services/acs.service';

export default {
  name: 'CCP',
  methods: {
    ...mapActions('phone', ['initConnect', 'setPopup']),
  },
  computed: {
    ...mapState('phone', ['streams', 'connectRunning', 'connectAuthed']),
    ...mapGetters('auth', ['isLoggedIn']),
  },
  created() {
    EventBus.$on(EVENTS.REQUEST, () => {
      if (!this.connectAuthed) {
        this.$log.info('setting popup!');
        Promise.resolve(this.setPopup(true));
      }
    });
  },
  async mounted() {
    if (!this.connectRunning) {
      this.$log.debug('CCP embed connecting...');
      const htmlEl = document.getElementById('ccp-embed');
      try {
        await this.initConnect(htmlEl);
      } catch (e) {
        this.$log.error(e);
      }
    }
  },
};
</script>

<style>
#ccp-embed {
  display: none;
}
</style>
