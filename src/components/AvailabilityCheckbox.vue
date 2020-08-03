<template>
  <div class="flex items-center">
    <div
      class="h-4 w-4 flex items-center justify-center cursor-pointer mx-4"
      :class="state ? 'bg-crisiscleanup-dark-300' : 'bg-white border'"
      @click="changeState"
      role="button"
    >
      <template v-if="state === 'available'">
        <font-awesome-icon class="text-white" size="xs" icon="check" />
      </template>
      <template v-if="state === 'available if necessary'">
        <font-awesome-icon class="text-white" size="xs" icon="minus" />
      </template>
      <template v-if="state === 'neutral'">
        <font-awesome-icon class="text-white" size="xs" icon="circle" />
      </template>
      <template v-if="state === 'unavailable'">
        <font-awesome-icon class="text-white" size="xs" icon="times" />
      </template>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'AvailabilityCheckbox',
  props: {
    value: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      state: null,
    };
  },
  mounted() {
    this.state = this.value;
  },
  watch: {
    value(value) {
      this.state = value;
    },
  },
  methods: {
    changeState() {
      if (this.disabled) {
        return;
      }

      if (!this.state) {
        this.state = 'available';
      } else if (this.state === 'available') {
        this.state = 'available if necessary';
      } else if (this.state === 'available if necessary') {
        this.state = 'neutral';
      } else if (this.state === 'neutral') {
        this.state = 'unavailable';
      } else if (this.state === 'unavailable') {
        this.state = 'available';
      }

      this.$emit('input', this.state);
    },
  },
};
</script>

<style scoped></style>
