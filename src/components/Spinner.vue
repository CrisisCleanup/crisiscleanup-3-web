<template>
  <div class="flex flex-col items-center justify-center">
    <font-awesome-icon :size="size" icon="spinner" spin />
    <div v-if="showQuote" class="my-3">{{ $t(randomQuote) }}</div>
  </div>
</template>

<script lang="ts">
import { sample } from 'lodash';

const RANDOM_QUOTES = [
  'spinner.loading_perpetual_motion',
  'spinner.loading_break_from_reality',
  'spinner.loading_quantum_physics',
  'spinner.loading_time_illusion',
  'spinner.loading_universe_spinning',
  'spinner.loading_patience_virtue',
  'spinner.loading_olympic_games',
  'spinner.loading_sit_back_relax',
  'spinner.loading_circles_captivating',
  'spinner.loading_warning_circus',
  'spinner.loading_spinner_mission',
  'spinner.loading_getting_sleepy',
  'spinner.loading_grasshopper_zen_mode',
  'spinner.loading_think_i_can',
  'spinner.loading_spinner_nobody_sees',
  'spinner.loading_twist_twirl_almost_there',
  'spinner.loading_watch_learn_dance',
  'spinner.loading_magic_in_progress',
  'spinner.loading_ufo',
  'spinner.loading_spin_me_right_round',
  'spinner.loading_politician',
  'spinner.loading_tick_tock',
  'spinner.loading_patience_padawan',
  'spinner.loading_revving_engines',
  'spinner.loading_stay_calm_spin_on',
  'spinner.loading_sprinkle_magic',
  'spinner.loading_pirouettes',
  'spinner.loading_dj_remix',
  'spinner.loading_invisible_hamster',
  'spinner.loading_pixelated_snail',
  'spinner.loading_invisible_ninjas',
  'spinner.loading_magic_clown',
  'spinner.loading_caffeinated_squirrel',
  'spinner.loading_mad_scientist',
  'spinner.loading_trained_penguins',
  'spinner.loading_intergalactic_turtle',
  'spinner.loading_tap_dancing_kangaroo',
  'spinner.loading_cheetah_intern',
  'spinner.loading_synchronized_swimmers',
  'spinner.loading_superhero_squirrel',
  'spinner.loading_ants_circle',
  'spinner.loading_tornado_octopus',
  'spinner.loading_wizard_spells',
  'spinner.loading_conjuring_magician',
  'spinner.loading_turbo_turtle',
  'spinner.loading_dj_sloth',
  'spinner.loading_synchronized_skydivers',
  'spinner.loading_spin_style',
  'spinner.loading_hamster_moon_walk',
  'spinner.loading_coding_sensei',
  'spinner.loading_friendly_ghost',
  'spinner.loading_website_yawn',
  'spinner.loading_spinner_miles',
  'spinner.loading_cyborg_hedgehog',
  'spinner.loading_data_bunnies',
  'spinner.loading_snacks_menu',
  'spinner.loading_roses_are_red',
  'spinner.loading_patience_halo',
  'spinner.loading_sloth_marathon',
  'spinner.loading_streaming_aging',
  'spinner.loading_time_machine',
  'spinner.loading_spinner_mocking',
  'spinner.loading_sloth_conservation',
  'spinner.loading_mona_lisa',
  'spinner.loading_mindfulness_meditation',
  'spinner.loading_world_record',
  'spinner.loading_enter_matrix',
  'spinner.loading_steam_engines',
  'spinner.loading_never_ending_load',
  'spinner.loading_waiting_rooms',
  'spinner.loading_slo_mo',
  'spinner.loading_time_is_money',
  'spinner.loading_delorean_gigawatt',
  'spinner.loading_disco_ball',
  'spinner.loading_toilet_flush',
  'spinner.loading_sonic_boom',
  'spinner.loading_fairy_breadcrumbs',
  'spinner.loading_11_kids',
  'spinner.loading_pixel_dragons',
  'spinner.website_doctor_bugs',
  'spinner.website_break_up_internet',
  'spinner.website_ladder_search_results',
  'spinner.keyboard_trouble_copying',
  'spinner.website_cold_pages_freezing',
  'spinner.website_diet_cookies',
  'spinner.website_party_network',
  'spinner.website_meditating_inner_webpage',
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
