<script lang="ts" setup>
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import _ from 'lodash';
import { useMq } from 'vue3-mq';
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
import useEmitter from '@/hooks/useEmitter';
import BaseSelect from '@/components/BaseSelect.vue';

const mq = useMq();
const { emitter } = useEmitter();
const { t } = useI18n();
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
    web?: number;
    ios?: number;
    android?: number;
    unkown?: number;
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
  app_type: { web: 0, ios: 0, android: 0, unknown: 0 },
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

const agents = ref([]);

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
    .then((response: AxiosResponse<unknown>) => {
      usersRelatedToTickets.value = response;
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

// const columns = makeTableColumns([
//   ['status', '8%', t('helpdesk.ticket_status')],
//   ['created_at', '5%', t('helpdesk.ticket_created_at')],
//   ['account_type', '10%', t('helpdesk.account_type')],
//   ['roles', '16%', t('helpdesk.roles')],
//   ['app', '6%', t('helpdesk.app_platform')],
//   ['assignee', '10%', t('helpdesk.assignee')],
//   ['requester', '8%', t('helpdesk.requester')],
//   ['description', '25%', t('helpdesk.description')],
//   ['advanced_ticket', '7%', t('helpdesk.full_ticket')],
//   ['zendesk', '5%', t('helpdesk.zendesk_link')],
// ]);
const columns = [
  {
    title: t('helpdesk.ticket_status'),
    dataIndex: 'status',
    key: 'status',
    sortable: true,
    width: '8%',
  },
  {
    title: t('helpdesk.ticket_created_at'),
    dataIndex: 'created_at',
    key: 'created_at',
    sortable: true,
    width: '5%',
  },
  {
    title: t('helpdesk.account_type'),
    dataIndex: 'account_type',
    key: 'account_type',
    sortable: true,
    width: '10%',
  },
  {
    title: t('helpdesk.roles'),
    dataIndex: 'roles',
    key: 'roles',
    sortable: true,
    width: '16%',
  },
  {
    title: t('helpdesk.app_platform'),
    dataIndex: 'app',
    key: 'app',
    sortable: true,
    width: '6%',
  },
  {
    title: t('helpdesk.assignee'),
    dataIndex: 'assignee',
    key: 'assignee',
    sortable: true,
    width: '10%',
  },
  {
    title: t('helpdesk.requester'),
    dataIndex: 'requester',
    key: 'requester',
    sortable: true,
    width: '8%',
  },
  {
    title: t('helpdesk.description'),
    dataIndex: 'description',
    key: 'description',
    sortable: true,
    width: '25%',
  },
  {
    title: t('helpdesk.full_ticket'),
    dataIndex: 'advanced_ticket',
    key: 'advanced_ticket',
    sortable: true,
    width: '7%',
  },
  {
    title: t('helpdesk.zendesk_link'),
    dataIndex: 'zendesk',
    key: 'zendesk',
    sortable: true,
    width: '5%',
  },
];

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
  } else console.log('Error Processing Users');
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
      if (
        ticket.custom_fields?.find((field) => field.id === 17_295_140_815_757)
          .value === 'android'
      ) {
        return 'android';
      }

      if (
        ticket.custom_fields?.find((field) => field.id === 17_295_140_815_757)
          .value === 'ios'
      ) {
        return 'ios';
      }

      if (
        ticket.custom_fields?.find((field) => field.id === 17_295_140_815_757)
          .value === 'web'
      ) {
        return 'web';
      }

      return 'unknown';
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

const getAgentList = () => {
  axiosInstance
    .get(`/users/search.json?role=agent`, {
      params: {
        role: 'admin',
      },
    })
    .then((response: AxiosResponse<unknown>) => {
      const _agents = response.data.users.map((user) => ({
        id: user.id,
        name: user.name,
        thumbnails: user.photo?.thumbnails,
      }));
      agents.value = _agents;
    });
};

emitter.on('closeModal', () => {
  showTicketModal();
});
// watch(ticketsWithUsers, (newValue, oldValue) => {
//   console.log('ticket data has changed', newValue, oldValue);
// });
const sorterEnums = {
  OLDEST: 'oldest',
  STATUS: 'status',
  AGENT: 'agent',
  REQUESTER: 'requester',
};
const ticketSorter = ref();
const sorterObject = {
  [sorterEnums.STATUS]: ['status'],
  [sorterEnums.AGENT]: ['assignee_id'],
  [sorterEnums.REQUESTER]: ['requester_id'],
  [sorterEnums.OLDEST]: null,
};

const changeTicketSorting = (sorter) => {
  ticketSorter.value = sorter;
};

const ticketsWithUsersSorted = computed(() => {
  const sortingKey = sorterObject[ticketSorter.value];

  if (sortingKey) {
    return _.orderBy(ticketsWithUsers.value, sortingKey);
  }

  return ticketsWithUsers.value;
});

onMounted(() => {
  isLoading.value = true;
  fetchTickets();
  getAgentList();
  isLoading.value = false;
});
</script>

<template>
  <div class="grid grid-cols-12">
    <div
      v-if="ticketTotals"
      class="flex border p-4 m-2 rounded-md items-center justify-evenly col-span-12 md:col-span-4"
    >
      <BaseText
        ><span class="font-bold">{{ t('helpdesk.total_tickets') }}</span>
        {{ ticketStats.total }}</BaseText
      >
      <BaseText
        ><span class="font-bold text-[#c19700]">{{
          t('helpdesk.new_tickets')
        }}</span
        >{{ ticketStats.newTickets }}</BaseText
      >
      <BaseText
        ><span class="font-bold text-[#0042ed]">{{
          t('helpdesk.open_tickets')
        }}</span>
        {{ ticketStats.open }}</BaseText
      >
      <BaseText
        ><span class="font-bold text-[#6b6b6b]">{{
          t('helpdesk.pending_tickets')
        }}</span
        >{{ ticketStats.pending }}</BaseText
      >
    </div>
    <div
      v-if="ticketTotals"
      class="flex border p-4 m-2 rounded-md items-center justify-evenly col-span-12 md:col-span-4"
    >
      <BaseText
        ><span class="font-bold">{{ t('helpdesk.web_platform') }}</span>
        {{ ticketStats.app_type?.web ?? 0 }}</BaseText
      >
      <BaseText
        ><span class="font-bold">{{ t('helpdesk.ios_platform') }}</span>
        {{ ticketStats.app_type?.ios ?? 0 }}</BaseText
      >
      <BaseText
        ><span class="font-bold">{{ t('helpdesk.android_platform') }}</span>
        {{ ticketStats.app_type?.android ?? 0 }}</BaseText
      >
      <BaseText
        ><span class="font-bold">{{ t('~~unknown') }}</span>
        {{ ticketStats.app_type?.unknown ?? 0 }}</BaseText
      >
    </div>
    <div
      v-if="ticketTotals"
      class="flex border p-4 m-2 rounded-md items-center justify-evenly col-span-12 md:col-span-4"
    >
      <!--      could not get these to return just number instead of key:value pair as undefined for key-->
      <BaseText
        ><span class="font-bold">{{ t('helpdesk.user_count') }}</span>
        {{ ticketStats.users?.undefined }}
      </BaseText>
      <BaseText
        ><span class="font-bold">{{ t('~~Other') }}</span>
        {{ ticketStats.survivors?.undefined }}</BaseText
      >
    </div>
    <div
      class="flex border p-4 m-2 rounded-md items-center justify-evenly col-span-12 md:col-span-4"
    >
      <BaseSelect
        :model-value="ticketSorter"
        select-classes="w-full absolute inset-0 outline-none focus:ring-0 appearance-none border-0 text-base font-sans bg-white rounded py-2"
        class="w-full"
        label="name"
        :placeholder="t('~~Selected Sorter')"
        item-key="id"
        :options="sorterObject"
        @update:model-value="(v) => changeTicketSorting(v)"
      />
    </div>
  </div>
  <Table
    v-if="usersRelatedToTickets && usersRelatedToTickets.data"
    :columns="columns"
    :data="ticketsWithUsersSorted"
  >
    <template #status="slotProps">
      <span v-if="mq.mdMinus" class="font-bold">Status: </span>
      <div
        :class="[slotProps.item.status + '-tag', 'ticket-status text-xl mx-4']"
      >
        {{ capitalize(slotProps.item.status) }}
      </div>
    </template>
    <template #created_at="slotProps">
      <BaseText
        ><span v-if="mq.mdMinus" class="font-bold">Created At: </span>
        {{ momentFromNow(slotProps.item.created_at) }}
      </BaseText>
    </template>

    <template #account_type="slotProps">
      <span v-if="mq.mdMinus" class="font-bold">Account Type: </span>
      <div
        v-if="slotProps.item.user.ccu_user"
        :style="`border-color: #3498DB; color: #3498DB`"
        class="user-type border rounded-md text-center p-2 mx-4 my-2 text-xl"
      >
        {{ t('helpdesk.user_account') }}
      </div>

      <div
        v-else
        class="user-type border rounded-md text-center p-2 mx-4 my-2 text-xl"
        style="border-color: #27ae60; color: #27ae60"
      >
        {{ t('~~Other') }}
      </div>
    </template>

    <template #roles="slotProps">
      <span v-if="mq.mdMinus" class="font-bold">Roles: </span>
      <UserRolesSelect
        v-if="slotProps.item.user.ccu_user"
        style="pointer-events: none"
        class="w-full flex-grow border border-crisiscleanup-dark-100 mx-2"
        data-testid="testUserRolesSelect"
        :user="slotProps.item.user.ccu_user"
      />
      <div v-else class="flex items-center justify-center">
        {{ t('helpdesk.no_account') }}
      </div>
    </template>
    <template #assignee="slotProps">
      <BaseText
        ><span v-if="mq.mdMinus" class="font-bold">Assignee: </span>
        {{ _.find(agents, { id: slotProps.item.assignee_id })?.name || '-' }}
      </BaseText>
    </template>
    <template #app="slotProps">
      <BaseText
        ><span v-if="mq.mdMinus" class="font-bold">App: </span
        >{{
          slotProps.item.custom_fields.find(
            (field) => field.id === 17295140815757,
          ).value || '-'
        }}</BaseText
      >
    </template>
    <template #requester="slotProps">
      <BaseText>
        <span v-if="mq.mdMinus" class="font-bold">Requester:</span>
        {{
          slotProps.item.user?.ccu_user
            ? slotProps.item.user?.ccu_user?.first_name +
              ' ' +
              slotProps.item.user?.ccu_user?.last_name
            : slotProps.item.user.name
        }}
      </BaseText>
    </template>

    <template #description="slotProps">
      <BaseText>
        <span v-if="mq.mdMinus" class="font-bold">Description: </span
        >{{ removeSubmittedFromFooter(slotProps.item.subject) }}
      </BaseText>
    </template>

    <template #advanced_ticket="slotProps">
      <BaseButton
        :action="() => showTicketModal(slotProps.item)"
        :text="t('helpdesk.open_ticket_status')"
        variant="primary"
        class="p-2 rounded-md text-lg"
        :class="mq.mdMinus && 'w-full'"
      />
    </template>

    <template #zendesk="slotProps">
      <base-link
        :href="`https://crisiscleanup.zendesk.com/agent/tickets/${slotProps.item.id}`"
        text-variant="bodysm"
        class="px-2 w-14 border rounded-md flex items-center justify-center"
        :class="mq.mdMinus && 'w-full'"
        target="_blank"
      >
        <img
          alt="zendesk icon"
          src="../../assets/icons/zendesk.svg"
          class="w-14"
        />
      </base-link>
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
        @change="fetchTickets"
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
