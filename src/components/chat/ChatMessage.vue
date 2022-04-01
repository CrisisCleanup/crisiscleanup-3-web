<template>
  <div
    class="chat-message w-full"
    @mouseenter="showFavorite = true"
    @mouseleave="showFavorite = false"
  >
    <div class="flex items-start justify-start w-full">
      <div class="flex flex-col space-y-2 text-sm mx-2 w-full">
        <div class="flex flex-col w-full relative">
          <div class="ml-1">
            <span>{{ message.full_name }}</span>
            <span
              v-if="$moment(message.created_at).isSame($moment(), 'day')"
              class="opacity-40 text-xs ml-1"
              :title="message.created_at"
              >{{ message.created_at | moment('h:mm A') }}</span
            >
            <span v-else class="opacity-40 text-xs ml-1">{{
              message.created_at | moment('MMM Do h:mm A')
            }}</span>
          </div>
          <div
            v-if="message.is_urgent"
            class="
              px-4
              py-2
              inline-block
              bg-crisiscleanup-chat-red bg-opacity-40
              text-crisiscleanup-dark-400
              w-full
            "
          >
            <div class="text-crisiscleanup-chat-red flex items-center">
              <ccu-icon
                :alt="$t('~~Urgent')"
                size="small"
                type="attention-red"
                class="mr-1"
              />
              {{ $t('~~URGENT') }}
            </div>
            {{ message.content }}
          </div>
          <div
            v-else
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
          <font-awesome-icon
            v-if="showFavorite"
            :icon="['far', 'star']"
            class="absolute top-1/2 right-2 mt-0.5"
            @click="$emit('onFavorite', message)"
          />
          <font-awesome-icon
            v-if="message.is_favorite"
            @mouseover="showFavorite"
            :icon="['fa', 'star']"
            class="absolute top-1/2 right-2 mt-0.5"
            @click="$emit('onUnfavorite', message)"
          />
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
  data() {
    return {
      showFavorite: false,
    };
  },
  props: {
    message: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style scoped></style>
