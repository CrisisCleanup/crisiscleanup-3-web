<script lang="ts" setup>
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import _ from 'lodash';
import { useMq } from 'vue3-mq';
import TicketCards from '@/components/Tickets/TicketCards.vue';
import useCurrentUser from '@/hooks/useCurrentUser';
import type {
  TableChangeEmitItem,
  TableSorterObject,
} from '@/components/Table.vue';
import Table from '@/components/Table.vue';
import Modal from '@/components/Modal.vue';
import BaseButton from '@/components/BaseButton.vue';
import UserRolesSelect from '@/components/UserRolesSelect.vue';
import BaseText from '@/components/BaseText.vue';
import { momentFromNow, capitalize } from '@/filters';
import type User from '@/models/User';
import useEmitter from '@/hooks/useEmitter';
import webIcon from '@/assets/icons/web.svg';
import iosIcon from '@/assets/icons/ios.svg';
import androidIcon from '@/assets/icons/android.svg';

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
  app_type: { web: 0, ios: 0, android: 0 },
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

const agents = ref<
  Array<{
    id: number | string;
    name: string;
    thumbnails: unknown[];
  }>
>([]);

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

const ticketTableSorter = ref<TableSorterObject>({});
const columns = computed<Partial<TableSorterObject>[]>(() => {
  return [
    {
      title: t('helpdesk.ticket_status'),
      key: 'status',
      sortable: true,
      width: '8%',
    },
    {
      title: t('helpdesk.ticket_created_at'),
      key: 'created_at',
      sortable: true,
      width: '5%',
    },
    {
      title: t('helpdesk.account_type'),
      key: 'account_type',
      sortKey: 'user.ccu_user',
      sortable: true,
      width: '10%',
    },
    {
      title: t('helpdesk.roles'),
      key: 'roles',
      width: '16%',
    },
    {
      title: t('helpdesk.app_platform'),
      key: 'app',
      sortKey: 'appPlatform',
      sortable: true,
      width: '6%',
    },
    {
      title: t('helpdesk.assignee'),
      key: 'assignee',
      sortable: true,
      sortKey: 'agentName',
      width: '10%',
    },
    {
      title: t('helpdesk.requester'),
      key: 'requester',
      sortKey: 'requesterName',
      sortable: true,
      width: '8%',
    },
    {
      title: t('helpdesk.description'),
      key: 'description',
      width: '25%',
    },
    {
      title: t('helpdesk.full_ticket'),
      key: 'advanced_ticket',
      width: '7%',
    },
    {
      title: t('helpdesk.zendesk_link'),
      key: 'zendesk',
      width: '5%',
    },
  ];
});

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
    return {
      ...ticket,
      user: matchingUser,
      agentName: agents.value.find((a) => a.id === ticket.assignee_id)?.name,
      appPlatform: ticket.custom_fields?.find(
        (field) => field.id === 17_295_140_815_757,
      )?.value,
      requesterName: matchingUser?.ccu_user
        ? `${matchingUser?.ccu_user?.first_name} ${matchingUser?.ccu_user?.last_name}`
        : matchingUser.name,
    };
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

      if (
        ticket.custom_fields?.find((field) => field.id === 17_295_140_815_757)
          .value === 'web'
      ) {
        return 'web';
      }

      return 'web';
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

emitter.on('closeTicketModal', () => {
  ticketModal.value = false;
});
// watch(ticketsWithUsers, (newValue, oldValue) => {
//   console.log('ticket data has changed', newValue, oldValue);
// });

const tableData = computed(() => {
  const o = ticketTableSorter.value;
  if (o.key) {
    const { key, direction } = o;
    return _.orderBy(ticketsWithUsers.value, key, direction);
  }

  return ticketsWithUsers.value;
});

function handleTableChange(value: TableChangeEmitItem) {
  const { sorter = {} } = value;
  ticketTableSorter.value = { ...sorter };
}

const findAgentName = (id) => {
  return agents.value.find((a) => a.id === id)?.name;
};

const getAppTypeIcons = (appPlatform: string, ticketSubject: string) => {
  if (appPlatform === 'web') {
    return webIcon;
  }

  if (ticketSubject.includes('ios_res')) {
    return iosIcon;
  }

  if (ticketSubject.includes('android_res')) {
    return androidIcon;
  }

  return webIcon;
};

onMounted(() => {
  isLoading.value = true;
  fetchTickets();
  getAgentList();
  isLoading.value = false;
});
</script>

<template>
  <div>
    <div class="grid grid-cols-12">
      <div
        v-if="ticketTotals"
        class="flex border p-4 m-2 rounded-md items-center justify-evenly col-span-12 md:col-span-4"
      >
        <BaseText
          ><span class="font-bold">{{ t('helpdesk.total_tickets') }}</span>
          {{ ticketStats.total ?? 0 }}
        </BaseText>
        <BaseText
          ><span class="font-bold text-[#c19700]">{{
            t('helpdesk.new_tickets')
          }}</span>
          {{ ticketStats.newTickets ?? 0 }}
        </BaseText>
        <BaseText
          ><span class="font-bold text-[#0042ed]">{{
            t('helpdesk.open_tickets')
          }}</span>
          {{ ticketStats.open ?? 0 }}</BaseText
        >
        <BaseText
          ><span class="font-bold text-[#6b6b6b]">{{
            t('helpdesk.pending_tickets')
          }}</span>
          {{ ticketStats.pending ?? 0 }}</BaseText
        >
      </div>
      <div
        v-if="ticketTotals"
        class="flex border p-4 m-2 rounded-md items-center justify-evenly col-span-12 md:col-span-4"
      >
        <BaseText class="flex justify-evenly items-center">
          <img src="@/assets/icons/web.svg" height="36" width="36" />
          {{ ticketStats.app_type?.web ?? 0 }}</BaseText
        >
        <BaseText class="flex justify-evenly items-center">
          <img
            class="mx-1"
            src="@/assets/icons/ios.svg"
            height="26"
            width="26"
          />
          {{ ticketStats.app_type?.ios ?? 0 }}</BaseText
        >
        <BaseText class="flex justify-evenly items-center">
          <img src="@/assets/icons/android.svg" height="36" width="36" />
          {{ ticketStats.app_type?.android ?? 0 }}</BaseText
        >
      </div>
      <div
        v-if="ticketTotals"
        class="flex border p-4 m-2 rounded-md items-center justify-evenly col-span-12 md:col-span-4"
      >
        <!--      could not get these to return just number instead of key:value pair as undefined for key-->
        <BaseText
          ><span class="font-bold">{{ t('helpdesk.user_count') }}</span>
          {{ ticketStats.users?.undefined || 0 }}
        </BaseText>
        <BaseText
          ><span class="font-bold">{{ t('helpdesk.other') }}</span>
          {{ ticketStats.survivors?.undefined || 0 }}</BaseText
        >
      </div>
    </div>
    <Table
      v-if="usersRelatedToTickets && usersRelatedToTickets.data"
      :columns="columns"
      :data="tableData"
      :sorter="ticketTableSorter"
      @change="handleTableChange"
    >
      <template #status="slotProps">
        <span v-if="mq.mdMinus" class="font-bold">Status: </span>
        <div :class="[slotProps.item.status + '-tag', 'ticket-status text-xl']">
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
          style="color: #3498db"
          class="user-type rounded-md text-center p-2 my-2"
        >
          {{ t('helpdesk.user_account') }}
        </div>

        <div
          v-else
          class="user-type rounded-md text-center p-2 my-2"
          style="color: #27ae60"
        >
          {{ t('helpdesk.other') }}
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
          {{ findAgentName(slotProps.item.assignee_id) ?? '-' }}
        </BaseText>
      </template>
      <template #app="slotProps">
        <div class="flex justify-center items-center w-full">
          <BaseText>
            <span v-if="mq.mdMinus" class="font-bold">App: </span>
            <span
              v-if="
                !getAppTypeIcons(
                  slotProps.item.appPlatform,
                  slotProps.item.description,
                )
              "
              >-</span
            >
            <img
              v-else
              :src="
                getAppTypeIcons(
                  slotProps.item.appPlatform,
                  slotProps.item.description,
                )
              "
            />
          </BaseText>
        </div>
      </template>
      <template #requester="slotProps">
        <BaseText>
          <span v-if="mq.mdMinus" class="font-bold">Requester:</span>
          {{ slotProps.item.requesterName }}
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
            class="w-8 md:w-14"
          />
        </base-link>
      </template>
    </Table>
  </div>

  <modal
    v-if="ticketModal"
    closeable
    :title="'Ticket: ' + activeTicket.id"
    :fullscreen="mq.mdMinus"
    :class="mq.mdMinus ? '' : 'p-10'"
    modal-classes="overflow-auto"
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
    <template #footer><span v-if="mq.mdMinus"></span></template>
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
  @apply p-2 rounded-md;
}

.open-tag {
  color: #0042ed;
  @apply p-2 rounded-md;
}

.solved-tag {
  color: #f21b1b;
  @apply p-2 rounded-md;
}

.pending-tag {
  color: #6b6b6b;
  @apply p-2 rounded-md;
}
</style>
