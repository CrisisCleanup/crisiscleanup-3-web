<template>
  <Home>
    <div class="grid--main m-10">
      <div class="text-4xl mb-5">
        {{ $t('contrib.ccu_contributor_agreements') }}
      </div>
      <div class="row mb-6">
        <base-text
          v-html="$t('contrib.ccu_uses_agreements_for_contributions')"
        />
        <base-text v-html="$t('contrib.purpose_goals_of_agreements')" />
        <base-text variant="h3">{{
          $t('contrib.contributor_license_agreements')
        }}</base-text>
        <ul>
          <li>
            <a class="doc-link" href="/icla.pdf" target="_blank">{{
              $t('contrib.icla')
            }}</a>
          </li>
          <li>
            <a class="doc-link" href="/ccla.pdf" target="_blank">{{
              $t('contrib.ccla')
            }}</a>
          </li>
        </ul>
        <base-text v-html="$t('contrib.everyone_should_sign_cla')" />
        <base-text v-html="$t('contrib.purpose_of_cla')" />
        <base-text v-html="$t('contrib.corporations_sign_ccla')" />
        <base-text v-html="$t('contrib.developers_sign_icla_even_with_ccla')" />
        <base-text v-html="$t('contrib.someone_with_authority_signs_ccla')" />
        <base-text v-html="$t('contrib.icla_independent_of_employer')" />
        <base-text variant="h3">{{
          $t('contrib.software_license_grant')
        }}</base-text>
        <ul>
          <li>
            <a class="doc-link" href="/sgla.pdf" target="_blank">{{
              $t('contrib.sgla')
            }}</a>
          </li>
        </ul>
        <base-text v-html="$t('contrib.sgla_required_for_code_donation')" />
        <base-text variant="h3">{{ $t('contrib.how_to_submit') }}</base-text>
        <base-text v-html="$t('contrib.must_be_emailed')" />
        <base-text v-html="$t('contrib.complete_scan_all_pages_then_email')" />
        <base-text v-html="$t('contrib.please_use_email_in_doc')" />
        <base-text v-html="$t('contrib.attachments_only_no_links')" />
        <base-text v-html="$t('contrib.define_signing')" />
      </div>
    </div>
  </Home>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import Home from '@/layouts/Home.vue';

export default defineComponent({
  name: 'Contributions',
  components: { Home },
  setup() {
    const { t } = useI18n();

    const contrib = {
      title: t('nav.contributions'),
      subtitle1_intro: t('nav.contributions'),
    };

    return {
      contrib,
    };
  },
});
</script>

<style scoped>
@import '../../assets/css/_terms-privacy.scss';
.doc-link {
  @apply text-base;
}
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
</style>
