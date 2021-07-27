<template>
  <div>
    <div v-for="(capability, index) in capabilities" :key="index">
      <div class="selected mx-2 rounded">
        <div class="text-center header my-2">
          {{ capability.name }}
        </div>
        <div
          class="grid grid-cols-6 text-center"
          :class="$mq === 'sm' ? '' : 'text-bodyxsm'"
        >
          <div
            class="col-span-1 text-crisiscleanup-dark-300 truncate"
            :class="hoverItem === 'normal' + index ? 'light' : ''"
          >
            {{ $t('NORMAL') }}
          </div>
          <div
            class="col-span-1 text-crisiscleanup-dark-300 truncate"
            :class="hoverItem === 'warning' + index ? 'light' : ''"
          >
            {{ $t('WARNING') }}
          </div>
          <div
            class="col-span-1 text-crisiscleanup-dark-300 truncate"
            :class="hoverItem === 'impact' + index ? 'light' : ''"
          >
            {{ $t('IMPACT') }}
          </div>
          <div
            class="col-span-1 text-crisiscleanup-dark-300 truncate"
            :class="hoverItem === 'rescue' + index ? 'light' : ''"
          >
            {{ $t('RESCUE') }}
          </div>
          <div
            class="col-span-1 text-crisiscleanup-dark-300 truncate"
            :class="hoverItem === 'cleanup' + index ? 'light' : ''"
          >
            {{ $t('CLEANUP') }}
          </div>
          <div
            class="col-span-1 text-crisiscleanup-dark-300 truncate"
            :class="hoverItem === 'longterm' + index ? 'light' : ''"
          >
            {{ $t('LONGTERM') }}
          </div>
        </div>
        <div class="mb-5">
          <div v-for="(item, idx) in capability.items" :key="idx">
            <CapabilityItem
              :capability="item"
              :index="index"
              @onHover="changeHover"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import CapabilityItem from '@/components/CapabilityItem.vue';

export default {
  name: 'Capability',
  components: { CapabilityItem },
  props: {
    capabilities: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      hoverItem: '',
    };
  },
  methods: {
    changeHover(hoverItem) {
      this.hoverItem = hoverItem;
    },
  },
};
</script>
<style scoped>
.light {
  @apply text-white;
  text-shadow: 0 0 3px rgb(0, 245, 254);
}
.header {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0),
    rgba(160, 174, 192),
    rgba(0, 0, 0, 0)
  );
  background-size: 150% 150%;
  animation: gradient 15s ease infinite;
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

.selected:hover {
  transform: scale(1.01) translateY(-5px);
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.5);
  transition: all 500ms ease;
}
</style>
