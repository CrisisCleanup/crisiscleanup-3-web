<template>
  <section
    class="w-full h-full text-center flex flex-col justify-center items-center gap-6 p-6"
  >
    <base-text bold variant="h1" font="display">We will be back soon</base-text>
    <div class="w-full md:w-2/3 text-2xl">
      <base-text>
        We are currently down for some scheduled (or, perhaps unscheduled)
        maintenance.
      </base-text>
      <base-text>
        In the meantime, let's both just take a moment to appreciate just how
        awesome you are... Yep, you're awesome.
      </base-text>
      <base-text>
        If anything unusual is happening, we will share details on our
        <base-link href="http://blog.crisiscleanup.org"> blog. </base-link>
      </base-text>
      <base-text>&mdash; The Team</base-text>
    </div>
  </section>
</template>

<script lang="ts">
import BaseLink from '@/components/BaseLink.vue';
import BaseText from '@/components/BaseText.vue';

export default defineComponent({
  name: 'DownForMaintenance',
  components: { BaseText, BaseLink },
  setup() {
    const deadline = ref(new Date(2021, 8, 7, 2, 0, 0));
    const current = ref(new Date());
    const diffDate = computed(() => new Date(deadline.value - current.value));

    function msToTime(duration) {
      let seconds = Math.floor((duration / 1000) % 60);
      let minutes = Math.floor((duration / (1000 * 60)) % 60);
      let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

      hours = hours < 10 ? `0${hours}` : hours;
      minutes = minutes < 10 ? `0${minutes}` : minutes;
      seconds = seconds < 10 ? `0${seconds}` : seconds;
      return `${hours} hours ${minutes} minutes ${seconds} seconds`;
    }

    const formattedCountdown = computed(() =>
      msToTime(diffDate.value.getTime()),
    );

    onMounted(() => {
      setInterval(() => {
        current.value = Date.now();
      }, 1000);
    });

    return {
      formattedCountdown,
    };
  },
});
</script>

<style scoped lang="postcss">
p {
  margin: 10px 0;
}
</style>
