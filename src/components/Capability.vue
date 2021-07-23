<template>
  <div>
    <div v-for="(capability, index) in capabilities" :key="index">
      <div>{{ capability.name }}</div>
      <div class="grid grid-cols-5">
        <div class="col-span-1 text-crisiscleanup-dark-300">
          {{ $t('NORMAL') }}
        </div>
        <div class="col-span-1 text-crisiscleanup-dark-300">
          {{ $t('WARNING') }}
        </div>
        <div class="col-span-1 text-crisiscleanup-dark-300">
          {{ $t('IMPACT') }}
        </div>
        <div class="col-span-1 text-crisiscleanup-dark-300">
          {{ $t('RESCUE') }}
        </div>
        <div class="col-span-1 text-crisiscleanup-dark-300">
          {{ $t('LONGTERM') }}
        </div>
      </div>
      <div v-for="(item, idx) in capability.items" :key="idx">
        <CapabilityItem :capability="item" />
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
};
</script>
