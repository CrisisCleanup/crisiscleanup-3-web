<template>
  <v-popover
    popover-class="status-dropdown"
    placement="bottom-end"
    class="text-xs"
  >
    <div class="badge-holder rounded-lg px-2" :style="dropdownStyle">
      <div
        v-if="useIcon"
        class="case-svg-container mr-1"
        v-html="getWorkTypeImage(currentWorkType)"
      ></div>
      <div v-else>{{ currentWorkType.status | getStatusName }}</div>
      <font-awesome-icon class="mx-1" size="sm" icon="chevron-down" />
    </div>
    <div
      slot="popover"
      class="bg-white border outline-none h-96 overflow-auto"
      @keyup="nextItem"
    >
      <div
        v-for="status in statuses"
        :key="status.id"
        :value="status.status"
        class="cursor-pointer py-1 hover:bg-gray-100"
        :class="{ selected: currentItem === status.selectionKey }"
      >
        <div
          class="badge-holder text-xs"
          @click="
            () => {
              onSelect(status.status);
            }
          "
        >
          <badge class="mx-1" :color="getColorForStatus(status.status)" />
          <div>{{ status.status_name_t }}</div>
        </div>
      </div>
    </div>
  </v-popover>
</template>

<script>
import Status from '@/models/Status';
import { getColorForStatus, getWorkTypeImage } from '@/filters';

export default {
  name: 'StatusDropDown',
  props: {
    onSelect: Function,
    currentWorkType: Object,
    useIcon: {
      type: Boolean,
      default: false,
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
    statuses() {
      return Status.all().map((status, index) => {
        return {
          ...status,
          selectionKey: index + 1,
        };
      });
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
  },
  methods: {
    nextItem(e) {
      if (e.keyCode === 38 && this.currentItem > 1) {
        this.currentItem -= 1;
      } else if (e.keyCode === 40 && this.currentItem < this.statuses.length) {
        this.currentItem += 1;
      }
    },
  },
};
</script>

<style>
.status-dropdown {
  @apply outline-none;
}
</style>

<style scoped>
.badge-holder {
  @apply flex items-center cursor-pointer;
}
</style>
