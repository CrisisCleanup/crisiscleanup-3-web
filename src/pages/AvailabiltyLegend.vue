<template>
  <div class="flex flex-col items-center">
    <div>
      <div class="ml-3 mb-2 text-base">
        {{ $t('~~Signs to show your availability') }}
      </div>
      <AvailabilityCheckbox disabled :value="`available`">
        {{ $t('~~Available') }}
      </AvailabilityCheckbox>
      <AvailabilityCheckbox disabled :value="`available if necessary`">
        {{ $t('~~Available if Necessary') }}
      </AvailabilityCheckbox>
      <AvailabilityCheckbox disabled :value="`neutral`">
        {{ $t('~~Neutral') }}
      </AvailabilityCheckbox>
      <AvailabilityCheckbox disabled :value="`unavailable`">
        {{ $t('~~Unavailable') }}
      </AvailabilityCheckbox>
    </div>
  </div>
</template>
<script>
import AvailabilityCheckbox from '../components/AvailabilityCheckbox';

export default {
  name: 'AvailabiltyLegend',
  components: { AvailabilityCheckbox },
};
</script>
