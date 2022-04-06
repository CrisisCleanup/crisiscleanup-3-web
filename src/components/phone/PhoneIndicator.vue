<template>
  <div
    class="flex h-8 w-8 items-center justify-center relative"
    :key="isTakingCalls"
  >
    <object
      class="cursor-pointer"
      ref="icon"
      type="image/svg+xml"
      :data="ICON_MAP[ICONS.phone]"
      @loadeddata="setSvgStyle"
      @load="setSvgStyle"
    />
  </div>
</template>
<script>
import { ICONS, ICON_MAP } from '@/constants';
import { theme } from '@/../tailwind.config';
import { ConnectFirstMixin } from '@/mixins';

export default {
  name: 'PhoneIndicator',
  mixins: [ConnectFirstMixin],
  methods: {
    setSvgStyle() {
      const svgDoc = this.$refs.icon.getSVGDocument();
      const iconColor = this.isTakingCalls
        ? theme.extend.colors['crisiscleanup-green']['500']
        : theme.extend.colors['crisiscleanup-red']['500'];
      if (svgDoc) {
        svgDoc.getElementsByTagName('path')[0].style.fill = iconColor;
        if (svgDoc.activeElement) {
          svgDoc.activeElement.attributes.width.nodeValue = 14 * 1.8;
          svgDoc.activeElement.attributes.height.nodeValue = 19 * 1.8;
        }
      }
    },
  },
  data() {
    return {
      ICONS,
      ICON_MAP,
    };
  },
};
</script>
