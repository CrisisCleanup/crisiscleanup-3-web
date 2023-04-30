<template>
  <div>
    <div class="flex my-2">
      {{ $t(capability.name_t) }}
      <ccu-icon
        v-tooltip="{
          content: $t(capability.description_t),
          triggers: ['click'],
          popperClass: 'interactive-tooltip w-auto',
          html: true,
        }"
        :invert-color="true"
        :alt="$t('actions.help_alt')"
        type="help"
        size="medium"
      />
    </div>

    <div
      class="grid gap-1"
      :style="`grid-template-columns: repeat(${phases.length}, minmax(0, 1fr));`"
    >
      <div
        v-for="phase in phases"
        :key="phase.id"
        class="col-span-1 h-3 rounded transform duration-100 hover:scale-105 shadow"
        :class="
          hasCapabilityForPhase(phase.id)
            ? 'border-2 border-white light-box'
            : 'bg-crisiscleanup-dark-400'
        "
        @mouseover="hoverEffect($t(phase.name_t))"
        @mouseleave="hoverEffect('')"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue';

export default defineComponent({
  name: 'CapabilityItem',
  props: {
    capability: {
      type: Object,
      default: () => ({}),
    },
    index: {
      type: Number,
      default: 0,
    },
    availableCapabilities: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['onHover'],
  setup(props, { emit }) {
    const store = useStore();
    const phases = computed(() => store.getters['enums/phases']);

    function hoverEffect(item) {
      emit('onHover', item + props.index);
    }

    function hasCapabilityForPhase(phase) {
      return props.availableCapabilities.some((item) => item.phase === phase);
    }

    return {
      hoverEffect,
      hasCapabilityForPhase,
      phases,
    };
  },
});
</script>

<style scoped>
.shadow {
  box-shadow: 0px 5px 5px black;
}

.light-box {
  background: linear-gradient(
    45deg,
    rgba(160, 174, 192, 0.4),
    rgba(160, 174, 192),
    rgba(160, 174, 192, 0.4),
    rgba(160, 174, 192)
  );
  background-size: 400% 400%;
  animation: gradient 20s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0%;
  }
  50% {
    background-position: 100%;
  }
  100% {
    background-position: 0%;
  }
}
</style>
