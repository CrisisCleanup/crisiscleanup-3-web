<template>
  <div class="flex flex-col h-full" data-cy="myorg-dashboard">
    <div
      class="
        h-12
        bg-white
        mx-5
        border-t
        flex
        justify-center
        text-crisiscleanup-grey-700
      "
    >
      <template v-for="r in routes">
        <router-link
          v-if="r.isActive"
          :to="`/organization/${r.name}`"
          class="flex w-48 justify-center mx-2 cursor-pointer"
          tag="div"
          :data-cy="`myorg-nav-${r.name}`"
          :key="`myorg-nav-${r.name}`"
          :class="r.class ? r.class : null"
        >
          <span class="p-3">
            {{ $t(`orgIndex.${r.key}`) }}
          </span>
        </router-link>
      </template>
    </div>
    <div class="flex-grow overflow-auto bg-crisiscleanup-light-grey">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Organization',
  data() {
    return {
      routes: [
        {
          name: 'invitations',
          key: 'invitation_management',
          class: { 'router-link-active': this.isInvitationsActive },
          isActive: true,
        },
        {
          name: 'users',
          key: 'user_management',
          isActive: true,
        },
        {
          name: 'teams',
          key: 'team_management',
          isActive: true,
        },
        {
          name: 'profile',
          key: 'organization_profile',
          isActive: true,
        },
        {
          name: 'affiliates',
          key: 'affiliated_orgs',
          isActive: true,
        },
        {
          name: 'layers',
          key: 'layer_library',
          isActive: true,
        },
      ],
    };
  },
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
  @apply text-black;
}
</style>
