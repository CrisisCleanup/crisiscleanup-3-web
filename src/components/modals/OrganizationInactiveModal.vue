<template>
  <modal
    :title="$t('~~Organization Inactive')"
    data-testid="testVerificationTitleModal"
    modal-classes="max-w-lg h-auto verification-modal"
  >
    <div class="overflow-auto">
      <div class="px-3">
        <div
          v-html="
            $t(
              `~~We're sorry. Your username and password are correct, but your organization is not currently active. Please contact helpdesk if you have any questions.`,
            )
          "
        ></div>
      </div>
    </div>
    <template #footer>
      <div class="flex items-center justify-center py-2 border-t">
        <base-button
          data-testid="testVerificationLogoutButton"
          :text="$t('actions.logout')"
          :alt="$t('actions.logout')"
          variant="solid"
          class="px-6 p-3 logout-button"
          :action="logout"
        >
          {{ $t('actions.logout') }}
        </base-button>
      </div>
    </template>
  </modal>
</template>

<script lang="ts">
export default defineComponent({
  name: 'OrganizationInactiveModal',
  props: {
    organization: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  emits: ['userLoggedOut'],
  methods: {
    logout() {
      // Your logout logic here. This could involve emitting an event or
      // calling some API endpoint or global function to perform the logout.
      this.$emit('userLoggedOut');
    },
  },
});
</script>

<style>
.verification-modal a {
  @apply text-primary-dark underline;
}
@media only screen and (max-width: 1223px) and (orientation: landscape) {
  .logout-button {
    @apply w-full m-2;
  }
}
</style>
