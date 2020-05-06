<template>
  <TitledCard title="~~Last 10 Calls">
    <div class="card-container flex flex-grow">
      <Table :columns="historyCols" :data="historyData">
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
import TitledCard from '@/components/phone/Cards/TitledCard.vue';
import Table from '@/components/Table.vue';
import { mapGetters } from 'vuex';
import { UserMixin, ValidateMixin } from '@/mixins';
import PhoneStatus from '@/models/PhoneStatus';

export default {
  name: 'CallHistory',
  components: { TitledCard, Table },
  mixins: [UserMixin, ValidateMixin],
  computed: {
    ...mapGetters('phone', ['agentBoard']),
    historyData() {
      if (!this.agentBoard.length) return [];
      const { recent_contacts } = this.agentBoard.find(
        (a) => a.user.id === this.currentUser.id,
      );
      const calls = recent_contacts.map(
        ({ phone_number, caller_name, status, ...metrics }) => ({
          name: caller_name,
          mobile: this.validatePhoneNumber(phone_number).newValue,
          status: PhoneStatus.find(status).substatus_name_t,
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
