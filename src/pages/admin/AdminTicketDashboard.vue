<template>
  <div class="my-2">
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
          >{{ $t('~~Link') }}</base-link
        >
      </template>
    </Table>
  </div>
</template>

<script>
import { makeTableColumns } from '@/utils/table';
import Table from '@/components/Table';

export default {
  name: 'TicketDashboard',
  components: { Table },
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
      this.tickets = results.map((result) => {
        return {
          id: result.id,
          description: result.description,
          via: result.via.channel,
          url: result.url,
          created_at: result.created_at,
          requester_id: result.requester_id,
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
