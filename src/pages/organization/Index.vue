<template>
  <div class="flex flex-col h-full">
    <div class="h-10 bg-white mx-5 border-t flex justify-center text-crisiscleanup-grey-700">
      <router-link
        to="/organization/invitations"
        class="flex w-48 justify-center mx-2 cursor-pointer"
        tag="div"
        :class="{ 'router-link-active': isInvitationsActive }"
      >
        <span class="pt-2">{{ $t('orgIndex.invitation_management') }}</span>
      </router-link>

      <router-link
        to="/organization/users"
        class="flex w-48 justify-center mx-2 cursor-pointer"
        tag="div"
      >
        <span class="pt-2">{{ $t('orgIndex.user_management') }}</span>
      </router-link>

      <router-link
        to="/organization/team"
        class="flex w-48 justify-center mx-2 cursor-pointer"
        tag="div"
      >
        <span class="pt-2">{{ $t('orgIndex.team_management') }}</span>
      </router-link>

      <router-link
        to="/organization/profile"
        class="flex w-48 justify-center mx-2 cursor-pointer"
        tag="div"
      >
        <span class="pt-2">{{ $t('orgIndex.organization_profile') }}</span>
      </router-link>

      <router-link
        to="/organization/affiliates"
        class="flex w-48 justify-center mx-2 cursor-pointer"
        tag="div"
      >
        <span class="pt-2">{{ $t('orgIndex.affiliated_orgs') }}</span>
      </router-link>

      <router-link
        to="/organization/layers"
        class="flex w-48 justify-center mx-2 cursor-pointer"
        tag="div"
      >
        <span class="pt-2">{{ $t('orgIndex.layer_library') }}</span>
      </router-link>
    </div>
    <div class="flex-grow overflow-auto bg-gray-100">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Organization',
  computed: {
    isInvitationsActive() {
      return this.$route.meta.id === 'invitations';
    },
  },
};
</script>

<style scoped>
.router-link:hover {
  text-decoration: none !important;
}

.router-link:active {
  text-decoration: none !important;
}

.router-link-active {
  background-color: transparent;
  border-bottom: solid 3px theme('colors.primary.light');
}
</style>
