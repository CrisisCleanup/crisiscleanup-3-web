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
  height: 100%;
  width: 100%;
}

a:hover,
a:active,
a:focus {
  outline: 0;
  cursor: pointer;
  user-select: none;
}
</style>
