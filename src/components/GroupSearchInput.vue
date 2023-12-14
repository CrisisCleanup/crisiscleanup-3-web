<template>
  <autocomplete
    icon="search"
    :suggestions="groupResults"
    :size="size"
    display-property="name"
    placeholder="Groups"
    clear-on-selected
    @selected="
      (value) => {
        $emit('selectedGroup', value);
      }
    "
    @search="onGroupSearch"
  >
    <template #result="slotProps" v-if="isAdmin">
      <div
        class="
          flex
          justify-between
          text-sm
          p-1
          cursor-pointer
          hover:bg-crisiscleanup-light-grey
          border-b
        "
      >
        <span
          >{{ slotProps.suggestion.item.id }} -
          {{ slotProps.suggestion.item.name }}</span
        >
      </div>
    </template>
  </autocomplete>
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import { getQueryString } from '../utils/urls';
import useHttp from '@/use/useHttp';

export default defineComponent({
  name: 'GroupSearchInput',
  props: {
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
    const { $http } = useHttp();
    const groupResults = ref([]);
    const onGroupSearch = async (value) => {
      emit('input', value);
      const params = {
        fields: 'id,name',
        limit: '10',
        search: value,
      };
      const results = await $http.get(
        `${process.env.VUE_APP_API_BASE_URL}/groups?${getQueryString(params)}`,
      );
      groupResults.value = results.data.results;
    };
    return {
      onGroupSearch,
      groupResults,
    };
  },
});
</script>
