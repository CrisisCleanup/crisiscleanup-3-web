<template>
  <autocomplete
    icon="search"
    :suggestions="organizationResults"
    :size="size"
    display-property="name"
    placeholder="Organizations"
    clear-on-selected
    @selected="
      (value) => {
        $emit('selectedOrganization', value);
      }
    "
    @search="onOrganizationSearch"
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
import Organization from '@/models/Organization';
import { getQueryString } from '../utils/urls';
export default {
  name: 'OrganizationSearchInput',
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
      organizationResults: [],
    };
  },
  methods: {
    async onOrganizationSearch(value) {
      this.$emit('input', value);

      const params = {
        fields: 'id,name',
        limit: '10',
        search: value,
      };

      if (!this.includeInactive) {
        params.is_active = true;
      }

      const results = await Organization.api().get(
        `/organizations?${getQueryString(params)}`,
        {
          dataKey: 'results',
        },
      );
      this.organizationResults = results.entities.organizations;
    },
  },
};
</script>
