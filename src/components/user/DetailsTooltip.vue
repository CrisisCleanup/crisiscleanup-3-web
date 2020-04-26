<template>
  <v-popover popover-class="user-popover" placement="top-start">
    <base-text class="details-name" variant="body">
      <span
        variant="body"
        :class="`${nameClass} tooltip-target cursor-pointer`"
        >{{ userItem.full_name }}</span
      >
      <slot
    /></base-text>
    <div slot="popover">
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
    </div>
  </v-popover>
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
  },
  computed: {
    userItem() {
      return this.getUser(this.user);
    },
  },
};
</script>

<style>
.user-popover {
  @apply bg-black text-white p-3 outline-none;
  width: 230px;
  left: 0.75rem !important;
  z-index: 1000;
}
</style>
