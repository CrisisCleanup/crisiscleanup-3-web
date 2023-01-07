<template>
  <section
    class="w-full h-full text-center flex flex-col justify-center items-center gap-6 p-6"
  >
    <div class="text-5xl">We&rsquo;ll be back soon</div>
    <div class="w-full md:w-2/3 text-2xl">
      <p>
        We are currently down for some scheduled (or, perhaps unscheduled)
        maintenance.
      </p>
      <p>We will be back online in: {{ formattedCountdown }}.</p>
      <p>
        In the meantime, let's both just take a moment to appreciate just how
        awesome you are... Yep, you're awesome.
      </p>
      <p>&mdash; The Team</p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DownForMaintenance',
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
};
</script>

<style scoped lang="postcss">
p {
  margin: 10px 0;
}
</style>
