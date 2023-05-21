<template>
  <div class="grid--survivors">
    <base-text font="display" variant="h1">
      {{ $t('homeVue.survivors_call') }}
    </base-text>
    <base-text font="display" variant="h2" class="help-contact">
      <div v-if="incidentList && incidentList.length > 0" class="w-full">
        <div
          v-for="incident in filterNumbers(incidentList)"
          :key="incident.id"
          class="ml-2"
        >
          {{ incident.short_name }}:
          {{ getIncidentPhoneNumbers(incident) }}
        </div>
      </div>
      <div v-else-if="isLoading">
        <spinner />
      </div>
      <div v-else>
        {{ $t('homeVue.phone_or_website') }}
      </div>
    </base-text>
  </div>
</template>

<script lang="ts" setup>
import { formatNationalNumber } from '@/filters';

const ccuApi = useApi();
const fieldsToFetch = [
  'id',
  'name',
  'short_name',
  'active_phone_number',
  'start_at',
];
const { isLoading, data } = ccuApi(
  '/incidents?fields=id,name,short_name,active_phone_number&limit=200&sort=-start_at',
  {
    method: 'GET',
    params: {
      fields: fieldsToFetch.join(','),
      limit: 200,
      sort: '-start_at',
    },
  },
);
const incidentList = computed(() => data.value?.results);
function getIncidentPhoneNumbers(incident) {
  if (Array.isArray(incident.active_phone_number)) {
    return incident.active_phone_number
      .map((number) => formatNationalNumber(String(number)))
      .join(', ');
  }

  return formatNationalNumber(String(incident.active_phone_number));
}

function filterNumbers(item) {
  return item.filter((filterItem) => filterItem.active_phone_number);
}
</script>

<style lang="postcss" scoped>
.grid--survivors {
  @apply bg-crisiscleanup-yellow-700 my-4 text-center p-4;
  //min-width: 205px;

  p {
    letter-spacing: 0.35px;

    &:first-child {
      font-weight: 700;
      @apply text-2xl;
    }

    &:last-child {
      font-weight: 600;
    }
  }

  a {
    @apply underline;
  }
}

@media only screen and (max-width: 768px) {
}
</style>
