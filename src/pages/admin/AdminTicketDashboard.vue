<template>
  <div class="">
    <!--    <base-button-->
    <!--      text="Expand All Tickets"-->
    <!--      variant="solid"-->
    <!--      class="mx-4 my-2 p-2 rounded"-->
    <!--      :action="() => (expandState = !expandState)"-->
    <!--    />-->
    <div class="p-4 m-4 bg-white rounded-xl border">
      <form-select
        class="border border-crisiscleanup-dark-100 select"
        :options="filters"
        placeholder="Please Select A Filter"
        :value="selectedFilter"
        @input="
          (value) => {
            selectedFilter = value;
          }
        "
      />
      <base-button
        text="Download Tickets"
        variant="solid"
        class="m-2 p-1 rounded p-2 bg-crisiscleanup-yellow-300"
        :action="() => downloadTickets()"
        @click="() => console.log('hello')"
      />
      <div
        class="bg-crisiscleanup-yellow-300 rounded-xl text-center w-22"
        @click="downloadTickets"
      >
        test
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <TicketCards
              :key="`${item.id}-${idx}`"
              v-for="(item, idx) in ticketWithCCData"
              :ticket-data="item"
              @reFetchTicket="reFetchAllTickets"
              :expand-state="expandState"
            />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import TicketCards from './TicketCards.vue';
import * as downloads from '../../utils/downloads.js';
export default {
  name: 'TicketDashboard',
  components: { TicketCards, downloads },
  data() {
    return {
      selectedFilter: '',
      filters: [
        'All Tickets',
        'New Tickets',
        'Pending Tickets',
        'Solved Tickets',
      ],
      expandState: false,

      tickets: [],

      ticketWithCCData: [],
    };
  },
  async mounted() {
    await this.fetchTickets();
  },
  methods: {
    async downloadTickets() {
      // bellow is an example of what a ticket might look like in json
      //   {
      //   "id": 9713,
      //     "description": "PO would like ash sifting help. Mostly jewelry or coins. Anything intact really.",
      //     "via": {
      //     "channel": "web",
      //       "source": {
      //       "from": {},
      //       "to": {},
      //       "rel": null
      //     }
      //   },
      //   "url": "https://crisiscleanup.zendesk.com/api/v2/tickets/9713.json",
      //     "created_at": "2022-02-01T20:19:59Z",
      //     "requester_id": 423543923912,
      //     "status": "new",
      //     "assignee_id": null,
      //     "name": "Alex Bennett Studio",
      //     "phone": null,
      //     "role": "end-user",
      //     "email": "alex.bennett.studio@gmail.com",
      //     "photo": null,
      //     "last_sign_in_at": "",
      //     "primary_language": "",
      //     "organization": ""
      // }
      this.ticketWithCCData.forEach(
        (item) => (item.description = item.description.replace(/,/, '')),
      );

      await downloads.exportCSVFile(
        [
          'id',
          'description',
          'via',
          'url',
          'created_at',
          'requester_id',
          'status',
          'assignee_id',
          'name',
          'phone',
          'role',
          'email',
          'photo',
          'mobile',
          'last_sign_in_at',
          'primary_language',
          'organization',
        ],
        this.ticketWithCCData,
        'TicketCsv',
      );
      console.log('downloading complete');
    },

    reFetchAllTickets() {
      this.ticketWithCCData = [];
      this.fetchTickets();
    },
    reFetchTicket(payload, ticketId) {
      _.remove(this.ticketWithCCData, (o) => o.id === ticketId);
      this.ticketWithCCData.push(payload);
    },
    async fetchTickets() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/zendesk/search?query=status<solved`,
      );
      const { results } = response.data;
      _.map(
        _.map(results, (obj) =>
          _.pick(obj, [
            'id',
            'description',
            'via',
            'url',
            'created_at',
            'requester_id',
            'status',
            'assignee_id',
          ]),
        ),
        async (t) => {
          const {
            data: {
              user: { name, phone, role, email, photo },
            },
          } = await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/zendesk/users/${t.requester_id}`,
          );
          const { data } = await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/zendesk/users/${t.requester_id}`,
          );
          const obj = _.merge(t, {
            name,
            phone,
            role,
            email,
            photo,
            last_sign_in_at: '',
            primary_language: '',
            organization: '',
          });
          if (data.ccu_user) {
            const {
              ccu_user: {
                mobile,
                last_sign_in_at,
                primary_language,
                organization,
              },
            } = data;
            obj.phone = mobile;
            obj.last_sign_in_at = last_sign_in_at;
            obj.primary_language = primary_language;
            obj.organization = organization;
          }
          this.ticketWithCCData.push(obj);
          return obj;
        },
      );
    },
  },
  computed: {},
};
</script>

<style scoped></style>
