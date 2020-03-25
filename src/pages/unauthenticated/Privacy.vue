<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <div class="grid--nav">
        <router-link
          v-for="item in navigation"
          :key="item.key"
          :to="item.route || '#'"
          class="font-h1 font-display text-h1 text-crisiscleanup-dark-500"
        >
          {{ lang.nav[item.key] }}
        </router-link>
      </div>
      <div class="grid--actions">
        <base-text
          font="display"
          variant="h2"
          :weight="300"
          class="text-crisiscleanup-dark-500"
          >{{ lang.relief_org }}</base-text
        >
        <base-button variant="solid" size="large">
          {{ lang.register }}
        </base-button>
      </div>
      <div class="grid--main">
        <div class="text-4xl">{{ $t('privacy.privacy_and_security_policy') }}</div>
              </div>
              <div class="row">
                <p v-html="privacy.purpose_intro"></p>
                <p v-html="privacy.must_accept"></p>
                <p v-html="privacy.check_for_changes"></p>
                
                <h3>1 {{ $t('privacy.highlights_and_principles') }}</h3>
                <p v-html="privacy.read_it_all"></p>
                <p v-html="privacy.shared_with_all_participants"></p>
                <p v-html="privacy.client_consent"></p>
                        
                <h3>2 {{ $t('privacy.definitions') }}</h3>
                <p v-html="privacy.definitions_intro"></p>
                <ol class="outline two">
                    <li v-html="privacy.def_npii"></li>
                    <li v-html="privacy.def_pii"></li>
                    <li v-html="privacy.def_org_info"></li>
                    <li v-html="privacy.def_pub_info"></li>
                    <li v-html="privacy.def_you"></li>
                    <li v-html="privacy.def_company"></li>
                    <li v-html="privacy.def_service"></li>
                    <li v-html="privacy.def_terms_conditions"></li>
                    <li v-html="privacy.def_your_materials"></li>           
                </ol>
                    
                <h3>3 {{ $t('privacy.children') }}</h3>
                <p v-html="privacy.not_for_under_13"></p>
            
                <h3>4 {{ $t('privacy.information_collected') }}</h3> 
                <ol class="outline four">
                  <li v-html="privacy.how_used_intro"></li>
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
                        <td>{{ $t('privacy.table_variety_questions_response') }}</td>
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
                  <p v-html="privacy.visitor_npii_collected"></p>
                  <p v-html="privacy.how_use_visitor_npii"></p>
                </li>
                <li><strong>{{ $t('privacy.web_cookies') }}</strong>
                  <p v-html="privacy.web_cookie_def"></p>
                  <p v-html="privacy.we_use_web_cookies"></p>
                </li>
                <li><strong>{{ $t('privacy.web_beacons') }}</strong>
                  <p v-html="privacy.web_beacon_def"></p>
                  <p v-html="privacy.how_to_kill_web_beacons"></p>
                </li>
              </ol>
                    
                <h3>5 {{ $t('privacy.other_disclosures') }}</h3>

                <p v-html="privacy.disclose_pii_when"></p>
                <ol class="outline five">
                    <li v-html="privacy.by_law_or_protect_rights"></li>
                    <li v-html="privacy.business_transfers"></li>
                    <li v-html="privacy.research_or_history"></li>
                    <li v-html="privacy.in_public_interest"></li>
                    <li v-html="privacy.other_purposes"></li>
                </ol>
                    
                <h3>6 {{ $t('privacy.ssl_encryption') }}</h3>
                <p v-html="privacy.we_use_ssl"></p>

                <h3>7 {{ $t('privacy.policy_changes') }}</h3>
                <ol class="outline seven">
                    <li v-html="privacy.how_we_update_policy"></li>
                    <li v-html="privacy.effective_date"></li>   
                </ol>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout from '@/layouts/Home';

export default {
  name: 'Privacy',
  components: { HomeLayout },
  data() {
    return {
        footer: {
          demo: this.$t('publicNav.demo'),
          contact: this.$t('publicNav.contact'),
          terms: this.$t('publicNav.terms'),
          privacy: this.$t('publicNav.privacy'),
        },
      },
    };
  },
};
</script>

<style scoped lang="scss">
  @import "../../assets/css/_terms-privacy.scss";

.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      'nav . main main main main'
      'nav . main main main main'
      'actions actions main main main main'
      '. . main main main main';
    overflow: auto;

    .grid {
      &--overlay {
        grid-row: 1 / span 5;
        grid-column: 1 / span 3;
      }
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
