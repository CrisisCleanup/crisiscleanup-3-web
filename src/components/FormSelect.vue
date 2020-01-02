<template>
  <v-select
    :value="value"
    :options="options"
    :label="label"
    :components="{ OpenIndicator }"
    :searchable="searchable"
    :multiple="multiple"
    :disabled="disabled"
    class="base-input text-base"
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
    options: Array,
    placeholder: String,
    label: String,
    size: {
      type: String,
      default: 'large',
    },
    value: {
      type: null,
    },
    itemKey: {
      type: null,
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
.base-input .vs__dropdown-menu {
  border-radius: 0;
}
.base-input .vs__dropdown-toggle {
  height: 50px;
  border-radius: 0;
  border: solid 1px #dadada;
}
.base-input .vs__search::placeholder {
  color: darkGray;
}
</style>
