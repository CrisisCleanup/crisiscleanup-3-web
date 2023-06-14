<template>
  <div class="flex flex-col items-center justify-center">
    <font-awesome-icon :size="size" icon="spinner" spin />
    <div v-if="showQuote" class="my-3">{{ $t(randomQuote) }}</div>
  </div>
</template>

<script lang="ts">
import { sample } from 'lodash';

const RANDOM_QUOTES = [
  'info.loading_perpetual_motion',
  'info.loading_break_from_reality',
  'info.loading_quantum_physics',
  'info.loading_time_illusion',
  'info.loading_universe_spinning',
  'info.loading_patience_virtue',
  'info.loading_olympic_games',
  'info.loading_sit_back_relax',
  'info.loading_circles_captivating',
  'info.loading_warning_circus',
  'info.loading_spinner_mission',
  'info.loading_getting_sleepy',
  'info.loading_grasshopper_zen_mode',
  'info.loading_think_i_can',
  'info.loading_spinner_nobody_sees',
  'info.loading_twist_twirl_almost_there',
  'info.loading_watch_learn_dance',
  'info.loading_magic_in_progress',
  'info.loading_ufo',
  'info.loading_spin_me_right_round',
  'info.loading_politician',
  'info.loading_tick_tock',
  'info.loading_patience_padawan',
  'info.loading_revving_engines',
  'info.loading_stay_calm_spin_on',
  'info.loading_sprinkle_magic',
  'info.loading_pirouettes',
  'info.loading_dj_remix',
];

export default defineComponent({
  name: 'Spinner',
  props: {
    size: {
      type: String,
      default: 'xl',
    },
    showQuote: {
      type: Boolean,
    },
  },
  setup() {
    const randomQuote = ref<string>(sample(RANDOM_QUOTES));
    return {
      randomQuote,
    };
  },
});
</script>
