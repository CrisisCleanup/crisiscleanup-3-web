<template>
  <div v-show="isActive"><slot></slot></div>
</template>

<script>
export default {
  name: 'Tab',
  props: {
    name: { required: true, type: String },
    selected: { type: Boolean },
    disabled: { type: Boolean, default: false },
  },

  data() {
    return {
      isActive: false,
    };
  },

  watch: {
    selected: {
      handler() {
        this.isActive = this.selected;
      },
    },
  },

  computed: {
    href() {
      return `#${this.name.toLowerCase().replace(/ /g, '-')}`;
    },
  },

  mounted() {
    this.isActive = this.selected;
  },
};
</script>

<style scoped></style>
