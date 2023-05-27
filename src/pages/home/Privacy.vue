<template>
  <Home>
    <div class="grid--main m-10 sm:px-0" data-testid="testPrivacyDiv">
      <div class="text-4xl">
        {{ $t('privacy.privacy_and_security_policy') }}
      </div>
      <div class="row mb-6">
        <p v-html="$t('privacy.purpose_intro')"></p>
        <p v-html="$t('privacy.must_accept')"></p>
        <p v-html="$t('privacy.check_for_changes')"></p>

        <h3>1 {{ $t('privacy.highlights_and_principles') }}</h3>
        <p v-html="$t('privacy.read_it_all')"></p>
        <p v-html="$t('privacy.shared_with_all_participants')"></p>
        <p v-html="$t('privacy.client_consent')"></p>

        <h3>2 {{ $t('privacy.definitions') }}</h3>
        <p v-html="$t('privacy.definitions_intro')"></p>
        <ol class="outline two">
          <li v-html="$t('privacy.def_npii')"></li>
          <li v-html="$t('privacy.def_pii')"></li>
          <li v-html="$t('privacy.def_org_info')"></li>
          <li v-html="$t('privacy.def_pub_info')"></li>
          <li v-html="$t('privacy.def_you')"></li>
          <li v-html="$t('privacy.def_company')"></li>
          <li v-html="$t('privacy.def_service')"></li>
          <li v-html="$t('privacy.def_terms_conditions')"></li>
          <li v-html="$t('privacy.def_your_materials')"></li>
        </ol>

        <h3>3 {{ $t('privacy.children') }}</h3>
        <p v-html="$t('privacy.not_for_under_13')"></p>

        <h3>4 {{ $t('privacy.information_collected') }}</h3>
        <ol class="outline four">
          <li>
            <div v-html="$t('privacy.how_used_intro')"></div>
            <table>
              <thead>
                <tr>
                  <th>{{ $t('privacy.table_th_info_collected') }}</th>
                  <th>{{ $t('privacy.table_th_info_primary_purpose') }}</th>
                  <th>{{ $t('privacy.table_th_info_required') }}</th>
                  <th>{{ $t('privacy.table_th_shared_participants') }}</th>
                  <th>{{ $t('privacy.table_th_shared_public') }}</th>
                  <th>{{ $t('privacy.table_th_pii_npii') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ $t('privacy.table_client_contact_info') }}</td>
                  <td>{{ $t('privacy.table_empower_recovery') }}</td>
                  <td>{{ $t('privacy.table_required') }}</td>
                  <td>{{ $t('privacy.table_shared_orgs') }}</td>
                  <td>{{ $t('privacy.table_not_shared_public') }}</td>
                  <td>{{ $t('privacy.table_pii') }}</td>
                </tr>
                <tr>
                  <td>{{ $t('privacy.table_lat_lon') }}</td>
                  <td>{{ $t('privacy.table_derived_from_address') }}</td>
                  <td>{{ $t('privacy.table_required') }}</td>
                  <td>{{ $t('privacy.table_shared_orgs') }}</td>
                  <td>{{ $t('privacy.table_randomized_public') }}</td>
                  <td>{{ $t('privacy.table_pii') }}</td>
                </tr>
                <tr>
                  <td>{{ $t('privacy.table_priortization_info') }}</td>
                  <td>{{ $t('privacy.table_variety_questions') }}</td>
                  <td>{{ $t('privacy.table_optional') }}</td>
                  <td>{{ $t('privacy.table_shared_orgs') }}</td>
                  <td>{{ $t('privacy.table_not_shared_public') }}</td>
                  <td>{{ $t('privacy.table_npii') }}</td>
                </tr>
                <tr>
                  <td>{{ $t('privacy.table_damage_info') }}</td>
                  <td>
                    {{ $t('privacy.table_variety_questions_response') }}
                  </td>
                  <td>{{ $t('privacy.table_optional') }}</td>
                  <td>{{ $t('privacy.table_shared_orgs') }}</td>
                  <td>{{ $t('privacy.table_some_shared_public') }}</td>
                  <td>{{ $t('privacy.table_npii') }}</td>
                </tr>
                <tr>
                  <td>{{ $t('privacy.table_your_name_contact') }}</td>
                  <td>{{ $t('privacy.table_your_name_contact_purpose') }}</td>
                  <td>{{ $t('privacy.table_required') }}</td>
                  <td>{{ $t('privacy.table_shared_orgs') }}</td>
                  <td>{{ $t('privacy.table_not_shared_public') }}</td>
                  <td>{{ $t('privacy.table_pii') }}</td>
                </tr>
                <tr>
                  <td>{{ $t('privacy.table_usage_habits') }}</td>
                  <td>{{ $t('privacy.table_usage_habits_google') }}</td>
                  <td>{{ $t('privacy.table_some_optional_no_cookies') }}</td>
                  <td>{{ $t('privacy.table_shared_only_aggregate') }}</td>
                  <td>{{ $t('privacy.table_shared_only_aggregate') }}</td>
                  <td>{{ $t('privacy.table_npii') }}</td>
                </tr>
                <tr>
                  <td>{{ $t('privacy.table_your_materials') }}</td>
                  <td>{{ $t('privacy.table_videos_pictures') }}</td>
                  <td>{{ $t('privacy.table_optional') }}</td>
                  <td>{{ $t('privacy.table_shared_orgs') }}</td>
                  <td>{{ $t('privacy.table_shared_public') }}</td>
                  <td>{{ $t('privacy.table_npii') }}</td>
                </tr>
              </tbody>
            </table>
            <p v-html="$t('privacy.visitor_npii_collected')"></p>
            <p v-html="$t('privacy.how_use_visitor_npii')"></p>
          </li>
          <li>
            <strong>{{ $t('privacy.web_cookies') }}</strong>
            <p v-html="$t('privacy.web_cookie_def')"></p>
            <p v-html="$t('privacy.we_use_web_cookies')"></p>
          </li>
          <li>
            <strong>{{ $t('privacy.web_beacons') }}</strong>
            <p v-html="$t('privacy.web_beacon_def')"></p>
            <p v-html="$t('privacy.how_to_kill_web_beacons')"></p>
          </li>
        </ol>

        <h3>5 {{ $t('privacy.other_disclosures') }}</h3>

        <p v-html="$t('privacy.disclose_pii_when')"></p>
        <ol class="outline five">
          <li v-html="$t('privacy.by_law_or_protect_rights')"></li>
          <li v-html="$t('privacy.business_transfers')"></li>
          <li v-html="$t('privacy.research_or_history')"></li>
          <li v-html="$t('privacy.in_public_interest')"></li>
          <li v-html="$t('privacy.other_purposes')"></li>
        </ol>

        <h3>6 {{ $t('privacy.ssl_encryption') }}</h3>
        <p v-html="$t('privacy.we_use_ssl')"></p>

        <h3>7 {{ $t('privacy.policy_changes') }}</h3>
        <ol class="outline seven">
          <li v-html="$t('privacy.how_we_update_policy')"></li>
          <li v-html="$t('privacy.effective_date')"></li>
        </ol>
      </div>
    </div>
  </Home>
</template>

<script lang="ts">
import Home from '@/layouts/Home.vue';

export default defineComponent({
  name: 'Privacy',
  components: { Home },
});
</script>

<style scoped lang="scss">
@import '../../assets/css/_terms-privacy.scss';

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
