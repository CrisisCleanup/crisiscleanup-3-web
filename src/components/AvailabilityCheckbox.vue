<template>
  <div
    class="h-4 w-4 flex items-center justify-center cursor-pointer"
    :class="state ? 'bg-crisiscleanup-dark-300' : 'bg-white border'"
    @click="changeState"
    role="button"
  >
    <slot></slot>
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
</template>

<script>
export default {
  name: 'AvailabilityCheckbox',
  props: {
    value: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      states: ['available', 'urgent', 'neutral', 'not available'],
      state: null,
    };
  },
  watch: {
    value(value) {
      this.state = value;
    },
  },
  methods: {
    changeState() {
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
