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
  />
</template>
<script>
import Organization from '@/models/Organization';
export default {
  name: 'OrganizationSearchInput',
  props: {
    size: {
      type: String,
      default: null,
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
      const results = await Organization.api().get(
        `/organizations?search=${value}&limit=10&fields=id,name`,
        {
          dataKey: 'results',
        },
      );
      this.organizationResults = results.entities.organizations;
    },
  },
};
</script>
