<template>
  <Home>
    <div class="grid--main m-10 sm:px-0">
      <h1 class="text-4xl" v-html="terms.terms_and_conditions"></h1>
      <div class="row mb-6">
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
            <li class="indent">
              <strong>3.9.1</strong> {{ $t('terms.tm_ccu_name') }}
            </li>
            <li class="indent">
              <strong>3.9.2</strong> {{ $t('terms.tm_ccu_logo') }}
            </li>
            <li class="indent">
              <strong>3.9.3</strong> {{ $t('terms.tm_ccu_other_marks') }}
            </li>
            <li class="indent">
              <strong>3.9.4</strong> {{ $t('terms.tm_no_other_company') }}
            </li>
          </ul>
        </ol>

        <h3>4. {{ $t('terms.your_acceptance') }}</h3>
        <ol class="outline four">
          <li v-html="terms.your_acceptance_intro"></li>
          <ul>
            <li class="indent">
              <strong>4.1.1</strong> {{ $t('terms.bound_by_tc') }}
            </li>
            <li class="indent" v-html="terms.comply_privacy_policy"></li>
            <li class="indent" v-html="terms.comply_other_policies"></li>
            <li class="indent">
              <strong>4.1.4 </strong> {{ $t('terms.accept_tc_updates') }}
            </li>
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
            <li class="indent">
              <strong>7.3.1</strong> {{ $t('terms.dmca_signature') }}
            </li>
            <li class="indent">
              <strong>7.3.2</strong> {{ $t('terms.dmca_description') }}
            </li>
            <li class="indent">
              <strong>7.3.3</strong> {{ $t('terms.dmca_location') }}
            </li>
            <li class="indent">
              <strong>7.3.4</strong> {{ $t('terms.dmca_your_contact_info') }}
            </li>
            <li class="indent">
              <strong>7.3.5</strong>
              {{ $t('terms.dmca_not_authorized_statement') }}
            </li>
            <li class="indent">
              <strong>7.3.6</strong> {{ $t('terms.dmca_statement_perjury') }}
            </li>
            <li class="indent">
              <strong>7.3.7</strong> {{ $t('terms.dmca_contact_us') }}
            </li>
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
          <li>
            <div v-html="terms.address_intro"></div>
            <br />
            Crisis Cleanup, LLC<br />
            Attn: Aaron Titus<br />
            5905 Blue Mountain Cir.<br />
            Longmont, CO 80503
          </li>

          <li v-html="terms.entire_agreement"></li>
          <li v-html="terms.updated"></li>
        </ol>
      </div>
    </div>
  </Home>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import Home from '@/layouts/Home.vue';

export default defineComponent({
  name: 'Terms',
  components: { Home },
  setup() {
    const { t } = useI18n();

    return {
      terms: {
        terms_and_conditions: t('terms.terms_and_conditions'),
        preamble: t('terms.preamble'),
        preamble_intro: t('terms.preamble_intro'),
        code_of_conduct: t('terms.code_of_conduct'),
        code_of_conduct_intro: t('terms.code_of_conduct_intro'),
        noncommercial_use: t('terms.noncommercial_use'),
        no_pii: t('terms.no_pii'),
        property_info_only: t('terms.property_info_only'),
        reputable_nonprofit: t('terms.reputable_nonprofit'),
        safeguard_password: t('terms.safeguard_password'),
        client_consent: t('terms.client_consent'),
        responsible_for_exported_data: t('terms.responsible_for_exported_data'),
        minimize_sharing: t('terms.minimize_sharing'),
        non_emergency_use: t('terms.non_emergency_use'),
        ccu_not_responsible_for_your_services: t(
          'terms.ccu_not_responsible_for_your_services',
        ),
        do_not_represent_ccu: t('terms.do_not_represent_ccu'),
        no_hacking: t('terms.no_hacking'),
        accept_sms: t('terms.accept_sms'),
        abide_by_tc: t('terms.abide_by_tc'),
        definitions: t('terms.definitions'),
        definitions_intro: t('terms.definitions_intro'),
        def_company: t('terms.def_company'),
        def_website: t('terms.def_website'),
        def_service: t('terms.def_service'),
        def_third_party_service: t('terms.def_third_party_service'),
        def_you: t('terms.def_you'),
        def_client: t('terms.def_client'),
        def_incident: t('terms.def_incident'),
        def_your_materials: t('terms.def_your_materials'),
        def_trademarks: t('terms.def_trademarks'),
        tm_ccu_name: t('terms.tm_ccu_name'),
        tm_ccu_logo: t('terms.tm_ccu_logo'),
        tm_ccu_other_marks: t('terms.tm_ccu_other_marks'),
        tm_no_other_company: t('terms.tm_no_other_company'),
        your_acceptance: t('terms.your_acceptance'),
        your_acceptance_intro: t('terms.your_acceptance_intro'),
        bound_by_tc: t('terms.bound_by_tc'),
        comply_privacy_policy: t('terms.comply_privacy_policy'),
        comply_other_policies: t('terms.comply_other_policies'),
        accept_tc_updates: t('terms.accept_tc_updates'),
        our_services: t('terms.our_services'),
        ccu_services_description: t('terms.ccu_services_description'),
        update_or_remove_functions: t('terms.update_or_remove_functions'),
        website_content: t('terms.website_content'),
        third_party_links: t('terms.third_party_links'),
        ip_rights: t('terms.ip_rights'),
        your_materials: t('terms.your_materials'),
        infringement: t('terms.infringement'),
        dmca_intro: t('terms.dmca_intro'),
        dmca_signature: t('terms.dmca_signature'),
        dmca_description: t('terms.dmca_description'),
        dmca_location: t('terms.dmca_location'),
        dmca_your_contact_info: t('terms.dmca_your_contact_info'),
        dmca_not_authorized_statement: t('terms.dmca_not_authorized_statement'),
        dmca_statement_perjury: t('terms.dmca_statement_perjury'),
        dmca_contact_us: t('terms.dmca_contact_us'),
        no_trademark_authorization: t('terms.no_trademark_authorization'),
        apache_license: t('terms.apache_license'),
        representations_warranties: t('terms.representations_warranties'),
        no_warranties: t('terms.no_warranties'),
        no_representations: t('terms.no_representations'),
        indemnification: t('terms.indemnification'),
        by_you: t('terms.by_you'),
        procedures: t('terms.procedures'),
        limitations_on_liability: t('terms.limitations_on_liability'),
        liability_limits: t('terms.liability_limits'),
        liability_disclaimer: t('terms.liability_disclaimer'),
        statute_of_limitations: t('terms.statute_of_limitations'),
        jurisdiction_consent: t('terms.jurisdiction_consent'),
        venue: t('terms.venue'),
        jurisdiction: t('terms.jurisdiction'),
        miscellaneous_provisions: t('terms.miscellaneous_provisions'),
        severability: t('terms.severability'),
        not_partners: t('terms.not_partners'),
        third_party_beneficiaries: t('terms.third_party_beneficiaries'),
        force_majeure: t('terms.force_majeure'),
        no_waiver: t('terms.no_waiver'),
        headings: t('terms.headings'),
        assignment: t('terms.assignment'),
        address_intro: t('terms.address_intro'),
        entire_agreement: t('terms.entire_agreement'),
        updated: t('terms.updated'),
      },
    };
  },
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
