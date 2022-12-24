<template>
  <div class="wrapper unauthenticated">
    <slot />
  </div>
</template>

<script lang="ts">
import detectBrowserLanguage from 'detect-browser-language';
import { defineComponent, onBeforeMount } from 'vue';
import useSetupLanguage from '@/hooks/useSetupLanguage';

export default defineComponent({
  setup() {
    let currentLanguage = detectBrowserLanguage() as string;
    console.log('current lang', currentLanguage);

    const { setupLanguage } = useSetupLanguage();

    onBeforeMount(async () => {
      await setupLanguage();
    });
  },
});
</script>

<style>
html,
body,
.wrapper,
#app {
  @apply w-full h-full;
}

a:hover,
a:active,
a:focus {
  outline: 0;
  cursor: pointer;
  user-select: none;
}
</style>
