<template>
  <div class="flex-1 p:2 sm:p-6 flex flex-col w-full">
    <div class="flex sm:items-center py-1 border-b border-gray-200">
      <div class="text-lg">Phone Live Chat</div>
    </div>
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
      />
    </div>
    <div class="border-t-2 border-gray-200 pt-4 mb-2 sm:mb-0">
      <div class="flex flex-col">
        <base-input @enter="sendMessage" class="" v-model="currentMessage" />
        <div class="flex items-center justify-between py-2">
          <base-link href="" text-variant="bodysm" class="px-2">{{
            $t('~~Need help?')
          }}</base-link>
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
</template>

<script>
import { uniqWith } from 'lodash/array';
import { isEqual } from 'lodash/lang';
import { UserMixin } from '@/mixins';
import ChatMessage from '@/components/chat/ChatMessage';
import { useWebSockets } from '@/use/useWebSockets';
import { getQueryString } from '@/utils/urls';

export default {
  name: 'Chat',
  components: { ChatMessage },
  props: {
    chatId: {
      type: String,
      default: '',
    },
  },
  async mounted() {
    await this.getMessages();
    const { socket, send } = useWebSockets(
      `/ws/chat/${this.groupId}`,
      'chat',
      (data) => {
        this.messages = [data, ...this.messages];
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
      groupId: 1,
      messages: [],
      currentMessage: '',
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
        message_group: this.groupId,
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
    sendMessage() {
      this.send({
        content: this.currentMessage,
      });
      this.currentMessage = '';
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
</style>
