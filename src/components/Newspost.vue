<template>
  <div class="flex flex-col relative p-2 rounded" :class="variant">
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
    <div class="font-bold text-sm" v-else>
      <slot name="header"></slot>
    </div>
    <div><slot name="content"></slot></div>
    <img v-if="image" :src="image" />
    <div class="ml-auto">
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
    variant: {
      type: String,
      default: 'default',
    },
  },
};
</script>
<style>
.unclaim {
  border-style: solid;
  border-width: 2px;
  border-color: #ed4747;
  background: #442a2a;
  border-radius: 4px;
}
.close {
  border-style: solid;
  border-width: 2px;
  border-color: #0fa355;
  background: #21382c;
  border-radius: 4px;
}
.assigned {
  border-style: solid;
  border-width: 2px;
  border-color: #fece09;
  background: #473f20;
  border-radius: 4px;
}
.claim {
  border-color: #fab92e;
  background: #463c26;
  border-radius: 4px;
  border-style: solid;
  border-width: 2px;
}
.partly_done {
  border-color: #0054bb;
  background: #3a4758;
  border-radius: 4px;
  border-style: solid;
  border-width: 2px;
}
.save {
  border-color: #a0f861;
  background: #495c62;
  border-radius: 4px;
  border-style: solid;
  border-width: 2px;
}
.login {
  border-color: #61d5f8;
  background: #495c62;
  border-radius: 4px;
  border-style: solid;
  border-width: 2px;
}
.default {
  background: #2a3138;
}
</style>
