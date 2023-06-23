<script lang="ts" setup>
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import _ from 'lodash';
import { useStore } from 'vuex';
import moment from 'moment';
import Table from '../Table.vue';
import LanguageTag from '../tags/LanguageTag.vue';
import Modal from '@/components/Modal.vue';
import BaseText from '@/components/BaseText.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseSelect from '@/components/BaseSelect.vue';
import UserRolesSelect from '@/components/UserRolesSelect.vue';
import AdminEventStream from '@/components/admin/AdminEventStream.vue';
import JsonWrapper from '@/components/JsonWrapper.vue';
import Language from '@/models/Language';
import { momentFromNow, capitalize } from '@/filters';

const store = useStore();
const props = defineProps({
  ticketData: {
    type: Object,
    default: () => null,
  },
  agents: {
    type: Array,
    default: () => [],
  },
  currentUser: {
    type: Object,
    default: () => null,
  },
});

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_BASE_URL}/zendesk`,
});
const router = useRouter();

const languages = Language.all();
const features = {
  userType: true,
  loginAs: true,
  ccUserInfo: true,
  events: true,
  githubIssue: true,
};
const extraInfo = ref(false);
const expanded = ref(false);
const currentUserID = ref('');
const isLoading = ref(false);
// const toast = useToast()
const comments = ref([]);
const ticketReply = ref('');
const selectedAgent = ref('');
const agentList = ref([]);
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
const eventsModal = ref(false);
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
    signInCount: null,
    // os: null,
    // browser: null,
  },
];
const ccUser = ref(props.ticketData.user.ccu_user);
const zendeskUser = ref(props.ticketData.user);

const ccUserEntries = computed(() => {
  return Object.entries(ccUser.value);
});
const profilePictureUrl = computed(() => {
  if (ccUser.value.files && ccUser.value.files.length > 0) {
    const profilePictures = ccUser.value.files.filter(
      (file) => file.file_type_t === 'fileTypes.user_profile_picture',
    );
    if (profilePictures.length > 0) {
      return profilePictures[0].small_thumbnail_url;
    }
  }

  return `https://avatars.dicebear.com/api/bottts/${ccUser.value.first_name}.svg`;
});
const submittedFrom = computed(() => {
  const _separator = 'Submitted from:';
  const parsed = props.ticketData.description.split(_separator)[1]?.trim();
  return parsed || '';
});
const assignedUser = computed(() => {
  return _.find(agentList.value, { id: props.ticketData?.assignee_id });
});
const ticketAssigneeName = computed(() => {
  return assignedUser.value ? assignedUser.value.name : 'None';
});

const createIssue = () => {
  const queryParams = new URLSearchParams({
    title: '',
    body: `
**Issue Description:**
This is the description of the issue.

**Steps to Reproduce:**
1. First step.
2. Second step.

**Expected Result:**
Describe the expected result here.

**Actual Result:**
Describe the actual result here.

**Additional Information:**
- Environment:
- Version:
- Ticket Submitted From: **${submittedFrom.value}**
- Zendesk Username: **${zendeskUser.value.name}**
- Crisis Cleanup Username: **${
      ccUser.value.first_name + ' ' + ccUser.value.last_name
    }**
- Organization: **${ccUser.value.organization?.name}**
- Email: **${ccUser.value.email}**
- Phone: **${ccUser.value.mobile}**
- CC Age: **${momentFromNow(ccUser.value.accepted_terms_timestamp)}**
`,
    // Add additional parameters as needed
  });

  const repo = 'crisiscleanup-4-web';
  const url = `https://github.com/CrisisCleanup/${repo}/issues/new?${queryParams.toString()}`;

  // Perform any other actions or navigate to the URL
  window.open(url, '_blank');
};

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
    .then((response: AxiosResponse<unknown>) => {
      if (response.status === 200) {
        // toast.success(
        // 	`Reply Successfull, Ticket Status Changed to ${replyStatus}`
        // )
      }

      router.go();
    })
    .catch((error: Error) => {
      // toast.error('Reply unsuccessful', e)
      console.log(error);
    });
};

const reAssignTicket = () => {
  axiosInstance
    .put(`/tickets/${props.ticketData.id}`, {
      ticket: {
        assignee_id: _.find(agentList.value, { name: selectedAgent.value }).id,
      },
    })
    .then((response: AxiosResponse<unknown>) => {
      if (response.status === 200) {
        // toast.success('Successfully reassigned')
        setTimeout(() => {
          router.go(); // Reload the page after a delay
        }, 2000); // Timeout to account for zendesk db update
      }
    })
    .catch((error: Error) => {
      // toast.error('Reply unsuccessful', e)
      console.log(error);
    });
};

const getAgentIdForCurrentUser = () => {
  currentUserID.value = props.agents.some(
    (agent) => agent.name === props.currentUser.full_name,
  )?.id;
};

// const getAgentList = () => {
//   axiosInstance
//     .get(`/users`, {
//       params: {
//         role: 'admin',
//       },
//     })
//     .then((response: any) => {
//       for (let i = 0; i < response.data.users.length; i++) {
//         agentList.value.push({
//           id: response.data.users[i].id,
//           name: response.data.users[i].name,
//         });
//         agentDropdown.value.push(response.data.users[i].name);
//       }
//     });
// };
const getComments = () => {
  axiosInstance
    .get(`/tickets/${props.ticketData.id}/comments`, {})
    .then((response: AxiosResponse<unknown>) => {
      comments.value = response.data.comments;
    });
};

const getCommentHighlights = (item) => {
  if (item.author_id === currentUserID.value) {
    return 'text-black border shadow-md';
  }

  if (
    props.agents.some(
      (agent) =>
        agent.id === item.author_id && agent.id !== currentUserID.value,
    )
  ) {
    return 'text-black border shadow-md'; // No specific class for the condition, returning an empty string
  }

  return 'bg-gray-300';
};

const showEventsModal = () => {
  eventsModal.value = !eventsModal.value;
};

const showMacroModal = () => {
  macroModalVisibility.value = !macroModalVisibility.value;
};

const executeMacro = (macro) => {
  showMacroModal();
  ticketReply.value = macro.template;
};

const formatKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

async function loginAs(userId: string) {
  const response = await axios.post(
    `${import.meta.env.VITE_APP_API_BASE_URL}/admins/users/login_as`,
    {
      user: userId,
    },
  );
  store.commit('auth/setUser', response.data);
  window.location.replace('/');
}

async function getCcuStats() {
  // 16781124470797 == ccid form field
  if (ccUser.value) {
    userStats[0] = {
      org: ccUser.value.organization?.name ?? '',
      email: ccUser.value.email ?? '',
      phone: ccUser.value.mobile ?? '',
      ccAge: momentFromNow(ccUser.value.accepted_terms_timestamp),
      signInCount: ccUser.value.sign_in_count,
      lastActive: momentFromNow(ccUser.value.last_sign_in_at),
      // os: `${ccUser.value.states.userAgent?.os?.name} ${ccUser.value.states.userAgent?.os?.version}`,
      // browser: `${ccUser.value.states.userAgent?.browser?.name} ${ccUser.value.states.userAgent?.browser?.version}`,
    };
  } else
    console.log('Error Loading CCuser or CCuser doesnt exist for this user');
}

const removeSubmittedFromFooter = (body) => {
  const delimiter = '------------------';
  const parts = body.split(delimiter);
  return parts[0].trim();
};

const getAgentById = (id: number) => {
  const _agentMap = props.agents
    .map((u) => ({ [u.id]: u.name }))
    .reduce((prev, current) => ({ ...prev, ...current }), {});

  return _agentMap[id];
};

const isUserType = computed(() => {
  const _userTypes = [
    { name: 'User', color: '#3498DB' },
    { name: 'Ghost', color: '#F39C12' },
    { name: 'Survivor', color: '#27AE60' },
  ];

  return _userTypes.map((type) => ({
    name: type.name,
    color: type.color,
  }));
});

onMounted(() => {
  isLoading.value = true;
  getAgentIdForCurrentUser();
  getCcuStats();
  getComments();
  // getAgentList();
  isLoading.value = false;
});
</script>

<template>
  <div class="ticket__container" :class="ccUser ? 'grid-cols-12' : ''">
    <div v-if="ccUser" class="cc__user-info">
      <div class="cc_user">
        <img alt="~~picture of user" :src="profilePictureUrl" class="w-full" />
        <BaseText>{{ ccUser.first_name + ' ' + ccUser.last_name }}</BaseText>
      </div>
      <div v-if="features.userType">
        <!--        <div-->
        <!--          v-for="type in isUserType"-->
        <!--          :key="type.name"-->
        <!--          :style="`border-color: ${type.color}; color: ${type.color}`"-->
        <!--          class="user-type border rounded-md text-center p-2 mx-4 my-2 text-xl"-->
        <!--        >-->
        <!--          {{ type.name }}-->
        <!--        </div>-->
        <div
          v-if="ccUser"
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
      </div>
      <div
        v-if="features.loginAs"
        class="flex items-center justify-center border-y-2 border-gray-400"
      >
        <BaseButton
          :action="() => loginAs(props.ticketData.user.ccu_user?.id)"
          text="Login As"
          variant="primary"
          class="p-2 mx-4 my-4 text-xl rounded-md w-full"
        />
      </div>
      <div v-if="features.ccUserInfo">
        <div
          v-for="stats in userStats"
          :key="stats.org"
          class="info flex flex-col mx-4 my-2"
        >
          <BaseText v-for="(value, key) in stats" :key="key">
            <template v-if="!value" #default><span></span></template>
            <template v-else #default>
              <span class="font-bold text-xl">{{ formatKey(key) }}: </span>
              <span class="text-lg">{{ value }}</span>
            </template>
          </BaseText>
        </div>
        <div class="flex flex-col px-4 py-2">
          <span class="font-bold text-xl">Languages: </span>
          <div
            v-for="l in languages.filter(
              (item) =>
                item.id === ccUser.primary_language ||
                item.id === ccUser.secondary_language,
            )"
            :key="`l_${l}`"
            class="flex flex-col tag-container"
          >
            <LanguageTag class="tag-item p-2 mx-0.5" :language-id="l.id" />
          </div>
        </div>

        <div class="flex flex-col px-4">
          <span class="font-bold text-xl">Roles: </span>
          <UserRolesSelect
            v-if="ccUser.roles"
            style="pointer-events: none"
            class="w-full flex-grow border border-crisiscleanup-dark-100"
            data-testid="testUserRolesSelect"
            :user="ccUser"
          />
        </div>
        <div class="flex items-center justify-center">
          <BaseButton
            :action="() => (extraInfo = !extraInfo)"
            variant="primary"
            text="Extra Info"
            class="p-2 mx-4 my-3 text-xl rounded-md w-full"
          />
        </div>
        <div v-if="extraInfo">
          <JsonWrapper :json-data="ccUser" />
        </div>
      </div>

      <div
        v-if="features.events"
        class="events m-2 text-xs border p-2 flex flex-col gap-2"
      >
        <AdminEventStream :user="ccUser.id" limit="5" class="overflow-auto" />
        <div class="flex items-center justify-center">
          <BaseButton
            :action="() => showEventsModal()"
            text="More Events"
            variant="primary"
            class="p-2 mx-4 my-4 text-xl rounded-md w-full"
          />
        </div>
      </div>
      <modal
        v-if="eventsModal"
        closeable
        title="Events"
        class="p-10"
        @close="showEventsModal()"
      >
        <template #default>
          <div class="p-4">
            <AdminEventStream :user="ccUser.id" />
          </div>
        </template>
      </modal>
    </div>
    <div class="col-span-12 md:col-span-9">
      <div class="ticket__header">
        <div class="submitter-info">
          <BaseText>
            {{ zendeskUser.name }}
          </BaseText>
          <hr />
          <BaseText>
            {{ zendeskUser.email }}
          </BaseText>
        </div>
        <base-link
          v-if="features.githubIssue"
          :href="url"
          class="border border-black rounded-md font-bold text-center flex justify-center items-center"
          target="_blank"
          text-variant="h2"
          @click="createIssue()"
        >
          Create GitHub Issue</base-link
        >
        <span v-else></span>
        <div class="ticket-link">
          <a
            :href="`https://crisiscleanup.zendesk.com/agent/tickets/${ticketData.id}`"
            target="_blank"
          >
            Zendesk</a
          >
        </div>
        <div :class="[ticketData.status + '-tag', 'ticket-status text-xl']">
          {{ capitalize(ticketData.status) }}
        </div>
      </div>

      <div class="subject-date__container">
        <BaseText>
          <span class="text-base font-bold">Created:</span>
          {{ momentFromNow(ticketData.created_at) }}</BaseText
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
            expanded
              ? removeSubmittedFromFooter(ticketData?.description)
              : ticketData?.raw_subject
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
          v-for="(comment, comment_idx) in comments"
          :key="comment_idx"
          class="comments__items"
          :class="getCommentHighlights(comment)"
        >
          <BaseText class="text-3xl font-bold">
            {{ getAgentById(comment.author_id) ?? zendeskUser.name }}
          </BaseText>
          <br />
          <BaseText>{{ removeSubmittedFromFooter(comment.body) }}</BaseText>

          <div v-if="comment.attachments[0]" class="attachments-container">
            <span class="attachments__header">Attachments</span>
            <div class="attachments__items">
              <div
                v-for="(attachment, attachment_idx) in comment.attachments"
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
              class="rounded-md mx-2 py-4 p-2"
              :action="showMacroModal"
              text="Apply Macro"
              variant="primary"
            />
          </div>
        </div>
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
          <BaseText variant="h1"
            >Assigned To:
            <span class="font-bold text-xl">{{
              ticketAssigneeName
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
  @apply rounded-lg bg-white border border-gray-600 m-4 text-sm shadow-md grid;

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
