<template>
  <div class="flex-1 p-2 sm:p-3 flex flex-col w-full">
    <div class="flex sm:items-center py-1 border-b border-gray-200">
      <div class="text-lg">{{ chat.name }}</div>
    </div>
    <tabs tab-details-classes="">
      <tab :name="$t('chat.chat')">
        <div class="message-container">
          <div
            id="messages"
            ref="messagesBox"
            @wheel="handleWheel"
            @ontouchmove="handleWheel"
            class="flex flex-col flex-grow py-2 space-y-5 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
          >
            <ChatMessage
              v-for="message in sortedMessages"
              :message="message"
              :key="message.id"
              @onFavorite="(message) => toggleFavorite(message, true)"
              @onUnfavorite="(message) => toggleFavorite(message, false)"
            />
          </div>
          <div
            class="border-t-2 pt-1 sm:mb-0"
            :class="
              urgent ? 'border-crisiscleanup-chat-red' : 'border-gray-200'
            "
          >
            <div
              v-if="urgent"
              class="text-crisiscleanup-chat-red flex items-center mb-1"
            >
              <ccu-icon
                :alt="$t('chat.urgent')"
                size="small"
                type="attention-red"
                class="mr-1"
              />
              {{ $t('chat.urgent') }}
            </div>
            <div class="flex flex-col">
              <base-input
                text-area
                @enter="sendMessage"
                class=""
                v-model="currentMessage"
              />
              <div class="flex items-center justify-between py-2">
                <base-checkbox v-model="urgent">
                  {{ $t('chat.urgent') }}
                </base-checkbox>
                <span class="italic cursor-pointer" @click="focusNewsTab">{{
                  $t('chat.read_faq_first')
                }}</span>
                <div class="flex">
                  <base-button
                    class="h-8 w-8 bg-crisiscleanup-dark-blue"
                    :disabled="!Boolean(currentMessage)"
                    ccu-icon="plane"
                    :action="sendMessage"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </tab>
      <tab :name="$t('chat.favorites')">
        <div class="flex flex-col h-84">
          <div
            class="flex flex-col flex-grow py-2 space-y-5 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
          >
            <ChatMessage
              v-for="favorite in favorites"
              :message="favorite"
              :key="favorite.id"
            />
          </div>
        </div>
      </tab>
    </tabs>
  </div>
</template>

<script>
import { uniqWith } from 'lodash/array';
import { isEqual } from 'lodash/lang';
import ChatMessage from '../../components/chat/ChatMessage.vue';
import { getQueryString } from '../../utils/urls';
import { getErrorMessage } from '../../utils/errors';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import axios from 'axios';
import useCurrentUser from '../../hooks/useCurrentUser';
import User from '../../models/User';
import moment from 'moment';
import { useToast } from 'vue-toastification';
import { useWebSockets } from '../../hooks/useWebSockets';

export default {
  name: 'Chat',
  components: { ChatMessage },
  props: {
    chat: {
      type: Object,
      default: () => ({}),
    },
    stateKey: {
      type: String,
      default: 'chat_last_seen',
    },
  },
  setup(props, { emit }) {
    const socket = ref(null);
    const currentMessage = ref('');
    const messages = ref([]);
    const favorites = ref([]);
    const urgent = ref(false);
    const loadingMessages = ref(false);
    const send = ref(() => {});
    const messagesBox = ref(null);
    const { currentUser } = useCurrentUser();
    const $toasted = useToast();

    const sortedMessages = computed(() => {
      const currentMessages = [...messages.value];
      currentMessages.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
      return uniqWith(currentMessages, isEqual);
    });

    function handleWheel() {
      if (
        messagesBox.value.scrollTop === 0 &&
        sortedMessages.value.length &&
        !loadingMessages.value
      ) {
        getMessages(sortedMessages.value[0].created_at, false);
      }
    }
    async function getMessages(before = null, scroll = true) {
      loadingMessages.value = true;
      const params = {
        message_group: props.chat.id,
        limit: 5,
      };
      if (before && messages.value.length) {
        params.created_at__lte = before;
      }
      const queryString = getQueryString(params);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/chat_messages?${queryString}`,
      );
      messages.value = [...messages.value, ...response.data.results];
      if (scroll) {
        nextTick(() => {
          if (messagesBox.value) {
            messagesBox.value.scrollTop = messagesBox.value.scrollHeight;
          }
        });
      }
      loadingMessages.value = false;
    }
    async function getFavorites() {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/chat_groups/${
          props.chat.id
        }/my_favorites`,
      );
      favorites.value = response.data;
    }
    async function getUnreadMessagesCount() {
      loadingMessages.value = true;
      const params = {
        message_group: props.chat.id,
        limit: 1,
        is_urgent: false,
      };
      if (currentUser.states[props.stateKey]) {
        params.created_at__gte = currentUser.states[props.stateKey];
      }
      const queryString = getQueryString(params);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/chat_messages?${queryString}`,
      );
      emit('unreadCount', response.data.count);
    }
    async function getUnreadUrgentMessagesCount() {
      loadingMessages.value = true;
      const params = {
        message_group: props.chat.id,
        limit: 1,
        is_urgent: true,
      };
      if (currentUser.states[props.stateKey]) {
        params.created_at__gte = currentUser.states[this.stateKey];
      }
      const queryString = getQueryString(params);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/chat_messages?${queryString}`,
      );
      emit('unreadUrgentCount', response.data.count);
    }
    function sendMessage() {
      send.value({
        content: currentMessage.value,
        is_urgent: urgent.value,
      });
      currentMessage.value = '';
      urgent.value = false;
      User.api().updateUserState(
        { [props.stateKey]: moment().toISOString() },
        {},
      );
    }
    async function toggleFavorite(message, state) {
      try {
        if (state) {
          await axios.post(
            `${import.meta.env.VITE_APP_API_BASE_URL}/chat_messages/${
              message.id
            }/favorite`,
          );
          message.is_favorite = true;
        } else {
          await axios.post(
            `${import.meta.env.VITE_APP_API_BASE_URL}/chat_messages/${
              message.id
            }/unfavorite`,
          );
          message.is_favorite = false;
        }

        await getFavorites();
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    function focusNewsTab() {
      emit('focusNewsTab');
    }

    onMounted(async () => {
      await getUnreadMessagesCount();
      await getUnreadUrgentMessagesCount();
      await getMessages();
      await getFavorites();
      const { socket, send } = useWebSockets(
        `/ws/chat/${props.chat.id}`,
        'chat',
        (data) => {
          messages.value = [data, ...messages.value];
          if (data.created_by !== currentUser.id) {
            if (data.is_urgent) {
              emit('onNewUrgentMessage');
            } else {
              emit('onNewMessage');
            }
          }

          nextTick(() => {
            if (messagesBox.value) {
              messagesBox.value.scrollTop = messagesBox.value.scrollHeight;
            }
          });
        },
      );
      socket.value = socket;
      send.value = send;
    });

    onBeforeUnmount(() => {
      socket.value.close();
    });

    return {
      socket,
      messages,
      favorites,
      currentMessage,
      urgent,
      send,
      loadingMessages,
      sortedMessages,
      messagesBox,
      handleWheel,
      sendMessage,
      toggleFavorite,
      focusNewsTab,
    };
  },
};
</script>

<style scoped>
.scrollbar-w-2::-webkit-scrollbar {
  width: 0.25rem;
  height: 0.25rem;
}

.scrollbar-track-blue-lighter::-webkit-scrollbar-track {
  --bg-opacity: 1;
  background-color: #f7fafc;
  background-color: rgba(247, 250, 252, var(--bg-opacity));
}

.scrollbar-thumb-blue::-webkit-scrollbar-thumb {
  --bg-opacity: 1;
  background-color: #edf2f7;
  background-color: rgba(237, 242, 247, var(--bg-opacity));
}

.scrollbar-thumb-rounded::-webkit-scrollbar-thumb {
  border-radius: 0.25rem;
}
.message-container {
  @apply flex flex-col;
  height: 60vh;
}
</style>
