<template>
  <div v-if="message.created_by === currentUser.id" class="chat-message">
    <div class="flex items-end">
      <div
        class="
          flex flex-col
          space-y-2
          text-xs
          max-w-xs
          mx-2
          order-2
          items-start
        "
      >
        <div>
          <span
            class="
              px-4
              py-2
              rounded-lg
              inline-block
              rounded-bl-none
              bg-gray-300
              text-gray-600
            "
            >{{ message.content }}</span
          >
        </div>
      </div>
      <img
        src="https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
        alt="My profile"
        class="w-6 h-6 rounded-full order-1"
      />
    </div>
  </div>
  <div v-else class="chat-message">
    <div class="flex items-end justify-end">
      <div
        class="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end"
      >
        <div>
          <span
            class="
              px-4
              py-2
              rounded-lg
              inline-block
              rounded-br-none
              bg-blue-600
              text-white
            "
            >{{ message.content }}</span
          >
        </div>
      </div>
      <img
        src="https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
        alt="My profile"
        class="w-6 h-6 rounded-full order-2"
      />
    </div>
  </div>
</template>

<script>
import { UserMixin } from '@/mixins';

export default {
  name: 'ChatMessage',
  mixins: [UserMixin],
  props: {
    message: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style scoped></style>
