<template>
  <TitledCard  :title="$t('phoneDashboard.active_calls')">
    <div class="card-container">
      <Table :columns="contactCols" :data="contactMetrics" />
    </div>
  </TitledCard>
</template>

<script>
import TitledCard from '@/components/cards/TitledCard.vue';
import Table from '@/components/Table.vue';
import { UserMixin } from '@/mixins';
import { mapState } from 'vuex';

export default {
  name: 'ContactTable',
  mixins: [UserMixin],
  components: { Table, TitledCard },
  computed: {
    ...mapState('phone.controller', ['contactMetrics']),
    contactCols() {
      return [
        {
          dataIndex: 'contact_id',
          key: 'contact_id',
          title: 'phoneDashboard.contact_id',
          width: '1fr',
        },
        {
          dataIndex: 'state',
          key: 'state',
          title: 'phoneDashboard.state',
          width: '1fr',
        },
        {
          dataIndex: 'action',
          key: 'action',
          title: 'phoneDashboard.action',
          width: '1fr',
        },
        {
          dataIndex: 'entered_timestamp',
          key: 'entered_timestamp',
          title: 'phoneDashboard.timestamp',
          width: '1fr',
        },
        {
          dataIndex: 'agent_id',
          key: 'agent_id',
          title: 'phoneDashboard.agent',
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
