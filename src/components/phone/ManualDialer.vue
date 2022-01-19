<template>
  <div class="text-center flex flex-col items-center">
    <base-text variant="h2" class="my-1">{{ $t('~~Manual Dialer') }}</base-text>
    <base-text class="my-1">{{
      $t(
        '~~Enter a phone number to manually dial an outbound call.  Your caller ID will be hidden',
      )
    }}</base-text>
    <div class="grid grid-cols-3 my-1">
      <form-select
        v-model="countryCode"
        :options="[$t('+1'), $t('+234')]"
        indicator-icon="caret-down"
        select-classes="h-8 border bg-white text-sm"
        class="col-span-1 text-sm"
        :placeholder="$t('~~Code')"
      />
      <input
        type="text"
        class="
          h-8
          p-1
          border
          bg-white
          text-sm
          placeholder-crisiscleanup-dark-200
          outline-none
          col-span-2
        "
        size="large"
        v-model="phoneNumber"
        :placeholder="$t('~~Phone Number')"
      />
    </div>
    <base-button
      variant="solid"
      class="px-5 py-1 my-3"
      :text="$t('~~Dial')"
      :action="() => $emit('onDial', `${countryCode}${phoneNumber}`)"
    ></base-button>
  </div>
</template>

<script>
export default {
  name: 'ManualDialer',
  data() {
    return {
      countryCode: null,
      phoneNumber: null,
    };
  },
};
</script>

<style scoped></style>
