<template>
  <modal
    :title="$t('Accept Terms and Conditions')"
    modal-classes="max-w-lg h-64"
  >
    <div class="p-3">
      {{ $t('Please Review and accept the') }}
      <base-link href="/terms" target="_blank">{{
        $t('Terms and Conditions')
      }}</base-link>
      and
      <base-link href="/privacy" target="_blank">{{
        $t('Privacy Policy')
      }}</base-link>
    </div>
    <div slot="footer" class="flex items-center justify-center py-2 border-t">
      <base-button
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

<style scoped></style>
