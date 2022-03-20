<template>
  <div class="flex-1 p:2 sm:p-6 flex flex-col h-full">
    <div class="flex sm:items-center py-3 border-b-2 border-gray-200">
      <div class="text-xl">Group</div>
    </div>
    <div
      id="messages"
      ref="messages"
      class="
        flex flex-col flex-grow
        space-y-4
        p-3
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
    <div class="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div class="relative flex">
        <base-input class="flex-1" v-model="currentMessage" />
        <base-button
          variant="solid"
          class="w-24"
          :disabled="!Boolean(currentMessage)"
          :text="$t('Send')"
          :action="sendMessage"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { UserMixin } from '@/mixins';
import ChatMessage from '@/components/chat/ChatMessage';
import { useWebSockets } from '@/use/useWebSockets';

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
    };
  },
  mixins: [UserMixin],
  computed: {
    sortedMessages() {
      const sortedMessages = [...this.messages];
      sortedMessages.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
      return sortedMessages;
    },
  },
  methods: {
    async getMessages() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/chat_messages?message_group=${this.groupId}`,
      );
      this.messages = [...response.data.results];
      this.$nextTick(() => {
        this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
      });
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
