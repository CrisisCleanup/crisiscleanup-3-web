<template>
  <TitledCard title="~~Last 10 Calls">
    <div class="card-container flex flex-grow">
      <Table :columns="historyCols" :data="historyData" />
    </div>
  </TitledCard>
</template>

<script>
import TitledCard from '@/components/phone/Cards/TitledCard.vue';
import Table from '@/components/Table.vue';
import { mapGetters } from 'vuex';
import { UserMixin, ValidateMixin } from '@/mixins';

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
      const calls = recent_contacts.map(({ dnis }) => ({
        name: 'Unknown',
        mobile: this.validatePhoneNumber(dnis).newValue,
        cases: ['C19'],
        status: 'Worksite added.',
        notes: 'User notes.',
        completed: '10 minutes ago.',
      }));
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
          dataIndex: 'completed',
          key: 'completed',
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
