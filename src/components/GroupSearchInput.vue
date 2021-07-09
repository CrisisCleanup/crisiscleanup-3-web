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
<script>
import { getQueryString } from '../utils/urls';
export default {
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
  data() {
    return {
      groupResults: [],
    };
  },
  methods: {
    async onGroupSearch(value) {
      this.$emit('input', value);

      const params = {
        fields: 'id,name',
        limit: '10',
        search: value,
      };

      const results = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/groups?${getQueryString(params)}`,
      );
      this.groupResults = results.data.results;
    },
  },
};
</script>
