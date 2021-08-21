<template>
  <div
    class="flex flex-col w-full rounded-md pl-3 py-3 popup--container shadow-md"
    :style="styles"
  >
    <div
      class="absolute h-7 top-1 right-0 cursor-pointer rounded-full text-center"
      @click="closeModal()"
    >
      <font-awesome-icon icon="times" />
    </div>
    <div class="mt-2 pb-3 flex border-b border-crisiscleanup-dark-300">
      <img
        :src="generalInfo.avatar"
        v-if="generalInfo.avatar"
        class="w-10 h-10 rounded-full mr-3"
      />
      <div class="text-xs">{{ generalInfo.name }}</div>
      <div v-if="generalInfo.url" class="text-bodysm">
        <a :href="generalInfo.url">{{ generalInfo.url }}</a>
      </div>
    </div>

    <div class="p-2 border-b border-crisiscleanup-dark-300">
      <div class="grid grid-cols-2">
        <div class="col-span-1">
          <div class="text-crisiscleanup-dark-300 text-bodyxsm">
            {{ $t('TYPE') }}
          </div>
          <div v-if="generalInfo.organization">
            {{
              $t(
                generalInfo.organization.type_t
                  ? generalInfo.organization.type_t
                  : 'Unknown',
              )
            }}
          </div>
        </div>
        <div class="col-span-1">
          <div class="text-crisiscleanup-dark-300 text-bodyxsm">
            {{ $t('ROLE') }}
          </div>
          <div>{{ $t(generalInfo.role ? generalInfo.role : 'Unknown') }}</div>
        </div>
      </div>
      <div class="grid grid-cols-4 mt-2">
        <div class="col-span-1">
          <div class="text-crisiscleanup-dark-300 truncate text-bodyxsm">
            {{ $t('INCIDENTS') }}
          </div>
          <div>
            {{
              $t(
                generalInfo.incident_count !== null
                  ? generalInfo.incident_count
                  : 0,
              )
            }}
          </div>
        </div>
        <div class="col-span-1">
          <div class="text-crisiscleanup-dark-300 truncate text-bodyxsm">
            {{ $t('CLAIMED') }}
          </div>
          <div>
            {{ $t(generalInfo.claimed_count ? generalInfo.claimed_count : 0) }}
          </div>
        </div>
        <div class="col-span-1">
          <div class="text-crisiscleanup-dark-300 truncate text-bodyxsm">
            {{ $t('CALLS') }}
          </div>
          <div>
            {{ $t(generalInfo.calls_count ? generalInfo.calls_count : 0) }}
          </div>
        </div>
        <div class="col-span-1">
          <div class="text-crisiscleanup-dark-300 truncate text-bodyxsm">
            {{ $t('VALUE') }}
          </div>
          <div>
            {{ nFormatter(generalInfo.commercial_value) }}
          </div>
        </div>
      </div>
    </div>
    <div class="py-2 border-b border-crisiscleanup-dark-300 text-xs">
      <div class="flex flex-row cursor-pointer" @click="onDropDown('incident')">
        <div class="mt-2">{{ $t('INCIDENTS') }}</div>
        <div class="ml-auto text-lg">
          <div class="chevron-down">
            <font-awesome-icon icon="chevron-down" />
          </div>
        </div>
      </div>
      <div class="overflow-hidden" :class="showIncidents ? 'h-auto' : 'h-0'">
        <Table
          :columns="incidentTable.columns"
          :data="generalInfo.statistics"
          :body-style="{ maxHeight: '40vh', ...styles }"
          :header-style="styles"
          :row-style="{ backgroundColor: 'unset' }"
        >
          <template #name="slotProps">
            {{ slotProps.item.name }}
          </template>
          <template #commercial_value="slotProps">
            {{ nFormatter(slotProps.item.commercial_value) }}
          </template>
          <template #reported_count="slotProps">
            <CaseDonutChart
              class="w-8 h-8"
              :chart-id="`case-donut-chart-${slotProps.item.id}`"
              :chart-data="{
                reportedCases: slotProps.item.reported_count || 0,
                claimedCases:
                  (slotProps.item.claimed_count || 0) -
                  (slotProps.item.closed_count || 0),
                completedCases: slotProps.item.closed_count || 0,
              }"
              :bg-color="styles.backgroundColor"
            />
          </template>
        </Table>
      </div>
    </div>
    <div class="py-2 text-xs">
      <div
        class="flex flex-row cursor-pointer no-ripple"
        @click="onDropDown('capability')"
      >
        <div class="mt-2">{{ $t('CAPABILITY') }}</div>
        <div class="ml-auto text-lg">
          <div class="chevron-down">
            <font-awesome-icon icon="chevron-down" />
          </div>
        </div>
      </div>
      <div class="overflow-y-hidden" :class="showCapability ? 'h-auto' : 'h-0'">
        <Capability
          :capabilities="capabilities"
          :organization-capabilities="generalInfo.capabilities"
          :class="showCapability ? 'drawer-open' : 'drawer-close'"
        />
      </div>
    </div>
  </div>
</template>
<script>
import Capability from '@/components/Capability.vue';
import { makeTableColumns } from '@/utils/table';
import CaseDonutChart from '@/components/charts/CaseDonutChart';
import { nFormatter } from '@/utils/helpers';
import Table from '@/components/Table';

export default {
  name: 'OrganizationActivityModal',
  components: { Table, CaseDonutChart, Capability },
  props: {
    generalInfo: {
      type: Object,
      default: null,
    },
    styles: {
      type: Object,
      default: null,
    },
    incidents: {
      type: Array,
      default: () => [],
    },
    capability: {
      type: Array,
      default: () => [],
    },
  },
  async mounted() {
    const capabilities = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/organization_capabilities?limit=200`,
    );
    this.capabilities = capabilities.data.results;
  },
  data() {
    return {
      showIncidents: false,
      nFormatter,
      showCapability: false,
      capabilities: [],
    };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    onDropDown(item) {
      const chevronUp = document.querySelectorAll('div.chevron-up');
      const chevronDown = document.querySelectorAll('div.chevron-down');
      if (item === 'incident') {
        if (this.showIncidents) {
          if (chevronUp) {
            chevronUp[0].classList.remove('chevron-up');
            chevronUp[0].classList.add('chevron-down');
          }
        } else {
          chevronDown[0].classList.remove('chevron-down');
          chevronDown[0].classList.add('chevron-up');
        }
        this.showIncidents = !this.showIncidents;
      } else {
        if (this.showCapability) {
          if (chevronUp) {
            chevronUp[chevronUp.length - 1].classList.remove('chevron-up');
            chevronUp[chevronUp.length - 1].classList.add('chevron-down');
          }
        } else {
          chevronDown[chevronDown.length - 1].classList.remove('chevron-down');
          chevronDown[chevronDown.length - 1].classList.add('chevron-up');
        }
        this.showCapability = !this.showCapability;
      }
    },
  },
  computed: {
    incidentTable() {
      const columns = makeTableColumns([
        ['name', '40%'],
        ['reported_count', '20%', 'Cases'],
        ['calls', '20%', 'Calls'],
        ['commercial_value', '20%', 'Value'],
      ]);
      columns.forEach((column) => {
        column.titleClass = 'small-font';
        column.class = 'small-font';
        column.style = {
          border: 0,
        };
        column.headerStyle = {
          border: 0,
        };
      });
      return {
        columns,
      };
    },
  },
};
</script>
<style scoped>
.popup--container {
  overflow-y: scroll;
  max-height: 90vh;
}
.chevron-up {
  transform: rotate(180deg);
  transition: all 300ms ease;
}
.chevron-down {
  transform: rotate(0deg);
  transition: all 300ms ease;
}
.drawer-close {
  top: -1000px;
}
.drawer-open {
  width: 100%;
  height: 100%;
  position: relative;
  top: 0;
  transition: top 400ms ease;
}
</style>
