<template>
  <div v-show="isActive"><slot></slot></div>
</template>

<script>
export default {
  name: 'Tab',
  props: {
    name: { required: true, type: String },
    selected: { type: Boolean },
  },

  data() {
    return {
      isActive: false,
    };
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
