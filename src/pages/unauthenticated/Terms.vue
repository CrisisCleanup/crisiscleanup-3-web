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
        <div class="text-4xl">{{ $t('terms.terms_and_conditions') }}</div>
              <h1 v-html="terms.terms_and_conditions"></h1>
              </div>
              <div class="row">
                <h3>1. {{ $t('terms.preamble') }}</h3>
                <p v-html="terms.preamble_intro"></p>

                <h3>2. {{ $t('terms.code_of_conduct') }}</h3>
                <p v-html="terms.code_of_conduct_intro"></p>
                <ul>
                    <li v-html="terms.noncommercial_use"></li>
                    <li v-html="terms.no_pii"></li>
                    <li v-html="terms.property_info_only"></li>
                    <li v-html="terms.reputable_nonprofit"></li>
                    <li v-html="terms.safeguard_password"></li>
                    <li v-html="terms.client_consent"></li>
                    <li v-html="terms.responsible_for_exported_data"></li>
                    <li v-html="terms.minimize_sharing"></li>
                    <li v-html="terms.non_emergency_use"></li>
                    <li v-html="terms.ccu_not_responsible_for_your_services"></li>
                    <li v-html="terms.do_not_represent_ccu"></li>
                    <li v-html="terms.no_hacking"></li>
                    <li v-html="terms.accept_sms"></li>
                    <li v-html="terms.abide_by_tc"></li>
                </ul>    
                
                <h3>3. {{ $t('terms.definitions') }}</h3>
                <p v-html="terms.definitions_intro"></p>
                <ol class="outline three">
                    <li v-html="terms.def_company"></li>
                    <li v-html="terms.def_website"></li>
                    <li v-html="terms.def_service"></li>
                    <li v-html="terms.def_third_party_service"></li>
                    <li v-html="terms.def_you"></li>
                    <li v-html="terms.def_client"></li>
                    <li v-html="terms.def_incident"></li>
                    <li v-html="terms.def_your_materials"></li>
                    <li v-html="terms.def_trademarks"></li>
                    <ul>
                        <li class="indent"><strong>3.9.1</strong> {{ $t('terms.tm_ccu_name') }}</li>
                        <li class="indent"><strong>3.9.2</strong> {{ $t('terms.tm_ccu_logo') }}</li>
                        <li class="indent"><strong>3.9.3</strong> {{ $t('terms.tm_ccu_other_marks') }}</li>
                        <li class="indent"><strong>3.9.4</strong> {{ $t('terms.tm_no_other_company') }}</li>
                    </ul>
                </ol>
                    
                <h3>4. {{ $t('terms.your_acceptance') }}</h3>
                <ol class="outline four">
                    <li v-html="terms.your_acceptance_intro"></li>
                    <ul>
                        <li class="indent"><strong>4.1.1</strong> {{ $t('terms.bound_by_tc') }}</li>
                        <li class="indent" v-html="terms.comply_privacy_policy"></li>
                        <li class="indent" v-html="terms.comply_other_policies"></li>
                        <li class="indent"><strong>4.1.4 </strong> {{ $t('terms.accept_tc_updates') }}</li>
                    </ul>
                </ol> 
                    
                <h3>5. {{ $t('terms.our_services') }}</h3>
                <ol class="outline five">
                    <li v-html="terms.ccu_services_description"></li>
                    <li v-html="terms.update_or_remove_functions"></li>
                </ol>    
                
                <h3>6. {{ $t('terms.website_content') }}</h3>
                <ol class="outline six">
                    <li v-html="terms.third_party_links"></li>
                </ol>
                
                <h3>7. {{ $t('terms.ip_rights') }}</h3>
                <ol class="outline seven">
                    <li v-html="terms.your_materials"></li>
                    <li v-html="terms.infringement"></li>
                    <li v-html="terms.dmca_intro"></li>
                    <ul>
                        <li class="indent"><strong>7.3.1</strong> {{ $t('terms.dmca_signature') }}</li>
                        <li class="indent"><strong>7.3.2</strong> {{ $t('terms.dmca_description') }}</li>
                        <li class="indent"><strong>7.3.3</strong> {{ $t('terms.dmca_location') }}</li>
                        <li class="indent"><strong>7.3.4</strong> {{ $t('terms.dmca_your_contact_info') }}</li>
                        <li class="indent"><strong>7.3.5</strong> {{ $t('terms.dmca_not_authorized_statement') }}</li>
                        <li class="indent"><strong>7.3.6</strong> {{ $t('terms.dmca_statement_perjury') }}</li>
                        <li class="indent"><strong>7.3.7</strong> {{ $t('terms.dmca_contact_us') }}</li>
                    </ul>
                    <li v-html="terms.no_trademark_authorization"></li>
                    <li v-html="terms.apache_license"></li>
                </ol>      
                    
                <h3>8. {{ $t('terms.representations_warranties') }}</h3>
                <ol class="outline eight">
                    <li v-html="terms.no_warranties"></li>
                    <li v-html="terms.no_representations"></li>
                </ol>  
                    
                <h3>9. {{ $t('terms.indemnification') }}</h3>
                <ol class="outline nine">
                    <li v-html="terms.by_you"></li>
                    <li v-html="terms.procedures"></li>
                </ol>          
                    
                <h3>10. {{ $t('terms.limitations_on_liability') }}</h3>
                <ol class="outline ten">
                    <li v-html="terms.liability_limits"></li>
                    <li v-html="terms.liability_disclaimer"></li>
                    <li v-html="terms.statute_of_limitations"></li>
                </ol>    
                    
                <h3>11. {{ $t('terms.jurisdiction_consent') }}</h3>
                <ol class="outline eleven">
                    <li v-html="terms.venue"></li>
                    <li v-html="terms.jurisdiction"></li>
                </ol>

                <h3>12. {{ $t('terms.miscellaneous_provisions') }}</h3>            
                <ol class="outline twelve">
                    <li v-html="terms.severability"></li>
                    <li v-html="terms.not_partners"></li>
                    <li v-html="terms.third_party_beneficiaries"></li>
                    <li v-html="terms.force_majeure"></li>
                    <li v-html="terms.no_waiver"></li>
                    <li v-html="terms.headings"></li>
                    <li v-html="terms.assignment"></li>
                    <li v-html="terms.address_intro"><br />
                        Crisis Cleanup, LLC<br />
                        Attn: Aaron Titus<br />
                        5905 Blue Mountain Cir.<br />
                        Longmont, CO 80503
                    <li v-html="terms.entire_agreement"></li>
                    <li v-html="terms.updated"></li>
                  </ol> 
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout from '@/layouts/Home';

export default {
  name: 'Terms',
  components: { HomeLayout },
  data() {
    return {
        terms: {
          terms_and_conditions: this.$t('terms.terms_and_conditions'),
          preamble: this.$t('terms.preamble'),
          preamble_intro: this.$t('terms.preamble_intro'),
          code_of_conduct: this.$t('terms.code_of_conduct'),
          code_of_conduct_intro: this.$t('terms.code_of_conduct_intro'),
          noncommercial_use: this.$t('terms.noncommercial_use'),
          no_pii: this.$t('terms.no_pii'),
          property_info_only: this.$t('terms.property_info_only'),
          reputable_nonprofit: this.$t('terms.reputable_nonprofit'),
          safeguard_password: this.$t('terms.safeguard_password'),
          client_consent: this.$t('terms.client_consent'),
          responsible_for_exported_data: this.$t('terms.responsible_for_exported_data'),
          minimize_sharing: this.$t('terms.minimize_sharing'),
          non_emergency_use: this.$t('terms.non_emergency_use'),
          ccu_not_responsible_for_your_services: this.$t('terms.ccu_not_responsible_for_your_services'),
          do_not_represent_ccu: this.$t('terms.do_not_represent_ccu'),
          no_hacking: this.$t('terms.no_hacking'),
          accept_sms: this.$t('terms.accept_sms'),
          abide_by_tc: this.$t('terms.abide_by_tc'),
          definitions: this.$t('terms.definitions'),
          definitions_intro: this.$t('terms.definitions_intro'),
          def_company: this.$t('terms.def_company'),
          def_website: this.$t('terms.def_website'),
          def_service: this.$t('terms.def_service'),
          def_third_party_service: this.$t('terms.def_third_party_service'),
          def_you: this.$t('terms.def_you'),
          def_client: this.$t('terms.def_client'),
          def_incident: this.$t('terms.def_incident'),
          def_your_materials: this.$t('terms.def_your_materials'),
          def_trademarks: this.$t('terms.def_trademarks'),
          tm_ccu_name: this.$t('terms.tm_ccu_name'),
          tm_ccu_logo: this.$t('terms.tm_ccu_logo'),
          tm_ccu_other_marks: this.$t('terms.tm_ccu_other_marks'),
          tm_no_other_company: this.$t('terms.tm_no_other_company'),
          your_acceptance: this.$t('terms.your_acceptance'),
          your_acceptance_intro: this.$t('terms.your_acceptance_intro'),
          bound_by_tc: this.$t('terms.bound_by_tc'),
          comply_privacy_policy: this.$t('terms.comply_privacy_policy'),
          comply_other_policies: this.$t('terms.comply_other_policies'),
          accept_tc_updates: this.$t('terms.accept_tc_updates'),
          our_services: this.$t('terms.our_services'),
          ccu_services_description: this.$t('terms.ccu_services_description'),
          update_or_remove_functions: this.$t('terms.update_or_remove_functions'),
          website_content: this.$t('terms.website_content'),
          third_party_links: this.$t('terms.third_party_links'),
          ip_rights: this.$t('terms.ip_rights'),
          your_materials: this.$t('terms.your_materials'),
          infringement: this.$t('terms.infringement'),
          dmca_intro: this.$t('terms.dmca_intro'),
          dmca_signature: this.$t('terms.dmca_signature'),
          dmca_description: this.$t('terms.dmca_description'),
          dmca_location: this.$t('terms.dmca_location'),
          dmca_your_contact_info: this.$t('terms.dmca_your_contact_info'),
          dmca_not_authorized_statement: this.$t('terms.dmca_not_authorized_statement'),
          dmca_statement_perjury: this.$t('terms.dmca_statement_perjury'),
          dmca_contact_us: this.$t('terms.dmca_contact_us'),
          no_trademark_authorization: this.$t('terms.no_trademark_authorization'),
          apache_license: this.$t('terms.apache_license'),
          representations_warranties: this.$t('terms.representations_warranties'),
          no_warranties: this.$t('terms.no_warranties'),
          no_representations: this.$t('terms.no_representations'),
          indemnification: this.$t('terms.indemnification'),
          by_you: this.$t('terms.by_you'),
          procedures: this.$t('terms.procedures'),
          limitations_on_liability: this.$t('terms.limitations_on_liability'),
          liability_limits: this.$t('terms.liability_limits'),
          liability_disclaimer: this.$t('terms.liability_disclaimer'),
          statute_of_limitations: this.$t('terms.statute_of_limitations'),
          jurisdiction_consent: this.$t('terms.jurisdiction_consent'),
          venue: this.$t('terms.venue'),
          jurisdiction: this.$t('terms.jurisdiction'),
          miscellaneous_provisions: this.$t('terms.miscellaneous_provisions'),
          severability: this.$t('terms.severability'),
          not_partners: this.$t('terms.not_partners'),
          third_party_beneficiaries: this.$t('terms.third_party_beneficiaries'),
          force_majeure: this.$t('terms.force_majeure'),
          no_waiver: this.$t('terms.no_waiver'),
          headings: this.$t('terms.headings'),
          assignment: this.$t('terms.assignment'),
          address_intro: this.$t('terms.address_intro'),
          entire_agreement: this.$t('terms.entire_agreement'),
          updated: this.$t('terms.updated')
        },
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
