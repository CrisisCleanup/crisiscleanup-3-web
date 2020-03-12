<template>
  <div>
    <div id="ccp-embed" />
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
    ...mapState('phone', ['streams']),
  },
  async mounted() {
    const htmlEl = document.getElementById('ccp-embed');
    this.initConnect(htmlEl);
  },
};
</script>

<style scoped>
.ccp-embed {
  display: none;
}
</style>
