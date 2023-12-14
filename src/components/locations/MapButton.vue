<template>
  <v-popover
    :auto-hide="false"
    data-testid="testMapButtonPopoverModal"
    popper-class="layer-action-popover"
    placement="bottom-start"
    :disabled="disabled || actions.length === 0"
  >
    <ccu-icon
      :alt="title || buttonText"
      :class="['map-button', buttonClass, selected ? 'selected' : '']"
      :type="icon"
      :data-testid="`test${title || buttonText}Icon`"
      size="xl"
      @click="$emit('click')"
      @click.stop
    />
    <template v-if="actions.length > 0" #popper>
      <div class="flex text-primary-dark" style="z-index: 1001">
        <base-button
          v-for="action in actions"
          :data-testid="`test${action.id}Button`"
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
      </div>
    </template>
  </v-popover>
</template>
<script lang="ts">
import type { PropType } from 'vue';

export default defineComponent({
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
      type: Array as PropType<{ id: string; text: string }[]>,
      default() {
        return [];
      },
    },
  },
});
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
