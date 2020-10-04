<template>
  <div class="dialer">
    <base-text variant="body" class="pb-2">
      {{ $t('phoneDashboard.enter_number_to_call') }}
    </base-text>
    <vue-phone-number-input
      :translations="{
        countrySelectorLabel: $t('phoneDashboard.country_code'),
        countrySelectorError: $t('phoneDashboard.choose_country'),
        phoneNumberLabel: $t('phoneDashboard.phone_number'),
        example: $t('phoneDashboard.example'),
      }"
      size="lg"
      v-model="phoneInput"
      @update="(payload) => $emit('update', payload)"
    />
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'OutboundDialer',
  props: {
    initialValue: VueTypes.string,
  },
  data() {
    return {
      phoneInput: this.initialValue,
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
