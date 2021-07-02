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
            <base-button text="Login" variant="solid" class="m-2 p-1" />
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
                item-key="key"
                label="label"
              />
              <base-button
                text="Reassign Ticket"
                variant="solid"
                class="m-2 p-1"
                :action="getComments"
              />
            </div>
          </div>
        </div>
      </div>
      <!--      <div v-if='!dropDownState' @click='changeDropDownState' class='arrow'>-->
      <!--        <div class='arrow-top'></div>-->
      <!--        <div class='arrow-bottom'></div>-->
      <!--      </div>-->

      <!--      <div v-show='dropDownState' class='h-62'>-->
      <!--        <hr />-->

      <!--        <div class='flex flex-row justify-between'>-->
      <!--          <div>Organization Name:</div>-->
      <!--          <div>{{ ticketData.organization.name }}</div>-->
      <!--        </div>-->

      <!--        <div class="flex flex-row justify-between">-->
      <!--          <div>Login Activity:</div>-->
      <!--          <div>Southeast Baptist Helpers</div>-->
      <!--        </div>-->

      <!--        <div class="flex flex-row justify-between">-->
      <!--          <div>Browser Type:</div>-->
      <!--          <div>Southeast Baptist Helpers</div>-->
      <!--        </div>-->

      <!--        <div class="flex flex-row justify-between">-->
      <!--          <div>Operating System:</div>-->
      <!--          <div>Southeast Baptist Helpers</div>-->
      <!--        </div>-->

      <!--        <div v-if='dropDownState' @click='changeDropDownState' class='arrow-up'>-->
      <!--          <div class='arrow-top'></div>-->
      <!--          <div class='arrow-bottom'></div>-->
      <!--        </div>-->
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
    await this.getComments;
  },
  data() {
    return {
      comments: null,
      test: null,
      truncateState: true,
      dropDownState: false,
      selectedUser: null,
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
    async getComments() {
      console.log('comments for get comments');
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/zendesk/tickets/${this.ticketData.id}/comments`,
      );
      // const { results } = response.data;
      this.comments = response;
      console.log(this.comments);
      console.log(this.comments[0].attachments);
      console.log(this.comments[0].attachments[0]);
    },
    async assignUser() {
      // if (input === 'Triston Lewis') {
      console.log(this.ticketData.id);
      const response = await this.$http.put(
        `${process.env.VUE_APP_API_BASE_URL}/zendesk/tickets/${this.ticketData.id}`,
        {
          ticket: {
            assignee_id: 411677450351,
          },
        },
      );
      console.log(response);
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

.arrow {
  cursor: pointer;
  height: 20px;
  left: 50%;
  position: relative;
  top: 50%;
  transform: translateX(-45%) translateY(270%) rotate(90deg);

  transition: transform 0.1s;
  width: 80px;

  $transition-time: 0.15 s;
  ,
  & -top,
  & -bottom {
    background-color: #666;
    height: 4px;
    left: -5px;
    position: absolute;
    top: 50%;
    width: 20%;

    &:after {
      background-color: gold;
      content: '';
      height: 100%;
      position: absolute;
      top: 0;
      transition: all $transition-time;
    }
  }

  &-top {
    transform: rotate(45deg);
    transform-origin: bottom right;

    &:after {
      left: 100%;
      right: 0;
      transition-delay: 0s;
    }
  }

  &-bottom {
    transform: rotate(-45deg);
    transform-origin: top right;

    &:after {
      left: 0;
      right: 100%;
      transition-delay: $transition-time;
    }
  }

  &:hover & {
    &-top:after {
      left: 0;
      transition-delay: $transition-time;
    }

    &-bottom:after {
      right: 0;
      transition-delay: 0s;
    }
  }
}

.arrow-up {
  cursor: pointer;
  height: 20px;
  left: 50%;
  position: relative;
  top: 50%;
  transform: translateX(-62%) translateY(-50%) rotate(-90deg);

  transition: transform 0.1s;
  width: 80px;

  $transition-time: 0.15 s;
  ,
  & -top,
  & -bottom {
    background-color: #666;
    height: 4px;
    left: -5px;
    position: absolute;
    top: 50%;
    width: 20%;

    &:after {
      background-color: gold;
      content: '';
      height: 100%;
      position: absolute;
      top: 0;
      transition: all $transition-time;
    }
  }

  &-top {
    transform: rotate(45deg);
    transform-origin: bottom right;

    &:after {
      left: 100%;
      right: 0;
      transition-delay: 0s;
    }
  }

  &-bottom {
    transform: rotate(-45deg);
    transform-origin: top right;

    &:after {
      left: 0;
      right: 100%;
      transition-delay: $transition-time;
    }
  }

  &:hover & {
    &-top:after {
      left: 0;
      transition-delay: $transition-time;
    }

    &-bottom:after {
      right: 0;
      transition-delay: 0s;
    }
  }
}
</style>
