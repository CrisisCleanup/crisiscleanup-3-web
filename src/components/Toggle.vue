<template>
  <div class="flex items-center justify-center w-full mb-12">
    <label for="toogleA" class="flex items-center cursor-pointer">
      <!-- toggle -->
      <div class="relative">
        <!-- input -->
        <input
          id="toogleA"
          type="checkbox"
          class="sr-only"
          @input="update"
          @change="change"
          :checked="value"
        />
        <!-- line -->
        <div class="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
        <!-- dot -->
        <div
          class="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition"
        ></div>
      </div>
      <!-- label -->
      <div class="ml-3 text-gray-700 font-medium">
        {{ value ? onText : offText }}
      </div>
    </label>
  </div>
</template>

<script>
export default {
  name: 'Toggle',
  props: {
    onText: {
      type: String,
      default: '',
    },
    offText: {
      type: String,
      default: '',
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    update(e) {
      this.$emit('input', e.target.checked);
      this.logEvent();
    },
    change(e) {
      this.$emit('change', e.target.checked);
    },
  },
};
</script>

<style scoped>
/* Toggle A */
input:checked ~ .dot {
  transform: translateX(100%);
  background-color: #48bb78;
}

/* Toggle B */
input:checked ~ .dot {
  transform: translateX(100%);
  background-color: #48bb78;
}
</style>
