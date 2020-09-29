<template>
  <div v-popover:phone-status @click="handleAgentState" class="pstatus">
    <object
      class="pstatus__icon"
      :class="[!connected && 'disconnected', agent && agent.friendlyState]"
      ref="icon"
      type="image/svg+xml"
      :data="enums.iconSvgs[enums.icons.phone]"
      @loadeddata="setStyle"
      @load="setStyle"
    />
    <popover
      @click.native="handleAgentState"
      transition="fade"
      event="hover"
      name="phone-status"
    >
      <div class="flex justify-center flex-col p-3">
        <base-text variant="h3" v-if="agent && agent.isOnline">{{
          $t('~~You are currently online and receiving phone calls.')
        }}</base-text>
        <base-text variant="h3" v-else>
          {{ $t('~~You are currently offline and not receiving phone calls.') }}
        </base-text>
        <base-text variant="h4" class="pt-1">
          {{
            $t('~~Click to go {0}.', [
              agent && agent.isOnline ? 'offline' : 'online',
            ])
          }}
        </base-text>
      </div>
    </popover>
  </div>
</template>

<script>
import useEnums from '@/use/useEnums';
import {
  computed,
  ref,
  onMounted,
  watch,
  onBeforeUnmount,
} from '@vue/composition-api';
import { theme } from '@/../tailwind.config';
import useAgentState from '@/use/phone/useAgentState';
import useAgent from '@/use/phone/useAgent';
import { useRouter } from '@u3u/vue-hooks';

export default {
  name: 'PhoneStatus',
  setup(props, context) {
    const icon = ref(null);
    const { agent, toggleAgentState, connected, ...agState } = useAgentState({
      ...useAgent(),
      context,
      isTrained: true,
    });

    const { router } = useRouter();

    const StateColorMap = {
      online: theme.extend.colors['crisiscleanup-green']['500'],
      connecting: theme.extend.colors['crisiscleanup-lightblue']['800'],
      talking: theme.extend.colors['crisiscleanup-dark-blue'],
      paused: theme.extend.colors['crisiscleanup-yellow']['500'],
      disconnected: theme.extend.colors['crisiscleanup-grey']['600'],
      offline: theme.extend.colors['crisiscleanup-red']['500'],
    };

    const iconColor = computed(() =>
      agent.value
        ? StateColorMap[agent.value.friendlyState]
        : StateColorMap.disconnected,
    );

    const handleAgentState = () => {
      if (!connected.value) {
        return router.push('/phone');
      }
      return toggleAgentState();
    };

    const setStyle = () => {
      const svgDoc = icon.value.getSVGDocument();
      if (svgDoc) {
        svgDoc.getElementsByTagName('path')[0].style.fill = iconColor.value;
        svgDoc.activeElement.attributes.width.nodeValue = 14 * 1.8;
        svgDoc.activeElement.attributes.height.nodeValue = 19 * 1.8;
        svgDoc.addEventListener('click', handleAgentState);
      }
    };

    watch(
      () => agent.value && agent.value.friendlyState,
      () => {
        setStyle();
      },
    );

    onMounted(() => {
      setStyle();
    });

    onBeforeUnmount(() => {
      const svgDoc = icon.value.getSVGDocument();
      if (svgDoc) {
        svgDoc.removeEventListener('click', handleAgentState);
      }
    });

    return {
      connected,
      handleAgentState,
      toggleAgentState,
      ...useEnums(),
      icon,
      setStyle,
      ...agState,
      agent,
    };
  },
};
</script>

<style scoped lang="postcss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.7s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.pstatus {
  @apply px-3;
  cursor: pointer;
  &__icon {
    transition: filter 250ms easeInOutCirc;
    &.disconnected {
      filter: none !important;
    }

    &.online {
      filter: drop-shadow(1px 1px 4px rgba(14, 210, 88, 0.5)) !important;
    }

    &.paused,
    &.connecting,
    &.talking,
    &.online {
      animation: pulse 2s infinite;
      &:hover {
        animation: none;
        cursor: pointer;
      }
    }
  }
}
</style>
