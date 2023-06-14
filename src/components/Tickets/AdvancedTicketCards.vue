<script lang="ts" setup>
import axios from 'axios';
import _ from 'lodash';
// import Dropdown from 'primevue/dropdown'
// import { useRouter } from '../../../../node_modules/vue-router'
// import { useToast } from '../../node_modules/vue-toastification'
// import Textarea from 'primevue/textarea';
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  ref,
  withDefaults,
  watchEffect,
  watch,
} from 'vue';
import BaseText from '@/components/BaseText.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseInput from '@/components/BaseInput.vue';
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
});

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_BASE_URL}/zendesk`,
});

const emit = defineEmits<{ (e: 'reFetchTicket'): void }>();

// here temporarily till i pull it from cc page
const userLoggedIn = ref('Triston Lewis');

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
  currentUserID.value = agentList.value.find(
    (agent) => agent.name === userLoggedIn.value,
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

      getCurrentLoggedInUser();
    });
};

const getComments = () => {
  axiosInstance
    .get(`/tickets/${props.ticketData.id}/comments`, {})
    .then((response: any) => {
      comments.value = response.data.comments;
      console.log('these are the comments', comments.value);
    });
};

const messageHighlights = (item) => {
  if (item.author_id === currentUserID.value) {
    return 'bg-primary-light text-white';
  }

  return 'bg-gray-400';
};

onMounted(() => {
  isLoading.value = true;
  if (props.users) {
    processedUsers();
  } else {
    console.log('users prop is not ready');
  }

  getComments();
  getAgentList();
  isLoading.value = false;
});
</script>

<template>
  <div
    class="ticket__container-a grid grid-cols-6 grid-rows-6 border rounded-md shadow-xl"
  >
    <div class="profile__column-a col-span-2 border-right">
      <div class="user-profile"></div>
    </div>
    <div></div>
  </div>
  <div class="ticket__container">
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
      <div class="ticket-link">
        <a
          :href="`https://crisiscleanup.zendesk.com/agent/tickets/${ticketData.id}`"
        >
          Launch Ticket</a
        >
      </div>
      <div :class="[ticketData.status, 'ticket-status']">
        {{ capitalizeFirstLetter(ticketData.status) }}
      </div>
    </div>

    <div class="subject-date__container">
      <BaseText class="">
        <span class="text-base font-bold">Created on: </span>
        {{ new Date(ticketData.created_at) }}</BaseText
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
        v-for="(item, idx) in comments"
        :key="idx"
        class="comments__items"
        :class="messageHighlights(item)"
      >
        <BaseText class="text-3xl font-bold"
          >{{ userMapFunction(item.author_id) || ticketData.name }}
        </BaseText>
        <br />
        <BaseText>{{ item.body }}</BaseText>

        <div v-if="item.attachments[0]" class="attachments-container">
          <hr />
          <span class="attachments__header">Attachments</span>
          <div class="attachments__items">
            <div
              v-for="(attachment, idx) in item.attachments"
              :key="idx"
              class="flex flex-col items-center justify-center border"
            >
              <a :href="attachment.content_url" target="_blank ">
                <img :src="attachment.content_url" class="w-14 h-14" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="ticket-reply">
      <textarea
        v-model="ticketReply"
        class="w-full h-full"
        placeholder="Ticket Reply"
      />
    </div>

    <div class="assigned-to__container">
      <div class="header">
        <!--        <img src="" class="w-10 h-10 rounded-md" />-->
        <BaseText
          >Assigned To:
          <span class="font-bold">{{
            assignedUser ? assignedUser.name : 'None'
          }}</span></BaseText
        >
      </div>
      <BaseSelect
        v-model="selectedAgent"
        class="agent-selection"
        place-holder="Select Agent"
        :options="agentDropdown"
      />
      <BaseButton
        title="Reassign Ticket"
        class="reassign-button"
        :action="() => reAssignTicket"
      />
    </div>

    <div class="reply-as">
      <BaseText class="reply-as__header">Reply As:</BaseText>
      <div class="buttons__container">
        <template v-for="status in ['open', 'pending', 'solved']" :key="status">
          <BaseButton
            :title="status.charAt(0).toUpperCase() + status.slice(1)"
            :class="[status, 'w-1/3']"
            :action="() => replyToTicket(status)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket__container {
  @apply rounded-lg bg-white border border-gray-600 m-4 text-sm shadow-md;
  .ticket__header {
    @apply grid grid-cols-4 px-4 py-2 row-span-2 flex gap-2 border-b-2 border-gray-400;
    .submitter-info {
      @apply col-span-2 text-left;
    }
    .ticket-link {
      @apply text-center flex items-center rounded-md justify-center bg-primary-light text-white;
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
        @apply mt-4;
        .attachments__header {
          @apply font-bold;
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
    @apply grid grid-cols-1 md:grid-cols-4 px-4 py-2 row-span-2 border-b-2 border-gray-400;
    .header {
      @apply flex gap-2 items-center justify-center md:col-span-4 my-2;
    }
    .agent-selection {
      @apply md:col-span-4 my-2;
    }
    .reassign-button {
      @apply md:col-span-4;
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
