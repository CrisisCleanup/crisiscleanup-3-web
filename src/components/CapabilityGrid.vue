<template>
  <div
    class="grid"
    :style="`grid-template-columns: max-content repeat(${phases.length}, [col-start] minmax(auto, 200px) [col-end])`"
  >
    <template v-for="capability in capabilitiesTree" :key="capability.id">
      <template v-if="capability.children && capability.children.length > 0">
        <div
          class="top-level bg-crisiscleanup-grid-grey p-3 flex items-center mb-1 cursor-pointer"
          @click="
            () => {
              capability.showChildren = !capability.showChildren;
              // $forceUpdate();
            }
          "
        >
          <font-awesome-icon
            :icon="capability.showChildren ? 'minus' : 'plus'"
            size="lg"
            :title="$t('capabilities.show_capabilities')"
            class="cursor-pointer text-crisiscleanup-grid-yellow mr-2"
          ></font-awesome-icon>
          {{ capability.name_t }}
          <badge
            v-if="getSelectedCount(capability) > 0"
            width="20px"
            height="20px"
            class="ml-2 text-white bg-black"
            >{{ getSelectedCount(capability) }}
          </badge>
        </div>
        <div
          v-for="phase in phases"
          :key="`${capability.id}:${phase.phase_key}`"
          class="text-xs text-center bg-crisiscleanup-grid-grey flex items-center justify-center mb-1 cursor-pointer"
          @click="
            () => {
              capability.showChildren = !capability.showChildren;
              // $forceUpdate();
            }
          "
        >
          <span v-if="capability.showChildren">{{
            $t(phase.phase_name_t)
          }}</span>
        </div>
        <template v-if="capability.showChildren">
          <template
            v-for="child in capability.children"
            :key="`${capability.id}:${child.id}`"
          >
            <div class="border-b p-2 py-4" :class="$mq === 'sm' ? 'w-60' : ''">
              {{ child.name_t }}
            </div>
            <template
              v-for="phase in phases"
              :key="`${capability.id}:${child.id}:${phase.phase_key}`"
            >
              <base-checkbox
                draggable="true"
                @dragstart="
                  (e) => {
                    e.dataTransfer.setDragImage(dragImage, null, null);
                    dragValue = !isCapabilitySelected(phase.id, child.id);
                    setMatrixValue(
                      !isCapabilitySelected(phase.id, child.id),
                      phase.id,
                      child.id,
                    );
                  }
                "
                @dragenter="
                  (e) => {
                    e.dataTransfer.setDragImage(dragImage, null, null);
                    setMatrixValue(dragValue, phase.id, child.id);
                    $emit('updated', { ...organizationCapabilityMatrix });
                  }
                "
                checkmark-style=""
                container-style=""
                class="border-b p-2 py-4 flex items-center justify-center cursor-pointer"
                :class="
                  isCapabilitySelected(phase.id, child.id)
                    ? 'bg-crisiscleanup-grid-blue border-2 border-white'
                    : ''
                "
                @update:modelValue="
                  (value) => {
                    setMatrixValue(value, phase.id, child.id);
                    $emit('updated', { ...organizationCapabilityMatrix });
                  }
                "
                :model-value="isCapabilitySelected(phase.id, child.id)"
              ></base-checkbox>
            </template>
          </template>
        </template>
      </template>
    </template>
    <img
      ref="dragImage"
      src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
      width="0"
      height="0"
      alt=""
    />
  </div>
</template>
<script>
import { useStore } from 'vuex';
import { computed, onMounted, reactive, toRefs, ref } from 'vue';
import axios from 'axios';
import { childrenBy, groupBy } from '../utils/array';

export default {
  name: 'CapabilityGrid',
  props: {
    organizationCapabilities: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const store = useStore();
    const phases = computed(() => store.getters['enums/phases']);
    const dragImage = ref(null);
    const state = reactive({
      capabilitiesTree: [],
      organizationCapabilityMatrix: {},
      dragValue: true,
    });
    const stateRefs = toRefs(state);

    function isCapabilitySelected(phase, capabilityId) {
      return (
        stateRefs.organizationCapabilityMatrix.value[phase] &&
        stateRefs.organizationCapabilityMatrix.value[phase].has(capabilityId)
      );
    }
    function setMatrixValue(value, phase, child) {
      if (value) {
        if (stateRefs.organizationCapabilityMatrix.value[phase]) {
          stateRefs.organizationCapabilityMatrix.value[phase].add(child);
        } else {
          stateRefs.organizationCapabilityMatrix.value[phase] = new Set([
            child,
          ]);
        }
      } else if (stateRefs.organizationCapabilityMatrix.value[phase]) {
        stateRefs.organizationCapabilityMatrix.value[phase].delete(child);
      } else {
        stateRefs.organizationCapabilityMatrix.value[phase] = new Set([]);
      }

      stateRefs.organizationCapabilityMatrix.value = {
        ...stateRefs.organizationCapabilityMatrix.value,
      };
    }
    function getSelectedCount(capability) {
      let count = 0;
      if (!capability.children) {
        return 0;
      }
      for (const phase of phases.value) {
        for (const child of capability.children) {
          if (isCapabilitySelected(phase.id, child.id)) {
            count += 1;
          }
        }
      }
      return count;
    }

    onMounted(async () => {
      const capabilities = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/organization_capabilities?limit=200`,
        {
          headers: {
            Authorization: null,
          },
        },
      );
      stateRefs.capabilitiesTree.value = childrenBy(
        groupBy(capabilities.data.results, 'parent_id'),
        'id',
      );

      for (const org_capability of props.organizationCapabilities) {
        setMatrixValue(true, org_capability.phase, org_capability.capability);
      }
    });

    return {
      ...stateRefs,
      phases,
      isCapabilitySelected,
      setMatrixValue,
      getSelectedCount,
      dragImage,
    };
  },
};
</script>
