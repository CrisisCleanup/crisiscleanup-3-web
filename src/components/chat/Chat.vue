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
            ref="messages"
            @wheel="handleWheel"
            @ontouchmove="handleWheel"
            class="
              flex flex-col flex-grow
              py-2
              space-y-5
              overflow-y-auto
              scrollbar-thumb-blue
              scrollbar-thumb-rounded
              scrollbar-track-blue-lighter
              scrollbar-w-2
              scrolling-touch
            "
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
            class="
              flex flex-col flex-grow
              py-2
              space-y-5
              overflow-y-auto
              scrollbar-thumb-blue
              scrollbar-thumb-rounded
              scrollbar-track-blue-lighter
              scrollbar-w-2
              scrolling-touch
            "
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
import { UserMixin } from '@/mixins';
import ChatMessage from '@/components/chat/ChatMessage';
import { useWebSockets } from '@/use/useWebSockets';
import { getQueryString } from '@/utils/urls';
import { getErrorMessage } from '@/utils/errors';

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
  async mounted() {
    await this.getUnreadMessagesCount();
    await this.getUnreadUrgentMessagesCount();
    await this.getMessages();
    await this.getFavorites();
    const { socket, send } = useWebSockets(
      `/ws/chat/${this.chat.id}`,
      'chat',
      (data) => {
        this.messages = [data, ...this.messages];
        if (data.created_by !== this.currentUser.id) {
          if (data.is_urgent) {
            this.$emit('onNewUrgentMessage');
          } else {
            this.$emit('onNewMessage');
          }
        }

        this.$nextTick(() => {
          this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
        });
      },
    );
    this.socket = socket;
    this.send = send;
  },
  unmounted() {
    this.socket.close();
  },
  data() {
    return {
      socket: null,
      messages: [],
      favorites: [],
      currentMessage: '',
      urgent: false,
      send: () => {},
      loadingMessages: false,
    };
  },
  mixins: [UserMixin],
  computed: {
    sortedMessages() {
      const sortedMessages = [...this.messages];
      sortedMessages.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
      return uniqWith(sortedMessages, isEqual);
    },
  },
  methods: {
    handleWheel() {
      if (
        this.$refs.messages.scrollTop === 0 &&
        this.sortedMessages.length &&
        !this.loadingMessages
      ) {
        this.getMessages(this.sortedMessages[0].created_at, false);
      }
    },
    async getMessages(before = null, scroll = true) {
      this.loadingMessages = true;
      const params = {
        message_group: this.chat.id,
        limit: 5,
      };
      if (before && this.messages.length) {
        params.created_at__lte = before;
      }
      const queryString = getQueryString(params);
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/chat_messages?${queryString}`,
      );
      this.messages = [...this.messages, ...response.data.results];
      if (scroll) {
        this.$nextTick(() => {
          this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
        });
      }
      this.loadingMessages = false;
    },
    async getFavorites() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/chat_groups/${this.chat.id}/my_favorites`,
      );
      this.favorites = response.data;
    },
    async getUnreadMessagesCount() {
      this.loadingMessages = true;
      const params = {
        message_group: this.chat.id,
        limit: 1,
        is_urgent: false,
      };
      if (this.currentUser.states[this.stateKey]) {
        params.created_at__gte = this.currentUser.states[this.stateKey];
      }
      const queryString = getQueryString(params);
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/chat_messages?${queryString}`,
      );
      this.$emit('unreadCount', response.data.count);
    },
    async getUnreadUrgentMessagesCount() {
      this.loadingMessages = true;
      const params = {
        message_group: this.chat.id,
        limit: 1,
        is_urgent: true,
      };
      if (this.currentUser.states[this.stateKey]) {
        params.created_at__gte = this.currentUser.states[this.stateKey];
      }
      const queryString = getQueryString(params);
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/chat_messages?${queryString}`,
      );
      this.$emit('unreadUrgentCount', response.data.count);
    },
    sendMessage() {
      this.send({
        content: this.currentMessage,
        is_urgent: this.urgent,
      });
      this.currentMessage = '';
      this.urgent = false;
      this.updateUserState({ [this.stateKey]: this.$moment().toISOString() });
    },
    async toggleFavorite(message, state) {
      try {
        if (state) {
          await this.$http.post(
            `${process.env.VUE_APP_API_BASE_URL}/chat_messages/${message.id}/favorite`,
          );
          message.is_favorite = true;
        } else {
          await this.$http.post(
            `${process.env.VUE_APP_API_BASE_URL}/chat_messages/${message.id}/unfavorite`,
          );
          message.is_favorite = false;
        }

        await this.getFavorites();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    focusNewsTab() {
      this.$emit('focusNewsTab');
    },
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
