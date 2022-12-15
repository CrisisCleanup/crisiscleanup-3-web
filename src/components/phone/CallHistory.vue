<template>
    <TitledCard
      :loading="!callHistoryReady && !calls"
      :title="$t('phoneDashboard.last_10_calls')"
    >
      <div class="card-container overflow-auto h-full">
        <AgentStats />
        <Table
          :body-style="{ overflow: 'auto', ...tableBodyStyle }"
          :columns="historyCols"
          :data="historyData"
          v-if="callHistoryReady || calls"
          @rowClick="
            (item) => {
              if ($mq === 'sm') $emit('rowClick', item);
            }
          "
        >
          <template #incident="{ item }">
            <div
              class="sm:justify-center flex flex-grow"
              :title="item.incident && item.incident.name"
            >
              <DisasterIcon
                v-if="item.incident"
                :current-incident="item.incident"
              />
              <div class="block sm:hidden flex items-center ml-2 text-lg">
                {{ toStartCase(item.incident.incident_type) }}
              </div>
            </div>
          </template>
          <template #mobile="{ item }">
            <div
              class="inline-flex items-center"
              @click="$emit('rowClick', item)"
            >
              <ccu-icon
                type="phone-classic"
                size="sm"
                :alt="$t('phoneDashboard.last_10_calls')"
              />
              <base-text class="pl-1">
                {{ formatNationalNumber(item.mobile) }}
              </base-text>
            </div>
          </template>
          <template #cases="slotProps">
            <div class="flex flex-col">
              <div
                class="inline-flex items-center flex-row py-1 justify-start"
                v-for="caseItem in slotProps.item.cases"
                :key="`${caseItem.id}`"
              >
                <base-link
                  class="mx-1"
                  :to="`/incident/${caseItem.incident}/cases/${caseItem.id}?showOnMap=true`"
                >
                  {{ caseItem.case_number }}
                </base-link>
                <div class="flex space-evenly justify-start">
                  <div
                    v-for="worktype in caseItem.work_types"
                    :key="`${worktype.id}`"
                    class="svg-container rounded-full p-1 mr-1 shadow-sm"
                    v-html="getWorkTypeImg(worktype)"
                    :style="getWorkTypeStyle(worktype)"
                  />
                </div>
              </div>
            </div>
          </template>
          <template #completed_at="slotProps">
            <div :title="slotProps.item.completed_at">
              {{ momentFromNow(slotProps.item.completed_at) }}
            </div>
          </template>
        </Table>
      </div>
    </TitledCard>
</template>

<script lang="ts">
import _, { get } from 'lodash';
// import Color from 'color';
import TitledCard from '../../components/cards/TitledCard.vue';
import PhoneStatus from '../../models/PhoneStatus';
import DisasterIcon from '../../components/DisasterIcon.vue';
import AgentStats from '../../components/phone/AgentStats.vue';
import useWorktypeImages from '../../hooks/worksite/useWorktypeImages';
import { formatNationalNumber, momentFromNow } from '../../filters/index';
import {computed, onMounted, ref} from 'vue';
import useValidation from "../../hooks/useValidation";
import Table from "../Table.vue";

export default {
  name: 'CallHistory',
  components: {Table, AgentStats, TitledCard, DisasterIcon },
  props: {
    calls: {
      type: Array,
      default: null,
    },
    tableBodyStyle: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const callHistoryReady = ref(true)
    const historyCols = [
      {
        title: 'phoneDashboard.incident',
        dataIndex: 'incident',
        key: 'incident',
        width: '.4fr',
        headerClass: 'justify-center',
      },
      {
        title: 'phoneDashboard.phone_number',
        dataIndex: 'mobile',
        key: 'mobile',
        width: '1fr',
      },
      {
        title: 'phoneDashboard.call_status',
        dataIndex: 'status',
        key: 'status',
        width: '1fr',
      },
      {
        title: 'phoneDashboard.notes',
        dataIndex: 'notes',
        key: 'notes',
        width: '1fr',
      },
      {
        title: 'phoneDashboard.completed',
        dataIndex: 'completed_at',
        key: 'completed_at',
        width: '.75fr',
      },
    ];

    const { getWorktypeColors, getWorktypeSVG } = useWorktypeImages();
    function getWorkTypeStyle(worktype: string) {
      const { fillColor } = getWorktypeColors(worktype);
      // const _color = Color(fillColor);
      return {
        // backgroundColor: _color.fade(0.8).string(),
        backgroundColor: fillColor,
      };
    }
    function getWorkTypeImg(worktype: string) {
      return getWorktypeSVG(worktype, 26);
    }
    function toStartCase(word: string) {
      return _.startCase(word);
    }

    const { validatePhoneNumber } = useValidation();

    const historyData: any = computed(() => {
      if (!callHistoryReady.value && !props.calls) return [];
      return props.calls.map(
          ({ phone_number, caller_name, status, notes, ...metrics }) => ({
            name: caller_name,
            mobile: validatePhoneNumber(phone_number).newValue,
            status: get(PhoneStatus.find(status), 'substatus_name_t', 'Unknown'),
            notes: notes || 'N/A',
            ...metrics,
          }),
      );
    });

    return {
      historyCols,
      getWorkTypeStyle,
      getWorkTypeImg,
      toStartCase,
      historyData,
      callHistoryReady,
      momentFromNow,
      formatNationalNumber,
    };
  },
};
</script>

<style lang="postcss" scoped>
.cell {
  @apply text-crisiscleanup-dark-300;
}

.svg-container svg {
  width: 26px !important;
  height: 26px !important;
}
</style>
