<template>
  <div v-if="capabilities.length" class="mt-1">
    <div v-for="(capability, index) in capabilitiesTree" :key="index">
      <template v-if="hasParent(capability)">
        <div class="selected rounded mx-2 p-2">
          <div class="text-center header my-2 rounded-t">
            {{ capability.name_t }}
          </div>
          <div
            class="grid text-center p-1"
            :class="[
              $mq === 'sm' ? '' : 'text-bodyxsm',
              `grid-cols-${phases.length}`,
            ]"
          >
            <div
              v-for="phase in phases"
              :key="phase.id"
              class="col-span-1 text-crisiscleanup-dark-300 truncate"
              :class="hoverItem === 'normal' + index ? 'light' : ''"
            >
              {{ $t(phase.phase_name_t) | upper }}
            </div>
          </div>
          <div class="mb-5">
            <div v-for="(item, idx) in capability.children" :key="idx">
              <CapabilityItem
                :capability="item"
                :available-capabilities="organizationCapabilitiesForChild(item)"
                v-if="hasCapability(item)"
                :index="index"
                @onHover="changeHover"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import CapabilityItem from '@/components/CapabilityItem.vue';
import { CapabilityMixin } from '@/mixins';
import { childrenBy, groupBy } from '@/utils/array';

export default {
  name: 'Capability',
  components: { CapabilityItem },
  mixins: [CapabilityMixin],
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
  data() {
    return {
      hoverItem: '',
    };
  },
  computed: {
    ...mapState('enums', ['phases']),
    capabilitiesTree() {
      return childrenBy(groupBy(this.capabilities, 'parent_id'), 'id');
    },
  },
  methods: {
    changeHover(hoverItem) {
      this.hoverItem = hoverItem;
    },
    organizationCapabilitiesForChild(capability) {
      return this.organizationCapabilities.filter(
        (item) => item.capability === capability.id,
      );
    },
    hasCapability(capability) {
      return this.organizationCapabilities.some(
        (item) => item.capability === capability.id,
      );
    },
    hasParent(capability) {
      return (
        capability.children &&
        capability.children.length &&
        capability.children.some((item) => this.hasCapability(item))
      );
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
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.5);
  transition: all 500ms ease;
}
</style>
