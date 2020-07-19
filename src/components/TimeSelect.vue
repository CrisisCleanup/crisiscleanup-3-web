<template>
  <form-select
    :value="value"
    :options="getTimes()"
    class="bg-white border border-crisiscleanup-dark-100 h-8 w-24"
    @input="$emit('input', $event)"
    item-key="key"
    label="value"
    select-classes="h-5 text-sm"
    :placeholder="placeholder"
  />
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
  methods: {
    getTimes() {
      const hoursPerDay = 24;
      const time = [];

      for (let i = 0; i < hoursPerDay + 1; i++) {
        const value = this.$moment()
          .subtract(i, 'hours')
          .startOf('hour')
          .format('hA');
        const key = this.$moment()
          .subtract(i, 'hours')
          .startOf('hour')
          .format('HH:mm:ss');
        time.unshift({
          key,
          value,
        });
      }
      return time;
    },
  },
};
</script>

<style scoped></style>
