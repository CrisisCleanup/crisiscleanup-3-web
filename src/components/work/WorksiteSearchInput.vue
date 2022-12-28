<template>
  <div class="flex items-center justify-start autocomplete">
    <div class="relative w-full">
      <base-input
        :model-value="value"
        :size="size"
        :placeholder="placeholder"
        :required="required"
        :tooltip="tooltip"
        @update:modelValue="worksitesSearch"
        @input.stop=""
        @focus="isFocused = true"
        @blur="onBlur"
      >
      </base-input>

      <div
        v-if="results.length > 0 && value.length > 0 && isFocused"
        class="absolute bg-white z-50 h-auto max-h-84 overflow-auto min-w-84"
      >
        <div v-for="result in results" :key="result.label">
          <template v-if="result.options.length > 0"
            >{{ result.label }}
            <div v-for="option in result.options" :key="option">
              <div
                v-if="result.label === 'Geocode'"
                class="flex flex-col sm:text-lg text-base p-1 cursor-pointer hover:bg-crisiscleanup-light-grey border-b"
                @click="() => $emit('selectedGeocode', option)"
              >
                <div>{{ option.description }}</div>
              </div>

              <div
                v-else
                class="flex items-center p-1 cursor-pointer hover:bg-crisiscleanup-light-grey border-b"
                @click="() => $emit('selectedExisting', option)"
              >
                <div
                  class="mr-1 case-svg-container"
                  v-html="getWorkImage(option.work_types)"
                ></div>
                <div
                  class="flex flex-col text-sm"
                  :style="{ width: width || 'auto' }"
                >
                  {{ option.name }}, {{ option.case_number }}
                  <br />
                  {{ option.address }}, {{ option.city }}, {{ option.state }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div
      v-if="icon || tooltip"
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
// import Highlighter from 'vue-highlight-words';
// import Worksite from '../../models/Worksite';
// import { getWorkTypeImage } from '../../filters';
import { computed, nextTick, ref } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import useCurrentUser from '../../hooks/useCurrentUser';
import GeocoderService from '../../services/geocoder.service';
import BaseInput from '../BaseInput.vue';
import Worksite from '../../models/Worksite';
import { getWorkTypeImage } from '../../filters/index';

export default {
  name: 'WorksiteSearchInput',
  components: { BaseInput },
  props: {
    value: {
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
    useGeocoder: {
      type: Boolean,
    },
    useWorksites: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const { currentUser } = useCurrentUser();
    const store = useStore();
    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Tab') {
        emit('clearSuggestions');
      }
    });

    function searchWorksites(search, incident) {
      return axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/worksites?fields=id,name,address,case_number,postal_code,city,state,incident,work_types&limit=5&search=${search}&incident=${incident}`,
      );
    }

    async function geocoderSearch(value) {
      return await GeocoderService.getMatchingAddresses(value, 'USA');
    }

    const results = ref([]);

    function onBlur() {
      setTimeout(() => {
        isFocused.value = false;
      }, 200);
    }

    async function worksitesSearch(value) {
      emit('input', value);
      let geocode = [];
      let worksites = [];
      if (props.useWorksites) {
        const sites = await searchWorksites(value, currentIncidentId.value);
        worksites = sites.data.results;
      }
      if (props.useGeocoder) {
        geocode = await geocoderSearch(value);
      }
      results.value = [
        {
          label: 'Search',
          options: worksites,
        },
        {
          label: 'Geocode',
          options: geocode,
        },
      ];
    }

    const selected = ref('');
    const isFocused = ref(false);
    const filteredOptions = ref([]);
    const timeout = ref(null);
    const debounceMilliseconds = ref(50);
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
      invalid: !props.skipValidation,
    });
    const iconClasses = ref({
      large: props.size === 'large',
      base: props.size !== 'large',
      'has-tooltip': Boolean(props.tooltip),
    });
    const text = ref('');

    // shouldRenderSuggestions(size, loading) {
    //   return size > 0 && !loading;
    // },
    // renderSuggestion(suggestion) {
    //   if (suggestion.name === 'geocoder') {
    //     return (
    //       <div class="flex flex-col sm:text-lg text-base p-1 cursor-pointer hover:bg-crisiscleanup-light-grey border-b">
    //         <div>{suggestion.item.description}</div>
    //       </div>
    //     );
    //   }
    //   return (
    //     <div class="flex items-center p-1 cursor-pointer hover:bg-crisiscleanup-light-grey border-b">
    //       <span>{this.getWorkImage(suggestion.item.work_types)}</span>
    //       <div
    //         className="flex flex-col text-sm"
    //         style={{ width: this.width || 'auto' }}
    //       >
    //         <Highlighter
    //           highlightClassName="highlight"
    //           searchWords={[this.text]}
    //           autoEscape={true}
    //           textToHighlight={`${suggestion.item.name}, ${suggestion.item.case_number}`}
    //         />
    //         <br />
    //         <Highlighter
    //           highlightClassName="highlight"
    //           searchWords={[this.text]}
    //           autoEscape={true}
    //           textToHighlight={`${suggestion.item.address}, ${suggestion.item.city}, ${suggestion.item.state}`}
    //         />
    //       </div>
    //     </div>
    //   );
    // },
    // getSuggestionValue(suggestion) {
    //   if (suggestion.name === 'geocoder') {
    //     return suggestion.item.description;
    //   }
    //   return suggestion.item.name;
    // },
    function getWorkImage(workTypes) {
      const workType = Worksite.getWorkType(
        workTypes,
        null,
        currentUser.organization,
      );

      if (!workType) {
        return '';
      }

      return getWorkTypeImage(workType);
    }

    return {
      selected,
      filteredOptions,
      timeout,
      debounceMilliseconds,
      classes,
      iconClasses,
      text,
      currentUser,
      worksitesSearch,
      results,
      getWorkImage,
      isFocused,
      onBlur,
    };
  },
};
</script>

<style>
.autocomplete {
  z-index: 1000;
}

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
  width: 40px;
  height: 40px;
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
