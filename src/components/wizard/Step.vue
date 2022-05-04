<template>
  <div v-show="isActive"><slot></slot></div>
</template>

<script>
export default {
  name: 'Step',
  props: {
    name: { required: true, type: String },
    onSave: { required: false, type: Function, default: () => {} },
    selected: { type: Boolean },
    disabled: { type: Boolean, default: false },
  },

  data() {
    return {
      isActive: false,
      isCompleted: false,
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
