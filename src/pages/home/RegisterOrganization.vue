<template>
  <HomeLayout>
    <template #grid-overlay v-if="$mq !== 'sm'">
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <home-nav />
      <home-actions />
      <div class="grid--main">
        <div class="text-4xl">{{ $t('registerOrg.register_org') }}</div>
        <div class="text-2xl w-3/4">
          {{ $t('registerOrg.please_create_profile') }}
        </div>
        <form
          ref="form"
          class="form w-full sm:w-4/5 mt-6"
          @submit.prevent="register"
        >
          <ol class="">
            <li class="text-xl form-item">
              {{ $t('registerOrg.choose_a_disaster') }}
              <form-select
                :value="organization.incident"
                class="m-3"
                :options="incidents"
                searchable
                select-classes="bg-white border border-crisiscleanup-dark-100 h-12 mb-3 max-w-sm"
                item-key="id"
                label="name"
                :placeholder="$t('registerOrg.disaster')"
                @input="updateOrganizationIncident"
              />
            </li>

            <li class="text-xl form-item">
              {{ $t('registerOrg.org_info') }}
              <div class="text-base w-3/5">
                {{ $t('registerOrg.use_local_org_name_msg') }}
              </div>
              <div class="flex flex-wrap">
                <OrganizationSearchInput
                  @selectedOrganization="
                    (organization) => {
                      $router.push(
                        `/request_access?organization=${organization.name}`,
                      );
                    }
                  "
                  @input="organization.name = $event"
                  size="large"
                  class="form-field"
                />
                <base-input
                  v-model="organization.url"
                  type="text"
                  class="form-field"
                  size="large"
                  :placeholder="$t('registerOrg.website')"
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
                v-model="organization.where_are_you_working"
                class="
                  text-base
                  w-4/5
                  border border-crisiscleanup-dark-100
                  placeholder-crisiscleanup-dark-200
                  outline-none
                  m-3
                  p-2
                  resize-none
                "
                rows="4"
                :placeholder="$t('registerOrg.where_working')"
                required
              />
              <textarea
                v-model="organization.referral"
                class="
                  text-base
                  w-4/5
                  border border-crisiscleanup-dark-100
                  placeholder-crisiscleanup-dark-200
                  outline-none
                  m-3
                  p-2
                  resize-none
                "
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
                  :validator="validatePhoneNumber"
                  :placeholder="$t('registerOrg.cell_phone_number')"
                  required
                />
              </div>
            </li>

            <li class="text-xl form-item">
              {{ $t('registerOrg.org_roles') }}
              <div class="text-base w-3/5">
                {{ $t('registerOrg.capability_explanation') }}
              </div>
              <capability
                @updated="
                  (matrix) => {
                    updatedOrganizationCapabilitiesMatrix = matrix;
                  }
                "
                class="text-sm mt-3"
              />
            </li>

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
              <div
                class="privacy"
                v-html="
                  $t('registerOrg') ? $t('registerOrg.tos_priv_agree') : ''
                "
              ></div>
            </base-checkbox>
          </ol>
          <base-button
            size="large"
            class="
              px-5
              py-2
              m-1
              self-center
              md:w-108
              lg:w-108
              m-auto
              mb-20
              sm:w-full
            "
            variant="solid"
            :text="$t('actions.sign_up')"
            :alt="$t('actions.sign_up')"
            :action="register"
          />
        </form>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import Organization from '@/models/Organization';
import HomeLayout, { HomeNav, HomeActions } from '@/layouts/Home';
import { getErrorMessage } from '@/utils/errors';
import OrganizationSearchInput from '@/components/OrganizationSearchInput';
import { CapabilityMixin, ValidateMixin } from '@/mixins';
import Capability from '@/pages/unauthenticated/Capability';

export default {
  name: 'Register',
  components: {
    Capability,
    HomeLayout,
    HomeNav,
    HomeActions,
    OrganizationSearchInput,
  },
  mixins: [ValidateMixin, CapabilityMixin],

  async mounted() {
    const incidentsResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/incidents_list?fields=id,name&limit=200&sort=-start_at`,
      {
        headers: {
          Authorization: null,
        },
      },
    );
    this.incidents = incidentsResponse.data.results;
  },

  data() {
    return {
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
      incidents: [],
      organizationCapabilities: [],
      updatedOrganizationCapabilitiesMatrix: null,
      selectedIncidentId: null,
      organizationTypes: [
        'orgType.survivor_client_services',
        'orgType.voad',
        'orgType.coad',
        'orgType.government',
        'orgType.ltr',
        'orgType.coalition',
      ].map((key) => {
        return { key, label: this.$t(key) };
      }),
    };
  },
  methods: {
    async register() {
      const isValid = this.$refs.form.reportValidity();
      if (!isValid) {
        return;
      }

      try {
        const savedOrganization = await Organization.api().post(
          '/organizations',
          {
            ...this.organization,
            contact: { ...this.user },
          },
        );
        [this.organization] = savedOrganization.entities.organizations;
        await this.saveCapabilities();
        this.$toasted.success(this.$t('registerOrg.org_registration_success'), {
          duration: 7000,
        });
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
        return;
      }
      await this.$router.push('/');
    },
    updateOrganizationIncident(value) {
      this.$nextTick(() => {
        this.organization.incident = value;
        this.organization = { ...this.organization };
      });
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
  @apply w-full sm:w-2/5 m-3;
}

.form-item {
  @apply py-3 ml-6;
}

.activities-checkbox {
  @apply pl-12 my-6;
}

@media only screen and (max-width: 640px) {
  .homegrid {
    height: 100vh;
    &.grid-container {
      grid-template-areas:
        'logo'
        'main'
        'survivors'
        'nav'
        'actions';
      grid-template-rows: 0.5fr 0.5fr 4fr 1fr;
    }
  }

  .form-field {
    @apply w-full;
  }
}
</style>

<style>
.privacy > a {
  @apply text-primary-dark;
  text-decoration: underline !important;
  &:hover {
    text-decoration: none;
  }
}
</style>
