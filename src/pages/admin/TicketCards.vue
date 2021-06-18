<template>
  <div>
    <div class="min-w-6/12 w-84 bg-white p-2 shadow rounded z-1">
      <div name="info" class="flex flex-col">
        <div class="flex flex-row justify-between pb-2">
          <div class="mr-2">
            <div class="font-bold">{{ ticketData.name }}</div>
            <div>{{ ticketData.email }}</div>
            <div>{{ ticketData.phone }}</div>
          </div>
          <base-link
            :href="`http://crisiscleanup.zendesk.com/agent/tickets/${ticketData.id}`"
            text-variant="bodysm"
            class="px-2"
            target="_blank "
            >{{ $t('~~Launch Ticket') }}
          </base-link>
          <div
            class="flex text-center items-center rounded h-6 w-12 justify-center text-md flex-wrap"
            :class="ticketData.status"
          >
            {{ ticketData.status }}
          </div>
        </div>

        <hr />
        <div class="font-bold">Created on {{ ticketData.created_at }}</div>
        <div :class="truncateState ? 'truncate' : ''">
          {{ ticketData.description }}
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
        <hr />
        <div class="flex flex-row justify-between">
          <div>
            <div class="p-2">
              <img src="https://via.placeholder.com/50" />
              Assigned To:
              <div v-if="ticketData.assignee_id">
                {{ assignWho }}
              </div>
              <div v-else>No user Assigned</div>
              <form-select
                class="w-auto flex-grow border border-crisiscleanup-dark-100 select"
                :options="userList"
                :value="selectedUser"
                v-model="selectedUser"
                item-key="key"
                label="label"
              />
            </div>
          </div>
          <div class="flex items-center">
            <base-button text="Login" variant="solid" class="m-2 p-1" />
          </div>
        </div>
      </div>
      <div v-if="!dropDownState" @click="changeDropDownState" class="arrow">
        <div class="arrow-top"></div>
        <div class="arrow-bottom"></div>
      </div>

      <div v-show="dropDownState" class="h-62">
        <hr />

        <div class="flex flex-row justify-between">
          <div>Organization Name:</div>
          <div>{{ ticketData.organization.name }}</div>
        </div>

        <div class="flex flex-row justify-between">
          <div>Login Activity:</div>
          <div>Southeast Baptist Helpers</div>
        </div>

        <div class="flex flex-row justify-between">
          <div>Browser Type:</div>
          <div>Southeast Baptist Helpers</div>
        </div>

        <div class="flex flex-row justify-between">
          <div>Operating System:</div>
          <div>Southeast Baptist Helpers</div>
        </div>

        <div v-if="dropDownState" @click="changeDropDownState" class="arrow-up">
          <div class="arrow-top"></div>
          <div class="arrow-bottom"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FormSelect from '../../components/FormSelect.vue';
export default {
  name: 'TicketCards',
  props: {
    ticketData: {
      type: Object,
      default: null,
    },
  },
  components: { FormSelect },
  data() {
    return {
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
  },
  methods: {
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
  &-top,
  &-bottom {
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
  &-top,
  &-bottom {
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
