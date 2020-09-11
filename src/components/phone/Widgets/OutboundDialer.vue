<template>
  <div class="dialer">
    <base-text variant="body" class="pb-2">
      {{ $t('~~Enter a Phone Number to manually dial an outbound call.') }}
    </base-text>
    <vue-phone-number-input
      :translations="{
        countrySelectorLabel: $t('~~Country Code'),
        countrySelectorError: $t('~~Choose a Country'),
        phoneNumberLabel: $t('~~Phone number'),
        example: $t('~~Example:'),
      }"
      size="lg"
      v-model="phoneInput"
      @update="(payload) => $emit('update', payload)"
    />
  </div>
</template>

<script>
export default {
  name: 'OutboundDialer',
  data() {
    return {
      phoneInput: '',
    };
  },
};
</script>

<style scoped>
.dialer {
  @apply w-full h-full;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  div {
    @apply py-1;
  }
}
</style>
