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
        <div class="text-4xl">{{ $t('registerOrg.register_org') }}</div>
        <div class="text-2xl w-3/4">{{ $t('registerOrg.please_create_profile') }}</div>
        <form ref="form" class="form w-4/5 mt-6" @submit.prevent="register">
          <ol class="list-decimal">
            <li class="text-xl form-item">
              {{ $t('registerOrg.choose_a_disaster') }}
              <form-select
                :value="organization.incident"
                class="form-field"
                :options="incidents"
                searchable
                select-classes="bg-white border border-crisiscleanup-dark-100 h-12 mb-3"
                item-key="id"
                label="name"
                :placeholder="$t('registerOrg.disaster')"
                @input="organization.incident = $event"
              />
            </li>

            <li class="text-xl form-item">
              {{ $t('registerOrg.org_info') }}
              <div class="text-base w-3/5">{{ $t('registerOrg.use_local_org_name_msg') }}</div>
              <div class="flex flex-wrap">
                <base-input
                  v-model="organization.name"
                  type="text"
                  class="form-field"
                  size="large"
                  :placeholder="$t('registerOrg.organization_name')"
                  required
                />
                <base-input
                  v-model="organization.url"
                  type="text"
                  class="form-field"
                  size="large"
                  :placeholder="$t('registerOrg.website')"
                  required
                />
                <base-input
                  v-model="organization.facebook"
                  class="form-field"
                  size="large"
                  :placeholder="$t('registerOrg.facebook')"
                />
                <base-input
                  v-model="organization.twitter"
                  class="form-field"
                  size="large"
                  :placeholder="$t('registerOrg.twitter')"
                />
              </div>
              <textarea
                v-model="organization.referral"
                class="text-base w-4/5 border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none m-3 p-2 resize-none"
                rows="4"
                :placeholder="$t('registerOrg.referral')"
                required
              />
            </li>

            <li class="text-xl form-item">
              {{ $t('registerOrg.primary_contact') }}
              <div class="flex flex-wrap">
                <base-input
                  v-model="user.first_name"
                  type="text"
                  class="form-field"
                  size="large"
                  :placeholder="$t('registerOrg.first_name')"
                  required
                />
                <base-input
                  v-model="user.last_name"
                  type="text"
                  class="form-field"
                  size="large"
                  :placeholder="$t('registerOrg.last_name')"
                  required
                />
                <base-input
                  v-model="user.email"
                  type="email"
                  class="form-field"
                  size="large"
                  :placeholder="$t('registerOrg.email')"
                  required
                />
                <base-input
                  v-model="user.mobile"
                  class="form-field"
                  size="large"
                  :placeholder="$t('registerOrg.cell_phone_number')"
                  required
                />
              </div>
            </li>

            <li class="text-xl form-item">
              {{ $t('registerOrg.org_roles') }}
              <base-checkbox
                v-model="organization.review_other_organizations"
                class="text-base activities-checkbox"
              >
                <div>
                  {{ $t('registerOrg.review_approve') }}
                </div>
                <div>
                  {{ $t('registerOrg.review_approve_msg') }}
                </div>
              </base-checkbox>

              <base-checkbox
                v-model="organization.does_damage_assessment"
                class="text-base activities-checkbox"
              >
                <div>
                  {{ $t('registerOrg.damage_assessment') }}
                </div>
                <div>
                  {{ $t('registerOrg.damage_assessment_msg') }}
                </div>
              </base-checkbox>

              <base-checkbox
                v-model="organization.does_cleanup"
                class="text-base activities-checkbox"
              >
                <div>
                  {{ $t('registerOrg.cleanup') }}
                </div>
                <div>
                  {{ $t('registerOrg.cleanup_msg') }}
                </div>
              </base-checkbox>

              <base-checkbox
                v-model="organization.does_follow_up"
                class="text-base activities-checkbox"
              >
                <div>
                  {{ $t('registerOrg.follow_up') }}
                </div>
                <div>
                  {{ $t('registerOrg.follow_up_msg') }}
                </div>
              </base-checkbox>

              <base-checkbox
                v-model="organization.does_minor_repairs"
                class="text-base activities-checkbox"
              >
                <div>
                  {{ $t('registerOrg.minor_repairs') }}
                </div>
                <div>
                  {{ $t('registerOrg.minor_repairs_msg') }}
                </div>
              </base-checkbox>

              <base-checkbox
                v-model="organization.does_rebuilding"
                class="text-base activities-checkbox"
              >
                <div>
                  {{ $t('registerOrg.rebuilding') }}
                </div>
                <div>
                  {{ $t('registerOrg.rebuilding_msg') }}
                </div>
              </base-checkbox>

              <base-checkbox
                v-model="organization.does_coordination"
                class="text-base activities-checkbox"
              >
                <div>
                  {{ $t('registerOrg.coordination') }}
                </div>
                <div>
                  {{ $t('registerOrg.coordination_msg') }}
                </div>
              </base-checkbox>

              <base-checkbox
                v-model="organization.government"
                class="text-base activities-checkbox"
              >
                <div>
                  {{ $t('registerOrg.government') }}
                </div>
                <div>
                  {{ $t('registerOrg.government_msg') }}
                </div>
              </base-checkbox>

              <base-checkbox
                v-model="organization.does_other_activity"
                class="text-base activities-checkbox"
              >
                <div>
                  {{ $t('registerOrg.other_activity') }}
                </div>
                <div>
                  {{ $t('registerOrg.other_activity_msg') }}
                </div>
              </base-checkbox>

              <base-checkbox
                v-model="organization.not_an_org"
                class="text-base activities-checkbox"
              >
                <div>
                  {{ $t('registerOrg.not_organization') }}
                </div>
                <div>
                  {{ $t('registerOrg.not_organization_msg') }}
                </div>
              </base-checkbox>

              <textarea
                v-model="organization.where_are_you_working"
                class="text-base w-4/5 border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none m-3 p-2 resize-none"
                rows="4"
                :placeholder="$t('registerOrg.where_working')"
                required
              />

              <base-checkbox
                v-model="organization.publish"
                class="text-base activities-checkbox"
              >
                <div>
                  {{ $t('registerOrg.publish_profile') }}
                </div>
              </base-checkbox>

              <base-checkbox
                v-model="organization.accepted_terms"
                class="text-base activities-checkbox"
                required
              >
                <div v-html="registerOrg.tos_priv_agree" ></div>
              </base-checkbox>
            </li>
          </ol>
          <base-button
            size="large"
            class="px-5 py-2 m-1 flex-grow"
            variant="solid"
            :text="$t('actions.sign_up')"
            :action="register"
          />
        </form>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import Organization from '@/models/Organization';
import Incident from '@/models/Incident';
import HomeLayout from '@/layouts/Home';
import { getErrorMessage } from '../../utils/errors';
import { HomeNavigation } from '../Login';

export default {
  name: 'InvitationSignup',
  components: { HomeLayout },

  mounted() {
    Incident.api().get('/incidents', {
      dataKey: 'results',
    });
  },

  data() {
    return {
      lang: {
        register: this.$t('actions.register'),
        relief_org: this.$t('publicNav.relief_orgs_only'),
        nav: {
          home: this.$t('publicNav.home'),
          aboutUs: this.$t('publicNav.about_us'),
          blog: this.$t('publicNav.blog'),
          map: this.$t('publicNav.map'),
          training: this.$t('publicNav.training'),
          contact: this.$t('publicNav.contact'),
        },
        footer: {
          demo: this.$t('publicNav.demo'),
          contact: this.$t('publicNav.contact'),
          terms: this.$t('publicNav.terms'),
          privacy: this.$t('publicNav.privacy'),
        },
      },
      organization: {
        name: '',
        url: '',
        type_t: '',
        facebook: '',
        twitter: '',
        referral: '',
        publish: false,
        does_damage_assessment: false,
        does_intake_assessment: false,
        does_cleanup: false,
        does_follow_up: false,
        does_minor_repairs: false,
        does_rebuilding: false,
        does_coordination: false,
        government: false,
        does_other_activity: false,
        where_are_you_working: '',
        review_other_organizations: false,
        accepted_terms: false,
        not_an_org: false,
        incident: null,
      },
      user: {
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
      },
      selectedIncidentId: null,
      navigation: HomeNavigation,
      organizationTypes: [
        'orgType.voad',
        'orgType.coad',
        'orgType.government',
        'orgType.ltr',
        'orgType.cleanup',
      ].map(key => {
        return { key, label: this.$t(key) };
      }),
    };
  },
  computed: {
    incidents() {
      return Incident.query()
        .orderBy('id', 'desc')
        .get();
    },
  },
  methods: {
    async register() {
      const isValid = this.$refs.form.reportValidity();
      if (!isValid) {
        return;
      }

      try {
        await Organization.api().post('/organizations', {
          ...this.organization,
          contact: { ...this.user },
        });
        this.$toasted.success(
          this.$t(
            '~~Successfully registered organization. If your organization is approved, you will recieve an email with further instructions.',
          ),
          {
            duration: 7000,
          },
        );
        await this.$router.push('/');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
};
</script>

<style scoped lang="scss">
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
