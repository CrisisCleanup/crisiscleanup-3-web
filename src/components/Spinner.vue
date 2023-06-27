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
  'info.loading_invisible_hamster',
  'info.loading_pixelated_snail',
  'info.loading_invisible_ninjas',
  'info.loading_magic_clown',
  'info.loading_caffeinated_squirrel',
  'info.loading_mad_scientist',
  'info.loading_trained_penguins',
  'info.loading_intergalactic_turtle',
  'info.loading_tap_dancing_kangaroo',
  'info.loading_cheetah_intern',
  'info.loading_synchronized_swimmers',
  'info.loading_superhero_squirrel',
  'info.loading_ants_circle',
  'info.loading_tornado_octopus',
  'info.loading_wizard_spells',
  'info.loading_conjuring_magician',
  'info.loading_turbo_turtle',
  'info.loading_dj_sloth',
  'info.loading_synchronized_skydivers',
  'info.loading_spin_style',
  'info.loading_hamster_moon_walk',
  'info.loading_coding_sensei',
  'info.loading_friendly_ghost',
  'info.loading_website_yawn',
  'info.loading_spinner_miles',
  'info.loading_cyborg_hedgehog',
  'info.loading_data_bunnies',
  'info.loading_snacks_menu',
  'info.loading_roses_are_red',
  'info.loading_patience_halo',
  'info.loading_sloth_marathon',
  'info.loading_streaming_aging',
  'info.loading_time_machine',
  'info.loading_spinner_mocking',
  'info.loading_sloth_conservation',
  'info.loading_mona_lisa',
  'info.loading_mindfulness_meditation',
  'info.loading_world_record',
  'info.loading_enter_matrix',
  'info.loading_steam_engines',
  'info.loading_never_ending_load',
  'info.loading_waiting_rooms',
  'info.loading_slo_mo',
  'info.loading_time_is_money',
  'info.loading_delorean_gigawatt',
  'info.loading_disco_ball',
  'info.loading_toilet_flush',
  'info.loading_sonic_boom',
  'info.loading_fairy_breadcrumbs',
  'info.loading_11_kids',
  'info.loading_pixel_dragons',
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
