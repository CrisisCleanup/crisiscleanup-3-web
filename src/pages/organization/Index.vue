<template>
  <div class="flex flex-col h-full">
    <div class="h-10 bg-white mx-5 border-t flex justify-center">
      <router-link
        to="/organization/invitations"
        class="flex w-40 justify-center mx-2 cursor-pointer"
        tag="div"
        :class="{ 'router-link-active': isInvitationsActive }"
      >
        <span class="pt-2">{{ $t('Invitation Management') }}</span>
      </router-link>

      <router-link
        to="/organization/users"
        class="flex w-40 justify-center mx-2 cursor-pointer"
        tag="div"
      >
        <span class="pt-2">{{ $t('User Management') }}</span>
      </router-link>

      <router-link
        to="/organization/team"
        class="flex w-40 justify-center mx-2 cursor-pointer"
        tag="div"
      >
        <span class="pt-2">{{ $t('Team Management') }}</span>
      </router-link>

      <router-link
        to="/organization/profile"
        class="flex w-40 justify-center mx-2 cursor-pointer"
        tag="div"
      >
        <span class="pt-2">{{ $t('Organization Profile') }}</span>
      </router-link>

      <router-link
        to="/organization/affiliate"
        class="flex w-40 justify-center mx-2 cursor-pointer"
        tag="div"
      >
        <span class="pt-2">{{ $t('dashboard.affiliated_orgs') }}</span>
      </router-link>

      <router-link
        to="/organization/layers"
        class="flex w-40 justify-center mx-2 cursor-pointer"
        tag="div"
      >
        <span class="pt-2">{{ $t('Layer Library') }}</span>
      </router-link>
    </div>
    <div class="flex-grow bg-gray-100">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Organization',
  computed: {
    isInvitationsActive() {
      return this.$route.name === 'Invitations';
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
