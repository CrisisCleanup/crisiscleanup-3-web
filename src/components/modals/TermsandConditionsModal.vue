<template>
  <modal
    :title="$t('termsConditionsModal.terms_conditions_title')"
    modal-classes="max-w-lg h-auto terms-modal"
  >
    <div class="overflow-auto">
      <div
        class="px-3"
        v-html="$t('termsConditionsModal.accept_terms_conditions')"
      ></div>

      <div v-if="organization.custom_legal_tos" class="tos">
        <div class="text-base py-1 font-semibold">
          {{ $t(`termsConditionsModal.your_organization_terms_conditions`) }}
        </div>
        <div
          v-if="organization.custom_legal_tos"
          class="terms-modal overflow-auto border border-crisiscleanup-dark-100"
          v-html="organization.custom_legal_tos"
        ></div>
      </div>
    </div>
    <template #footer>
      <div class="flex items-center justify-center py-2 border-t">
        <base-button
          data-testid="termsmodal.acceptBtn"
          :text="$t('actions.accept')"
          :alt="$t('actions.accept')"
          variant="solid"
          class="px-6 p-3 accept-button"
          :action="
            () => {
              $emit('acceptedTerms');
            }
          "
        >
          {{ $t('actions.accept') }}
        </base-button>
      </div>
    </template>
  </modal>
</template>

<script lang="ts">
export default defineComponent({
  name: 'TermsandConditionsModal',
  props: {
    organization: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  emits: ['acceptedTerms'],
});
</script>

<style>
.terms-modal a {
  @apply text-primary-dark underline;
}
.tos {
  @apply p-3;
}
@media only screen and (max-width: 1223px) and (orientation: landscape) {
  .accept-button {
    @apply w-full m-2;
  }
  .tos {
    @apply px-3;
  }
}
</style>
