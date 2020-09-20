<template>
  <modal
    :title="$t('termsConditionsModal.terms_conditions_title')"
    modal-classes="max-w-lg h-64 terms-modal"
  >
    <div
      class="p-3"
      v-html="$t('termsConditionsModal.accept_terms_conditions')"
    ></div>
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
};
</script>

<style>
.terms-modal a {
  @apply text-primary-dark underline;
}
</style>
