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
        :src="message.profile_picture_file"
        :alt="message.full_name"
        :title="message.full_name"
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
        :src="message.profile_picture_file"
        :alt="message.full_name"
        :title="message.full_name"
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
