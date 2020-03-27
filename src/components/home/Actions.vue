<template>
  <div class="grid--actions">
    <base-text
      font="display"
      variant="h2"
      :weight="300"
      class="text-crisiscleanup-dark-500"
      >{{ lang.relief_org }}</base-text
    >
    <base-button
      variant="solid"
      size="large"
      :action="() => $router.push('/register')"
    >
      {{ lang.register }}
    </base-button>
  </div>
</template>

<script>
export default {
  name: 'HomeActions',
  computed: {
    lang() {
      return {
        register: this.$t('actions.register'),
        relief_org: this.$t('publicNav.relief_orgs_only'),
      };
    },
  },
};
</script>
