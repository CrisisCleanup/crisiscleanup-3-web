<template>
  <object
    ref="icon"
    type="image/svg+xml"
    class="disaster-icon"
    :data="currentIncident.incidentImage"
    :style="style"
    @load="setColor"
  ></object>
</template>
<script>
export default {
  name: 'DisasterIcon',
  props: {
    currentIncident: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      ready: false,
    };
  },
  computed: {
    style() {
      return { visibility: this.ready ? 'visible' : 'hidden' };
    },
  },
  methods: {
    setColor() {
      this.$refs.icon
        .getSVGDocument()
        .getElementsByTagName(
          'path',
        )[0].style.fill = this.currentIncident.color;
      this.ready = true;
    },
  },
};
</script>
