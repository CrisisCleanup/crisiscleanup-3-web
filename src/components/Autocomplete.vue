<template>
  <div class="flex items-center justify-start autocomplete">
    <vue-autosuggest
      v-bind="$attrs"
      :suggestions="[{ data: suggestions }]"
      :get-suggestion-value="getSuggestionValue"
      :input-props="{
        id: 'autosuggest__input',
        placeholder,
        required,
        autocomplete: 'off',
        type: 'search',
      }"
      :should-render-suggestions="shouldRenderSuggestions"
      :class="classes"
      @input="onInputChange"
      @selected="onSelected"
    >
      <template slot-scope="{ suggestion }">
        <span class="my-suggestion-item" />
        <slot name="result" :suggestion="suggestion">
          <div
            class="
              flex
              justify-between
              text-sm
              p-2
              cursor-pointer
              hover:bg-crisiscleanup-light-grey
              border-b
            "
          >
            {{ suggestion.item[displayProperty] }}
          </div>
        </slot>
      </template>
    </vue-autosuggest>
    <div
      v-if="loading"
      class="icon-container flex items-center justify-center"
      :class="iconClasses"
    >
      <font-awesome-icon icon="spinner" spin />
    </div>
    <div
      v-if="(icon || tooltip) && !loading"
      class="icon-container flex items-center justify-center"
      :class="iconClasses"
    >
      <ccu-icon
        :alt="$t('actions.help_alt')"
        :type="tooltip ? 'info' : icon"
        size="small"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
export default defineComponent({
  name: 'Autocomplete',

  props: {
    suggestions: {
      type: Array,
      default: () => {
        return [];
      },
    },
    displayProperty: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    required: Boolean,
    size: {
      type: String,
      default: '',
    },
    tooltip: {
      type: String,
      default: '',
    },
    full: Boolean,
    loading: Boolean,
    clearOnSelected: Boolean,
  },

  setup(props, { emit }) {
    const onInputChange = (text) => {
      if (text === '' || text === undefined) {
        return;
      }
      emit('search', text);
    };

    const selected = ref('');
    const inputProps = ref({
      id: 'autosuggest__input',
      onInputChange,
      placeholder: "Type 'e'",
    });
    const classes = ref({
      'flex-grow': true,
      relative: true,
      'text-base': true,
      'font-light': true,
      large: props.size === 'large',
      base: props.size !== 'large',
      'has-icon': Boolean(props.icon),
      'has-tooltip': Boolean(props.tooltip),
      full: Boolean(props.full),
    });

    const iconClasses = ref({
      large: props.size === 'large',
      base: props.size !== 'large',
      'has-tooltip': Boolean(props.tooltip),
    });

    const filteredOptions = ref<any[]>([]);

    const onSelected = (option) => {
      selected.value = option.item;
      emit('selected', option.item);
      if (props.clearOnSelected) {
        selected.value = '';
        // this.value = '';
      }
    };
    const getSuggestionValue = (suggestion) => {
      return suggestion.item[props.displayProperty];
    };
    const shouldRenderSuggestions = (size, loading) => {
      return size > 0 && !loading;
    };

    return {
      selected,
      onInputChange,
      onSelected,
      getSuggestionValue,
      shouldRenderSuggestions,
      inputProps,
      classes,
      iconClasses,
      filteredOptions,
    };
  },
});
</script>

<style scoped>
#autosuggest__input {
  outline: none;
  width: 300px;
  height: 32px;
  border-radius: 0;
  border: solid 1px #dadada;
  padding: 10px;
}

.large #autosuggest__input {
  height: 50px;
}

.has-icon #autosuggest__input {
  width: 100%;
  border-right: 0;
}

.has-tooltip #autosuggest__input {
  width: 100%;
}

.autosuggest__results {
  font-weight: 300;
  /*width: 100%;*/
  position: absolute;
  z-index: 10000001;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  background: white;
  padding: 0;
  overflow: auto;
  max-height: 200px;
}

.full .autosuggest__results {
  width: max-content;
}

.autocomplete .icon-container {
  width: 32px;
  height: 32px;
  border: solid 1px #dadada;
  border-left: 0;
}

.autocomplete .has-tooltip.icon-container {
  background-color: #f7f7f7;
}

.autocomplete .large.icon-container {
  width: 50px;
  height: 50px;
}

.autosuggest__results ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.autosuggest__results .autosuggest__results_item {
  cursor: pointer;
  padding: 15px;
}

#autosuggest ul:nth-child(1) > .autosuggest__results_title {
  border-top: none;
}

.autosuggest__results .autosuggest__results_title {
  color: gray;
  font-size: 11px;
  margin-left: 0;
  padding: 15px 13px 5px;
  border-top: 1px solid lightgray;
}

.autosuggest__results .autosuggest__results_item:active,
.autosuggest__results .autosuggest__results_item:hover,
.autosuggest__results .autosuggest__results_item:focus,
.autosuggest__results
  .autosuggest__results_item.autosuggest__results_item-highlighted {
  background-color: red;
}

#autosuggest__input::placeholder {
  @apply text-crisiscleanup-dark-200;
}
</style>
