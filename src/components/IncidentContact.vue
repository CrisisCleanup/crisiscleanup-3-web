<template>
  <div class="grid--survivors">
    <base-text font="display" variant="h1">{{
      $t('homeVue.survivors_call')
    }}</base-text>
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
      <div v-else>
        <spinner />
      </div>
    </base-text>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { formatNationalNumber } from '@/filters';

export default defineComponent({
  name: 'IncidentContact',
  setup() {
    const incidentList = ref([]);
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
    onMounted(async () => {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/incidents?fields=id,name,short_name,active_phone_number&limit=200&sort=-start_at`,
      );
      incidentList.value = response.data.results;
    });

    return {
      incidentList,
      filterNumbers,
      getIncidentPhoneNumbers,
    };
  },
});
</script>
<style scoped>
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
