<template>
  <div
    :class="[
      this.ticketData.status === 'solved' ? 'opacity-25' : '',
      expandState ? '' : 'height: 50rem',
    ]"
    class="bg-white p-2 shadow rounded-xl z-1 m-4"
  >
    <div name="info" class="flex flex-col">
      <div class="flex flex-row justify-between pb-2">
        <div class="mr-2">
          <div class="font-bold">{{ ticketData.name }}</div>
          <div>{{ ticketData.email }}</div>
          <div>{{ ticketData.phone }}</div>

          <base-link text-variant="bodysm" class="px-2" target="_blank "
            >{{ ticketData.organization.name }}
          </base-link>
          <base-button
            disabled
            text="Events"
            variant="solid"
            class="m-2 p-2 rounded"
          />
        </div>
        <div class="flex flex-col lg:flex-row">
          <base-link
            :href="`http://crisiscleanup.zendesk.com/agent/tickets/${ticketData.id}`"
            text-variant="bodysm"
            class="px-2"
            target="_blank "
            >{{ $t('~~Launch Ticket') }}
          </base-link>
          <div class="flex flex-col">
            <div
              class="
                flex
                justify-center
                text-center
                rounded
                text-md
                flex-wrap
                p-2
              "
              :class="ticketData.status"
            >
              {{ ticketData.status }}
            </div>
            <base-button
              disabled
              text="Login"
              variant="solid"
              class="mt-2 mr-6 pl-2 pr-2 rounded p-2 w-full"
            />
          </div>
        </div>
      </div>

      <hr />
      <div class="font-bold">
        Created on {{ ticketData.created_at | formatDate }}
      </div>
      <div :class="truncateState ? '' : ''">
        <div v-if="truncateState">
          {{ ticketData.description | truncate(200) }}
        </div>

        <div v-if="!truncateState">{{ ticketData.description }}</div>

        <div v-if="ticketData.description.length > 200">
          <div
            v-if="truncateState"
            @click="toggleTruncate"
            class="p-1 bg-blue-500 w-1/4 h-1/2 rounded m-1 text-center"
          >
            Read more
          </div>
          <div
            v-else
            @click="toggleTruncate"
            class="p-1 bg-blue-500 w-1/4 h-1/2 rounded m-1 text-center"
          >
            Read Less
          </div>
        </div>
      </div>
      <hr />
      <div class="overflow-y-scroll h-80">
        <div class="font-bold">Comments</div>

        <div
          id="comments"
          :class="assignWhoColor(item.author_id)"
          class="m-4 bg-crisiscleanup-dark-100 shadow-lg rounded-md p-2 break-all"
          :key="`${idx}-${item.author_id}`"
          v-for="(item, idx) in comments"
        >
          <div class="font-bold">{{ assignWhoComments(item.author_id) }}</div>
          {{ item.body }}
        </div>
      </div>

      <base-input
        :text-area="true"
        :value="TicketReply"
        class="w-11/12 m-4"
        @input="
          (value) => {
            TicketReply = value;
          }
        "
      ></base-input>

      <hr />
      <div class="flex flex-col">
        <div class="flex justify-between p-2 items-center">
          <img class="mr-4 h-10 w-10" :src="assignWhoPicture" />
          <div class="flex flex-col mr-4">
            Assigned To:
            <div v-if="ticketData.assignee_id" class="font-bold">
              {{ assignWho }}
            </div>
            <div v-else class="font-bold">No user Assigned</div>
          </div>

          <form-select
            class="w-auto flex-grow border border-crisiscleanup-dark-100 select"
            :options="userList"
            :value="selectedUser"
            @input="
              (value) => {
                selectedUser = value;
              }
            "
          />
          <base-button
            text="Reassign Ticket"
            variant="solid"
            class="m-2 p-2 rounded"
            :action="assignUser"
          />
        </div>
        <div class="flex justify-evenly">
          <base-button
            style="background: #9cb8ff"
            text="Reply as Open"
            variant="solid"
            class="m-2 p-1 rounded p-2"
            :action="replyToTicketOpen"
          />

          <base-button
            style="background: #e8e4e4"
            text="Reply as Pending"
            variant="solid"
            class="m-2 p-1 rounded p-2"
            :action="replyToTicketPending"
          />

          <base-button
            style="background: #ffa296"
            text="Reply as Solved/Closed"
            variant="solid"
            class="m-2 p-1 rounded p-2"
            :action="replyToTicketSolved"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import moment from 'moment';
import { DialogsMixin } from '@/mixins';
import { getQueryString } from '@/utils/urls';

import User from '@/models/User';
import FormSelect from '../../components/FormSelect.vue';
export default {
  name: 'TicketCards',
  filters: {
    formatDate(value) {
      if (value) {
        return moment(String(value)).format('MM/DD/YYYY hh:mm');
      }
      return null;
    },
    truncate(data, num) {
      const reqdString = data.split('').slice(0, num).join('');
      return reqdString;
    },
  },
  props: {
    ticketData: {
      type: Object,
      default: null,
    },
    expandState: {
      type: Boolean,
      default: false,
    },
    filter: {
      type: String,
      default: '',
    },
  },
  components: { FormSelect },
  async mounted() {
    this.loading = true;
    await this.currentUser();
    await this.getComments();
  },
  data() {
    return {
      loading: false,
      filterEvents: [],
      users: {
        data: [],
        meta: {
          pagination: {
            pageSize: 20,
            page: 1,
            current: 1,
          },
        },
        search: '',
        visible: true,
      },
      eventStream: [],
      currentLoggedinUser: '',
      currentLoggedinUserId: 0,
      replyState: false,
      TicketReply: '',
      userToAssign: 0,
      comments: [],
      test: null,
      truncateState: true,
      dropDownState: false,
      selectedUser: '',
      userList: ['Arron Titus', 'Triston Lewis', 'Ross Arroyo', 'Gina'],
      ticketAgents: {
        'Arron Titus': 484643688,
        'Triston Lewis': 411677450351,
        'Ross Arroyo': 114709872451,
        Gina: 403645788712,
      },
    };
  },
  mixins: [DialogsMixin],

  computed: {
    assignWho() {
      if (this.ticketData.assignee_id === 484643688) {
        return 'Arron titus';
      }
      if (this.ticketData.assignee_id === 411677450351) {
        return 'Triston Lewis';
      }
      if (this.ticketData.assignee_id === 114709872451) {
        return 'Ross Arroyo';
      }
      if (this.ticketData.assignee_id === 403645788712) {
        return 'Gina';
      }
      return this.ticketData.assignee_id;
    },
    assignWhoPicture() {
      if (this.ticketData.assignee_id === 484643688) {
        return require('@/assets/headshots/aarontitus.jpg');
      }
      if (this.ticketData.assignee_id === 411677450351) {
        return require('@/assets/headshots/triston.png');
      }
      if (this.ticketData.assignee_id === 114709872451) {
        return require('@/assets/headshots/rossarroyo.jpeg');
      }
      if (this.ticketData.assignee_id === 403645788712) {
        return require('@/assets/headshots/ginanewby.jpg');
      }
      return this.ticketData.assignee_id;
    },
  },
  methods: {
    findByEmail(query) {
      console.log(this.users.data.find((o) => o.email === query));
    },
    async loginAs(userId) {
      const response = await axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/admins/users/login_as`,
        {
          user: userId,
        },
      );
      this.setUser(response.data);
      window.location.reload();
    },

    assignWhoColor(author) {
      if (author === 484643688) {
        return 'bg-crisiscleanup-yellow-300';
      }
      if (author === 411677450351) {
        return 'bg-crisiscleanup-yellow-300';
      }
      if (author === 114709872451) {
        return 'bg-crisiscleanup-yellow-300';
      }
      if (author === 403645788712) {
        return 'bg-crisiscleanup-yellow-300';
      }
      return '';
    },

    async currentUser() {
      this.currentLoggedinUser = `${
        User.find(this.$store.getters['auth/userId']).first_name
      } ${User.find(this.$store.getters['auth/userId']).last_name}`;
    },
    assignWhoComments(author) {
      if (author === 484643688) {
        return 'Arron titus';
      }
      if (author === 411677450351) {
        return 'Triston Lewis';
      }
      if (author === 114709872451) {
        return 'Ross Arroyo';
      }
      if (author === 403645788712) {
        return 'Gina';
      }
      return this.ticketData.name;
    },

    async replyToTicketOpen() {
      this.currentLoggedinUserId = this.ticketAgents[this.currentLoggedinUser];
      const response = await this.$http.put(
        `${process.env.VUE_APP_API_BASE_URL}/zendesk/tickets/${this.ticketData.id}`,
        {
          ticket: {
            status: 'open',

            comment: {
              body: this.TicketReply,
              author_id: this.currentLoggedinUserId,
            },
          },
        },
      );
      console.log(response);
      this.$emit('reFetchTicket');
      this.$toasted.success('Ticket Status Changed to OPEN');
    },

    async replyToTicketPending() {
      this.currentLoggedinUserId = this.ticketAgents[this.currentLoggedinUser];

      const response = await this.$http.put(
        `${process.env.VUE_APP_API_BASE_URL}/zendesk/tickets/${this.ticketData.id}`,
        {
          ticket: {
            status: 'pending',

            comment: {
              body: this.TicketReply,
              author_id: this.currentLoggedinUserId,
            },
          },
        },
      );
      console.log(response);

      this.$emit('reFetchTicket');
      this.$toasted.success('Ticket Status Changed to PENDING');
    },

    async replyToTicketSolved() {
      this.currentLoggedinUserId = this.ticketAgents[this.currentLoggedinUser];

      const response = await this.$http.put(
        `${process.env.VUE_APP_API_BASE_URL}/zendesk/tickets/${this.ticketData.id}`,
        {
          ticket: {
            status: 'solved',

            comment: {
              body: this.TicketReply,
              author_id: this.currentLoggedinUserId,
            },
          },
        },
      );
      console.log(response);

      this.$emit('reFetchTicket');
      this.$toasted.success('Ticket Status Changed to SOLVED/CLOSED');
    },

    async getComments() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/zendesk/tickets/${this.ticketData.id}/comments`,
      );
      this.comments = response.data.comments;
      this.comments = this.comments.slice();
    },

    async assignUser() {
      if (this.selectedUser === 'Arron Titus') {
        this.userToAssign = 484643688;
      }
      if (this.selectedUser === 'Triston Lewis') {
        this.userToAssign = 411677450351;
      }
      if (this.selectedUser === 'Ross Arroyo') {
        this.userToAssign = 114709872451;
      }
      if (this.selectedUser === 'Gina') {
        this.userToAssign = 403645788712;
      }

      const response = await this.$http.put(
        `${process.env.VUE_APP_API_BASE_URL}/zendesk/tickets/${this.ticketData.id}`,
        {
          ticket: {
            assignee_id: this.userToAssign,
          },
        },
      );

      this.$emit('reFetchTicket', response, this.ticketData.id);
      if (this.selectedUser === '') {
        this.$toasted.error(
          'ERROR please select a user to assign a ticket to!',
        );
      } else
        this.$toasted.success(
          `Successfully Assigned ticket to user: ${this.selectedUser}`,
        );
    },
    toggleTruncate() {
      this.truncateState = !this.truncateState;
    },
    changeDropDownState() {
      this.dropDownState = !this.dropDownState;
    },
  },
};
</script>

<style scoped lang="postcss">
.new {
  color: #c19700;
  background: #fff59c;
}

.open {
  color: #0042ed;
  background: #9cb8ff;
}

.pending {
  color: #f21b1b;
  background: #ffa296;
}

.solved {
  color: #6b6b6b;
  background: #e8e4e4;
}

::-webkit-scrollbar {
  width: 10px;
  @apply rounded-r-xl;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  @apply rounded-r-xl;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #ffce50;
  @apply rounded-r-xl;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #ffb249;
}
</style>
