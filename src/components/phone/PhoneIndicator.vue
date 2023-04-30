<template>
  <div
    class="flex h-8 w-8 items-center justify-center relative"
    :key="isTakingCalls"
  >
    <object
      class="cursor-pointer"
      ref="icon"
      type="image/svg+xml"
      :data="ICON_MAP.phone"
      @loadeddata="setSvgStyle"
      @load="setSvgStyle"
    />
  </div>
</template>

<script lang="ts">
import { ICONS, ICON_MAP } from '../../constants';
// import { theme } from '../../../tailwind.config.cjs'
import useConnectFirst from '../../hooks/useConnectFirst';
import { ref } from 'vue';

export default defineComponent({
  name: 'PhoneIndicator',
  setup(_, context) {
    const { isTakingCalls } = useConnectFirst(context);
    const icon = ref(null);
    function setSvgStyle() {
      const svgDoc = icon.value.getSVGDocument();
      const iconColor = isTakingCalls.value ? 'green' : 'red';
      if (svgDoc) {
        svgDoc.getElementsByTagName('path')[0].style.fill = iconColor;
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
