<template>
  <div class="">
    <div class="gridContainer sm:gridContainer-mobile">
      <TicketCards
        :key="`${item.id}-${idx}`"
        v-for="(item, idx) in ticketWithCCData"
        :ticket-data="item"
      />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { makeTableColumns } from '@/utils/table';
import TicketCards from './TicketCards.vue';

export default {
  name: 'TicketDashboard',
  components: { TicketCards },
  data() {
    return {
      tickets: [],

      ticketWithCCData: [],
    };
  },
  async mounted() {
    // await this.getTickets();
    // const x = await this.fetchTickets();
    // console.log(x);
    await this.fetchTickets();
    // await this.getTickets();
  },
  methods: {
    async fetchTickets() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/zendesk/search?query=status<solved`,
      );
      const { results } = response.data;
      console.log(results);
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
          // console.log('this is what deep wanted',
          //   await this.$http.get(
          //     `${process.env.VUE_APP_API_BASE_URL}/zendesk/users/${t.requester_id}`,
          //   ),
          // );
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
          console.log(obj);
          this.ticketWithCCData.push(obj);
          return obj;
        },
      );
    },
    // async fetchTickets() {
    //   const response = await this.$http.get(
    //     `${process.env.VUE_APP_API_BASE_URL}/zendesk/search?query=status<solved`,
    //   );
    //   const { results } = response.data;
    //   console.log(results);
    //   _.map(
    //     _.map(results, (obj) =>
    //       _.pick(obj, [
    //         'id',
    //         'description',
    //         'via',
    //         'url',
    //         'created_at',
    //         'requester_id',
    //         'status',
    //         'assignee_id',
    //       ]),
    //     ),
    //     async (t) => {
    //       console.log(
    //         'this is what deep wanted',
    //         await this.$http.get(
    //           `${process.env.VUE_APP_API_BASE_URL}/zendesk/users/${t.requester_id}`,
    //         ),
    //       );
    //       const {
    //         data: {
    //           ccu_user: {
    //             mobile,
    //             last_sign_in_at,
    //             primary_language,
    //             organization,
    //           },
    //           user: { name, phone, role, email, photo },
    //         },
    //       } = await this.$http.get(
    //         `${process.env.VUE_APP_API_BASE_URL}/zendesk/users/${t.requester_id}`,
    //       );
    //       const obj = _.merge(t, {
    //         name,
    //         phone: mobile || phone,
    //         last_sign_in_at: last_sign_in_at || '',
    //         role,
    //         email,
    //         photo,
    //         primary_language: primary_language || '',
    //         organization: organization || '',
    //       });
    //       console.log(obj);
    //       this.ticketWithCCData.push(obj);
    //       return obj;
    //     },
    //   );
    // },

    // async fetchTickets() {
    //   const response = await this.$http.get(
    //     `${process.env.VUE_APP_API_BASE_URL}/zendesk/search?query=status<solved`,
    //   );
    //   const { results } = response.data;
    //   console.log(results);
    //   _.map(
    //     _.map(results, (obj) => _.pick(obj, ['id', 'description', 'via', 'url', 'created_at', 'requester_id', 'status', 'assignee_id'])),
    //     async (t) => {
    //       console.log('this is what deep wanted',
    //         await this.$http.get(
    //           `${process.env.VUE_APP_API_BASE_URL}/zendesk/users/${t.requester_id}`,
    //         ),
    //       );
    //       const {
    //         data: {
    //           user: {
    //             name,
    //             phone,
    //             role,
    //             email,
    //             photo,
    //           },
    //         },
    //       } = await this.$http.get(`${process.env.VUE_APP_API_BASE_URL}/zendesk/users/${t.requester_id}`);
    //       // const aa = await this.$http.get(`${process.env.VUE_APP_API_BASE_URL}/zendesk/users/484643688`);
    //       // console.log('user with phone', aa);
    //       const obj = _.merge(t, { name, phone, role, email, photo });
    //       console.log(obj);
    //       this.ticketWithCCData.push(obj);
    //       return obj;
    //     });
    // },
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
@media (min-width: 600px) {
  .gridContainer {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (min-width: 900px) {
  .gridContainer {
    grid-template-columns: repeat(3, 1fr);
  }
}

.gridContainer {
  @apply mt-6;
  max-width: 600px;

  display: grid;
  grid-gap: 1rem;

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
