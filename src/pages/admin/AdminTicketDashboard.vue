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

          <th style="width: 10%;">{{ items.created }}</th>

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
  </div>
</template>

<script>
const axios = require('axios');

export default {
  name: 'TicketDashboard',
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
      newData: [
        {
          id: 1,
          description: 'test',
          via: 'test web',
          url: 'http://crisiscleanup.zendesk.com',
          created: 'this date',
          requester_id: '8900',
        },
        {
          id: 2,
          description: 'test',
          via: 'test web',
          url: 'http://crisiscleanup.zendesk.com',
          created: 'this date',
          requester_id: '8900',
        },
      ],
      dataFromApi: [],
    };
  },
  async mounted() {
    // await this.dataConversion();
  },
  methods: {
    async dataConversion() {
      // const cookie = await browser.cookie.get();
      // console.log(cookie);

      // axios.defaults.headers.common.Authorization =
      //   'Bearer 759bfc68240739458c76c58cf4ce7d8eb8b9336916eb32d953afaa34a4d2b676';
      const headers = {
        Authorization:
          'Bearer 759bfc68240739458c76c58cf4ce7d8eb8b9336916eb32d953afaa34a4d2b676',
        cors: false,
      };
      axios
        .get(
          'https://crisiscleanup.zendesk.com/api/v2/search.json?query=status<solved',
          { headers },
        )
        // eslint-disable-next-line no-return-assign
        .then((response) => (this.dataFromApi = response));
      for (let i = 0; i < this.dataFromApi.data.results.length; i++) {
        this.newData[i] = {
          id: this.dataFromApi.data.results[i].id,
          description: this.dataFromApi.data.results[i].description,
          via: this.dataFromApi.data.results[i].via.channel,
          url: this.dataFromApi.data.results[i].url,
          created: this.dataFromApi.data.results[i].created_at,
          requester_id: this.dataFromApi.data.results[i].requester_id,
        };
      }
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
