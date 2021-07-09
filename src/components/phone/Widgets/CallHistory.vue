<template>
  <TitledCard
    :loading="!callHistoryReady"
    :title="$t('phoneDashboard.last_10_calls')"
  >
    <div class="card-container overflow-auto h-full">
      <Table
        @rowClick="(payload) => $emit('row:click', payload)"
        :body-style="{ overflow: 'auto' }"
        :columns="historyCols"
        :data="historyData"
        v-if="callHistoryReady"
      >
        <template #incident="{ item }">
          <div class="justify-center flex flex-grow">
            <DisasterIcon
              v-if="item.incident"
              :current-incident="item.incident"
            />
          </div>
        </template>
        <template #mobile="{ item }">
          <div class="inline-flex items-center">
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
import TitledCard from '@/components/cards/TitledCard.vue';
import Table from '@/components/Table.vue';
import { mapGetters } from 'vuex';
import { UserMixin, ValidateMixin, WorksitesMixin } from '@/mixins';
import PhoneStatus from '@/models/PhoneStatus';
import { get } from 'lodash';
import DisasterIcon from '@/components/DisasterIcon.vue';
import Color from 'color';

export default {
  name: 'CallHistory',
  components: { TitledCard, Table, DisasterIcon },
  mixins: [UserMixin, ValidateMixin, WorksitesMixin],
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
  },
  computed: {
    ...mapGetters('phone.controller', [
      'agentRankings',
      'callHistoryReady',
      'callHistory',
    ]),
    historyData() {
      if (!this.callHistoryReady) return [];
      const calls = this.callHistory.map(
        ({ phone_number, caller_name, status, notes, ...metrics }) => ({
          name: caller_name,
          mobile: this.validatePhoneNumber(phone_number).newValue,
          status: get(PhoneStatus.find(status), 'substatus_name_t', 'Unknown'),
          notes: notes || 'N/A',
          ...metrics,
        }),
      );
      return calls;
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
          title: 'phoneDashboard.name',
          dataIndex: 'name',
          key: 'name',
          width: '.8fr',
        },
        {
          title: 'phoneDashboard.case_num',
          dataIndex: 'cases',
          key: 'cases',
          width: '1.35fr',
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
