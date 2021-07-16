<template>
  <div class="flex flex-col relative p-2 rounded" :class="'bg-' + bgColor">
    <div class="absolute top-1 right-0 text-xs mr-2">
      <slot name="corner"></slot>
    </div>
    <div v-if="isUserPost" class="flex flex-row items-center">
      <img :src="avatarIcon" class="rounded-full w-8 h-8 mr-2" />
      <div class="flex flex-col w-2/3">
        <div class="font-bold text-lg">{{ userInfo.name }}</div>
        <div class="truncate">{{ userInfo.organization }}</div>
      </div>
    </div>
    <div class="font-bold text-lg" v-else>
      <slot name="header"></slot>
    </div>
    <slot name="content"></slot>
    <img v-if="image" :src="image" />
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
    bgColor: {
      type: String,
      default: 'gray-500',
    },
  },
};
</script>
