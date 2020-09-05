<template>
  <TitledCard :loading="!callHistoryReady" title="~~Last 10 Calls">
    <div class="card-container overflow-auto h-full">
      <Table
        :body-style="{ overflow: 'auto' }"
        :columns="historyCols"
        :data="historyData"
      >
        <template #completed_at="slotProps">
          <div :title="slotProps.item.completed_at">
            {{ slotProps.item.completed_at | moment('from', 'now') }}
          </div>
        </template>
        <template #cases="slotProps">
          <div class="flex flex-wrap w-full">
            <div
              v-for="caseItem in slotProps.item.cases"
              :key="caseItem.id"
              class="mx-1"
            >
              {{ caseItem.case_number }}
            </div>
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
import { UserMixin, ValidateMixin } from '@/mixins';
import PhoneStatus from '@/models/PhoneStatus';
import { get } from 'lodash';

export default {
  name: 'CallHistory',
  components: { TitledCard, Table },
  mixins: [UserMixin, ValidateMixin],
  computed: {
    ...mapGetters('phone.controller', [
      'agentRankings',
      'callHistoryReady',
      'callHistory',
    ]),
    historyData() {
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
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          width: '1fr',
        },
        {
          title: 'Phone Number',
          dataIndex: 'mobile',
          key: 'mobile',
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
