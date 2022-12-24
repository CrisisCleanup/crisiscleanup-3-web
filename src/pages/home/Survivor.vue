<template>
  <Home>
    <div class="grid--main px-5 sm:px-0">
      <h1 class="text-4xl" v-html="$t('survivor.info_for_survivors')"></h1>
      <div class="row mb-6">
        <p v-html="$t('survivor.intro')"></p>
        <h3 class="text-lg font-bold text-crisiscleanup-dark-500">
          {{ $t('survivor.what_is_ccu') }}
        </h3>
        <p v-html="$t('survivor.ccu_for_relief_agencies')"></p>

        <h3 class="text-lg font-bold text-crisiscleanup-dark-500">
          {{ $t('survivor.can_i_ask_for_help') }}
        </h3>
        <p v-html="$t('survivor.yes_call_number_at_top')"></p>

        <h3 class="text-lg font-bold text-crisiscleanup-dark-500">
          {{ $t('survivor.when') }}
        </h3>
        <p v-html="$t('survivor.we_dont_know')"></p>

        <h3 class="text-lg font-bold text-crisiscleanup-dark-500">
          {{ $t('survivor.is_it_in_scope') }}
        </h3>
        <p v-html="$t('survivor.in_scope')"></p>
        <ul>
          <li v-html="$t('survivor.small_tree')"></li>
          <li v-html="$t('survivor.tarping')"></li>
          <li v-html="$t('survivor.muck_out')"></li>
          <li v-html="$t('survivor.debris_to_curb')"></li>
        </ul>
        <p v-html="$t('survivor.out_of_scope')"></p>
        <ul>
          <li v-html="$t('survivor.large_tree')"></li>
          <li v-html="$t('survivor.fire_cleanup')"></li>
          <li v-html="$t('survivor.permits')"></li>
          <li v-html="$t('survivor.debris_to_landfill')"></li>
        </ul>

        <h3 class="text-lg font-bold text-crisiscleanup-dark-500">
          {{ $t('survivor.guarantee_good_job') }}
        </h3>
        <p v-html="$t('survivor.non_professional_volunteers')"></p>

        <h3 class="text-lg font-bold text-crisiscleanup-dark-500">
          {{ $t('survivor.can_i_view') }}
        </h3>
        <p v-html="$t('survivor.cannot_view_can_request_delete')"></p>

        <h3 class="text-lg font-bold text-crisiscleanup-dark-500">
          {{ $t('survivor.relief_agencies_using_ccu') }}
        </h3>
        <p v-html="$t('survivor.just_ask')"></p>

        <h3 class="text-lg font-bold text-crisiscleanup-dark-500">
          {{ $t('survivor.what_can_i_do') }}
        </h3>
        <p v-html="$t('survivor.be_patient')"></p>
        <p v-html="$t('survivor.be_persistent')"></p>
        <p v-html="$t('survivor.never_give_up_hope')"></p>
      </div>
    </div>
  </Home>
</template>

<script>
import Home from '@/layouts/Home.vue';

export default {
  name: 'Survivor',
  components: { Home },
  data() {
    return {};
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      'nav . main main main .'
      'nav . main main main .'
      'actions actions main main main .'
      '. . main main main .';
    overflow: auto;

    .grid {
      &--overlay {
        grid-row: 1 / span 5;
        grid-column: 1 / span 3;
      }
    }
  }
}

@media only screen and (max-width: 640px) {
  .homegrid {
    height: 100vh;
    &.grid-container {
      grid:
        [r1] 'logo survivors' [r1end]
        [r4] 'nav nav' [r4end]
        [r2] 'main main' [r2end]
        [r3] 'actions actions' [r3end]
        / auto;
      grid-template-rows: 0.5fr 0.5fr 4fr 1fr;
    }
  }
}

.form-field {
  @apply w-2/5 m-3;
}

.form-item {
  @apply py-3 ml-6;
}

.activities-checkbox {
  @apply pl-12 my-6;
}
</style>
