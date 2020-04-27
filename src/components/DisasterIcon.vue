<template>
  <object
    ref="icon"
    type="image/svg+xml"
    class="disaster-icon"
    :data="currentIncident.incidentImage"
    :style="style"
    @load="setStyle"
  ></object>
</template>
<script>
export default {
  name: 'DisasterIcon',
  props: {
    width: {
      type: [Number, null],
      default: null,
    },
    height: {
      type: [Number, null],
      default: null,
    },
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
    setStyle() {
      this.setColor();
      if (this.width !== null || this.height !== null) {
        this.width = this.width === null ? this.height : this.width;
        this.height = this.height === null ? this.width : this.height;
        this.setSize();
      }
      this.ready = true;
    },
    setColor() {
      this.$refs.icon
        .getSVGDocument()
        .getElementsByTagName(
          'path',
        )[0].style.fill = this.currentIncident.color;
    },
    setSize() {
      const svg = this.$refs.icon.getSVGDocument().activeElement;
      svg.attributes.width.nodeValue = this.width;
      svg.attributes.height.nodeValue = this.height;
    },
  },
};
</script>
