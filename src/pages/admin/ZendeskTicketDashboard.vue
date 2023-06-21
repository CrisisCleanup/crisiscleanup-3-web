<script lang="ts" setup>
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import TicketCards from '@/components/Tickets/TicketCards.vue';
import useCurrentUser from '@/hooks/useCurrentUser';
import { makeTableColumns } from '@/utils/table';
import Table from '@/components/Table.vue';
import Modal from '@/components/Modal.vue';
import BaseButton from '@/components/BaseButton.vue';
import UserRolesSelect from '@/components/UserRolesSelect.vue';
import BaseText from '@/components/BaseText.vue';

export interface Macro {
  label: string;
  value: string;
}
export interface Macros {
  macros: Macro[];
}
export interface Status {
  label: string;
  value: string;
}

export interface Statuses {
  statuses: Status[];
}

export interface Agent {
  label: string;
  value: string;
}

export interface Agents {
  agents: Agent[];
}

export interface Filter {
  label: string;
  agents?: Agent[];
  Statuses?: Status[];
}

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_BASE_URL}/zendesk`,
});
const userIdsFilter = ref();

const usersRelatedToTickets = ref();
const requesterIdList = ref();
const ticketTotals = ref();
const isLoading = ref(false);
const tickets = ref([]);
// const selectedFilters = ref([]);
const { currentUser } = useCurrentUser();
const agents = ref([
  { id: 411_677_450_351, name: 'Triston Lewis' },
  { id: 484_643_688, name: 'Aarron Titus' },
  { id: 114_709_872_451, name: 'Ross Arroyo' },
  { id: 403_645_788_712, name: 'Gina Newby' },
  { id: 401_921_331_392, name: 'Angelo Pablo' },
]);
// const filters = ref([
//   {
//     label: 'Ticket Status',
//     statuses: [
//       { label: 'New', value: 'New' },
//       { label: 'Open', value: 'Open' },
//       { label: 'Pending', value: 'Pending' },
//       { label: 'Solved', value: 'Solved' },
//     ],
//   },
//   {
//     label: 'Assigned Agents',
//     agents: [
//       { label: 'Triston', value: 'Triston' },
//       { label: 'Braden', value: 'Braden' },
//       { label: 'Ross', value: 'Ross' },
//       { label: 'Deep', value: 'Deep' },
//       { label: 'Angelo', value: 'Angelo' },
//     ],
//   },
// ]);

// const selectedTicketStatusFilter = ref('');
// const changeStatusFilter = (status: string) => {
//   selectedTicketStatusFilter.value = status;
// };

const parseUserIdsFromTickets = (tickets) => {
  try {
    requesterIdList.value = tickets.map((ticket) => ticket.requester_id);
    userIdsFilter.value = requesterIdList.value
      .map((id) => `user_ids=${id}`)
      .join('&');
  } catch (error) {
    console.log(error);
  }
};

const getUsersRelatedToTickets = () => {
  axiosInstance
    .get(`/users?${userIdsFilter.value}`, {})
    .then((response) => {
      usersRelatedToTickets.value = response;
    })
    .then(() => {
      processedUsers();
    })
    .then(() => {
      getTicketsWithUsers();
      getTicketStats();
    })
    .catch((error) => {
      console.error('Error fetching tickets:', error);
    });
};

// const ticketStatusClasses = {
//   '': 'bg-purple-200',
//   new: 'border border-primary-light border-2',
//   open: 'border border-primary-light border-2',
//   pending: 'border border-primary-light border-2',
// };

// const getStatusFilterClass = (status) => {
//   if (selectedTicketStatusFilter.value === status) {
//     return ticketStatusClasses[selectedTicketStatusFilter.value];
//   }
//
//   return '';
// };

// const computedTicketData = computed(() => {
// const _allowed = ref(['status']);

//   const raw = {
//     status: selectedTicketStatusFilter.value,
//   };
//
//   const filtered = Object.keys(raw)
//     .filter((key) => _allowed.value.includes(key))
//     .reduce((obj, key) => {
//       obj[key] = raw[key];
//       return obj;
//     }, {});
//
//   if (selectedTicketStatusFilter.value !== '') {
//     return _.filter(tickets.value, filtered);
//   }
//
//   return tickets.value;
// });

const columns = makeTableColumns([
  ['status', '8%', 'Status'],
  ['created_at', '5%', 'Created'],
  ['account_type', '10%', 'Account Type'],
  ['roles', '16%', 'Roles'],
  ['app', '6%', 'App'],
  ['requester', '8%', 'Requester'],
  ['description', '35%', 'Description'],
  ['advanced_ticket', '7%', 'Advanced Ticket'],
  ['zendesk', '5%', 'Zendesk'],
]);

const activeTicket = ref();
const ticketModal = ref();
const showTicketModal = (ticket) => {
  ticketModal.value = !ticketModal.value;
  activeTicket.value = ticket;
};

const userMap = ref({});
const userEmailMap = ref({});
const processedUsers = () => {
  if (Array.isArray(usersRelatedToTickets.value.data)) {
    userMap.value = usersRelatedToTickets.value.data
      .map((u) => ({ [u.id]: u.name }))
      .reduce((prev, current) => ({ ...prev, ...current }), {});

    userEmailMap.value = usersRelatedToTickets.value.data
      .map((u) => ({ [u.id]: u.email }))
      .reduce((prev, current) => ({ ...prev, ...current }), {});
  } else console.log('props.users is not an array');
};

const formatTicketTime = (date: string) => {
  return moment(date).fromNow();
};

const ticketsWithUsers = ref([]);
const getTicketsWithUsers = () => {
  ticketsWithUsers.value = tickets.value.map((ticket) => {
    const matchingUser = usersRelatedToTickets.value.data.find(
      (user) => ticket.requester_id === user.id,
    );
    return { ...ticket, user: matchingUser };
  });
};

const ticketStats = ref({
  total: 0,
  new: 0,
  open: 0,
  pending: 0,
  users: 0,
  survivors: 0,
  app: null,
});
const getTicketStats = () => {
  const ticketFilterByCCUser = ticketsWithUsers.value.filter(
    (ticket) => ticket.user.ccu_user !== null,
  );
  const ticketFilterBySurvivors = ticketsWithUsers.value.filter(
    (ticket) => ticket.user.ccu_user === null,
  );
  ticketStats.value.users = _.countBy(ticketFilterByCCUser, 'ccu_user');
  ticketStats.value.survivors = _.countBy(ticketFilterBySurvivors, 'ccu_user');
  ticketStats.value.total = Object.values(ticketTotals.value).reduce(
    (acc, val) => acc + val,
    0,
  );
  ticketStats.value.new = ticketTotals.value.new;
  ticketStats.value.open = ticketTotals.value.open;
  ticketStats.value.pending = ticketTotals.value.pending;
  ticketStats.value.app = _.countBy(ticketsWithUsers.value, (ticket) => {
    if (ticket.description.includes('android_res')) {
      return 'android';
    }

    if (ticket.description.includes('ios_res')) {
      return 'ios';
    }

    return 'web4';
  });
};

const fetchTickets = () => {
  axiosInstance
    .get('/search', {
      params: {
        query: 'status<solved',
      },
    })
    .then((response) => {
      tickets.value = response.data.results;
      ticketTotals.value = _.countBy(response.data.results, 'status');
    })
    .then(() => {
      parseUserIdsFromTickets(tickets.value);
      getUsersRelatedToTickets();
    })
    .catch((error) => {
      console.error('Error fetching tickets:', error);
    });
};

const removeSubmittedFrom = (body) => {
  const delimiter = '------------------';
  const parts = body.split(delimiter);
  return parts[0].trim();
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

onMounted(() => {
  isLoading.value = true;
  fetchTickets();
  isLoading.value = false;
});
</script>

<template>
  <div class="grid grid-cols-12">
    <div
      v-if="ticketTotals"
      class="flex border p-4 m-2 rounded-md items-center justify-evenly col-span-4"
    >
      <BaseText
        ><span class="font-bold">Total Tickets:</span>
        {{ ticketStats.total }}</BaseText
      >
      <BaseText
        ><span class="font-bold text-[#c19700]">New: </span
        >{{ ticketStats.new }}</BaseText
      >
      <BaseText
        ><span class="font-bold text-[#0042ed]">Open: </span>
        {{ ticketStats.open }}</BaseText
      >
      <BaseText
        ><span class="font-bold text-[#6b6b6b]">Pending: </span
        >{{ ticketStats.pending }}</BaseText
      >
    </div>
    <div
      v-if="ticketTotals"
      class="flex border p-4 m-2 rounded-md items-center justify-evenly col-span-4"
    >
      <BaseText
        ><span class="font-bold">Web4:</span>
        {{ ticketStats.app?.web4 ?? 0 }}</BaseText
      >
      <BaseText
        ><span class="font-bold">IOS:</span>
        {{ ticketStats.app?.ios ?? 0 }}</BaseText
      >
      <BaseText
        ><span class="font-bold">Android:</span>
        {{ ticketStats.app?.android ?? 0 }}</BaseText
      >
    </div>
    <div
      v-if="ticketTotals"
      class="flex border p-4 m-2 rounded-md items-center justify-evenly col-span-4"
    >
      <!--      could not get these to return just number instead of key:value pair as undefined for key-->
      <BaseText
        ><span class="font-bold">Users: </span>
        {{ ticketStats.users?.undefined }}
      </BaseText>
      <BaseText
        ><span class="font-bold">Survivors: </span>
        {{ ticketStats.survivors?.undefined }}</BaseText
      >
    </div>
  </div>
  <Table
    v-if="usersRelatedToTickets && usersRelatedToTickets.data"
    :columns="columns"
    :data="ticketsWithUsers"
  >
    <template #status="slotProps">
      <div :class="[slotProps.item.status + '-tag', 'ticket-status text-xl']">
        {{ capitalizeFirstLetter(slotProps.item.status) }}
      </div>
    </template>
    <template #created_at="slotProps">{{
      formatTicketTime(slotProps.item.created_at)
    }}</template>

    <template #account_type="slotProps">
      <div
        v-if="slotProps.item.user.ccu_user"
        :style="`border-color: #3498DB; color: #3498DB`"
        class="user-type border rounded-md text-center p-2 mx-4 my-2 text-xl"
      >
        User
      </div>

      <div
        v-else
        :style="`border-color: #27AE60; color: #27AE60`"
        class="user-type border rounded-md text-center p-2 mx-4 my-2 text-xl"
      >
        Survivor
      </div>
    </template>

    <template #roles="slotProps">
      <UserRolesSelect
        v-if="slotProps.item.user.ccu_user"
        style="pointer-events: none"
        class="w-full flex-grow border border-crisiscleanup-dark-100"
        data-testid="testUserRolesSelect"
        :user="slotProps.item.user.ccu_user"
      />
      <div v-else class="flex items-center justify-center">No Roles</div>
    </template>

    <template #requester="slotProps">
      {{
        slotProps.item.user.ccu_user
          ? slotProps.item.user.ccu_user?.first_name +
            ' ' +
            slotProps.item.user.ccu_user?.last_name
          : slotProps.item.user.name
      }}
    </template>

    <template #description="slotProps">{{
      removeSubmittedFrom(slotProps.item.description)
    }}</template>

    <template #advanced_ticket="slotProps">
      <BaseButton
        :action="() => showTicketModal(slotProps.item)"
        text="Open"
        variant="primary"
        class="p-2 rounded-md text-lg"
      />
    </template>

    <template #zendesk="slotProps">
      <base-link
        :href="`http://crisiscleanup.zendesk.com/agent/tickets/${slotProps.item.id}`"
        text-variant="bodysm"
        class="px-2 w-14 border rounded-md"
        target="_blank"
      >
        <img alt="zendesk icon" src="../../assets/icons/zendesk.svg"
      /></base-link>
    </template>
  </Table>

  <!--  <div class="tickets__statusAndFilter">-->
  <!--    <div v-if="tickets" class="bg-primary-light rounded-xl shadow-md">-->
  <!--      <div class="text-white grid grid-cols-5 p-2">-->
  <!--        <BaseText class="col-span-4"-->
  <!--          >Total Tickets: {{ tickets.data?.results?.length }}</BaseText-->
  <!--        >-->
  <!--        <div-->
  <!--          :class="-->
  <!--            selectedTicketStatusFilter === '' ? 'bg-primary-dark' : 'bg-white'-->
  <!--          "-->
  <!--          class="rounded-md text-center text-black"-->
  <!--          @click="changeStatusFilter('')"-->
  <!--        >-->
  <!--          All-->
  <!--        </div>-->
  <!--      </div>-->
  <!--      <div v-if="ticketTotals" class="grid grid-cols-3 text-center">-->
  <!--        <div-->
  <!--          :class="[-->
  <!--            getStatusFilterClass('new'),-->
  <!--            'new rounded-bl-xl flex flex-col',-->
  <!--          ]"-->
  <!--          @click="changeStatusFilter('new')"-->
  <!--        >-->
  <!--          New <BaseText>{{ ticketTotals?.new || 0 }}</BaseText>-->
  <!--        </div>-->
  <!--        <div-->
  <!--          :class="[getStatusFilterClass('open'), 'open flex flex-col']"-->
  <!--          @click="changeStatusFilter('open')"-->
  <!--        >-->
  <!--          Open <BaseText>{{ ticketTotals?.open || 0 }}</BaseText>-->
  <!--        </div>-->
  <!--        <div-->
  <!--          :class="[getStatusFilterClass('pending'), 'pending flex flex-col']"-->
  <!--          @click="changeStatusFilter('pending')"-->
  <!--        >-->
  <!--          Pending <BaseText>{{ ticketTotals?.pending || 0 }}</BaseText>-->
  <!--        </div>-->
  <!--      </div>-->
  <!--    </div>-->
  <!--    <BaseSelect-->
  <!--      v-model="selectedFilters"-->
  <!--      :options="filters"-->
  <!--      display="chip"-->
  <!--      option-label="label"-->
  <!--      option-group-label="label"-->
  <!--      option-group-children="items"-->
  <!--      placeholder="Select a Filter"-->
  <!--    />-->
  <!--  </div>-->

  <modal
    v-if="ticketModal"
    closeable
    :title="'Ticket: ' + activeTicket.id"
    class="p-10"
    @close="showTicketModal()"
  >
    <template #default>
      <TicketCards
        v-if="
          activeTicket.description &&
          usersRelatedToTickets &&
          currentUser &&
          agents
        "
        :key="`${activeTicket.id}`"
        :current-user="currentUser"
        :agents="agents"
        :ticket-data="activeTicket"
        @re-fetch-ticket="fetchTickets"
      />
    </template>
  </modal>
</template>

<style lang="postcss" scoped>
.tickets__statusAndFilter {
  @apply p-4 m-4 gap-4 flex flex-col;
}
.tickets__container {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

.tickets__container-advanced {
  @apply grid grid-cols-1;
}
.new {
  color: #c19700;
  background: #fff59c;
}

.open {
  color: #0042ed;
  background: #9cb8ff;
}

.solved {
  color: #f21b1b;
  background: #ffa296;
}

.pending {
  color: #6b6b6b;
  background: #e8e4e4;
}

.new-tag {
  color: #c19700;
  border: 2px solid #c19700;
  @apply p-2 rounded-md;
}

.open-tag {
  color: #0042ed;
  border: 2px solid #0042ed;
  @apply p-2 rounded-md;
}

.solved-tag {
  color: #f21b1b;
  border: 2px solid #f21b1b;
  @apply p-2 rounded-md;
}

.pending-tag {
  color: #6b6b6b;
  border: 2px solid #6b6b6b;
  @apply p-2 rounded-md;
}
</style>
