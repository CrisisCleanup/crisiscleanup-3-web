<template>
  <div>
    <div
      class="min-w-6/12 bg-white p-2 shadow rounded z-1"
      style="width: 30rem;"
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
            <base-button text="Tobi Events" variant="solid" class="m-2 p-1" />
          </div>
          <base-link
            :href="`http://crisiscleanup.zendesk.com/agent/tickets/${ticketData.id}`"
            text-variant="bodysm"
            class="px-2"
            target="_blank "
            >{{ $t('~~Launch Ticket') }}
          </base-link>
          <div class="flex flex-col">
            <div
              class="flex text-center items-center rounded h-6 w-12 justify-center text-md flex-wrap"
              :class="ticketData.status"
            >
              {{ ticketData.status }}
            </div>
            <base-button
              text="Login"
              variant="solid"
              class="mt-2 mr-6 pl-2 pr-2"
            />
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

          <div v-if="ticketData.description.length > 400">
            <div
              v-if="truncateState"
              @click="toggleTruncate"
              class="p-1 bg-blue-500 w-1/4 h-1/2 rounded m-1"
            >
              Read more
            </div>
            <div
              v-else
              @click="toggleTruncate"
              class="p-1 bg-blue-500 w-1/4 h-1/2 rounded m-1"
            >
              Read Less
            </div>
          </div>
        </div>
        <hr />
        <div class="font-bold">Comments</div>

        <div
          class="m-4 bg-crisiscleanup-dark-100 shadow-md rounded-md p-2"
          :key="`${idx}-${item.author_id}`"
          v-for="(item, idx) in comments"
        >
          <div class="font-bold">{{ assignWhoComments(item.author_id) }}</div>
          {{ item.body }}
        </div>

        <hr />
        <div class="flex justify-between">
          <div>
            <div class="flex justify-between p-2">
              <img
                class="mr-4"
                style="width: 50px; height: 50px;"
                :src="assignWhoPicture"
              />
              <div class="flex flex-col mr-4">
                Assigned To:
                <div v-if="ticketData.assignee_id">
                  {{ assignWho }}
                </div>
                <div v-else>No user Assigned</div>
              </div>

              <form-select
                class="w-auto h-12 flex-grow border border-crisiscleanup-dark-100 select"
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
                class="m-2 p-1"
                :action="assignUser"
              />
              <base-button
                text="Reply"
                variant="solid"
                class="m-2 p-1"
                :action="replyToTicket"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="true"></div>
  </div>
</template>

<script>
import moment from 'moment';

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
  },
  components: { FormSelect },
  async mounted() {
    // this.selectedUser = this.assignWho;
    await this.getComments();
  },
  data() {
    return {
      userToAssign: 0,
      comments: [],
      test: null,
      truncateState: true,
      dropDownState: false,
      selectedUser: '',
      userList: ['Arron Titus', 'Triston Lewis', 'Ross Arroyo', 'Gina'],
    };
  },
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

    async replyToTicket() {
      const response = await this.$http.put(
        `${process.env.VUE_APP_API_BASE_URL}/zendesk/tickets/${this.ticketData.id}/comments`,
        {
          ticket: {
            comment: {
              body: 'The smoke is very colorful.',
              author_id: 411677450351,
            },
          },
        },
      );
      console.log(response);
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

      // }
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
</style>
