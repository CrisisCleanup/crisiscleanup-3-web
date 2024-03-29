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
              {{ item.mobile | formatNationalNumber }}
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
            {{ slotProps.item.completed_at | moment('from', 'now') }}
          </div>
        </template>
      </Table>
    </div>
  </TitledCard>
</template>

<script>
import { mapGetters } from 'vuex';
import _, { get } from 'lodash';
import Color from 'color';
import TitledCard from '@/components/cards/TitledCard.vue';
import Table from '@/components/Table.vue';
import { UserMixin, ValidateMixin, WorksitesMixin } from '@/mixins';
import PhoneStatus from '@/models/PhoneStatus';
import DisasterIcon from '@/components/DisasterIcon.vue';
import AgentStats from '@/components/phone/AgentStats';

export default {
  name: 'CallHistory',
  components: { AgentStats, TitledCard, Table, DisasterIcon },
  mixins: [UserMixin, ValidateMixin, WorksitesMixin],
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
  methods: {
    getWorkTypeStyle(worktype) {
      const { fillColor } = this.getWorktypeColors(worktype);
      const _color = Color(fillColor);
      return {
        backgroundColor: _color.fade(0.8).string(),
      };
    },
    getWorkTypeImg(worktype) {
      return this.getWorktypeSVG(worktype, '26');
    },
    toStartCase(word) {
      return _.startCase(word);
    },
  },
  computed: {
    ...mapGetters('phone.controller', [
      'agentRankings',
      'callHistoryReady',
      'callHistory',
    ]),
    historyData() {
      if (!this.callHistoryReady && !this.calls) return [];
      const calls = this.calls || this.callHistory;
      return calls.map(
        ({ phone_number, caller_name, status, notes, ...metrics }) => ({
          name: caller_name,
          mobile: this.validatePhoneNumber(phone_number).newValue,
          status: get(PhoneStatus.find(status), 'substatus_name_t', 'Unknown'),
          notes: notes || 'N/A',
          ...metrics,
        }),
      );
    },
    historyCols() {
      return [
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
    },
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
