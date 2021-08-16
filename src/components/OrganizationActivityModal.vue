<template>
  <div class="relative w-full rounded p-2 popup--container" :style="styles">
    <div
      class="
        absolute
        h-7
        top-1
        right-0
        cursor-pointer
        px-2
        rounded-full
        text-center
      "
      @click="closeModal()"
    >
      <font-awesome-icon icon="times" />
    </div>
    <img
      :src="generalInfo.avatar"
      v-if="generalInfo.avatar"
      class="w-10 h-10 rounded-full"
    />
    <div class="flex flex-col">
      <div class="pb-2">
        <div class="text-h2">{{ generalInfo.name }}</div>
        <div v-if="generalInfo.url" class="text-bodysm">
          <a :href="generalInfo.url">{{ generalInfo.url }}</a>
        </div>
      </div>
      <hr />
      <div class="p-2">
        <div class="grid grid-cols-2">
          <div class="col-span-1">
            <div class="text-crisiscleanup-dark-300">{{ $t('TYPE') }}</div>
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
            <div class="text-crisiscleanup-dark-300">{{ $t('ROLE') }}</div>
            <div>{{ $t(generalInfo.role ? generalInfo.role : 'Unknown') }}</div>
          </div>
        </div>
        <div class="grid grid-cols-4">
          <div class="col-span-1">
            <div class="text-crisiscleanup-dark-300 truncate">
              {{ $t('INCIDENTS') }}
            </div>
            <div>
              {{
                $t(
                  generalInfo.reported_count !== null
                    ? generalInfo.reported_count
                    : 0,
                )
              }}
            </div>
          </div>
          <div class="col-span-1">
            <div class="text-crisiscleanup-dark-300 truncate">
              {{ $t('CLAIMED') }}
            </div>
            <div>
              {{
                $t(generalInfo.claimed_count ? generalInfo.claimed_count : 0)
              }}
            </div>
          </div>
          <div class="col-span-1">
            <div class="text-crisiscleanup-dark-300 truncate">
              {{ $t('CALLS') }}
            </div>
            <div>{{ $t(generalInfo.calls ? generalInfo.calls : 0) }}</div>
          </div>
          <div class="col-span-1">
            <div class="text-crisiscleanup-dark-300 truncate">
              {{ $t('VALUE') }}
            </div>
            <div>
              {{ nFormatter(generalInfo.commercial_value) }}
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div class="py-2">
        <div
          class="flex flex-row cursor-pointer"
          @click="onDropDown('incident')"
        >
          <div class="mt-2">{{ $t('INCIDENTS') }}</div>
          <div class="ml-auto text-lg">
            <div class="chevron-down">
              <font-awesome-icon icon="chevron-down" />
            </div>
          </div>
        </div>
        <div class="overflow-hidden" :class="showIncidents ? 'h-full' : 'h-0'">
          <Table
            :columns="incidentTable.columns"
            :data="generalInfo.statistics"
            style="height: 20rem"
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
                  claimedCases: slotProps.item.claimed_count || 0,
                  completedCases: slotProps.item.closed_count || 0,
                }"
                bg-color="#232323"
              />
            </template>
          </Table>
        </div>
      </div>
      <hr class="mt-2" />
      <div class="py-2">
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
        <div
          class="overflow-y-hidden"
          :class="showCapability ? 'h-full' : 'h-0'"
        >
          <Capability
            :capabilities="testCapabilities"
            :class="showCapability ? 'drawer-open' : 'drawer-close'"
          />
        </div>
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
import { CapabilityMixin } from '@/mixins';

export default {
  name: 'OrganizationActivityModal',
  components: { Table, CaseDonutChart, Capability },
  mixins: [CapabilityMixin],
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
  data() {
    return {
      showIncidents: false,
      nFormatter,
      showCapability: false,
      testIncidents: [
        {
          name: 'Hurricane Florence',
          cases: 45,
          claimed: 103,
          calls: '25.2K',
          value: '2.7M',
          completed: 103,
        },
        {
          name: 'Hurricane Irma',
          cases: 45,
          claimed: 103,
          calls: '25.2K',
          value: '2.7M',
          completed: 103,
        },
        {
          name: 'Flint Michigan Water Crisis',
          cases: 45,
          claimed: 103,
          calls: '25.2K',
          value: '2.7M',
          completed: 103,
        },
      ],
      testCapabilities: [
        {
          name: 'Business Services',
          items: [
            {
              name: 'Business Financial Assistance',
              normal: true,
              warning: false,
              impact: false,
              rescue: true,
              cleanup: true,
              longterm: false,
            },
            {
              name: 'SBA Loans',
              normal: false,
              warning: true,
              impact: true,
              rescue: true,
              cleanup: true,
              longterm: false,
            },
          ],
        },
        {
          name: 'Capacity-Building',
          items: [
            {
              name: 'Community Monitoring and Evaluation',
              normal: false,
              warning: false,
              impact: true,
              rescue: false,
              cleanup: true,
              longterm: false,
            },
            {
              name: 'Contingency Planning',
              normal: false,
              warning: true,
              impact: true,
              rescue: true,
              cleanup: true,
              longterm: false,
            },
            {
              name: 'Grant Writing',
              normal: false,
              warning: true,
              impact: true,
              rescue: true,
              cleanup: true,
              longterm: false,
            },
          ],
        },
        {
          name: 'test 3',
          items: [
            {
              name: 'Community Monitoring and Evaluation',
              normal: false,
              warning: false,
              impact: true,
              rescue: false,
              cleanup: true,
              longterm: false,
            },
            {
              name: 'Contingency Planning',
              normal: false,
              warning: true,
              impact: true,
              rescue: true,
              cleanup: true,
              longterm: false,
            },
            {
              name: 'Grant Writing',
              normal: false,
              warning: true,
              impact: true,
              rescue: true,
              cleanup: true,
              longterm: false,
            },
          ],
        },
      ],
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
        ['name', '50%'],
        ['reported_count', '25%', 'Cases'],
        // ['claimed_count', '0.5fr', 'Claimed'],
        // ['calls', '0.5fr'],
        ['commercial_value', '25%', 'Value'],
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
