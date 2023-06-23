<script lang="ts" setup>
import axios from 'axios';
import _ from 'lodash';
import TicketCards from '@/components/Tickets/TicketCards.vue';
import useCurrentUser from '@/hooks/useCurrentUser';
import { makeTableColumns } from '@/utils/table';
import Table from '@/components/Table.vue';
import Modal from '@/components/Modal.vue';
import BaseButton from '@/components/BaseButton.vue';
import UserRolesSelect from '@/components/UserRolesSelect.vue';
import BaseText from '@/components/BaseText.vue';
import { momentFromNow, capitalize } from '@/filters';
import type User from '@/models/User';

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_BASE_URL}/zendesk`,
});
interface Ticket {
  assignee_id: number;
  collaborator_ids: number[];
  created_at: string;
  custom_fields: {
    id: number;
    value: string;
  }[];
  custom_status_id: number;
  description: string;
  due_at: string | null;
  external_id: string;
  follower_ids: number[];
  from_messaging_channel: boolean;
  group_id: number;
  has_incidents: boolean;
  id: number;
  organization_id: number;
  priority: string;
  problem_id: number;
  raw_subject: string;
  recipient: string;
  requester_id: number;
  satisfaction_rating: {
    comment: string;
    id: number;
    score: string;
  };
  sharing_agreement_ids: number[];
  status: string;
  subject: string;
  submitter_id: number;
  tags: string[];
  type: string;
  updated_at: string;
  url: string;
  via: {
    channel: string;
  };
  user?: ZendeskUser;
}
interface ZendeskUser {
  active: boolean;
  alias: string;
  created_at: string;
  custom_role_id: number;
  details: string;
  email: string;
  external_id: string;
  iana_time_zone: string;
  id: number;
  last_login_at: string;
  locale: string;
  locale_id: number;
  moderator: boolean;
  name: string;
  notes: string;
  only_private_comments: boolean;
  organization_id: number;
  phone: string;
  photo: {
    content_type: string;
    content_url: string;
    id: number;
    name: string;
    size: number;
    thumbnails: {
      content_type: string;
      content_url: string;
      id: number;
      name: string;
      size: number;
    }[];
  };
  restricted_agent: boolean;
  role: string;
  role_type: number;
  shared: boolean;
  shared_agent: boolean;
  signature: string;
  suspended: boolean;
  tags: string[];
  ticket_restriction: string;
  time_zone: string;
  updated_at: string;
  url: string;
  user_fields: {
    user_date: string;
    user_decimal: number;
    user_dropdown: string;
  };
  verified: boolean;
  ccu_user?: User | null;
}
interface ZendeskUserList {
  users: ZendeskUser[];
}
interface TicketsWithUsers {
  tickets: Ticket[];
}
interface TicketStats {
  total: number;
  newTickets: number;
  open: number;
  pending: number;
  users: number;
  survivors: number;
  app_type: {
    web4?: number;
    ios?: number;
    android?: number;
  } | null;
}
interface UserNameMap {
  [userId: number]: string;
}

interface UserEmailMap {
  [userId: number]: string;
}

const { currentUser } = useCurrentUser();
const ticketsWithUsers = ref<TicketsWithUsers[]>([]);
const tickets = ref<Ticket[]>([]);
const ticketStats = ref<TicketStats>({
  total: 0,
  newTickets: 0,
  open: 0,
  pending: 0,
  users: 0,
  survivors: 0,
  app_type: { web4: 0, ios: 0, android: 0 },
});
const userNameMap = ref<UserNameMap>({});
const userEmailMap = ref<UserEmailMap>({});
const activeTicket = ref<Ticket | undefined>();
const ticketModal = ref<boolean>(false);
const userIdsFilter = ref<string>();
const usersRelatedToTickets = ref<ZendeskUserList>({ users: [] });
const requesterIdList = ref<number[]>([]);
const isLoading = ref<boolean>(false);

const ticketTotals = ref();
const agents = ref([
  { id: 411_677_450_351, name: 'Triston Lewis' },
  { id: 484_643_688, name: 'Aarron Titus' },
  { id: 114_709_872_451, name: 'Ross Arroyo' },
  { id: 403_645_788_712, name: 'Gina Newby' },
  { id: 401_921_331_392, name: 'Angelo Pablo' },
]);

const parseUserIdsFromTickets = (tickets: Ticket[]) => {
  try {
    requesterIdList.value = tickets.map((ticket) => ticket.requester_id);
    userIdsFilter.value = requesterIdList.value
      .map((id: number) => `user_ids=${id}`)
      .join('&');
  } catch (error) {
    console.log(error);
  }
};

const getUsersRelatedToTickets = () => {
  axiosInstance
    .get(`/users?${userIdsFilter.value}`, {})
    .then((response: ZendeskUserList) => {
      usersRelatedToTickets.value = response;
      console.log('This is the usersRelated to ticket response', response);
    })
    .then(() => {
      processedUsers();
    })
    .then(() => {
      getTicketsWithUsers();
      getTicketStats();
    })
    .catch((error: Error) => {
      console.error('Error fetching tickets:', error);
    });
};

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
const showTicketModal = (ticket: Ticket) => {
  ticketModal.value = !ticketModal.value;
  activeTicket.value = ticket;
};

const processedUsers = () => {
  if (Array.isArray(usersRelatedToTickets.value.data)) {
    userNameMap.value = usersRelatedToTickets.value.data
      .map((u: ZendeskUser) => ({ [u.id]: u.name }))
      .reduce(
        (prev: UserNameMap, current: UserNameMap) => ({ ...prev, ...current }),
        {},
      );

    userEmailMap.value = usersRelatedToTickets.value.data
      .map((u: ZendeskUser) => ({ [u.id]: u.email }))
      .reduce(
        (prev: UserEmailMap, current: UserEmailMap) => ({
          ...prev,
          ...current,
        }),
        {},
      );
  } else console.log('props.users is not an array');
};

const getTicketsWithUsers = () => {
  ticketsWithUsers.value = tickets.value.map((ticket: Ticket) => {
    const matchingUser = usersRelatedToTickets.value.data.find(
      (user: ZendeskUser) => ticket.requester_id === user.id,
    );
    return { ...ticket, user: matchingUser };
  });
};

const getTicketStats = () => {
  const ticketFilterByCCUser = ticketsWithUsers.value.filter(
    (ticket: Ticket) => ticket.user?.ccu_user !== null,
  );
  const ticketFilterBySurvivors = ticketsWithUsers.value.filter(
    (ticket: Ticket) => ticket.user?.ccu_user === null,
  );
  ticketStats.value.users = _.countBy(ticketFilterByCCUser, 'ccu_user');
  ticketStats.value.survivors = _.countBy(ticketFilterBySurvivors, 'ccu_user');
  ticketStats.value.total = Object.values(ticketTotals.value).reduce(
    (acc, val) => acc + val,
    0,
  );
  ticketStats.value.newTickets = ticketTotals.value.new;
  ticketStats.value.open = ticketTotals.value.open;
  ticketStats.value.pending = ticketTotals.value.pending;
  ticketStats.value.app_type = _.countBy(
    ticketsWithUsers.value,
    (ticket: Ticket) => {
      if (ticket.description.includes('android_res')) {
        return 'android';
      }

      if (ticket.description.includes('ios_res')) {
        return 'ios';
      }

      return 'web4';
    },
  );
};

const fetchTickets = () => {
  axiosInstance
    .get('/search', {
      params: {
        query: 'status<solved',
      },
    })
    .then((response: { data: { results: Ticket[] } }) => {
      tickets.value = response.data.results;
      ticketTotals.value = _.countBy(response.data.results, 'status');
    })
    .then(() => {
      parseUserIdsFromTickets(tickets.value);
      getUsersRelatedToTickets();
    })
    .catch((error: Error) => {
      console.error('Error fetching tickets:', error);
    });
};

const removeSubmittedFromFooter = (body: string): string => {
  const delimiter = '------------------';
  const parts: string[] = body.split(delimiter);
  return parts[0].trim();
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
        >{{ ticketStats.newTickets }}</BaseText
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
        {{ ticketStats.app_type?.web4 ?? 0 }}</BaseText
      >
      <BaseText
        ><span class="font-bold">IOS:</span>
        {{ ticketStats.app_type?.ios ?? 0 }}</BaseText
      >
      <BaseText
        ><span class="font-bold">Android:</span>
        {{ ticketStats.app_type?.android ?? 0 }}</BaseText
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
        {{ capitalize(slotProps.item.status) }}
      </div>
    </template>
    <template #created_at="slotProps">{{
      momentFromNow(slotProps.item.created_at)
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
        slotProps.item.user?.ccu_user
          ? slotProps.item.user?.ccu_user?.first_name +
            ' ' +
            slotProps.item.user?.ccu_user?.last_name
          : slotProps.item.user.name
      }}
    </template>

    <template #description="slotProps">{{
      removeSubmittedFromFooter(slotProps.item.description)
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
        :href="`https://crisiscleanup.zendesk.com/agent/tickets/${slotProps.item.id}`"
        text-variant="bodysm"
        class="px-2 w-14 border rounded-md"
        target="_blank"
      >
        <img alt="zendesk icon" src="../../assets/icons/zendesk.svg"
      /></base-link>
    </template>
  </Table>

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
