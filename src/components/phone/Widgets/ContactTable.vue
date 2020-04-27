<template>
  <TitledCard title="~~Active Calls">
    <div class="card-container">
      <Table :columns="contactCols" :data="contactMetrics" />
    </div>
  </TitledCard>
</template>

<script>
import TitledCard from '@/components/phone/Cards/TitledCard.vue';
import Table from '@/components/Table.vue';
import { UserMixin, AgentMixin } from '@/mixins';
import { mapGetters } from 'vuex';

export default {
  name: 'ContactTable',
  mixins: [UserMixin, AgentMixin],
  components: { Table, TitledCard },
  computed: {
    ...mapGetters('phone', ['contactMetrics']),
    contactCols() {
      return [
        {
          dataIndex: 'contact_id',
          key: 'contact_id',
          title: 'Contact',
          width: '1fr',
        },
        {
          dataIndex: 'state',
          key: 'state',
          title: 'State',
          width: '1fr',
        },
        {
          dataIndex: 'action',
          key: 'action',
          title: 'Action',
          width: '1fr',
        },
        {
          dataIndex: 'entered_timestamp',
          key: 'entered_timestamp',
          title: 'Timestamp',
          width: '1fr',
        },
        {
          dataIndex: 'agent_id',
          key: 'agent_id',
          title: 'Agent',
          width: '1fr',
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.card-container {
  @apply bg-white;
  display: flex;
  flex-grow: 1;
}
</style>
