<template>
  <div class="my-2 justify-center items-center">
    <Table
      :columns="ticketTable.columns"
      :data="tickets"
      style="height: 450px"
      :body-style="{ maxHeight: '450px' }"
    >
      <template #url="slotProps">
        <base-link
          :href="`http://crisiscleanup.zendesk.com/agent/tickets/${slotProps.item.id}`"
          text-variant="bodysm"
          class="px-2"
          target="_blank"
          >{{ $t('adminDashboard.link') }}</base-link
        >
      </template>
    </Table>

    <div class="gridContainer">
      <TicketCards
        :key="idx"
        v-for="(items, idx) in tickets.length"
        :ticket-data="tickets[idx]"
      />
    </div>
  </div>
</template>

<script>
import { makeTableColumns } from '@/utils/table';
import Table from '@/components/Table';
import TicketCards from './TicketCards.vue';

export default {
  name: 'TicketDashboard',
  components: { Table, TicketCards },
  data() {
    return {
      tickets: [],
    };
  },
  async mounted() {
    await this.getTickets();
  },
  methods: {
    async getTickets() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/zendesk/search?query=status<solved`,
      );
      const { results } = response.data;
      console.log(results);
      this.tickets = results.map((result) => {
        return {
          id: result.id,
          description: result.description,
          via: result.via.channel,
          url: result.url,
          created_at: result.created_at,
          requester_id: result.requester_id,
          status: result.status,
          assignee_id: result.assignee_id,
        };
      });

      return this.tickets;
    },
  },
  computed: {
    ticketTable() {
      const columns = makeTableColumns([
        ['id', '5%', 'Id'],
        ['requester_id', '15%', 'Requester Id'],
        ['created_at', '20%', 'Created'],
        ['description', '50%', 'Description'],
        ['via', '5%', 'Via'],
        ['url', '5%', ''],
      ]);
      columns.forEach((column) => {
        column.titleClass = 'small-font';
        column.class = 'small-font';
      });
      return {
        columns,
      };
    },
  },
};
</script>

<style>
.gridContainer {
  justify-content: center;
  display: grid;
  justify-items: stretch;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto;
  column-gap: 20px;
  row-gap: 20px;
  &-mobile {
    justify-content: center;
    display: grid;
    justify-items: stretch;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    column-gap: 20px;
    row-gap: 20px;
  }
}
</style>
