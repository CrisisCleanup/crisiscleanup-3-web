<template>
  <div
    class="grid"
    :style="`grid-template-columns: max-content repeat(${phases.length}, [col-start] minmax(auto, 200px) [col-end])`"
  >
    <template v-for="capability in capabilitiesTree">
      <template v-if="capability.children && capability.children.length > 0">
        <div
          class="
            top-level
            bg-crisiscleanup-grid-grey
            p-3
            flex
            items-center
            mb-1
            cursor-pointer
          "
          :key="capability.id"
          @click="
            () => {
              capability.showChildren = !capability.showChildren;
              $forceUpdate();
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
          class="
            text-xs text-center
            bg-crisiscleanup-grid-grey
            flex
            items-center
            justify-center
            mb-1
            cursor-pointer
          "
          @click="
            () => {
              capability.showChildren = !capability.showChildren;
              $forceUpdate();
            }
          "
        >
          <span v-if="capability.showChildren">{{
            $t(phase.phase_name_t)
          }}</span>
        </div>
        <template v-if="capability.showChildren">
          <template v-for="child in capability.children">
            <div
              :key="`${capability.id}:${child.id}`"
              class="border-b p-2 py-4"
              :class="$mq === 'sm' ? 'w-60' : ''"
            >
              {{ child.name_t }}
            </div>
            <template v-for="phase in phases">
              <base-checkbox
                draggable="true"
                @dragstart.native="
                  (e) => {
                    e.dataTransfer.setDragImage($refs.dragImage, null, null);
                    dragValue = !isCapabilitySelected(phase.id, child.id);
                    setMatrixValue(
                      !isCapabilitySelected(phase.id, child.id),
                      phase.id,
                      child.id,
                    );
                  }
                "
                @dragenter.native="
                  (e) => {
                    e.dataTransfer.setDragImage($refs.dragImage, null, null);
                    setMatrixValue(dragValue, phase.id, child.id);
                    $emit('updated', { ...organizationCapabilityMatrix });
                  }
                "
                checkmark-style=""
                container-style=""
                class="
                  border-b
                  p-2
                  py-4
                  flex
                  items-center
                  justify-center
                  cursor-pointer
                "
                :class="
                  isCapabilitySelected(phase.id, child.id)
                    ? 'bg-crisiscleanup-grid-blue border-2 border-white'
                    : ''
                "
                :key="`${capability.id}:${child.id}:${phase.phase_key}`"
                @input="
                  (value) => {
                    setMatrixValue(value, phase.id, child.id);
                    $emit('updated', { ...organizationCapabilityMatrix });
                  }
                "
                :value="isCapabilitySelected(phase.id, child.id)"
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
import { mapState } from 'vuex';
import { childrenBy, groupBy } from '@/utils/array';

export default {
  name: 'Capability',
  data() {
    return {
      capabilitiesTree: [],
      organizationCapabilityMatrix: {},
      dragValue: true,
    };
  },
  props: {
    organizationCapabilities: {
      type: Array,
      default: () => [],
    },
  },
  async mounted() {
    const capabilities = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/organization_capabilities?limit=200`,
      {
        headers: {
          Authorization: null,
        },
      },
    );
    this.capabilitiesTree = childrenBy(
      groupBy(capabilities.data.results, 'parent_id'),
      'id',
    );

    this.organizationCapabilities.forEach((org_capability) => {
      this.setMatrixValue(
        true,
        org_capability.phase,
        org_capability.capability,
      );
    });
  },
  computed: {
    ...mapState('enums', ['phases']),
  },
  methods: {
    isCapabilitySelected(phase, capabilityId) {
      return (
        this.organizationCapabilityMatrix[phase] &&
        this.organizationCapabilityMatrix[phase].has(capabilityId)
      );
    },
    setMatrixValue(value, phase, child) {
      if (value) {
        if (this.organizationCapabilityMatrix[phase]) {
          this.organizationCapabilityMatrix[phase].add(child);
        } else {
          this.organizationCapabilityMatrix[phase] = new Set([child]);
        }
      } else if (this.organizationCapabilityMatrix[phase]) {
        this.organizationCapabilityMatrix[phase].delete(child);
      } else {
        this.organizationCapabilityMatrix[phase] = new Set([]);
      }

      this.organizationCapabilityMatrix = {
        ...this.organizationCapabilityMatrix,
      };
    },
    getSelectedCount(capability) {
      let count = 0;
      if (!capability.children) {
        return 0;
      }
      this.phases.forEach((phase) => {
        capability.children.forEach((child) => {
          if (this.isCapabilitySelected(phase.id, child.id)) {
            count += 1;
          }
        });
      });
      return count;
    },
  },
};
</script>
