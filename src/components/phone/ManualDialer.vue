<template>
  <div class="text-center flex flex-col items-center">
    <base-text
      variant="h2"
      class="my-1"
      data-testid="testManualDialerContent"
    >
      {{$t('phoneDashboard.manual_dialer')}}
    </base-text>
    <base-text
      class="my-1"
      data-testid="testManualDialHiddenCallerIdContent"
    >
      {{$t('phoneDashboard.manual_dial_hidden_caller_id')}}
    </base-text>
    <div class="grid grid-cols-4 my-1">
      <base-select
        v-model="countryCode"
        data-testid="testCountryCodeSelect"
        :options="[$t('+1')]"
        indicator-icon="caret-down"
        class="col-span-2 text-sm"
        :placeholder="$t('phoneDashboard.code')"
      />
      <input
        v-model="phoneNumber"
        data-testid="testPhoneNumberTextInput"
        type="text"
        class="h-10 p-1 border bg-white text-sm placeholder-crisiscleanup-dark-200 outline-none col-span-2"
        size="large"
        :placeholder="$t('phoneDashboard.phone_number')"
      />
    </div>
    <base-button
      variant="solid"
      data-testid="testDialingButton"
      class="px-5 py-1 my-3"
      :text="dialing ? $t('phoneDashboard.dialing') : $t('phoneDashboard.dial')"
      :alt="dialing ? $t('phoneDashboard.dialing') : $t('phoneDashboard.dial')"
      :disabled="dialing"
      :action="() => $emit('onDial', `${countryCode}${phoneNumber}`)"
    ></base-button>
  </div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import useEmitter from '../../hooks/useEmitter';

export default defineComponent({
  name: 'ManualDialer',
  props: {
    dialing: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { emitter } = useEmitter();
    const { t } = useI18n();

    const phoneNumber = ref(null);
    emitter.on('dialer:set_phone_number', (phone) => {
      phoneNumber.value = phone;
    });
    return {
      countryCode: t('+1'),
      phoneNumber,
    };
  },
});
</script>

<style scoped></style>
