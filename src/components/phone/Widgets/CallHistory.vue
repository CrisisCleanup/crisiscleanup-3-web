<template>
  <TitledCard title="~~Last 10 People I talked too">
    <div class="card-container">
      <Table :columns="historyCols" :data="historyData" />
    </div>
  </TitledCard>
</template>

<script>
import TitledCard from '@/components/phone/Cards/TitledCard.vue';
import Table from '@/components/Table.vue';

export default {
  name: 'CallHistory',
  components: { TitledCard, Table },
  computed: {
    historyData() {
      return [
        {
          // stub data
          mobile: '+19999999999',
          cases: ['C10', 'PDA-10'],
          status: 'Worksite added.',
          notes: 'User had entered a PDA',
          completed: '10 minutes ago.',
        },
      ];
    },
    historyCols() {
      return [
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

<style></style>
