<script lang="ts" setup>
import axios from 'axios';
import _ from 'lodash';
import { useStore } from 'vuex';
import moment from 'moment';
import Table from '../Table.vue';
import Modal from '@/components/Modal.vue';
import BaseText from '@/components/BaseText.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseInput from '@/components/BaseInput.vue';
import User from '@/models/User';
import BaseSelect from '@/components/BaseSelect.vue';

const props = defineProps({
  ticketData: {
    type: Object,
    default: null,
  },
  users: {
    type: Array,
  },
  rawTickets: {
    type: Array,
  },
  agents: {
    type: Array,
  },
  currentUser: {
    type: Object,
  },
});

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_BASE_URL}/zendesk`,
});
const emit = defineEmits<{ (e: 'reFetchTicket'): void }>();
const store = useStore();
const userMap = ref({});
const userEmailMap = ref({});
const expanded = ref(false);
const currentUserID = ref('');
const isLoading = ref(false);
const router = useRouter();
// const toast = useToast()
const comments = ref([]);
const ticketReply = ref('');
const selectedAgent = ref('');
const agentList = ref([]);
const agentDropdown = ref([]);
const customerList = ref([]);
const macros = ref([
  {
    id: 1,
    name: 'Test Macro',
    description: 'This is just for user testing of macros',
    template: 'This is a test',
    actions() {
      console.log('macro applied');
    },
  },
  {
    id: 2,
    name: '2nd Test',
    description: 'This is just for user testing of macros',
    template: '2nd test',
    actions() {
      console.log('macro applied');
    },
  },
]);
const macroColumns = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    searchable: false,
    width: '1fr',
  },
  {
    key: 'description',
    title: 'Description',
    sortable: true,
    searchable: false,
    width: '1fr',
  },
  {
    key: 'template',
    title: 'Template',
    sortable: true,
    searchable: false,
    width: '1fr',
  },
  {
    key: 'actions',
    title: 'Actions',
    sortable: true,
    searchable: false,
    width: '1fr',
  },
];
const macroModalVisibility = ref(false);
const selectedMacroId = ref();

const processedUsers = () => {
  if (Array.isArray(props.users)) {
    userMap.value = props.users
      .map((u) => ({ [u.id]: u.name }))
      .reduce((prev, current) => ({ ...prev, ...current }), {});

    userEmailMap.value = props.users
      .map((u) => ({ [u.id]: u.email }))
      .reduce((prev, current) => ({ ...prev, ...current }), {});
  } else console.log('props.users is not an array');
};

const userMapFunction = (id: number) => {
  return userMap.value[id];
};

const userEmailMapFunction = (id: number) => {
  return userEmailMap.value[id];
};

const assignedUser = computed(() => {
  return _.find(agentList.value, { id: props.ticketData?.assignee_id });
});
const assignedTo = computed(() => {
  return assignedUser.value ? assignedUser.value.name : 'None'
})

const replyToTicket = (replyStatus: string) => {
  axiosInstance
    .put(`/tickets/${props.ticketData.id}`, {
      ticket: {
        status: replyStatus,
        comment: {
          body: ticketReply.value,
          author_id: currentUserID.value,
        },
      },
    })
    .then((response: any) => {
      if (response.status === 200) {
        // toast.success(
        // 	`Reply Successfull, Ticket Status Changed to ${replyStatus}`
        // )
      }

      router.go();
    })
    .catch((error) => {
      // toast.error('Reply unsuccessful', e)
    });
};

const reAssignTicket = () => {
  axiosInstance
    .put(`/tickets/${props.ticketData.id}`, {
      ticket: {
        assignee_id: _.find(agentList.value, { name: selectedAgent.value }).id,
      },
    })
    .then((response: any) => {
      if (response.status === 200) {
        // toast.success('Successfully reassigned')
        setTimeout(() => {
          router.go(); // Reload the page after a delay
        }, 2000); // Timeout to account for zendesk db update
      }
    })
    .catch((error) => {
      // toast.error('Reply unsuccessful', e)
    });
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getCurrentLoggedInUser = () => {
  currentUserID.value = props.agents.find(
    (agent) => agent.name === props.currentUser.full_name,
  )?.id;
};

const getAgentList = () => {
  axiosInstance
    .get(`/users`, {
      params: {
        role: 'admin',
      },
    })
    .then((response: any) => {
      for (let i = 0; i < response.data.users.length; i++) {
        agentList.value.push({
          id: response.data.users[i].id,
          name: response.data.users[i].name,
        });
        agentDropdown.value.push(response.data.users[i].name);
      }
    });
};

const getComments = () => {
  axiosInstance
    .get(`/tickets/${props.ticketData.id}/comments`, {})
    .then((response: any) => {
      comments.value = response.data.comments;
    });
};

const messageHighlights = (item) => {
  if (item.author_id === currentUserID.value) {
    return 'bg-primary-light text-white';
  }

  return 'bg-gray-400';
};
const eventsModal = ref(false)
const showEventsModal = () => {
  eventsModal.value = !eventsModal.value
}
const showMacroModal = () => {
  macroModalVisibility.value = !macroModalVisibility.value;
};

const selectedMacro = computed(() => {
  return macros.value.find((m) => {
    return m.id === selectedMacroId.value;
  });
});

const executeMacro = (macro) => {
  showMacroModal();
  ticketReply.value = macro.template
}

const formatKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

const userStats = [
  {
    org: null,
    roles: null,
    ccAge: null,
    lastActive: null,
    timezone: null,
    email: null,
    phone: null,
    totalTickets: null,
    os: null,
    browser: null,
  },
];

const submittedFrom = computed(() => {
  const _separator = 'Submitted from:';
  const parsed = props.ticketData.description.split(_separator)[1]?.trim();
  return parsed || '';
});
const formatDateString = (date: string, format: string) => {
  return moment(date).format(format);
};

const formatTicketTime = (date: string) => {
  return moment(date).fromNow();
};

const ccUser = ref();
async function getCCUser() {
  // 16781124470797 == ccid
  // 360042012811 = cc email
  try {
    const _userId =
      props.ticketData.custom_fields.find(
        (field) => field.id === 360_042_012_811,
      )?.value || null;
    if (_userId !== null) {
      const _response = await User.api().get(`/users?id__in=${_userId}`, {
        dataKey: 'results',
      });
      ccUser.value = _response.entities.users[0];

      userStats[0] = {
        org: ccUser.value.organization?.name ?? '',
        roles: ccUser.value.roles ?? [],
        email: ccUser.value.email ?? '',
        phone: ccUser.value.mobile ?? '',
        ccAge: formatDateString(ccUser.value.accepted_terms_timestamp, 'MM/DD/YYYY, h:mm:ss A'),
        os: `${ccUser.value.states.userAgent?.os?.name} ${ccUser.value.states.userAgent?.os?.version}` ?? '',
        browser: `${ccUser.value.states.userAgent?.browser?.name} ${ccUser.value.states.userAgent?.browser?.version}` ?? '',
      };

    }
  } catch (error) {
    console.log(error);
  }
}


// async function loginAs(userId: string) {
//   console.log('waiting on merged user data to get user id')
//   const response = await axios.post(
//     `${import.meta.env.VITE_APP_API_BASE_URL}/admins/users/login_as`,
//     {
//       user: userId,
//     },
//   );
//   store.commit('auth/setUser', response.data);
//   window.location.replace('/');
// }


const isUserType = computed(() => {
  const _usertypes = [
    { name: 'User', color: '#3498DB' },
    { name: 'Ghost', color: '#F39C12' },
    { name: 'Survivor', color: '#27AE60' },
  ];

  return _usertypes.map((type) => ({
    name: type.name,
    color: type.color,
  }));
});

onMounted(() => {
  isLoading.value = true;
  if (props.users) {
    processedUsers();
  } else {
    console.log('users prop is not ready');
  }

  getCurrentLoggedInUser();
  getCCUser();
  getComments();
  // getAgentList();
  isLoading.value = false;
});
</script>

<template>
  <div class="ticket__container">
    <div class="cc__user-info">
      <div class="cc_user">
        <img
          alt="picture of user"
          :src="ccUser?.profilePictureUrl || 'https://picsum.photos/200'"
          class="w-full"
        />
        <BaseText>{{
          ccUser
            ? ccUser.full_name
            : userMapFunction(ticketData.requester_id) || ticketData.name
        }}</BaseText>
      </div>
      <div
        v-for="type in isUserType"
        :key="type.name"
        :style="`border-color: ${type.color}; color: ${type.color}`"
        class="user-type border rounded-md text-center p-2 mx-4 my-2 text-xl"
      >
        {{ type.name }}
      </div>
      <hr class="border-gray-400" />

      <div class="flex items-center justify-center">
        <BaseButton
          :action="() => loginAs()"
          text="Login As"
          variant="primary"
          class="p-2 mx-4 my-4 text-xl rounded-md w-full"
        />
      </div>
      <hr class="border-gray-400" />
      <div
        v-for="stats in userStats"
        :key="stats.org"
        class="info flex flex-col m-4"
      >
        <BaseText v-for="(value, key) in stats" :key="key">
          <template v-if="!value" #default><span></span></template>
          <template v-else #default>
            <span class="font-bold text-xl">{{ formatKey(key) }}: </span>
            <span class="text-lg">{{ value }}</span>
          </template>
        </BaseText>
      </div>
      <hr class="border-gray-400" />
      <div class="events m-2 text-xs border p-2 flex flex-col gap-2">
        <BaseText class="text-center">Recent Events:</BaseText>
        <div>
          <span class="underline text-primary-light">D W</span> from Crisis
          Cleanup User <span class="font-bold">Has Loggin In</span>
        </div>
        <div>
          <span class="underline text-primary-light">D W</span> from Crisis
          Cleanup User
          <span class="font-bold">Create Case W774 in Hurricane Nicole</span>
        </div>
        <BaseButton :action="()=> showEventsModal()" text="More Events" variant="primary" class="p-1 rounded-md"/>
      </div>
      <modal
        v-if="eventsModal"
        closeable
        title="Events"
        class="p-10"
        @close="showEventsModal()"
      >
        <template #default>
          <BaseInput type="search" />
          Plan to add all events related to user here
        </template>
      </modal>
    </div>
    <div class="col-span-12 md:col-span-9">
      <div class="ticket__header">
        <div class="submitter-info">
          <BaseText>
            {{ userMapFunction(ticketData.requester_id) || ticketData.name }}
          </BaseText>
          <hr />
          <BaseText>
            {{
              userEmailMapFunction(ticketData.requester_id) || ticketData.email
            }}
          </BaseText>
        </div>
        <BaseButton
          action=""
          class="border border-black rounded-md font-bold"
          text="Create Github Issue"
        />
        <div class="ticket-link">
          <a
            :href="`https://crisiscleanup.zendesk.com/agent/tickets/${ticketData.id}`"
            target="_blank"
          >
            Zendesk</a
          >
        </div>
        <div :class="[ticketData.status + '-tag', 'ticket-status text-xl']">
          {{ capitalizeFirstLetter(ticketData.status) }}
        </div>
      </div>

      <div class="subject-date__container">
        <BaseText class="">
          <span class="text-base font-bold">Created:</span>
          {{ formatTicketTime(ticketData.created_at) }}</BaseText
        >
        <hr />
        <BaseText>
          <span class="text-base font-bold"> Submitted From: </span>
          {{ submittedFrom }}</BaseText
        >
        <hr />
        <BaseText>
          <span class="text-base font-bold"> Subject: </span>
          {{
            expanded ? ticketData?.description : ticketData?.raw_subject
          }}</BaseText
        >
        <BaseText
          class="m-2 text-primary-light"
          @click="() => (expanded = !expanded)"
        >
          {{ expanded ? 'Less' : 'More' }}
        </BaseText>
      </div>

      <div class="comments__container">
        <BaseText class="comments__header">Comments</BaseText>
        <div
          v-for="(item, comment_idx) in comments"
          :key="comment_idx"
          class="comments__items"
          :class="messageHighlights(item)"
        >
          <BaseText class="text-3xl font-bold"
            >{{ userMapFunction(item.author_id) || ticketData.name }}
          </BaseText>
          <br />
          <BaseText>{{ item.body }}</BaseText>

          <div v-if="item.attachments[0]" class="attachments-container">
            <span class="attachments__header">Attachments</span>
            <div class="attachments__items">
              <div
                v-for="(attachment, attachment_idx) in item.attachments"
                :key="attachment_idx"
                class="flex flex-col items-center justify-center border"
              >
                <a :href="attachment.content_url" target="_blank">
                  <img :src="attachment.content_url" class="w-14 h-14" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ticket-reply">
        <div class="grid grid-cols-12 grid-rows-4">
          <BaseInput
            v-model="ticketReply"
            text-area
            class="w-full h-full col-span-11 row-span-4"
            rows="6"
            placeholder="Ticket Reply"
          />
          <div class="row-span-4 flex justify-center items-center">
            <BaseButton
              class="rounded-md mx-2 py-4 "
              :action="showMacroModal"
              text="Apply Macro"
              variant="primary"
            />
          </div>

        </div>

<!--        <BaseSelect-->
<!--          class="my-2"-->
<!--          select-classes="w-full absolute inset-0 outline-none focus:ring-0 appearance-none border-0 text-base font-sans bg-white rounded py-2"-->
<!--          placeholder="Apply Macro"-->
<!--          :options="macros"-->
<!--          :model-value="selectedMacroId"-->
<!--          item-key="id"-->
<!--          label="name"-->
<!--          @update:model-value="(v) => (selectedMacroId = v)"-->
<!--        />-->
        <modal
          v-if="macroModalVisibility"
          closeable
          title="Macros"
          class="p-10"
          @close="showMacroModal()"
        >
          <template #default>
            <Table
              :columns="macroColumns"
              :data="macros"
              @row-click="(v) => executeMacro(v)"
            />
          </template>
        </modal>
      </div>

      <div class="assigned-to__container">
        <div class="header">
          <!--        <img src="" class="w-10 h-10 rounded-md" />-->
          <BaseText
            variant="h1"
            >Assigned To:
            <span class="font-bold text-xl">{{
              assignedTo
              }}</span></BaseText
          >
        </div>
        <BaseSelect
          :model-value="selectedAgent"
          select-classes="w-full absolute inset-0 outline-none focus:ring-0 appearance-none border-0 text-base font-sans bg-white rounded py-2"
          class="agent-selection"
          label="name"
          placeholder="Select Agent"
          item-key="id"
          :options="agents"
          @update:model-value="(v) => (selectedAgent = v)"

        />

        <BaseButton
          variant="primary"
          text="Assign"
          class="reassign-button"
          :action="() => reAssignTicket"
        />
      </div>

      <div class="reply-as">
        <BaseText class="reply-as__header">Reply As:</BaseText>
        <div class="buttons__container">
          <template
            v-for="status in ['open', 'pending', 'solved']"
            :key="status"
          >
            <BaseButton
              size="md"
              :text="status.charAt(0).toUpperCase() + status.slice(1)"
              :class="[status, 'w-1/3 rounded-md text-xl']"
              :action="() => replyToTicket(status)"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket__container {
  @apply rounded-lg bg-white border border-gray-600 m-4 text-sm shadow-md grid grid-cols-12 ;

  .cc__user-info {
    @apply col-span-12 md:col-span-3  border-r-2 border-gray-400 overflow-y-auto min-h-full  h-64 md:h-24;
    .cc_user {
      @apply border rounded-md m-4 text-center;
    }
  }

  .ticket__header {
    @apply grid grid-cols-4 px-4 py-2 row-span-2 flex gap-2 border-b-2 border-gray-400;
    .submitter-info {
      @apply col-span-1 text-left;
    }
    .ticket-link {
      @apply text-center flex items-center rounded-md justify-center bg-primary-light;
    }
    .ticket-status {
      @apply text-center flex items-center rounded-md justify-center font-bold;
    }
  }

  .subject-date__container {
    @apply px-4 py-2 text-left row-span-2  border-b-2 border-gray-400;
  }
  .comments__container {
    @apply text-left px-4 py-2 overflow-y-scroll row-span-4 h-80;
    .comments__header {
      @apply text-base font-bold;
    }
    .comments__items {
      @apply rounded-lg p-2 m-4;

      .attachments-container {
        @apply my-4 border-t-4;
        .attachments__header {
          @apply font-bold text-black;
        }
        .attachments__items {
          @apply flex gap-4 my-4;
        }
      }
    }
  }

  .ticket-reply {
    @apply px-4 py-2 border-y-2 border-gray-400;
  }
  .assigned-to__container {
    @apply grid grid-cols-12 px-4 py-2 row-span-2 border-b-2 border-gray-400 flex items-center justify-center;
    .header {
      @apply flex gap-2 items-center justify-center md:col-span-12 my-2;
    }
    .agent-selection {
      @apply md:col-span-11 my-2;
    }
    .reassign-button {
      @apply md:col-span-1 p-4 rounded-md mx-2 my-2;
    }
  }

  .reply-as {
    .reply-as__header {
      @apply text-base font-bold;
    }
    @apply flex flex-col gap-2 px-4 py-2 col-span-6 row-span-2;
    .buttons__container {
      @apply flex gap-2;
    }
  }
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
}

.open-tag {
  color: #0042ed;
}

.solved-tag {
  color: #f21b1b;
}

.pending-tag {
  color: #6b6b6b;
}


::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  @apply bg-primary-light;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #ffb249;
}
</style>
