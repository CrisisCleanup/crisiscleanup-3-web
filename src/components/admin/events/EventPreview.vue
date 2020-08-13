<template>
  <div class="epreview">
    <div class="epreview__section">
      <div>
        <base-text variant="h3" class="pb-1">
          Key
        </base-text>
        <base-input size="medium" :value="eventData.key" break-glass />
      </div>
      <div>
        <base-text variant="h3" class="pb-1">
          Points
        </base-text>
        <number-input
          :attrs="{ style: { maxHeight: '40px' } }"
          class="points"
          center
          inline
          controls
          :min="0"
          v-model="eventData.points"
        />
      </div>
    </div>
  </div>
</template>

<script>
// @flow

import VueTypes from 'vue-types';
import { toRefs, reactive } from '@vue/composition-api';

// Renders dirty new event data for preview.
export default {
  name: 'EventPreview',
  props: {
    // Dirty event key.
    eventKey: VueTypes.string.def(''),
    // Dirty event points.
    eventPoints: VueTypes.number.def(0),
  },
  setup(props) {
    const { eventKey, eventPoints } = toRefs(props);

    const eventData = reactive({
      key: eventKey,
      points: eventPoints,
    });
    return {
      eventData,
    };
  },
};
</script>

<style scoped lang="postcss">
.epreview {
  @apply h-full w-full p-6;
  lost-flex-container: column;
  &__section {
    @apply w-full;
    lost-row: 1/7;
    > div:first-child {
      @apply w-5/6 pr-6;
    }
    &:first-child {
      display: flex;
      flex-direction: row;
      > div:last-child {
        justify-content: flex-end;
      }
    }
  }
}
</style>
