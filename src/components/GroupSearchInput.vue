<template>
  <Multiselect
    :placeholder="$t('Group (optional)')"
    label="name"
    :filter-results="false"
    :min-chars="1"
    :resolve-on-load="false"
    :delay="0"
    :searchable="true"
    :object="true"
    value-prop="id"
    @update:modelValue="
      (value) => {
        $emit('update:modelValue', value);
      }
    "
    :model-value="modelValue"
    :options="onGroupSearch"
  >
    <template v-slot:option="{ option }" v-if="isAdmin">
      <div
        class="flex justify-between text-sm p-1 cursor-pointer hover:bg-crisiscleanup-light-grey border-b"
      >
        <span>{{ option.id }} - {{ option.name }}</span>
      </div>
    </template>
  </Multiselect>
</template>
<script>
import axios from 'axios';
import Multiselect from '@vueform/multiselect';
import { getQueryString } from '../utils/urls';

export default {
  name: 'GroupSearchInput',
  components: { Multiselect },
  props: {
    modelValue: {
      type: Object,
      default: null,
    },
    size: {
      type: String,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    includeInactive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    async function onGroupSearch(value) {
      emit('input', value);

      const parameters = {
        fields: 'id,name',
        limit: '10',
        search: value,
      };

      const results = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/groups?${getQueryString(
          parameters,
        )}`,
      );
      return results.data.results;
    }

    return {
      onGroupSearch,
    };
  },
};
</script>
