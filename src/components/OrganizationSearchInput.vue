<template>
  <Multiselect
    :placeholder="$t('Organization (optional)')"
    label="name"
    :filter-results="false"
    :min-chars="1"
    :resolve-on-load="false"
    :delay="0"
    :searchable="true"
    value-prop="id"
    @update:modelValue="
      (value) => {
        $emit('selectedOrganization', value);
      }
    "
    :options="onOrganizationSearch"
  >
    <template v-slot:option="{ option }" v-if="isAdmin">
      <span>{{ option.id }} - {{ option.name }}</span>
    </template>
  </Multiselect>
</template>
<script>
import Organization from '../models/Organization';
import { getQueryString } from '../utils/urls';
import Multiselect from '@vueform/multiselect';

export default {
  name: 'OrganizationSearchInput',
  setup(props) {
    async function onOrganizationSearch(value) {
      const params = {
        fields: 'id,name',
        limit: '10',
        search: value,
      };

      if (!props.includeInactive) {
        params.is_active = true;
      }

      if (props.allowedOrganizationIds.length > 0 && !props.isAdmin) {
        params.id__in = props.allowedOrganizationIds.join(',');
      }

      const results = await Organization.api().get(
        `/organizations?${getQueryString(params)}`,
        {
          headers: {
            Authorization: null,
          },
          dataKey: 'results',
        },
      );

      return results.entities.organizations;
    }

    return {
      onOrganizationSearch,
    };
  },
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
    allowedOrganizationIds: {
      type: Array,
      default: () => [],
    },
  },
  components: { Multiselect },
};
</script>
