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
<script lang="ts">
import { ref, computed } from "vue";
import Incident from "../models/Incident";

export default {
  name: "DisasterIcon",
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

  setup(props) {
    const ready = ref(false);
    const width_ = ref(null);
    const height_ = ref(null);
    const icon = ref<HTMLObjectElement | null>(null);

    const style = computed(() => ({
      visibility: ready.value ? "visible" : "hidden",
      pointerEvents: "none",
    }));

    const incidentImage = computed(() => {
      if (props.currentIncident && props.currentIncident.incidentImage) {
        return props.currentIncident.incidentImage;
      }
      return Incident.getIncidentImage(props.currentIncident.incident_type);
    });

    const svgDocument = computed(() => {
      return icon?.value?.getSVGDocument();
    });

    function setColor() {
      if (svgDocument.value) {
        const { value } = svgDocument;
        value.getElementsByTagName("path")[0].style.fill =
          props.currentIncident.color;
      }
    }

    function setSize() {
      if (svgDocument.value) {
        const svg = svgDocument.value.activeElement;
        if (svg) {
          // @ts-ignore
          svg.attributes.width.nodeValue = width_.value;
          // @ts-ignore
          svg.attributes.height.nodeValue = height_.value;
        }
      }
    }

    function setStyle() {
      setColor();
      if (props.width !== null || props.height !== null) {
        width_.value = props.width === null ? props.height : props.width;
        height_.value = props.height === null ? props.width : props.height;
        setSize();
      }
      ready.value = true;
    }

    return {
      ready,
      width_,
      height_,
      icon,
      style,
      incidentImage,
      svgDocument,
      setColor,
      setSize,
      setStyle,
    };
  },
};
</script>
