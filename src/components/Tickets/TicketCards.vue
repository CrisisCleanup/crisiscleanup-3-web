<script lang="ts" setup>
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import _ from 'lodash';
import { useStore } from 'vuex';
import { ref, Teleport } from 'vue';
import { useToast } from 'vue-toastification';
import { useMq } from 'vue3-mq';
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
import useEmitter from '@/hooks/useEmitter';
import { getErrorMessage } from '@/utils/errors';

const mq = useMq();

const commentsContainer = ref<HTMLDivElement | null>(null);
const { emitter } = useEmitter();
const { t } = useI18n();
const toast = useToast();

export interface TicketCardsProps {
  ticketData?: Record<string, any>;
  agents: Record<string, any>[];
  currentUser?: Record<string, any>;
}

interface Thumbnail {
  content_type: string;
  content_url: string;
  file_name: string;
  id: number;
  size: number;
}

interface Comment {
  attachments: {
    content_type: string;
    content_url: string;
    file_name: string;
    id: number;
    size: number;
    thumbnails: {
      [key: string]: Thumbnail;
    }[];
  }[];
  author_id: number;
  body: string;
  created_at: string;
  id: number;
  metadata: {
    system: {
      client: string;
      ip_address: string;
      latitude: number;
      location: string;
      longitude: number;
    };
    via: {
      channel: string;
      source: {
        from: unknown;
        rel: string;
        to: unknown;
      };
    };
  };
  public: boolean;
  type: string;
}

const StatusEnum = {
  NEW: 'new',
  OPEN: 'open',
  PENDING: 'pending',
  SOLVED: 'solved',
};
const store = useStore();
const props = withDefaults(defineProps<TicketCardsProps>(), {
  ticketData: undefined,
  agents: () => [],
  currentUser: undefined,
});
const ticketTestData = toRef(props, 'ticketData');
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_BASE_URL}/zendesk`,
});
const languages = Language.all();
const extraInfo = ref<boolean>(false);
const expanded = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const currentUserID = ref<number>();
const comments = ref<Comment[]>([]);
const firstComment = ref();
const ticketReply = ref<string>('');
const selectedAgent = ref<string>('');
const workSiteColumns = [
  {
    key: 'id',
    title: 'Worksite ID',
    sortable: true,
    searchable: false,
    width: '20%',
  },
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    searchable: false,
    width: '20%',
  },
  {
    key: 'incident',
    title: 'Incident',
    sortable: true,
    searchable: false,
    width: '60%',
  },
];
const macroColumns = [
  {
    key: 'title',
    title: 'Name',
    sortable: true,
    searchable: false,
    width: '20%',
  },
  {
    key: 'description',
    title: 'Description',
    sortable: true,
    searchable: false,
    width: '20%',
  },
  {
    key: 'template',
    title: 'Template',
    sortable: true,
    searchable: false,
    width: '60%',
  },
  // {
  //   key: 'actions',
  //   title: 'Actions',
  //   sortable: true,
  //   searchable: false,
  //   width: '1fr',
  // },
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

// const ccUserEntries = computed(() => {
//   return Object.entries(ccUser.value);
// });
const profilePictureUrl = computed(() => {
  if (ccUser.value.files && ccUser.value.files.length > 0) {
    const profilePictures = ccUser.value.files.filter(
      (file: Record<string, unknown>) =>
        file.file_type_t === 'fileTypes.user_profile_picture',
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
  return _.find(props.agents, { id: props.ticketData?.assignee_id }) as Record<
    string,
    any
  >;
});
const ticketAssigneeName = computed(() => {
  return assignedUser.value ? assignedUser.value.name : 'None';
});

const createIssue = () => {
  getAllPictures();

  const formattedComments = comments.value
    .map(
      (comment) =>
        `**Comment ${
          getAgentById(comment.author_id) ?? zendeskUser.value.name
        }:**\n\n${removeSubmittedFromFooter(comment.body)}`,
    )
    .join('\n\n---\n\n');

  const queryParams = new URLSearchParams({ title: '', body: '' });
  if (ccUser.value) {
    queryParams.set(
      'body',
      `



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

**Pictures:**
${attachmentsArray.value.join('\n')}

**Comments:**
\`\`\`
  ${formattedComments}
\`\`\`
`,
    );
  } else {
    queryParams.set(
      'body',
      `


**Additional Information:**
- Environment:
- Version:
- Ticket Submitted From: **${submittedFrom.value}**
- Zendesk Username: **${zendeskUser.value.name}**

**Pictures:**
${attachmentsArray.value.join('\n')}

**Comments:**
\`\`\`
  ${formattedComments}
\`\`\`
`,
    );
  }

  const url = `https://github.com/CrisisCleanup/${
    selectedRepo.value
  }/issues/new?${queryParams.toString()}`;

  // Perform any other actions or navigate to the URL
  window.open(url, '_blank');
};

const fetchActiveTicket = () => {
  axiosInstance
    .get(`/tickets/${ticketTestData.value.id}`, {})
    .then((response) => {
      ticketTestData.value.status = response.data.ticket.status;
      ticketTestData.value.assignee_id = response.data.ticket.assignee_id;
    })
    .catch((error: Error) => {
      console.error('Error fetching tickets:', error);
    });
};

const replyToTicket = (replyStatus: string) => {
  if (replyStatus === StatusEnum.SOLVED && !assignedUser.value) {
    axiosInstance
      .put(`/tickets/${props.ticketData.id}`, {
        ticket: {
          assignee_id: currentUserID.value!,
        },
      })
      .then((response: AxiosResponse<unknown>) => {
        if (response.status === 200) {
          toast.success(t('helpdesk.reassign_success'));
          setTimeout(() => {
            fetchActiveTicket();
          }, 1000); // Timeout to account for zendesk db update
        }

        selectedAgent.value = '';
      })
      .catch((error: Error) => {
        toast.error(t('helpdesk.reassign_failure')` ${getErrorMessage(error)}`);
      })
      .then(() => {
        // Ticket has been successfully reassigned, now proceed with the ticket reply
        return axiosInstance.put(`/tickets/${props.ticketData.id}`, {
          ticket: {
            status: replyStatus,
            comment: {
              body: ticketReply.value,
              author_id: currentUserID.value,
            },
          },
        });
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success(t('helpdesk.reply_success'));
          emitter.emit('closeTicketModal');
        }
      })
      .then(() => {
        emitter.emit('reFetchActiveTicket');
      })
      .catch((error: Error) => {
        toast.error(
          t('helpdesk.reply_unsuccessful')` ${getErrorMessage(error)}`,
        );
      });
  } else
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
      .then((response) => {
        if (response.status === 200) {
          toast.success(t('helpdesk.reply_success'));
        }

        if (replyStatus === StatusEnum.OPEN) {
          getComments();
        } else {
          emitter.emit('closeTicketModal');
        }

        if (props.ticketData?.assignee_id) {
          fetchActiveTicket();
          ticketReply.value = '';
        } else {
          reAssignTicket(currentUserID.value!);
        }
      })
      .then(() => {
        emitter.emit('reFetchActiveTicket');
      })
      .catch((error: Error) => {
        toast.error(
          t('helpdesk.reply_unsuccessful')` ${getErrorMessage(error)}`,
        );
      });
};

const deleteTicket = () => {
  toast.info('helpdesk.coming_soon');
  // axiosInstance
  //   .delete(`/tickets/${props.ticketData.id}.json`).then((response: AxiosResponse<unknown>) => {
  //   if (response.status === 200) {
  // toast.success(
  // 	t('helpdesk.sucessfully_deleted')` ${replyStatus}`
  // )
  // }

  // emitter.emit('closeTicketModal');
  // })
  //   .catch((error: Error) => {
  // toast.error(t('helpdesk.delete_unsucessful')` ${getErrorMessage(e)}`)
  // console.log(error);
  // });
};

const reAssignTicket = (agentId?: number) => {
  const _assigneeId = agentId || selectedAgent.value;

  axiosInstance
    .put(`/tickets/${props.ticketData.id}`, {
      ticket: {
        assignee_id: _assigneeId,
      },
    })
    .then((response: AxiosResponse<unknown>) => {
      if (response.status === 200) {
        toast.success(t('helpdesk.reassign_success'));
        setTimeout(() => {
          fetchActiveTicket();
        }, 1000); // Timeout to account for zendesk db update
      }

      selectedAgent.value = '';
    })
    .catch((error: Error) => {
      toast.error(t('helpdesk.reassign_failure')` ${getErrorMessage(error)}`);
    });
};

const getAgentIdForCurrentUser = () => {
  const agent = props.agents.find(
    (agent) => agent.name === props.currentUser.full_name,
  );
  const generalAgent = props.agents.find(
    (agent) => agent.name === 'Crisis Cleanup Helpdesk',
  );
  currentUserID.value = agent ? agent.id : generalAgent.id;
};

const getComments = () => {
  axiosInstance
    .get(`/tickets/${props.ticketData.id}/comments`, {})
    .then((response: AxiosResponse<unknown>) => {
      comments.value = response.data.comments;
      firstComment.value = comments.value[0];
    })
    .then(() => {
      commentsContainer.value.scrollTop = commentsContainer.value.scrollHeight;
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
  let appendedReply = ticketReply.value + '\n' + macro.template;

  for (const [zendeskVariable, myVariable] of Object.entries(
    zendeskVariables,
  )) {
    appendedReply = appendedReply.replace(zendeskVariable, myVariable);
  }

  ticketReply.value = appendedReply;

  toast.success(t('helpdesk.macro_success')` ${macro.title}`);
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
    ?.map((u) => ({ [u.id]: u.name }))
    .reduce((prev, current) => ({ ...prev, ...current }), {});

  return _agentMap[id];
};

const onMacroSearch = computed(() => {
  const lowerCasedSearchValue = macroSearch.value.toLowerCase().trim();

  // If there is no search term, return the original mappedMacros.value without filtering
  if (!lowerCasedSearchValue) {
    return mappedMacros.value;
  }

  return mappedMacros.value.filter((macro) => {
    const macroTitleLower = macro.title ? macro.title.toLowerCase() : '';
    const macroDescriptionLower = macro.description
      ? macro.description.toLowerCase()
      : '';
    const macroTemplateLower =
      typeof macro.template === 'string' ? macro.template.toLowerCase() : '';

    return (
      macroTitleLower.includes(lowerCasedSearchValue) ||
      macroDescriptionLower.includes(lowerCasedSearchValue) ||
      macroTemplateLower.includes(lowerCasedSearchValue)
    );
  });
});

const mappedMacros = ref([]);

const getMacros = () => {
  axiosInstance
    .get<Record<string, any>>(`/macros`, {})
    .then((response: AxiosResponse<unknown>) => {
      const mappedData = response.data?.macros.map((macro) => {
        const templateAction = macro.actions.find(
          (action: Record<string, any>) => action.field === 'comment_value',
        );
        const templateValue = templateAction?.value ?? '';
        return {
          title: macro.title,
          description: macro.description,
          template: templateValue,
        };
      });
      mappedMacros.value = mappedData;
    });
};

const zendeskVariables = {
  '{{current_user.details}}': 'unknownCurrentUserDetails',
  '{{current_user.email}}': props.currentUser?.email,
  '{{current_user.external_id}}': props.currentUser?.id,
  '{{current_user.first_name}}': props.currentUser?.first_name,
  '{{current_user.language}}': props.currentUser?.primary_language,
  '{{current_user.name}}': props.currentUser?.full_name,
  '{{current_user.notes}}': 'unknownCurrentUserNotes',
  '{{current_user.organization.details}}':
    'unknownCurrentUserOrganizationDetails',
  '{{current_user.organization.name}}': props.currentUser?.organization?.name,
  '{{current_user.organization.notes}}': 'unknownCurrentUserOrganizationNotes',
  '{{current_user.phone}}': props.currentUser?.mobile,
  '{{satisfaction.current_comment}}': 'unknownSatisfactionCurrentComment',
  '{{satisfaction.current_rating}}': 'unknownSatisfactionCurrentRating',
  '{{ticket.account}}': 'unknownTicketAccount',
  '{{ticket.assignee.email}}': 'unknownTicketAssigneeEmail',
  '{{ticket.assignee.first_name}}': 'unknownTicketAssigneeFirstName',
  '{{ticket.assignee.last_name}}': 'unknownTicketAssigneeLastName',
  '{{ticket.assignee.name}}': 'unknownTicketAssigneeName',
  '{{ticket.brand.name}}': 'unknownTicketBrandName',
  '{{ticket.cc_names}}': 'unknownTicketCCNames',
  '{{ticket.ccs}}': 'unknownTicketCCs',
  '{{ticket.current_holiday_name}}': 'unknownTicketCurrentHolidayName',
  '{{ticket.description}}': 'unknownTicketDescription',
  '{{ticket.due_date}}': 'unknownTicketDueDate',
  '{{ticket.external_id}}': 'unknownTicketExternalId',
  '{{ticket.latest_comment_html}}': 'unknownTicketLatestCommentHTML',
  '{{ticket.latest_public_comment_html}}':
    'unknownTicketLatestPublicCommentHTML',
  '{{ticket.organization.details}}': 'unknownTicketOrganizationDetails',
  '{{ticket.organization.external_id}}': 'unknownTicketOrganizationExternalId',
  '{{ticket.organization.name}}': 'unknownTicketOrganizationName',
  '{{ticket.organization.notes}}': 'unknownTicketOrganizationNotes',
  '{{ticket.priority}}': 'unknownTicketPriority',
  '{{ticket.requester.details}}': 'unknownTicketRequesterDetails',
  '{{ticket.requester.email}}': zendeskUser.value.email,
  '{{ticket.requester.external_id}}': 'unknownTicketRequesterExternalId',
  '{{ticket.requester.first_name}}': zendeskUser.value.name.split(' ')[0],
  '{{ticket.requester.language}}': 'unknownTicketRequesterLanguage',
  '{{ticket.requester.last_name}}': zendeskUser.value.name.split(' ')[1],
  '{{ticket.requester.name}}': zendeskUser.value.name,
  '{{ticket.requester.phone}}': zendeskUser.value.phone,
  '{{ticket.requester_field}}': 'unknownTicketRequesterField',
  '{{ticket.status}}': props.ticketData?.status,
  '{{ticket.tags}}': 'unknownTicketTags',
  '{{ticket.ticket_field_ID}}': 'unknownTicketFieldID',
  '{{ticket.ticket_field_option_title_ID}}': 'unknownTicketFieldOptionTitleID',
  '{{ticket.ticket_type}}': props.ticketData?.type,
  '{{ticket.title}}': props.ticketData?.subject,
  '{{ticket.url}}': props.ticketData?.url,
  // Add more Zendesk variables as needed
};
const ghostUser = ref([]);

async function getGhostUser() {
  const response = await axios.get(
    `${import.meta.env.VITE_APP_API_BASE_URL}/ghost_users?search=${
      zendeskUser.value.email
    }`,
  );
  ghostUser.value = response.data.results;
}

const worksites = ref([]);

async function getWorksiteForUser() {
  const response = await axios.get(
    `${import.meta.env.VITE_APP_API_BASE_URL}/worksites?search=${
      zendeskUser.value.email
    }`,
  );
  worksites.value = response.data.results;
}

const accountType = computed(() => {
  const _accountType = {
    ghostUser: ghostUser.value,
    ccUser: ccUser.value,
    worksite: worksites.value,
  };

  return _accountType;
});

const openWorkSitePage = (incidentId: number, worksiteId: number) => {
  const url = `https://crisiscleanup.org/incident/${incidentId}/work/${worksiteId}?showOnMap=true`;
  window.open(url, '_blank');
};

const worksiteModal = ref(false);
const showWorksiteModal = () => {
  worksiteModal.value = !worksiteModal.value;
};

const mobileExtraUserInfo = ref(false);
const showExtraUserInfoModal = () => {
  mobileExtraUserInfo.value = !mobileExtraUserInfo.value;
};

const crisisCleanupRepos = ref([
  'crisiscleanup-4-web',
  'crisiscleanup-android',
  'crisiscleanup-ios',
]);

const repoSelection = ref(false);

const showRepoSelection = () => {
  repoSelection.value = !repoSelection.value;
};

const selectedRepo = ref(crisisCleanupRepos.value[0]);

const attachmentsArray = ref([]);

const getAllPictures = () => {
  // Assuming comments.value is an array of comments, each with an attachments array
  attachmentsArray.value = _.flatMap(comments.value, (comment) =>
    comment.attachments.map((attachment) => attachment.content_url),
  );
};

const macroSearch = ref('');

onMounted(async () => {
  isLoading.value = true;
  getAgentIdForCurrentUser();
  await getCcuStats();
  getComments();
  getMacros();
  await getWorksiteForUser();
  await getGhostUser();
  isLoading.value = false;
});
</script>

<template>
  <div class="ticket__container">
    <!--    <Teleport to="#user-content">-->
    <div v-if="ccUser" class="cc__user-info">
      <div class="cc_user">
        <img
          :alt="t('helpdesk.user_picture')"
          :src="profilePictureUrl"
          class="w-full"
        />
        <BaseText>{{ ccUser.first_name + ' ' + ccUser.last_name }}</BaseText>
      </div>
      <div>
        <div v-if="accountType.ccUser" style="color: #3498db" class="user-type">
          {{ t('helpdesk.user_account') }}
        </div>

        <div
          v-if="accountType.worksite.length > 0"
          :style="`background-color: #27AE60; color: #ffffff`"
          class="user-type cursor-pointer"
          @click="showWorksiteModal"
        >
          {{ t('helpdesk.survivor_account') }}
        </div>
        <div
          v-if="accountType.ghostUser.length > 0"
          style="color: #f39c12"
          class="user-type"
        >
          {{ t('helpdesk.ghost_user') }}
        </div>
      </div>
      <div class="flex items-center justify-center border-y-2 border-gray-400">
        <BaseButton
          :action="() => loginAs(props.ticketData.user.ccu_user?.id)"
          :text="t('actions.login_as')"
          variant="primary"
          class="p-2 mx-4 my-4 text-xl rounded-md w-full"
        />
      </div>
      <div>
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
          <span class="font-bold text-xl"> {{ t('helpdesk.languages') }}</span>
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
          <span class="font-bold text-xl"> {{ t('helpdesk.roles') }} </span>
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
            :text="t('helpdesk.more_user_details')"
            class="p-2 mx-4 my-3 text-xl rounded-md w-full"
          />
        </div>
        <div v-if="extraInfo">
          <JsonWrapper :json-data="ccUser" />
        </div>
      </div>

      <div class="events m-2 text-xs border p-2 flex flex-col gap-2">
        <AdminEventStream :user="ccUser.id" :limit="5" class="overflow-auto" />
        <div class="flex items-center justify-center">
          <BaseButton
            :action="() => showEventsModal()"
            :text="t('actions.show_more')"
            variant="primary"
            class="p-2 mx-4 my-4 text-xl rounded-md w-full"
          />
        </div>
      </div>
      <modal
        v-if="eventsModal"
        closeable
        title="Events"
        class="md:p-10"
        @close="showEventsModal()"
      >
        <template #default>
          <div class="p-4">
            <AdminEventStream :user="ccUser.id" />
          </div>
        </template>
      </modal>
    </div>
    <div v-if="!ccUser" class="cc__user-info">
      <div>
        <div
          v-if="accountType.worksite.length > 0"
          :style="`background-color: #27AE60; color: #ffffff`"
          class="user-type cursor-pointer"
          @click="showWorksiteModal"
        >
          {{ t('helpdesk.survivor_account') }}
        </div>
        <div
          v-if="accountType.ghostUser.length > 0"
          :style="`border-color: #F39C12; color: #F39C12`"
          class="user-type"
        >
          {{ t('helpdesk.ghost_user') }}
        </div>

        <div
          v-if="
            accountType.ghostUser.length === 0 &&
            accountType.worksite.length === 0
          "
          :style="`border-color: #B2BEB5; color: #B2BEB5`"
          class="user-type"
        >
          {{ t('helpdesk.no_role') }}
        </div>
      </div>
    </div>

    <!--    </Teleport>-->

    <!--    <modal-->
    <!--      v-if="mobileExtraUserInfo"-->
    <!--      closeable-->
    <!--      :title="t('helpdesk.more_user_details')"-->
    <!--      class="md:p-10"-->
    <!--      @close="showExtraUserInfoModal()"-->
    <!--    >-->
    <!--      <template #default>-->
    <!--<div id="user-content"></div>-->
    <!--      </template>-->
    <!--    </modal>-->

    <modal
      v-if="mobileExtraUserInfo"
      closeable
      fullscreen
      :title="t('helpdesk.more_user_details')"
      modal-body-classes="overflow-y-scroll"
      @close="showExtraUserInfoModal()"
    >
      <template #default>
        <div v-if="ccUser" class="cc__user-info2">
          <div class="flex flex-col justify-center items-center">
            <div class="cc_user">
              <img
                :alt="t('helpdesk.user_picture')"
                :src="profilePictureUrl"
                class="w-full"
              />
              <BaseText>{{
                ccUser.first_name + ' ' + ccUser.last_name
              }}</BaseText>
            </div>
          </div>

          <div>
            <div
              v-if="accountType.ccUser"
              style="color: #3498db"
              class="user-type"
            >
              {{ t('helpdesk.user_account') }}
            </div>

            <div
              v-if="accountType.worksite.length > 0"
              :style="`background-color: #27AE60; color: #ffffff`"
              class="user-type cursor-pointer"
              @click="showWorksiteModal"
            >
              {{ t('helpdesk.survivor_account') }}
            </div>
            <div
              v-if="accountType.ghostUser.length > 0"
              style="color: #f39c12"
              class="user-type"
            >
              {{ t('helpdesk.ghost_user') }}
            </div>
          </div>
          <div
            class="flex items-center justify-center border-y-2 border-gray-400"
          >
            <BaseButton
              :action="() => loginAs(props.ticketData.user.ccu_user?.id)"
              :text="t('actions.login_as')"
              variant="primary"
              class="p-2 mx-4 my-4 text-xl rounded-md w-full"
            />
          </div>
          <div>
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
              <span class="font-bold text-xl">
                {{ t('helpdesk.languages') }}</span
              >
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
              <span class="font-bold text-xl"> {{ t('helpdesk.roles') }} </span>
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
                :text="t('helpdesk.more_user_details')"
                class="p-2 mx-4 my-3 text-xl rounded-md w-full"
              />
            </div>
            <div v-if="extraInfo">
              <JsonWrapper :json-data="ccUser" />
            </div>
          </div>
          <modal
            v-if="eventsModal"
            closeable
            title="Events"
            class="md:p-10"
            @close="showEventsModal()"
          >
            <template #default>
              <div class="p-4">
                <AdminEventStream :user="ccUser.id" />
              </div>
            </template>
          </modal>
        </div>
        <div v-if="!ccUser" class="cc__user-info2">
          <div>
            <div
              v-if="accountType.worksite.length > 0"
              :style="`background-color: #27AE60; color: #ffffff`"
              class="user-type cursor-pointer"
              @click="showWorksiteModal"
            >
              {{ t('helpdesk.survivor_account') }}
            </div>
            <div
              v-if="accountType.ghostUser.length > 0"
              :style="`border-color: #F39C12; color: #F39C12`"
              class="user-type"
            >
              {{ t('helpdesk.ghost_user') }}
            </div>

            <div
              v-if="
                accountType.ghostUser.length === 0 &&
                accountType.worksite.length === 0
              "
              :style="`border-color: #B2BEB5; color: #B2BEB5`"
              class="user-type"
            >
              {{ t('helpdesk.no_role') }}
            </div>
          </div>
        </div>
      </template>
    </modal>

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
        <BaseButton class="github-link" @click="showRepoSelection()">
          <span class="hidden md:block">{{
            t('helpdesk.create_github_issue')
          }}</span>
          <span class="block md:hidden">G</span>
        </BaseButton>
        <modal
          v-if="repoSelection"
          closeable
          title="Crisis Cleanup Repo Selection"
          @close="showRepoSelection()"
          @ok="createIssue()"
        >
          <template #default>
            <div class="p-4">
              <BaseSelect
                :model-value="selectedRepo"
                select-classes="w-full absolute inset-0 outline-none focus:ring-0 appearance-none border-0 text-base font-sans bg-white rounded py-2"
                :placeholder="t('~~Select a repo')"
                :options="crisisCleanupRepos"
                @update:model-value="(v) => (selectedRepo = v)"
              />
            </div>
          </template>
        </modal>
        <a
          :href="`https://crisiscleanup.zendesk.com/agent/tickets/${ticketData.id}`"
          target="_blank"
          class="md:text-[.9vw] ticket-link"
        >
          <span class="hidden md:block">{{ t('helpdesk.zendesk_link') }}</span>
          <span class="block md:hidden">Z</span>
        </a>
        <BaseButton
          v-if="mq.mdMinus"
          class="extra-info"
          :action="showExtraUserInfoModal"
          text="Extra Info"
          variant="primary"
        />
        <div :class="[ticketTestData.status + '-tag', 'ticket-status text-xl']">
          {{ capitalize(ticketTestData.status) }}
        </div>
      </div>

      <div class="subject-date__container">
        <BaseText>
          <span class="text-base font-bold">
            {{ t('helpdesk.ticket_created_at') }}:</span
          >
          {{ momentFromNow(ticketData.created_at) }}
        </BaseText>
        <hr />
        <BaseText v-if="firstComment">
          <span class="text-base font-bold">
            {{ t('helpdesk.submitting_page') }}
          </span>
          [{{ submittedFrom }}]
          <span class="font-bold">{{ t('helpdesk.ip_address') }}</span> [{{
            firstComment?.metadata?.system?.ip_address
          }}] (<a
            class="underline text-blue"
            :href="`https://www.google.com/maps/search/?api=1&query=${firstComment.metadata?.system?.latitude},${firstComment.metadata?.system?.longitude}`"
            target="_blank"
            title="{{firstComment.metadata?.system?.location}}"
            >{{ firstComment.metadata?.system?.location }}</a
          >)
        </BaseText>
        <hr />
        <BaseText>
          <span class="text-base font-bold">
            {{ t('helpdesk.subject_line') }}
          </span>
          {{
            expanded
              ? removeSubmittedFromFooter(ticketData?.description)
              : ticketData?.raw_subject
          }}
        </BaseText>
        <BaseText
          v-if="
            removeSubmittedFromFooter(ticketData?.description).length >
            ticketData?.raw_subject.length
          "
          class="m-2 text-primary-light"
          @click="() => (expanded = !expanded)"
        >
          {{ expanded ? t('actions.show_less') : t('actions.show_more') }}
        </BaseText>
      </div>
      <div ref="commentsContainer" class="comments__container">
        <BaseText class="comments__header">{{
          t('helpdesk.comments')
        }}</BaseText>
        <div
          v-for="(comment, comment_idx) in comments"
          :key="comment_idx"
          class="comments__items"
          :class="getCommentHighlights(comment)"
        >
          <BaseText class="text-3xl font-bold">
            {{ getAgentById(comment.author_id) ?? zendeskUser.name }}
          </BaseText>
          <BaseText>{{ removeSubmittedFromFooter(comment.body) }}</BaseText>

          <div v-if="comment.attachments[0]" class="attachments-container">
            <span class="attachments__header">
              {{ t('helpdesk.attachments') }}</span
            >
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
      <div class="grid grid-cols-1 md:grid-cols-12">
        <div class="ticket-reply">
          <BaseInput
            v-model="ticketReply"
            text-area
            class="reply-box"
            input-classes="resize-none row-span-4"
            :rows="mq.mdMinus ? 4 : 6"
            placeholder="Ticket Reply"
          />
          <BaseButton
            class="apply-macro__button"
            :action="showMacroModal"
            :text="t('actions.apply_macro')"
            variant="primary"
          />
          <modal
            v-if="macroModalVisibility"
            closeable
            :title="t('helpdesk.macros')"
            class="p-10"
            modal-classes="mx-2"
            @close="showMacroModal()"
          >
            <template #default>
              <base-input
                v-model="macroSearch"
                icon="search"
                class="my-2"
                :placeholder="t('~~Search Macros')"
              ></base-input>
              <Table
                :columns="macroColumns"
                :data="onMacroSearch"
                :body-style="{ height: '600px' }"
                @row-click="(v) => executeMacro(v)"
              >
                <template #template="slotProps">
                  <span v-if="mq.mdMinus" class="font-bold">Template: </span>
                  <div
                    class="overflow-auto px-4"
                    :class="h - [slotProps.item.template.length]"
                  >
                    {{ slotProps.item.template }}
                  </div>
                </template>
              </Table>
            </template>
          </modal>
        </div>
        <div class="assigned-to__container">
          <div class="header">
            <BaseText variant="h1"
              >{{ t('helpdesk.assigned_to') }}
              <span class="font-bold text-xl">{{ ticketAssigneeName }}</span>
            </BaseText>
          </div>
          <BaseSelect
            :model-value="selectedAgent"
            select-classes="w-full absolute inset-0 outline-none focus:ring-0 appearance-none border-0 text-base font-sans bg-white rounded py-2"
            class="agent-selection"
            label="name"
            :placeholder="t('helpdesk.select_agent')"
            item-key="id"
            :options="agents"
            @update:model-value="(v) => (selectedAgent = v)"
          />

          <BaseButton
            variant="primary"
            :text="t('actions.assign')"
            class="reassign-button"
            :action="reAssignTicket"
          />
        </div>
      </div>

      <div class="reply-as">
        <div class="buttons__container">
          <BaseButton
            size="md"
            :text="mq.mdMinus ? '' : t('actions.delete')"
            :class="['w-full rounded-md text-xl border']"
            icon="trash"
            icon-size="lg"
            :action="() => deleteTicket()"
          />
          <template
            v-for="status in ['open', 'pending', 'solved']"
            :key="status"
          >
            <BaseButton
              size="md"
              :text="status.charAt(0).toUpperCase() + status.slice(1)"
              :class="[status, 'w-full rounded-md text-xl']"
              :action="() => replyToTicket(status)"
            />
          </template>
        </div>
      </div>
    </div>

    <modal
      v-if="worksiteModal"
      closeable
      :title="t('helpdesk.worksite')"
      class="p-10"
      @close="showWorksiteModal()"
    >
      <template #default>
        <Table
          :columns="workSiteColumns"
          :data="worksites"
          :body-style="{ height: '400px' }"
          @row-click="(v) => openWorkSitePage(v.incident, v.id)"
        />
      </template>
    </modal>
  </div>
</template>

<style scoped>
.ticket__container {
  @apply rounded-lg bg-white md:border md:border-gray-600 md:m-4 text-sm shadow-md grid grid-cols-12;

  .cc__user-info {
    @apply hidden md:block col-span-12 md:col-span-3  border-r-2 border-gray-400 overflow-y-auto min-h-full  h-64 md:h-24;
    .cc_user {
      @apply border rounded-md m-4 text-center;
    }
  }

  .cc__user-info2 {
    @apply overflow-y-auto min-h-full h-full md:h-24 w-full;
    .cc_user {
      @apply border rounded-md m-4 text-center w-3/4;
    }
  }

  .user-type {
    @apply border rounded-md text-center p-2 mx-4 my-2 text-xl;
  }
  .ticket__header {
    @apply grid grid-cols-9 grid-rows-2 md:grid-rows-1 md:grid-cols-4 px-4 py-2 row-span-2 flex gap-2 border-b-2 border-gray-400;

    .submitter-info {
      @apply row-start-1 col-span-5 md:col-span-1 text-left;
    }
    .github-link {
      @apply row-start-2 md:row-end-1 col-span-3 md:col-span-1 border border-black rounded-md font-bold text-center flex justify-center items-center;
    }

    .ticket-link {
      @apply row-start-2 md:row-end-1  col-span-3 md:col-span-1 text-center flex items-center rounded-md justify-center bg-primary-light;
    }
    .extra-info {
      @apply row-start-2 md:row-end-1 col-span-3 md:col-span-1 text-center flex items-center rounded-md justify-center bg-primary-light;
    }
    .ticket-status {
      @apply col-span-4 md:col-span-1 text-center flex items-center rounded-md justify-center font-bold;
    }
  }

  .subject-date__container {
    @apply px-4 py-2 text-left row-span-2 border-b-2 border-gray-400;
  }

  .comments__container {
    @apply text-left px-4 py-2 overflow-y-scroll row-span-4 h-60 scroll-smooth;

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
    @apply grid grid-cols-12 col-span-8 px-4 py-2 border-y-2 border-gray-400;

    .reply-box {
      @apply w-full h-full col-span-9 md:col-span-12 row-span-4;
    }
    .apply-macro__button {
      @apply rounded-md col-span-3 row-span-4 md:row-span-1 md:col-span-12 m-2 md:my-2 p-1 md:text-[.8vw];
    }
  }

  .assigned-to__container {
    @apply grid grid-cols-12 col-span-4 px-4 p-2 row-span-2 border-b-2 md:border-y-2 md:border-l-2 border-gray-400 flex items-center justify-center;

    .header {
      @apply flex gap-2 items-center justify-center col-span-12 my-2;
    }

    .agent-selection {
      @apply col-span-8 md:col-span-12  my-2;
    }

    .reassign-button {
      @apply col-span-4 md:col-span-12 p-1 rounded-md m-2 md:my-2 md:text-[.8vw];
    }
  }

  .reply-as {
    .reply-as__header {
      @apply text-base font-bold;
    }

    @apply flex flex-col gap-2 px-4 py-2 col-span-6 row-span-2;

    .buttons__container {
      @apply flex gap-2 grid grid-cols-2 grid-rows-2 md:grid-rows-1 md:grid-cols-4;
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
