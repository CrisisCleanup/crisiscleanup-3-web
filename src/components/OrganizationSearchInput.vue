<template>
  <Multiselect
    :placeholder="$t('registerOrg.organization_name')"
    label="name"
    :filter-results="false"
    :min-chars="1"
    :resolve-on-load="false"
    :no-options-text="$t('registerOrg.search_for_organization')"
    :delay="0"
    :searchable="true"
    :object="true"
    value-prop="id"
    :options="onOrganizationSearch"
    :clear-on-blur="false"
    class="outline-none"
    native-support
    :class="[isInvalid ? 'invalid' : '']"
    @close="
      (select) => {
        const value = select.input.value;
        if (value) {
          isInvalid = false;
        }
        $nextTick(() => {
          if (!Number.isInteger(select.textValue) && allowNew) {
            $emit('input', value);
          }
        });
      }
    "
    @update:modelValue="
      (value) => {
        if (value) {
          isInvalid = false;
        }
        if (Number.isInteger(value.id)) {
          $emit('selectedOrganization', value);
        } else {
          $emit('input', value.name);
        }
      }
    "
  >
    <template v-if="isAdmin" #option="{ option }">
      <span>{{ option.id }} - {{ option.name }}</span>
    </template>
    <template v-if="allowNew" #nooptions>
      <div></div>
    </template>
  </Multiselect>
</template>

<script lang="ts">
import Multiselect from '@vueform/multiselect';
import { defineComponent } from 'vue';
import Organization from '@/models/Organization';
import { getQueryString } from '@/utils/urls';

export default defineComponent({
  name: 'OrganizationSearchInput',
  components: { Multiselect },
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
    allowNew: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const isInvalid = ref(false);
    async function onOrganizationSearch(value: string) {
      const parameters: Record<string, unknown> = {
        fields: 'id,name',
        limit: '10',
        search: value,
      };

      if (!props.includeInactive) {
        parameters.is_active = true;
      }

      if (props.allowedOrganizationIds.length > 0 && !props.isAdmin) {
        parameters.id__in = props.allowedOrganizationIds.join(',');
      }

      const results = await Organization.api().get(
        `/organizations?${getQueryString(parameters)}`,
        {
          headers: {
            Authorization: null,
          },
          dataKey: 'results',
        },
      );

      return results.entities?.organizations || [];
    }

    onMounted(() => {
      if (props.required) {
        const input = document.querySelector(
          '.multiselect-search',
        ) as HTMLInputElement;
        const form = document.querySelector('.form') as HTMLFormElement;
        if (input) {
          form?.addEventListener(
            'invalid',
            (event) => {
              if (!input.value) {
                isInvalid.value = true;
                input.setCustomValidity('Please fill out this field');
                input.focus();
              }
            },
            true,
          );
        }
      }
    });

    return {
      onOrganizationSearch,
      log: console.log,
      isInvalid,
    };
  },
});
</script>

<style lang="postcss" scoped>
.form-field.invalid {
  @apply border-crisiscleanup-red-100;
}
</style>
