<template>
  <div>
    <div v-for="(capability, index) in capabilities" :key="index">
      <div
        class="text-center bg-gradient-to-r from-transparent via-gray-500 to-transparent my-2"
      >
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
</style>
