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
            <UserDetailsTooltip
              :dark="false"
              :name-class="'text-h3 font-h3 text-crisiscleanup-dark-500 name-tooltip'"
              :user="message.created_by"
              data-testid="testCreatedByTooltip"
            />
            <span
              v-if="moment(message.created_at).isSame(moment(), 'day')"
              class="opacity-40 text-xs ml-1"
              data-testid="testCreatedAtTimestamp"
              :title="message.created_at"
              >{{ formatDateString(message.created_at, 'h:mm A') }}</span
            >
            <span v-else class="opacity-40 text-xs ml-1">{{
              formatDateString(message.created_at, 'MMM Do h:mm A')
            }}</span>
          </div>
          <div
            v-if="message.is_urgent"
            class="px-4 py-2 inline-block bg-crisiscleanup-chat-red bg-opacity-40 text-crisiscleanup-dark-400 w-full"
          >
            <div class="text-crisiscleanup-chat-red flex items-center">
              <ccu-icon
                :alt="$t('chat.urgent')"
                data-testid="testIsUrgentStyle"
                size="small"
                type="attention-red"
                class="mr-1"
              />
              {{ $t('chat.urgent') }}
            </div>
            {{ message.content }}
          </div>
          <div
            v-else
            class="px-4 py-2 inline-block bg-crisiscleanup-chat-blue text-black w-full"
          >
            {{ message.content }}
          </div>
          <font-awesome-icon
            v-if="showFavorite"
            :alt="$t('chat.show_favorite')"
            data-testid="testShowFavoriteContent"
            icon="star"
            class="absolute top-1/2 right-2 mt-3"
            @click="$emit('onFavorite', message)"
          />
          <font-awesome-icon
            v-if="message.is_favorite"
            :alt="$t('chat.is_favorite')"
            data-testid="testIsFavoriteIcon"
            icon="star"
            class="absolute top-1/2 right-2 mt-3"
            @mouseover="showFavorite"
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

<script lang="ts">
import type { PropType } from 'vue';
import { ref } from 'vue';
import moment from 'moment';
import UserDetailsTooltip from '../user/DetailsTooltip.vue';
import { formatDateString } from '../../filters/index';
import type { Message } from '@/models/types';

export default defineComponent({
  name: 'ChatMessage',
  components: { UserDetailsTooltip },
  props: {
    message: {
      type: Object as PropType<Message>,
      default: () => ({}),
    },
  },
  setup() {
    const showFavorite = ref(false);
    return {
      showFavorite,
      formatDateString,
      moment,
    };
  },
});
</script>

<style scoped></style>
