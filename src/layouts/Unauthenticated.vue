<template>
  <div class="wrapper">
    <slot />
  </div>
</template>

<script>
export default {
  computed: {},
  methods: {},
};
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
