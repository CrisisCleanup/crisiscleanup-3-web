<template>
  <a-select
    v-decorator="decorator"
    v-bind="$attrs"
    :size="size"
    @change="change"
  >
    <slot name="options"></slot>
    <template slot="suffixIcon">
      <font-awesome-icon :size="iconSize || 'sm'" :icon="icon || 'sort'" />
    </template>
  </a-select>
</template>

<script>
export default {
  name: 'BaseSelect',
  props: {
    change: {
      type: Function,
      default: () => {},
    },
    icon: String,
    iconSize: String,
    decorator: Array,
    placeholder: String,
    size: {
      type: String,
      default: 'large',
    },
  },
};
</script>

<style scoped></style>
