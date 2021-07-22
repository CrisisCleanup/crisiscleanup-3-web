<template>
  <div class="flex flex-col relative p-2 rounded bg-gray-800">
    <div v-if="isUserPost" class="flex flex-row items-center">
      <img
        :src="avatarIcon"
        class="rounded-full w-8 h-8 mr-2"
        v-if="avatarIcon"
      />
      <div class="flex flex-col w-2/3">
        <div class="font-bold text-base">{{ userInfo.name }}</div>
        <div class="truncate text-sm">{{ userInfo.organization }}</div>
      </div>
    </div>
    <div class="font-bold text-lg" v-else>
      <slot name="header"></slot>
    </div>
    <div class="text-xs"><slot name="content"></slot></div>
    <img v-if="image" :src="image" />
    <div class="text-xs ml-auto">
      <slot name="corner"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Newspost',
  props: {
    image: {
      type: String,
      default: '',
    },
    avatarIcon: {
      type: String,
      default: '',
    },
    isUserPost: {
      type: Boolean,
      default: false,
    },
    userInfo: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>
