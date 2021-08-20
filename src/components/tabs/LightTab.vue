<template>
  <!-- Lightweight alternative of Tab.vue which uses v-if to unmount child components when not active -->
  <div v-if="isActive"><slot></slot></div>
</template>

<script>
export default {
  name: 'LightTab',
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
