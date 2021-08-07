<template>
  <modal
    :title="$t('termsConditionsModal.terms_conditions_title')"
    modal-classes="max-w-lg h-auto terms-modal"
  >
    <div class="overflow-auto">
      <div
        class="p-3"
        v-html="$t('termsConditionsModal.accept_terms_conditions')"
      ></div>

      <div class="p-3" v-if="organization.custom_legal_tos">
        <div class="text-base py-1 font-semibold">
          {{ $t(`~~Your Organization's Terms of Service`) }}
        </div>
        <div
          v-if="organization.custom_legal_tos"
          class="h-64 terms-modal overflow-auto border border-crisiscleanup-dark-100"
          v-html="organization.custom_legal_tos"
        ></div>
      </div>
    </div>
    <div slot="footer" class="flex items-center justify-center py-2 border-t">
      <base-button
        data-cy="termsmodal.acceptBtn"
        :text="$t('actions.accept')"
        :alt="$t('actions.accept')"
        variant="solid"
        class="px-6 p-3"
        :action="
          () => {
            $emit('acceptedTerms');
          }
        "
      >
        {{ $t('actions.accept') }}
      </base-button>
    </div>
  </modal>
</template>

<script>
export default {
  name: 'TermsandConditionsModal',
  props: {
    organization: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
};
</script>

<style>
.terms-modal a {
  @apply text-primary-dark underline;
}
</style>
