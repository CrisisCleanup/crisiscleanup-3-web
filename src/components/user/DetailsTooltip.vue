<template>
  <div class="relative">
    <base-text
      v-popover.bottom="{ name: userItem.full_name + '_popover' }"
      :style="[nameStyle]"
      class="details-name"
      variant="body"
    >
      <span :class="`${nameClass} tooltip-target cursor-pointer`">{{
        userItem.full_name
      }}</span>
      <slot
    /></base-text>
    <div class="user-popover--container absolute">
      <popover
        :name="userItem.full_name + '_popover'"
        popover-class="user-popover"
        ref="popover"
        :width="300"
        :pointer="false"
        :style="{ left: 0, top: 0 }"
      >
        <div class="text-base">{{ userItem.full_name }}</div>
        <div class="text-xs">{{ userItem.organization.name }}</div>
        <div class="mt-2">
          <font-awesome-icon icon="envelope" />
          <a :href="`mailto:${userItem.email}`" class="ml-1">{{
            userItem.email
          }}</a>
        </div>
        <div v-if="userItem.mobile">
          <font-awesome-icon icon="phone" />
          <a :href="`tel:${userItem.mobile}`" class="ml-1">{{
            userItem.mobile
          }}</a>
        </div>
      </popover>
    </div>
  </div>
</template>

<script>
import { UserMixin } from '@/mixins';
import VueTypes from 'vue-types';

export default {
  name: 'UserDetailsTooltip',
  mixins: [UserMixin],
  props: {
    user: VueTypes.number,
    nameClass: VueTypes.string.def('text-yellow-600'),
    nameStyle: VueTypes.any,
  },
  computed: {
    userItem() {
      return this.getUser(this.user);
    },
  },
};
</script>

<style>
.user-popover--container {
  position: absolute;
  left: 0;
  .vue-popover {
    @apply bg-crisiscleanup-dark-500 text-white p-3 outline-none;
  }
}
</style>
