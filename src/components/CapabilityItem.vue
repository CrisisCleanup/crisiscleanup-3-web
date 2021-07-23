<template>
  <div>
    <div class="my-2">{{ $t(capability.name) }}</div>
    <div class="grid grid-cols-6 gap-1">
      <div
        class="col-span-1 h-3 rounded"
        :class="
          capability.normal
            ? 'border-2 border-white bg-crisiscleanup-dark-300'
            : 'bg-crisiscleanup-dark-400'
        "
      ></div>
      <div
        class="col-span-1 h-3 rounded"
        :class="
          capability.warning
            ? 'border-2 border-white bg-crisiscleanup-dark-300'
            : 'bg-crisiscleanup-dark-400'
        "
      ></div>
      <div
        class="col-span-1 h-3 rounded"
        :class="
          capability.impact
            ? 'border-2 border-white bg-crisiscleanup-dark-300'
            : 'bg-crisiscleanup-dark-400'
        "
      ></div>
      <div
        class="col-span-1 h-3 rounded"
        :class="
          capability.rescue
            ? 'border-2 border-white bg-crisiscleanup-dark-300'
            : 'bg-crisiscleanup-dark-400'
        "
      ></div>
      <div
        class="col-span-1 h-3 rounded"
        :class="
          capability.cleanup
            ? 'border-2 border-white bg-crisiscleanup-dark-300'
            : 'bg-crisiscleanup-dark-400'
        "
      ></div>
      <div
        class="col-span-1 h-3 rounded"
        :class="
          capability.longterm
            ? 'border-2 border-white bg-crisiscleanup-dark-300'
            : 'bg-crisiscleanup-dark-400'
        "
      ></div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CapabilityItem',
  props: {
    capability: {
      type: Object,
      default: () => ({
        name: '',
        normal: false,
        warning: false,
        impact: false,
        rescue: false,
        cleanup: false,
        longterm: false,
      }),
    },
  },
};
</script>
