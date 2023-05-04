<template>
  <div
    :key="isTakingCalls"
    class="flex h-8 w-8 items-center justify-center relative"
  >
    <object
      ref="icon"
      class="cursor-pointer"
      type="image/svg+xml"
      :data="ICON_MAP.phone"
      @loadeddata="setSvgStyle"
      @load="setSvgStyle"
    />
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { ICONS, ICON_MAP } from '../../constants';
// import { theme } from '../../../tailwind.config.cjs'
import useConnectFirst from '../../hooks/useConnectFirst';

export default defineComponent({
  name: 'PhoneIndicator',
  setup(_, context) {
    const { isTakingCalls } = useConnectFirst(context);
    const icon = ref(null);
    function setSvgStyle() {
      const svgDoc = icon.value.getSVGDocument();
      const iconColor = isTakingCalls.value ? 'green' : 'red';
      if (svgDoc) {
        svgDoc.querySelectorAll('path')[0].style.fill = iconColor;
        if (svgDoc.activeElement) {
          svgDoc.activeElement.attributes.width.nodeValue = 14 * 1.8;
          svgDoc.activeElement.attributes.height.nodeValue = 19 * 1.8;
        }
      }
    }

    return {
      ICONS,
      ICON_MAP,
      isTakingCalls,
      setSvgStyle,
      icon,
    };
  },
});
</script>
