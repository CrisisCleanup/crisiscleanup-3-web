<template>
  <div class="flex items-center">
    <label for="switch" class="flex items-center justify-between gap-2 cursor-pointer w-full">
      <slot />
      <div class="relative">
        <input
          id="switch"
          type="checkbox"
          class="hidden"
          v-model="value"
        />
        <div
          class="toggle-path w-9 h-5 rounded-full shadow-inner border"
          :class="value ? 'bg-crisiscleanup-light-smoke' : 'bg-crisiscleanup-grey-300'"
        ></div>
        <div
          class="toggle-dot absolute left-0 top-0 w-5 h-5 rounded-full shadow inset-y-0 left-0 transform transition-transform duration-200 ease-in-out"
          :class="[value ? 'translate-x-full bg-primary-light' : 'translate-x-0 bg-primary-light']"
        ></div>
      </div>
    </label>
  </div>
</template>

<script>
export default {
  props: ['modelValue'],
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      }
    }
  }
}
</script>

<style scoped>
.toggle-path {
  transition: background-color 0.2s ease-in-out;
}
.toggle-dot {
  transition: all 0.2s ease-in-out;
}
</style>
