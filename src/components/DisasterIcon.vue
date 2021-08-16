<template>
  <object
    ref="icon"
    type="image/svg+xml"
    class="disaster-icon"
    :data="incidentImage"
    :style="style"
    @load="setStyle"
  ></object>
</template>
<script>
import Incident from '@/models/Incident';

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
      width_: null,
      height_: null,
    };
  },
  computed: {
    style() {
      return { visibility: this.ready ? 'visible' : 'hidden' };
    },
    incidentImage() {
      if (this.currentIncident && this.currentIncident.incidentImage) {
        return this.currentIncident.incidentImage;
      }
      return Incident.getIncidentImage(this.currentIncident.incident_type);
    },
    svgDocument() {
      if (!this.$refs.icon) return null;
      const svgDoc = this.$refs.icon.getSVGDocument();
      if (!svgDoc) return null;
      return svgDoc;
    },
  },
  methods: {
    setStyle() {
      this.setColor();
      if (this.width !== null || this.height !== null) {
        this.width_ = this.width === null ? this.height : this.width;
        this.height_ = this.height === null ? this.width : this.height;
        this.setSize();
      }
      this.ready = true;
    },
    setColor() {
      if (!this.svgDocument) return;
      this.svgDocument.getElementsByTagName('path')[0].style.fill =
        this.currentIncident.color;
    },
    setSize() {
      if (!this.svgDocument) return;
      const svg = this.svgDocument.activeElement;
      svg.attributes.width.nodeValue = this.width_;
      svg.attributes.height.nodeValue = this.height_;
    },
  },
};
</script>
