<template>
  <div>
    <table class="styled-table" id="customers">
      <thead>
        <tr>
          <th
            style="color: black;"
            v-for="(headers, idx) in [
              'Ticket Id',
              'Requester Id',
              'Created',
              'Description',
              'Via',
              'Launch Ticket',
            ]"
            :key="idx"
          >
            {{ headers }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr :key="idx" class="text-" v-for="(items, idx) in newData">
          <th style="width: 7%;">{{ items.id }}</th>

          <th style="width: 8%;">{{ items.requester_id }}</th>

          <th style="width: 10%;">{{ items.created_at }}</th>

          <th style="width: 65%;">{{ items.description }}</th>

          <th style="width: 5%;">{{ items.via }}</th>

          <th>
            <div
              class="text-center flex justify-center"
              style="background-color: #fece09; padding: 2px;"
            >
              <a
                class="flex"
                :href="
                  'http://crisiscleanup.zendesk.com/agent/tickets/' + items.id
                "
                target="_blank"
                >Launch Ticket</a
              >
            </div>
          </th>
        </tr>
      </tbody>
    </table>
    <div>
      <base-button
        variant="solid"
        class="px-4 py-2"
        :text="$t('actions.save')"
        :alt="$t('actions.save')"
        :action="console"
      />
    </div>
  </div>
</template>

<script>
const axios = require('axios');

export default {
  name: 'TicketDashboard',
  components: {},
  data() {
    return {
      ticketTableHeaders: [
        'Ticket Id',
        'Requester Id',
        'Created',
        'Description',
        'Via',
        'Launch Ticket',
      ],
      newData: [],
      dataFromApi: [],
    };
  },
  async onMounted() {
    await this.dataConversion();
  },
  methods: {
    console() {
      this.dataConversion();
    },
    async dataConversion() {
      axios
        .get(
          'https://api.dev.crisiscleanup.io/zendesk/search?query=status<solved',
        )
        // eslint-disable-next-line no-return-assign
        .then((response) => (this.dataFromApi = response.data.results));
      console.log(this.dataFromApi);
      for (let i = 0; i < this.dataFromApi.length; i++) {
        this.newData[i] = {
          id: this.dataFromApi[i].id,
          description: this.dataFromApi[i].description,
          via: 'test',
          url: this.dataFromApi[i].url,
          created_at: this.dataFromApi[i].created_at,
          requester_id: this.dataFromApi[i].requester_id,
        };
      }
      console.log(this.newData);
      return this.newData;
    },
  },
};
</script>

<style scoped>
.styled-table {
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  font-family: sans-serif;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}

.styled-table thead tr {
  background-color: #fece09;
  color: #ffffff;
  text-align: left;
}

.styled-table th,
.styled-table td {
  padding: 12px 15px;
}

.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #fece09;
}

.styled-table tbody tr.active-row {
  font-weight: bold;
  color: #fece09;
}
</style>
