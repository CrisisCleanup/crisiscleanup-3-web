<template>
  <div
    class="
      py-2
      px-3
      bg-crisiscleanup-light-grey
      flex
      items-center
      justify-between
      text-base
      font-semibold
    "
  >
    <div class="flex items-center">
      <badge width="22px" height="22px" class="mr-2 bg-black text-white"
        >{{ count }}
      </badge>
      <slot></slot>
    </div>
    <ccu-icon
      v-if="tooltip"
      v-tooltip="{
        content: tooltip,
        triggers: ['hover'],
        popperClass: 'interactive-tooltip w-72',
        html: true,
      }"
      :alt="$t('actions.help_alt')"
      type="help"
      size="large"
    />
    <slot name="action"></slot>
  </div>
</template>
<script>
export default {
  name: 'SectionHeading',
  props: {
    count: {
      type: Number,
      default: 1,
    },
    tooltip: {
      type: String,
      default: '',
    },
  },
};
</script>
