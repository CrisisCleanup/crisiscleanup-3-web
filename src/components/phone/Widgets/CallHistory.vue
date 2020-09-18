<template>
  <TitledCard :loading="!callHistoryReady" title="~~Last 10 Calls">
    <div class="card-container overflow-auto h-full">
      <Table
        @rowClick="(payload) => $emit('row:click', payload)"
        :body-style="{ overflow: 'auto' }"
        :columns="historyCols"
        :data="historyData"
        v-if="callHistoryReady"
      >
        <template #incident="{item}">
          <div class="justify-center flex flex-grow">
            <DisasterIcon
              v-if="item.incident"
              :current-incident="item.incident"
            />
          </div>
        </template>
        <template #mobile="{item}">
          <div class="inline-flex items-center">
            <ccu-icon type="phone-classic" size="sm" />
            <base-text class="pl-1">
              {{ item.mobile | formatNationalNumber }}
            </base-text>
          </div>
        </template>
        <template #cases="slotProps">
          <div class="flex flex-col">
            <div
              class="inline-flex items-center flex-row py-1"
              v-for="caseItem in slotProps.item.cases"
            >
              <base-link
                :key="caseItem.id"
                class="mx-1"
                :to="`/incident/${caseItem.incident}/cases/${caseItem.id}?showOnMap=true`"
              >
                {{ caseItem.case_number }}
              </base-link>
              <div class="flex space-evenly">
                <div
                  v-for="worktype in caseItem.work_types"
                  class="case-svg-container rounded-full p-1 mr-1 shadow-sm"
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
      return this.getWorktypeSVG(worktype, '32');
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
          title: '',
          dataIndex: 'incident',
          key: 'incident',
          width: '.5fr',
        },
        {
          title: 'Phone Number',
          dataIndex: 'mobile',
          key: 'mobile',
          width: '1.25fr',
        },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          width: '1fr',
        },
        {
          title: 'Case #',
          dataIndex: 'cases',
          key: 'cases',
          width: '1fr',
        },
        {
          title: 'Call Status',
          dataIndex: 'status',
          key: 'status',
          width: '1fr',
        },
        {
          title: 'Notes',
          dataIndex: 'notes',
          key: 'notes',
          width: '1fr',
        },
        {
          title: 'Completed',
          dataIndex: 'completed_at',
          key: 'completed_at',
          width: '1fr',
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.cell {
  @apply text-crisiscleanup-dark-300;
}
</style>
