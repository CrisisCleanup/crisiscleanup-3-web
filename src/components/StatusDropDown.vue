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
        v-html="workTypeImage"
      ></div>
      <div>{{ currentWorkType.status | getStatusName }}</div>
      <font-awesome-icon class="mx-1" size="sm" icon="chevron-down" />
    </div>
    <div
      slot="popover"
      class="bg-white border outline-none h-84 w-56 overflow-auto"
      @keyup="nextItem"
    >
      <div
        v-for="status in displayStatuses"
        :key="status.id"
        :value="status.status"
        class="cursor-pointer py-1 hover:bg-crisiscleanup-light-grey"
        :class="{ selected: currentItem === status.selectionKey }"
      >
        <div
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
  </v-popover>
</template>

<script>
import { getColorForStatus, getWorkTypeImage } from '@/filters';
import { mapState } from 'vuex';

export default {
  name: 'StatusDropDown',
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
    phase: {
      type: Number,
      default: null,
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
