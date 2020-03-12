<template>
  <div>
    <div id="ccp-embed" />
    <audio id="remote-audio" autoplay></audio>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'CCP',
  methods: {
    ...mapActions('phone', ['initConnect']),
  },
  computed: {
    ...mapState('phone', ['streams', 'connectRunning']),
  },
  async mounted() {
    if (!this.connectRunning) {
      this.$log.debug('CCP embed connecting...');
      const htmlEl = document.getElementById('ccp-embed');
      await this.initConnect(htmlEl);
    }
  },
};
</script>

<style>
.ccp-embed {
  display: none;
}
</style>
