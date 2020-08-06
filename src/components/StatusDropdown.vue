<template>
  <form-select
    :value="status"
    :options="displayStatuses"
    class="bg-white border border-crisiscleanup-dark-100 h-12 mb-3 w-full"
    @input="
      (value) => {
        status = value;
        $emit('input', status);
      }
    "
    item-key="status"
    label="status_name_t"
    :placeholder="$t('actions.select_status')"
  >
    <template #selected-option="slotProps">
      <div class="badge-holder">
        <badge
          class="mx-1"
          :color="getColorForStatus(slotProps.option.status)"
        />
        <div>{{ slotProps.option.status_name_t }}</div>
      </div>
    </template>
    <template #option="slotProps">
      <div class="badge-holder">
        <badge
          class="mx-1"
          :color="getColorForStatus(slotProps.option.status)"
        />
        <div>{{ slotProps.option.status_name_t }}</div>
      </div>
    </template>
  </form-select>
</template>

<script>
import { getColorForStatus, getWorkTypeImage } from '@/filters';
import { mapState } from 'vuex';

export default {
  name: 'StatusDropdown',
  props: {
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
      status: null,
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
  z-index: 10000000;
}
</style>

<style scoped>
.badge-holder {
  @apply flex items-center cursor-pointer;
}
</style>
