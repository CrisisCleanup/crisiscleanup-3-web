<template>
  <v-select
    :value="value"
    :options="options"
    :label="label"
    :components="{ OpenIndicator }"
    :searchable="searchable"
    :multiple="multiple"
    :clearable="clearable"
    :disabled="disabled"
    class="form-select text-base"
    :class="selectClasses"
    :placeholder="placeholder"
    :reduce="item => (itemKey ? item[itemKey] : item)"
    @input="$emit('input', $event)"
  >
  </v-select>
</template>

<script>
export default {
  name: 'FormSelect',
  props: {
    searchable: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    selectClasses: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'large',
    },
    value: {
      type: null,
      default: null,
    },
    itemKey: {
      type: null,
      default: null,
    },
  },
  data() {
    return {
      OpenIndicator: {
        render() {
          return (
            <font-awesome-icon
              size="sm"
              icon="sort"
              class="mx-1 text-gray-500"
            />
          );
        },
      },
    };
  },
};
</script>

<style>
@import '~vue-select/dist/vue-select.css';
.form-select .vs__dropdown-menu {
  border-radius: 0;
}
.form-select .vs__dropdown-toggle {
  height: 100%;
  border-radius: 0;
  border: none;
}
.form-select .vs__search::placeholder {
  color: darkGray;
}
</style>
