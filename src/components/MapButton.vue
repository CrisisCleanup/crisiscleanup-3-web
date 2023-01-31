<template>
  <v-popover
    :auto-hide="false"
    popover-class="layer-action-popover"
    placement="bottom-end"
    :disabled="disabled || actions?.length !== 0"
  >
    <ccu-icon
      :alt="title || buttonText"
      :class="['map-button', buttonClass, selected ? 'selected' : '']"
      :type="icon"
      size="xl"
      @click="$emit('click')"
    />
    <slot
      v-if="actions?.length"
      name="popover"
      class="flex text-primary-dark"
      style="z-index: 1001"
    >
      <base-button
        v-for="action in actions"
        :key="`${action.id}`"
        :text="action.text"
        :alt="action.text"
        :action="
          () => {
            $emit('changed', action.id);
          }
        "
        type="bare"
        class="p-1 px-2 text-xs"
        :ccu-event="ccuEvent"
      />
    </slot>
  </v-popover>
</template>
<script>
export default {
  name: 'MapButton',
  props: {
    buttonClass: {
      type: String,
      default: '',
    },
    buttonText: {
      type: String,
      default: '',
    },
    ccuEvent: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    actions: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
};
</script>

<style>
.layer-action-popover {
  @apply bg-white text-crisiscleanup-dark-100 outline-none w-full border w-auto;
  left: 1px !important;
  z-index: 50000;
}

.map-button.selected {
  @apply bg-gray-300;
}
</style>
