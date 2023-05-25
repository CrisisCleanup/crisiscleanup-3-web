<template>
  <v-popover
    :popper-class="['popover', dark && 'dark']"
    trigger="click"
    popover-inner-class="popover-inner max-w-sm"
  >
    <base-text :style="[nameStyle]" class="details-name" variant="body">
      <span
        v-if="userItem"
        data-testid="testUserFullNameContent"
        :class="`${nameClass} tooltip-target cursor-pointer hover:text-primary-dark`"
        >{{ userItem.full_name }}</span
      >
      <slot
    /></base-text>
    <template #popper>
      <div class="tooltip-content">
        <div v-if="userItem" class="text-base">{{ userItem.full_name }}</div>
        <div
          v-if="userItem"
          class="text-xs"
          data-testid="testUserOrganizationDiv"
        >
          {{ userItem.organization.name }}
        </div>
        <div
          v-if="userItem"
          class="mt-2"
          data-testid="testUserEmailDiv"
        >
          <font-awesome-icon icon="envelope" />
          <a :href="`mailto:${userItem.email}`" class="ml-1">{{
            userItem.email
          }}</a>
        </div>
        <div
          v-if="userItem && userItem.mobile"
          data-testid="testUserMobileDiv"
        >
          <font-awesome-icon icon="phone" />
          <a :href="`tel:${userItem.mobile}`" class="ml-1">{{
            userItem.mobile
          }}</a>
        </div>
      </div>
    </template>
  </v-popover>
</template>

<script lang="ts">
import { computed, onMounted, ref } from 'vue';
import User from '../../models/User';

export default defineComponent({
  name: 'UserDetailsTooltip',
  props: {
    user: {
      type: Number,
    },
    nameClass: {
      type: String,
      default: 'text-yellow-600',
    },
    nameStyle: {
      type: String,
      default: '',
    },
    dark: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const asyncUser = ref(null);
    const userItem = computed(() => {
      return User.find(props.user);
    });
    onMounted(() => {
      const user = User.find(props.user);
      if (!user) {
        User.api().get(`/users/${props.user}`, {});
      }
    });
    return {
      asyncUser,
      userItem,
    };
  },
});
</script>

<style></style>
