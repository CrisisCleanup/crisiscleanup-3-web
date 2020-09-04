<template>
  <div
    class="opreview bg-crisiscleanup-dark-500 text-white shadow-xl opacity-75 w-64 h-128"
    :class="visibleState.state.value ? 'active' : ''"
  >
    <div
      @click="() => visibleState.toggle()"
      class="opreview__tab flex justify-center shadow-xl rounded-tl rounded-bl"
    >
      <base-text variant="bodysm">{{
        visibleState.state.value ? 'Hide' : 'Debugger'
      }}</base-text>
    </div>
    <div class="opreview__current">
      <div class="opreview__item">
        <base-text variant="h1">
          Phone Debugger
        </base-text>
      </div>
      <div class="opreview__item">
        <base-text variant="h4">
          Serving Outbound:
        </base-text>
        <base-text variant="bodysm">
          {{ currentOutbound ? currentOutbound.phone_number : 'None' }}
        </base-text>
      </div>
      <div class="opreview__item">
        <base-text variant="h4">
          Priority:
        </base-text>
        <base-text variant="bodysm">
          {{ currentOutbound ? currentOutbound.priority : '0.00' }}
        </base-text>
      </div>
      <div class="opreview__item">
        <base-text variant="h4">
          Location:
        </base-text>
        <base-text variant="bodysm">
          {{ currentOutbound ? currentOutbound.location_name : 'None' }}
        </base-text>
      </div>
      <div class="opreview__item">
        <base-text variant="h4">
          Agent State:
        </base-text>
        <base-text variant="bodysm">
          {{ agent ? agent.fullState : 'None' }}
        </base-text>
      </div>
      <div class="opreview__item">
        <base-text variant="h4">
          Contact State:
        </base-text>
        <base-text variant="bodysm">
          {{ currentContact ? currentContact.fullState : 'None' }}
        </base-text>
      </div>
      <div class="opreview__item">
        <base-text variant="h4">
          Call Type:
        </base-text>
        <base-text variant="bodysm">
          {{ currentContact ? callType : 'None' }}
        </base-text>
      </div>
    </div>
    <div class="opreview__config">
      <div class="flex h-full">
        <base-text variant="h3">Enable Outbounds:</base-text>
        <toggle-button
          :value="isServingOutbounds"
          sync
          :font-size="14"
          :width="85"
          :labels="{
            checked: 'Polling',
            unchecked: 'Disabled',
          }"
          @input="toggleServeState"
        />
      </div>
    </div>
  </div>
</template>

<script>
import useController from '@/use/phone/useController';
import useAgent from '@/use/phone/useAgent';
import useContact from '@/use/phone/useContact';
import useToggle from '@/use/useToggle';

export default {
  name: 'PhoneDebugger',
  setup() {
    const { actions, state } = useController();
    const { agent } = useAgent();
    const visibleState = useToggle();
    return {
      visibleState,
      ...actions,
      ...state,
      agent,
      ...useContact({ agent }),
      async toggleServeState(value) {
        await actions.setServingOutbounds(value);
      },
    };
  },
};
</script>

<style scoped lang="postcss">
@lost flexbox flex;
$neg-left: calc(0rem - theme('width.4'));
$neg-hidden: calc(0rem - theme('width.64'));

.opreview {
  position: fixed;
  bottom: 0;
  right: 0;
  @apply p-3;
  lost-flex-container: column;
  transform: translateX(theme('width.64'));
  transition: transform 250ms easeInOutCirc;
  &.active {
    transform: translateX(0px);
  }
  &__current {
    lost-row: 4/5;
    ^&__item {
      &:first-child {
        @apply pb-3;
      }
      p {
        @apply text-white;
      }
    }
  }
  &__config {
    lost-row: 1/5;
    & > div {
      align-items: flex-end;
      justify-content: space-evenly;

      p {
        @apply text-white;
        line-height: 22px !important;
      }
    }
  }
  &__tab {
    position: absolute;
    left: $neg-left;
    top: 0;
    @apply w-4 h-16 bg-crisiscleanup-dark-400;
    align-items: center;
    transition: background-color 250ms easeInOutCirc;
    cursor: pointer;
    &:hover {
      @apply bg-crisiscleanup-dark-500;
    }
    p {
      @apply text-white;
      writing-mode: vertical-lr;
    }
  }
}
</style>
