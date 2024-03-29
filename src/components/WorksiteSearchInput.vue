<template>
  <div class="flex items-center justify-start autocomplete">
    <vue-autosuggest
      v-bind="$attrs"
      :suggestions="suggestions"
      :input-props="{
        id: 'autosuggest__input',
        class: `js-worksite-search ${selector}`,
        'data-cy': selector,
        placeholder,
        required,
        autocomplete: 'off',
        type: 'search',
      }"
      :section-configs="sectionConfigs"
      :render-suggestion="renderSuggestion"
      :get-suggestion-value="getSuggestionValue"
      :should-render-suggestions="shouldRenderSuggestions"
      :class="classes"
      @input="onInputChange"
    />
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

<script>
import Highlighter from 'vue-highlight-words';
import Worksite from '@/models/Worksite';
import User from '@/models/User';
import { getWorkTypeImage } from '@/filters';

export default {
  name: 'WorksiteSearchInput',
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
    width: {
      type: String,
      default: '',
    },
    selector: {
      type: String,
      default: '',
    },
    skipValidation: {
      type: Boolean,
    },
  },
  created() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Tab') {
        this.$emit('clearSuggestions');
      }
    });
  },
  data() {
    return {
      selected: '',
      filteredOptions: [],
      timeout: null,
      debounceMilliseconds: 50,
      inputProps: {
        id: 'autosuggest__input',
        onInputChange: this.onInputChange,
        placeholder: "Type 'e'",
      },
      classes: {
        'flex-grow': true,
        relative: true,
        'text-base': true,
        'font-light': true,
        large: this.size === 'large',
        base: this.size !== 'large',
        'has-icon': Boolean(this.icon),
        'has-tooltip': Boolean(this.tooltip),
        full: Boolean(this.full),
        invalid: !this.skipValidation,
      },
      iconClasses: {
        large: this.size === 'large',
        base: this.size !== 'large',
        'has-tooltip': Boolean(this.tooltip),
      },
      text: '',
      sectionConfigs: {
        worksites: {
          limit: 5,
          label: this.$t('worksiteSearchInput.existing_cases'),
          type: '',
          onSelected: (selected) => {
            this.selected = selected.item;
            this.$emit('selectedExisting', selected.item);
          },
        },
        geocoder: {
          limit: 10,
          label: this.$t('worksiteSearchInput.geocoder'),
          type: '',
          onSelected: (selected) => {
            this.selected = selected.item;
            this.$emit('selectedGeocode', selected.item);
          },
        },
      },
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  methods: {
    shouldRenderSuggestions(size, loading) {
      return size > 0 && !loading;
    },
    renderSuggestion(suggestion) {
      if (suggestion.name === 'geocoder') {
        return (
          <div class="flex flex-col sm:text-lg text-base p-1 cursor-pointer hover:bg-crisiscleanup-light-grey border-b">
            <div>{suggestion.item.description}</div>
          </div>
        );
      }
      return (
        <div class="flex items-center p-1 cursor-pointer hover:bg-crisiscleanup-light-grey border-b">
          <span>{this.getWorkImage(suggestion.item.work_types)}</span>
          <div
            className="flex flex-col text-sm"
            style={{ width: this.width || 'auto' }}
          >
            <Highlighter
              highlightClassName="highlight"
              searchWords={[this.text]}
              autoEscape={true}
              textToHighlight={`${suggestion.item.name}, ${suggestion.item.case_number}`}
            />
            <br />
            <Highlighter
              highlightClassName="highlight"
              searchWords={[this.text]}
              autoEscape={true}
              textToHighlight={`${suggestion.item.address}, ${suggestion.item.city}, ${suggestion.item.state}`}
            />
          </div>
        </div>
      );
    },
    getSuggestionValue(suggestion) {
      if (suggestion.name === 'geocoder') {
        return suggestion.item.description;
      }
      return suggestion.item.name;
    },
    getWorkImage(workTypes) {
      const workType = Worksite.getWorkType(
        workTypes,
        null,
        this.currentUser.organization,
      );

      if (!workType) {
        return '';
      }

      const svg = getWorkTypeImage(workType);

      return this.$createElement('div', {
        domProps: {
          innerHTML: svg,
        },
        class: {
          'case-svg-container': true,
          'mr-1': true,
        },
      });
    },
    onInputChange(text) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        if (text === '' || text === undefined) {
          this.$emit('clear', text);
          return;
        }
        this.$emit('search', text);
        this.$emit('input', text);
        this.text = text;
      }, this.debounceMilliseconds);
    },
  },
};
</script>

<style>
.case-svg-container svg {
  width: 30px;
  height: 30px;
}

#autosuggest__input {
  outline: none;
  width: 100%;
  height: 32px;
  border-radius: 0;
  border: solid 1px #dadada;
  padding: 10px;
  position: relative;
  @apply text-sm;
}

.invalid #autosuggest__input[required] {
  @apply border-crisiscleanup-red-100;
}

.large #autosuggest__input {
  height: 50px;
  @apply text-base;
}

.has-icon #autosuggest__input {
  width: 100%;
  border-right: 0;
}

.has-tooltip #autosuggest__input {
  width: 100%;
}

#autosuggest__input::placeholder {
  @apply text-crisiscleanup-dark-200;
}

#autosuggest__input {
  -webkit-appearance: none;
}

.autosuggest__results {
  font-weight: 200;
  min-width: 10vw;
  max-width: 100vw;
  position: absolute;
  z-index: 10000001;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  background: white;
  padding: 0;
  overflow: auto;
  max-height: 400px;
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

.autosuggest__results-before {
  @apply text-gray-400 text-sm font-bold px-1;
}

@media screen and (max-width: 640px) {
  .autosuggest__results {
    min-width: 97vw;
  }
}
</style>
