<template>
  <div class="grid-container">
    <slot name="grid-overlay" />
    <slot name="grid-logo">
      <div class="logo my-8">
        <img src="@/assets/ccu-logo-black-500w.png" alt="CrisisCleanup" />
      </div>
    </slot>
    <slot name="grid-survivors">
      <div class="grid--survivors">
        <div class="survivors-container">
          <base-text font="display" variant="h1">Survivors Call</base-text>
          <base-text font="display" variant="h2">1 (800) 451 1954</base-text>
        </div>
      </div>
    </slot>
    <slot name="grid-content" />
  </div>
</template>

<script>
export default {
  name: 'HomeLayout',
  computed: {},
  methods: {},
};
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: 20% auto;
  grid-template-areas:
    'logo . . . . survivors'
    'nav . main main . .'
    'nav . main main . .'
    'actions actions . . . .';

  height: 100%;
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.logo {
  grid-area: logo;
  max-width: 200px;
  margin-left: 2.8rem;
}

.grid--survivors {
  grid-area: survivors;
  @apply mx-6 my-4;
}

.survivors-container {
  @apply bg-crisiscleanup-yellow-700 my-4 text-center p-4;
  min-width: 205px;
}

.survivors-container > p {
  letter-spacing: 0.35px;
  @apply text-gray-900;
}

.survivors-container > p:first-child {
  font-weight: 700;
  @apply text-2xl;
}

.survivors-container > p:last-child {
  font-weight: 600;
}
</style>
