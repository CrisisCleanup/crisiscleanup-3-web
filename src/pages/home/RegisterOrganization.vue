<template>
  <Home>
    <div class="grid--main m-10">
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
            <base-select
              :model-value="organization.incident"
              class="m-3"
              :options="incidents"
              searchable
              select-classes="bg-white h-12 mb-3 max-w-sm"
              item-key="id"
              label="name"
              :placeholder="$t('registerOrg.disaster')"
              @update:modelValue="updateOrganizationIncident"
            />
          </li>

          <li class="text-xl form-item">
            {{ $t('registerOrg.org_info') }}
            <div class="text-base w-3/5">
              {{ $t('registerOrg.use_local_org_name_msg') }}
            </div>
            <div class="flex flex-wrap">
              <OrganizationSearchInput
                size="large"
                class="form-field"
                allow-new
                required
                @selectedOrganization="
                  (organization) => {
                    $router.push(
                      `/request_access?organization=${organization.name}`,
                    );
                  }
                "
                @input="organization.name = $event"
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
            <base-input
              v-model="organization.where_are_you_working"
              text-area
              class="text-base w-4/5 placeholder-crisiscleanup-dark-200 outline-none my-3 p-2 resize-none"
              rows="4"
              :placeholder="$t('registerOrg.where_working')"
              required
            />
            <base-input
              v-model="organization.referral"
              text-area
              class="text-base w-4/5 placeholder-crisiscleanup-dark-200 outline-none my-3 p-2 resize-none"
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
            <div
              class="text-base w-3/5"
              v-html="$t('registerOrg.capability_explanation')"
            ></div>
            <CapabilityGrid
              class="text-sm mt-3"
              @updated="
                (matrix) => {
                  updatedOrganizationCapabilitiesMatrix = matrix;
                }
              "
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
              v-html="$t('registerOrg') ? $t('registerOrg.tos_priv_agree') : ''"
            ></div>
          </base-checkbox>
        </ol>
        <base-button
          size="large"
          class="px-5 py-2 m-1 self-center md:w-108 lg:w-108 m-auto mb-20 sm:w-full"
          variant="solid"
          :text="$t('actions.sign_up')"
          :alt="$t('actions.sign_up')"
          :action="register"
        />
      </form>
    </div>
    <template #register>
      <!-- Don't show register info & button on this page -->
      <span></span>
    </template>
  </Home>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { nextTick, reactive, toRefs } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Organization from '@/models/Organization';
import { getErrorMessage } from '@/utils/errors';
import OrganizationSearchInput from '@/components/OrganizationSearchInput.vue';
import Home from '@/layouts/Home.vue';
import CapabilityGrid from '@/components/CapabilityGrid.vue';
import useCapabilities from '@/hooks/useCapabilities';
import BaseInput from '@/components/BaseInput.vue';

export default defineComponent({
  name: 'Register',
  components: {
    BaseInput,
    Home,
    CapabilityGrid,
    OrganizationSearchInput,
  },

  setup() {
    const { t } = useI18n();
    const form = ref(null);
    const state = reactive({
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
        return { key, label: t(key) };
      }),
    });
    const $toasted = useToast();
    const { saveCapabilities } = useCapabilities();
    const router = useRouter();

    async function register() {
      const isValid = form.value.reportValidity();
      if (!isValid) {
        return;
      }

      try {
        const savedOrganization = await Organization.api().post(
          '/organizations',
          {
            ...state.organization,
            contact: { ...state.user },
          },
        );
        [state.organization] = savedOrganization.entities.organizations;
        await saveCapabilities(
          state.updatedOrganizationCapabilitiesMatrix,
          state.organizationCapabilities,
          state.organization,
          false,
        );
        $toasted.success(t('registerOrg.org_registration_success'), {
          duration: 7000,
        });
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
        return;
      }

      await router.push('/');
    }

    function updateOrganizationIncident(value) {
      nextTick(() => {
        state.organization.incident = value;
        state.organization = { ...state.organization };
      });
    }

    onMounted(async () => {
      const incidentsResponse = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/incidents_list?fields=id,name&limit=200&sort=-start_at`,
        {
          headers: {
            Authorization: null,
          },
        },
      );
      state.incidents = incidentsResponse.data.results;
    });

    return {
      ...toRefs(state),
      form,
      register,
      updateOrganizationIncident,
    };
  },
});
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

<style lang="scss">
.activities-checkbox a {
  @apply text-primary-dark;
  text-decoration: underline !important;
  &:hover {
    text-decoration: none;
  }
}
</style>
