<template>
  <modal :title="$t('~~You have been moved')" modal-classes="max-w-lg h-64">
    <div class="p-3">
      <div>{{ $t('~~You have been moved') }}</div>
      <div>{{ transferRequest }}</div>
    </div>
    <div slot="footer" class="p-3 flex items-center justify-center">
      <base-button
        :action="$emit('close')"
        :text="$t('~~Stay')"
        variant="outline"
        class="ml-2 p-3 px-6 text-xs"
      />
      <base-button
        variant="solid"
        :action="$router.push('/profile?move=true')"
        :text="$t('~~Move Back')"
        class="ml-2 p-3 px-6 text-xs"
      />
    </div>
  </modal>
</template>

<script>
export default {
  name: 'CompletedTransferModal',
  props: {
    transferRequest: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped></style>
