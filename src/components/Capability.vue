<template>
  <div v-if="capabilities.length > 0" class="mt-1">
    <div v-for="(capability, index) in capabilitiesTree" :key="index">
      <template v-if="hasParent(capability)">
        <div class="selected rounded">
          <div class="text-center header my-2 rounded-t">
            {{ capability.name_t }}
          </div>
          <div
            class="grid text-center p-1"
            :class="[$mq === 'sm' ? '' : 'text-bodyxsm']"
            :style="`grid-template-columns: repeat(${phases.length}, minmax(0, 1fr));`"
          >
            <div
              v-for="phase in phases"
              :key="phase.id"
              class="col-span-1 text-crisiscleanup-dark-300 truncate"
              :class="hoverItem === 'normal' + index ? 'light' : ''"
            >
              {{ $t(phase.phase_name_t) }}
            </div>
          </div>
          <div class="mb-5">
            <div v-for="(item, idx) in capability.children" :key="idx">
              <CapabilityItem
                v-if="hasCapability(item)"
                :capability="item"
                :available-capabilities="organizationCapabilitiesForChild(item)"
                :index="index"
                @onHover="changeHover"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  <div v-else class="p-2 text-crisiscleanup-grey-700 italic">
    {{ $t('info.no_items_found') }}
  </div>
</template>
<script>
import { computed } from 'vue';
import CapabilityItem from '@/components/CapabilityItem.vue';
import { childrenBy, groupBy } from '@/utils/array';

export default {
  name: 'Capability',
  components: { CapabilityItem },
  props: {
    capabilities: {
      type: Array,
      default: () => [],
    },
    organizationCapabilities: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const store = useStore();
    const hoverItem = ref('');
    const phases = computed(() => store.getters['enums/phases']);
    const capabilitiesTree = computed(() => {
      return childrenBy(groupBy(props.capabilities, 'parent_id'), 'id');
    });

    function changeHover(hoverItem) {
      hoverItem.value = hoverItem;
    }
    function organizationCapabilitiesForChild(capability) {
      return props.organizationCapabilities.filter(
        (item) => item.capability === capability.id,
      );
    }
    function hasCapability(capability) {
      return props.organizationCapabilities.some(
        (item) => item.capability === capability.id,
      );
    }
    function hasParent(capability) {
      return (
        capability.children &&
        capability.children.some((item) => hasCapability(item))
      );
    }

    return {
      hoverItem,
      phases,
      capabilitiesTree,
      changeHover,
      organizationCapabilitiesForChild,
      hasCapability,
      hasParent,
    };
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
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.5);
  transition: all 500ms ease;
}
</style>
