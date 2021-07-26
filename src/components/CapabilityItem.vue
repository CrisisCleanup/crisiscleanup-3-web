<template>
  <div>
    <div class="my-2">{{ $t(capability.name) }}</div>
    <div class="grid grid-cols-6 gap-1">
      <div
        @mouseover="hoverEffect('normal')"
        @mouseleave="hoverEffect('')"
        class="col-span-1 h-3 rounded transform duration-100 hover:scale-105"
        :class="
          capability.normal
            ? 'border-2 border-white bg-crisiscleanup-dark-300'
            : 'bg-crisiscleanup-dark-400'
        "
      ></div>
      <div
        @mouseover="hoverEffect('warning')"
        @mouseleave="hoverEffect('')"
        class="col-span-1 h-3 rounded transform duration-100 hover:scale-105"
        :class="
          capability.warning
            ? 'border-2 border-white bg-crisiscleanup-dark-300'
            : 'bg-crisiscleanup-dark-400'
        "
      ></div>
      <div
        @mouseover="hoverEffect('impact')"
        @mouseleave="hoverEffect('')"
        class="col-span-1 h-3 rounded transform duration-100 hover:scale-105"
        :class="
          capability.impact
            ? 'border-2 border-white bg-crisiscleanup-dark-300'
            : 'bg-crisiscleanup-dark-400'
        "
      ></div>
      <div
        @mouseover="hoverEffect('rescue')"
        @mouseleave="hoverEffect('')"
        class="col-span-1 h-3 rounded transform duration-100 hover:scale-105"
        :class="
          capability.rescue
            ? 'border-2 border-white bg-crisiscleanup-dark-300'
            : 'bg-crisiscleanup-dark-400'
        "
      ></div>
      <div
        @mouseover="hoverEffect('cleanup')"
        @mouseleave="hoverEffect('')"
        class="col-span-1 h-3 rounded transform duration-100 hover:scale-105"
        :class="
          capability.cleanup
            ? 'border-2 border-white bg-crisiscleanup-dark-300'
            : 'bg-crisiscleanup-dark-400'
        "
      ></div>
      <div
        @mouseover="hoverEffect('longterm')"
        @mouseleave="hoverEffect('')"
        class="col-span-1 h-3 rounded transform duration-100 hover:scale-105"
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
    index: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    hoverEffect(item) {
      this.$emit('onHover', item + this.index);
    },
  },
};
</script>
