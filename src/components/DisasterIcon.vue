<template>
  <div
    class="disaster-icon select-none cursor-pointer"
    @dblclick="toggleEasterEgg"
  >
    <object
      v-if="randomEasterEgg"
      data-testid="testRandomEasterEggIcon"
      ref="icon"
      type="image/svg+xml"
      class="easter-egg"
      :data="randomEasterEgg"
      :style="style"
      @load="setStyle"
    ></object>
    <object
      v-else
      data-testid="testIncidentImageIcon"
      ref="icon"
      type="image/svg+xml"
      class="standard-icon"
      :data="incidentImage"
      :style="style"
      @load="setStyle"
    ></object>
  </div>
</template>
<script lang="ts">
import { ref, computed } from 'vue';
import _ from 'lodash';
import Incident from '@/models/Incident';
import { EASTER_EGG_DISASTER_ICONS } from '@/constants';

export default defineComponent({
  name: 'DisasterIcon',
  props: {
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    currentIncident: {
      type: Object,
      default() {
        return {};
      },
    },
  },

  setup(props) {
    const ready = ref(false);
    const width_ = ref<number | null>(null);
    const height_ = ref<number | null>(null);
    const randomEasterEgg = ref<string | null>(null);
    const icon = ref<HTMLObjectElement | null>(null);

    const style = computed(() => ({
      visibility: ready.value ? 'visible' : 'hidden',
      pointerEvents: 'none',
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
        value.querySelectorAll('path')[0].style.fill =
          props.currentIncident.color;
      }
    }

    function toggleEasterEgg() {
      randomEasterEgg.value = randomEasterEgg.value
        ? null
        : _.sample(EASTER_EGG_DISASTER_ICONS) || '';
    }

    function setSize() {
      if (svgDocument.value) {
        const svg = svgDocument.value.activeElement as any;
        if (svg) {
          svg.attributes.width.nodeValue = width_.value;
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
      toggleEasterEgg,
      randomEasterEgg,
    };
  },
});
</script>

<style>
.disaster-icon .standard-icon {
  @apply w-10 h-10;
}

.disaster-icon .easter-egg {
  @apply w-10 h-10;
}
</style>
