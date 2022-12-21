<template>
  <div class="floating-input relative">
    <input
      class="focus:outline-none rounded-md focus:border-gray-500 focus:shadow-sm w-full p-3 h-12"
      @input="
        (e) => {
          $emit('update:modelValue', e.target.value);
        }
      "
      v-bind="$attrs"
      :value.prop="modelValue"
    />
    <label
      :for="$attrs.id"
      class="absolute top-0 left-0 p-3 h-full pointer-events-none transform origin-left transition-all duration-100 ease-in-out text-base text-crisiscleanup-dark-200"
      >{{ $attrs.placeholder }}</label
    >
  </div>
</template>

<script lang="ts">
export default {
  name: 'FloatingInput',
  props: {
    modelValue: { type: String, default: '' },
  },
};
</script>

<style scoped>
.floating-input {
  border-radius: 0;
  @apply border border-crisiscleanup-dark-100;
}

.floating-input > input::placeholder {
  color: transparent;
}

.floating-input > input {
  border-radius: 0;
}

.floating-input > input:focus,
.floating-input > input:not(:placeholder-shown) {
  @apply pt-8;
}

.floating-input > input:focus ~ label,
.floating-input > input:not(:placeholder-shown) ~ label {
  @apply opacity-75 scale-75 -translate-y-3 translate-x-1;
}
</style>
