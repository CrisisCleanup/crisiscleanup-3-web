<template>
  <div
    class="flex flex-col w-11/12 p-3 overflow-y-auto rounded-lg shadow-lg relative"
    :style="styles"
    style="max-height: 85vh"
  >
    <div class="grid grid-cols-8">
      <img
        v-if="generalInfo.avatar"
        :src="generalInfo.avatar"
        class="col-span-2 w-10 h-10 rounded-full mr-3"
      />

      <div class="col-span-5">
        <div class="text-xs">
          {{ generalInfo.name }}
          <a
            v-if="generalInfo.url"
            :href="generalInfo.url"
            class="ml-1"
            target="_blank"
          >
            <font-awesome-icon icon="external-link-alt" />
          </a>
        </div>
      </div>

      <font-awesome-icon
        class="col-span-1 justify-self-end cursor-pointer rounded-full m-1"
        icon="times"
        @click="closeModalAndResetState"
      />
    </div>

    <div class="p-1 border-b border-crisiscleanup-dark-300">
      <div class="grid grid-cols-2">
        <div class="col-span-1">
          <div class="flex text-crisiscleanup-dark-300 text-bodyxsm">
            {{ $t('pewPew.type') }}
            <ccu-icon
              v-tooltip="{
                content: $t('pewPew.type_description'),
                triggers: ['click'],
                html: true,
                popperClass: 'interactive-tooltip w-108',
                autoHide: true,
              }"
              v-bind="helpTooltipAttrs"
            />
          </div>
          <div v-if="generalInfo.organization">
            {{
              $t(
                generalInfo.organization.type_t
                  ? generalInfo.organization.type_t
                  : 'pewPew.unknown',
              )
            }}
          </div>
        </div>
        <div class="col-span-1">
          <div class="flex text-crisiscleanup-dark-300 text-bodyxsm">
            {{ $t('pewPew.role') }}
            <ccu-icon
              v-tooltip="{
                content: $t('pewPew.role_description'),
                triggers: ['click'],
                html: true,
                popperClass: 'interactive-tooltip w-108',
                autoHide: true,
              }"
              v-bind="helpTooltipAttrs"
            />
          </div>
          <div>
            {{
              $t(
                generalInfo.approved_roles
                  ? getRoleNames(generalInfo.approved_roles)
                  : 'pewPew.unknown',
              )
            }}
          </div>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-1 mt-2">
        <div class="col-span-1">
          <div class="flex text-crisiscleanup-dark-300 truncate text-bodyxsm">
            {{ $t('pewPew.incidents') }}
            <ccu-icon
              v-tooltip="{
                content: $t('pewPew.incidents_description'),
                triggers: ['click'],
                html: true,
                popperClass: 'interactive-tooltip w-108',
                autoHide: true,
              }"
              v-bind="helpTooltipAttrs"
            />
          </div>
          <div>
            {{ $t(generalInfo.statistics ? generalInfo.statistics.length : 0) }}
          </div>
        </div>
        <div class="col-span-1">
          <div class="flex text-crisiscleanup-dark-300 truncate text-bodyxsm">
            {{ $t('pewPew.cases') }}
            <ccu-icon
              v-tooltip="{
                content: $t('pewPew.cases_description'),
                triggers: ['click'],
                html: true,
                popperClass: 'interactive-tooltip w-108',
                autoHide: true,
              }"
              v-bind="helpTooltipAttrs"
            />
          </div>
          <div>
            {{ getTotalCases() || 0 }}
          </div>
        </div>
        <div class="col-span-1">
          <div class="flex text-crisiscleanup-dark-300 truncate text-bodyxsm">
            {{ $t('pewPew.calls') }}
            <ccu-icon
              v-tooltip="{
                content: $t('pewPew.call_description'),
                triggers: ['click'],
                html: true,
                popperClass: 'interactive-tooltip w-108',
                autoHide: true,
              }"
              v-bind="helpTooltipAttrs"
            />
          </div>
          <div>
            {{ getTotalCalls() || 0 }}
          </div>
        </div>
        <div class="col-span-1">
          <div class="flex text-crisiscleanup-dark-300 truncate text-bodyxsm">
            {{ $t('pewPew.value') }}
            <ccu-icon
              v-tooltip="{
                content: $t('pewPew.value_description'),
                html: true,
                triggers: ['click'],
                popperClass: 'interactive-tooltip w-108',
                autoHide: true,
              }"
              v-bind="helpTooltipAttrs"
            />
          </div>
          <div>${{ nFormatter(getTotalValue()) }}</div>
        </div>
      </div>
    </div>

    <section class="incidents-section">
      <div
        class="flex justify-between items-center cursor-pointer"
        @click="
          isIncidentHidden = !isIncidentHidden;
          isCapabilityHidden = true;
        "
      >
        <span>{{ $t('pewPew.incidents') }}</span>
        <font-awesome-icon
          class="transition duration-500 transform"
          :class="isIncidentHidden ? 'rotate-0' : 'rotate-180'"
          icon="chevron-down"
          size="lg"
        />
      </div>

      <transition name="fade">
        <Table
          v-show="!isIncidentHidden"
          :key="generalInfo.id"
          :columns="incidentTable.columns"
          :data="generalInfo.statistics"
          :body-style="{ maxHeight: '40vh', ...styles }"
          :header-style="{ ...styles }"
          :row-style="{ backgroundColor: 'unset' }"
        >
          <template #name="slotProps">
            {{ slotProps.item.name }}
          </template>
          <template #calls="slotProps">
            <span class="w-full flex justify-center">
              {{ nFormatter(slotProps.item.calls || 0)
              }}<span class="pew-pew-blue">*</span>
            </span>
          </template>
          <template #commercial_value="slotProps">
            <span class="w-full flex justify-end">
              ${{ nFormatter(slotProps.item.commercial_value || 0)
              }}<span class="pew-pew-blue">*</span>
            </span>
          </template>
          <template #reported_count="slotProps">
            <CaseDonutChart
              v-if="!isDataEmpty(slotProps.item)"
              class="w-8 h-8"
              :chart-id="`case-donut-org-modal-${slotProps.item.id}`"
              :chart-data="{
                reportedCases: slotProps.item.reported_count || 0,
                claimedCases:
                  (slotProps.item.claimed_count || 0) -
                  (slotProps.item.closed_count || 0),
                completedCases: slotProps.item.closed_count || 0,
              }"
              :bg-color="styles.backgroundColor"
              :margin-all="5"
              :has-auto-resizing="false"
            />
            <span v-else class="w-8 h-8 flex items-center justify-center">
              0<span class="pew-pew-blue">*</span>
            </span>
          </template>
        </Table>
      </transition>
    </section>

    <section class="capabilities-section">
      <div
        class="flex justify-between items-center cursor-pointer"
        @click="
          isCapabilityHidden = !isCapabilityHidden;
          isIncidentHidden = true;
        "
      >
        <span>{{ $t('pewPew.capabilities') }}</span>
        <font-awesome-icon
          class="transition duration-500 transform"
          :class="isCapabilityHidden ? 'rotate-0' : 'rotate-180'"
          icon="chevron-down"
          size="lg"
        />
      </div>

      <transition name="fade">
        <Capability
          v-show="!isCapabilityHidden"
          :capabilities="capabilities"
          :organization-capabilities="generalInfo.capabilities"
        />
      </transition>
    </section>
    <div
      v-if="isLoading"
      class="absolute inset-0 opacity-75 flex items-center justify-center"
    >
      <spinner color="#d3d3d3" />
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { useI18n } from 'vue-i18n';
import type { PropType } from 'vue';
import { reactive, toRefs } from 'vue';
import Capability from '@/components/Capability.vue';
import { makeTableColumns } from '@/utils/table';
import { nFormatter } from '@/utils/helpers';
import Table from '@/components/Table.vue';
import { cachedGet } from '@/utils/promise';
import CaseDonutChart from '@/components/live/CaseDonutChart.vue';
import type { OrganizationRole } from '@/models/types';

type OrganizationStatistic = {
  calls: number;
  reported_count: number;
  claimed_count: number;
  closed_count: number;
  commercial_value: number;
};

export default defineComponent({
  name: 'OrganizationActivityModal',
  components: { Table, CaseDonutChart, Capability },
  props: {
    generalInfo: {
      type: Object as PropType<Record<string, any>>,
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
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { t, locale } = useI18n();

    const state = reactive({
      isIncidentHidden: true,
      isCapabilityHidden: true,
      nFormatter,
      capabilities: [],
      roles: [],
    });

    const helpTooltipAttrs = {
      invertColor: true,
      alt: t('actions.help_alt'),
      type: 'help',
      size: 'medium',
    };

    const incidentTable = computed(() => {
      const columns = makeTableColumns([
        ['name', '40%'],
        ['reported_count', '20%', 'Cases'],
        ['calls', '20%', 'Calls'],
        ['commercial_value', '20%', 'Value'],
      ]);
      for (const column of columns) {
        column.titleClass = 'small-font';
        column.class = 'small-font';
        column.style = {
          border: 0,
        };
        column.headerStyle = {
          border: 0,
        };
      }
      return {
        columns,
      };
    });

    function getTotalValue() {
      return _.sumBy(
        props.generalInfo.statistics,
        (stat: OrganizationStatistic) => stat.commercial_value || 0,
      );
    }
    function getTotalCalls() {
      return _.sumBy(
        props.generalInfo.statistics,
        (stat: OrganizationStatistic) => stat.calls || 0,
      );
    }
    function getTotalCases() {
      return _.sumBy(
        props.generalInfo.statistics,
        (stat: OrganizationStatistic) =>
          (stat.reported_count || 0) +
          ((stat.claimed_count || 0) - (stat.closed_count || 0)) +
          (stat.closed_count || 0),
      );
    }
    function getRoleNames(roleIds: number[]) {
      return _.join(
        _.map(roleIds, (id) => {
          const orgRole = _.find(
            state.roles,
            (role: OrganizationRole) => role.id === id,
          );
          return orgRole?.name_t;
        }),
        ', ',
      );
    }
    function closeModalAndResetState() {
      emit('close');
      state.isIncidentHidden = true;
      state.isCapabilityHidden = true;
    }
    function isDataEmpty(data: OrganizationStatistic) {
      return (
        (data.reported_count || 0) <= 0 &&
        (data.claimed_count || 0) - (data.closed_count || 0) <= 0 &&
        (data.closed_count || 0) <= 0
      );
    }

    onMounted(async () => {
      const capabilities = await cachedGet(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/organization_capabilities?limit=200`,
        {},
        `organization_capabilities:${locale.value}`,
      );
      state.capabilities = capabilities.data.results;

      const roles = await cachedGet(
        `${import.meta.env.VITE_APP_API_BASE_URL}/organization_roles`,
        {},
        `organizations_roles:${locale.value}`,
      );
      state.roles = roles.data.results;
    });

    return {
      ...toRefs(state),
      incidentTable,
      helpTooltipAttrs,
      getTotalValue,
      getTotalCalls,
      getTotalCases,
      getRoleNames,
      closeModalAndResetState,
      isDataEmpty,
    };
  },
});
</script>
<style lang="postcss" scoped>
.pew-pew-blue {
  color: #61d5f8;
}

.incidents-section,
.capabilities-section {
  @apply p-2 border-b border-crisiscleanup-dark-300;
}
</style>
