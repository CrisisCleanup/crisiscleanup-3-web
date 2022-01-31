<template>
  <div class="">
    <!--    <base-button-->
    <!--      text="Expand All Tickets"-->
    <!--      variant="solid"-->
    <!--      class="mx-4 my-2 p-2 rounded"-->
    <!--      :action="() => (expandState = !expandState)"-->
    <!--    />-->
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

export default {
  name: 'TicketDashboard',
  components: { TicketCards },
  data() {
    return {
      expandState: false,

      tickets: [],

      ticketWithCCData: [],
    };
  },
  async mounted() {
    await this.fetchTickets();
  },
  methods: {
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
