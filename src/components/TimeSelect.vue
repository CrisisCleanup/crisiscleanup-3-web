<template>
  <a-time-picker v-model="value" format="hA">
    <font-awesome-icon slot="suffixIcon" icon="sort" />
  </a-time-picker>
</template>

<script>
export default {
  name: 'TimeSelect',
  props: {
    value: {
      type: null,
      default: null,
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
};
</script>

<style>
.ant-time-picker {
  width: 80px;
}
.ant-time-picker-input {
  height: 28px;
  border-radius: 0;
}
.ant-time-picker-panel {
  z-index: 10000;
}
</style>
