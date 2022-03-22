<template>
  <div class="chat-message w-full">
    <div class="flex items-start justify-start w-full">
      <div class="flex flex-col space-y-2 text-sm mx-2 w-full">
        <div class="flex flex-col w-full">
          <div class="ml-1">
            <span>{{ message.full_name }}</span>
            <span class="opacity-40 text-xs ml-1">{{
              message.created_at | moment('h:mm A')
            }}</span>
          </div>
          <div
            class="
              px-4
              py-2
              inline-block
              bg-crisiscleanup-chat-blue
              text-black
              w-full
            "
          >
            {{ message.content }}
          </div>
        </div>
      </div>
      <img
        :src="
          message.profile_picture_file ||
          `https://avatars.dicebear.com/api/bottts/${message.full_name}.svg`
        "
        :alt="message.full_name"
        :title="message.full_name"
        class="w-6 h-6 rounded-full order-2 hidden"
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
