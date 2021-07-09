<template>
  <v-popover
    popover-class="popover menu"
    placement="bottom-end"
    class="text-xs"
  >
    <div
      class="badge-holder rounded-lg"
      :class="size === 'sm' ? 'px-1' : 'px-2'"
      :style="dropdownStyle"
    >
      <div
        v-if="useIcon"
        class="case-svg-container mr-1 flex"
        ref="svgContainer"
        v-html="workTypeImage"
      ></div>
      <div class="tooltip-target" v-if="!hideName">
        {{ currentWorkType.status | getStatusName }}
      </div>
      <font-awesome-icon
        class="tooltip-target"
        :class="size === 'sm' ? '' : 'mx-1'"
        size="sm"
        icon="chevron-down"
      />
    </div>
    <template #popover>
      <div
        class="
          bg-white
          border
          outline-none
          h-84
          w-56
          overflow-auto
          tooltip-content
        "
        @keyup="nextItem"
      >
        <div
          v-for="status in displayStatuses"
          :key="`${status.id}`"
          :value="status.status"
          class="cursor-pointer py-1 hover:bg-crisiscleanup-light-grey"
          :class="{ selected: currentItem === status.selectionKey }"
        >
          <div
            v-close-popover
            class="badge-holder text-xs"
            @click="
              () => {
                $emit('input', status.status);
              }
            "
          >
            <badge class="mx-1" :color="getColorForStatus(status.status)" />
            <div>{{ status.status_name_t }}</div>
          </div>
        </div>
      </div>
    </template>
  </v-popover>
</template>

<script>
import { getColorForStatus, getWorkTypeImage } from '@/filters';
import { mapState } from 'vuex';
import { WorksitesMixin } from '@/mixins';

export default {
  name: 'WorksiteStatusDropdown',
  mixins: [WorksitesMixin],
  props: {
    currentWorkType: {
      type: Object,
      default: () => {
        return {};
      },
    },
    useIcon: {
      type: Boolean,
      default: false,
    },
    hideName: {
      type: Boolean,
      default: false,
    },
    phase: {
      type: Number,
      default: null,
    },
    iconSize: {
      type: Number,
      default: 0,
    },
    size: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      getColorForStatus,
      getWorkTypeImage,
      currentItem: 1,
    };
  },
  computed: {
    ...mapState('enums', ['statuses']),
    displayStatuses() {
      return this.statuses
        .filter((status) =>
          this.phase ? status.phases.includes(this.phase) : true,
        )
        .map((status, index) => {
          return {
            ...status,
            selectionKey: index + 1,
          };
        });
    },
    workTypeImage() {
      if (this.iconSize) {
        return this.getWorktypeSVG(this.currentWorkType, this.iconSize);
      }
      return this.getWorkTypeImage(this.currentWorkType);
    },
    dropdownStyle() {
      return {
        color: getColorForStatus(
          this.currentWorkType.status,
          Boolean(this.currentWorkType.claimed_by),
        ),
        backgroundColor: `${getColorForStatus(
          this.currentWorkType.status,
          Boolean(this.currentWorkType.claimed_by),
        )}3D`,
      };
    },
  },
  mounted() {
    document.addEventListener('keyup', this.nextItem);
    this.$nextTick(() => this.setSVGStyles());
  },
  methods: {
    nextItem(e) {
      if (e.keyCode === 38 && this.currentItem > 1) {
        this.currentItem -= 1;
      } else if (
        e.keyCode === 40 &&
        this.currentItem < this.displayStatuses.length
      ) {
        this.currentItem += 1;
      }
    },
    setSVGStyles() {
      if (!this.$refs.svgContainer) return;
      if (this.iconSize) {
        this.$refs.svgContainer.style.minHeight = `${this.iconSize}px`;
        this.$refs.svgContainer.style.minWidth = `${this.iconSize}px`;
      }
    },
  },
};
</script>

<style>
.status-dropdown {
}
</style>

<style scoped>
.badge-holder {
  @apply flex items-center cursor-pointer;
}
</style>
