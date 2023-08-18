<template>
  <img v-if="qrDataURL" :src="qrDataURL" alt="QR Code" />
</template>

<script>
import { ref, watchEffect } from 'vue';
import QRCode from 'qrcode';

export default {
  name: "QRCode",
  props: {
    value: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const qrDataURL = ref(null);

    watchEffect(async () => {
      try {
        qrDataURL.value = await QRCode.toDataURL(props.value);
      } catch (err) {
        console.error(err);
      }
    });

    return { qrDataURL };
  }
}
</script>
