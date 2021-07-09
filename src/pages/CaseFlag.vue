<template>
  <div
    v-if="ready"
    class="
      bg-white
      flex flex-col flex-grow
      justify-between
      p-3
      main-container
      w-full
    "
  >
    <div class="w-full overflow-auto">
      <form-select
        v-model="currentFlag.reason_t"
        :options="flagTypes"
        :placeholder="$t('flag.choose_problem')"
        select-classes="bg-white border w-full h-12"
        item-key="key"
        label="label"
      />
      <div v-if="currentFlag.reason_t === 'flag.worksite_high_priority'">
        <div class="my-3 py-5 border-t border-b">
          <base-checkbox
            v-model="currentFlag.is_high_priority"
            class="text-crisiscleanup-red-700"
          >
            {{ $t('flag.flag_high_priority') }}
          </base-checkbox>
        </div>
        <div>
          <p class="my-3">
            {{ $t('flag.please_describe_why_high_priority') }}
          </p>
          <textarea
            v-model="currentFlag.notes"
            rows="4"
            class="block w-full border outline-none"
          />

          <base-text variant="h2" class="py-2">
            {{ $t('flag.nearby_organizations') }}
          </base-text>
          <div>
            <span>
              <strong>{{
                $t('caseHistory.do_not_share_contact_warning')
              }}</strong
              >{{ $t('caseHistory.do_not_share_contact_explanation') }}
            </span>
          </div>
          <div
            v-for="organization in organizationsWithClaimsInArea"
            :key="`${organization.id}`"
          >
            <v-popover popover-class="contact-popover" placement="top-end">
              <span class="text-yellow-600 tooltip-target cursor-pointer">{{
                organization.name
              }}</span>
              <div slot="popover">
                <base-text
                  variant="h2"
                  v-if="organization.incident_primary_contacts.length"
                  >{{ $t('flag.incident_primary_contacts') }}</base-text
                >
                <div
                  v-for="contact in organization.incident_primary_contacts"
                  :key="contact.email"
                  class="pb-1"
                >
                  <div class="text-base">
                    {{ contact.first_name }} {{ contact.last_name }}
                  </div>
                  <div class="mt-2">
                    <font-awesome-icon icon="envelope" />
                    <a :href="`mailto:${contact.email}`" class="ml-1">{{
                      contact.email
                    }}</a>
                  </div>
                  <div v-if="contact.mobile">
                    <font-awesome-icon icon="phone" />
                    <a :href="`tel:${contact.mobile}`" class="ml-1">{{
                      contact.mobile
                    }}</a>
                  </div>
                </div>
                <base-text
                  variant="h2"
                  v-if="organization.primary_contacts.length"
                  >{{ $t('flag.primary_contacts') }}</base-text
                >
                <div
                  v-for="contact in organization.primary_contacts"
                  :key="contact.email"
                  class="pb-1"
                >
                  <div class="text-base">
                    {{ contact.first_name }} {{ contact.last_name }}
                  </div>
                  <div class="mt-2">
                    <font-awesome-icon icon="envelope" />
                    <a :href="`mailto:${contact.email}`" class="ml-1">{{
                      contact.email
                    }}</a>
                  </div>
                  <div v-if="contact.mobile">
                    <font-awesome-icon icon="phone" />
                    <a :href="`tel:${contact.mobile}`" class="ml-1">{{
                      contact.mobile
                    }}</a>
                  </div>
                </div>
              </div>
            </v-popover>
          </div>
        </div>
      </div>
      <div v-if="currentFlag.reason_t === 'flag.worksite_wrong_incident'">
        <div>
          <p class="my-3">
            {{ $t('flag.choose_correct_incident') }}
          </p>
          <form-select
            v-model="newIncident"
            :options="incidents"
            searchable
            select-classes="bg-white border w-full h-12 mb-3"
            item-key="id"
            label="name"
          />
          <base-checkbox
            v-model="incidentNotFound"
            class="text-crisiscleanup-red-700"
          >
            {{ $t('flag.incident_not_listed') }}
          </base-checkbox>
        </div>
      </div>
      <div v-if="currentFlag.reason_t === 'flag.worksite_wrong_location'">
        <div class="text-sm">
          <p class="mt-5 font-semibold">
            {{ $t('flag.move_case_pin') }}
          </p>
          <div>
            <ol class="mt-2 mb-5 list-decimal ml-4">
              <li>{{ $t('flag.find_correct_google_maps') }}</li>
              <li>{{ $t('flag.zoom_in_completely') }}</li>
              <li>{{ $t('flag.copy_paste_url') }}</li>
            </ol>
          </div>
          <base-input
            v-model="currentFlag.requested_action"
            :placeholder="$t('flag.google_map_url')"
          />
          <p class="mt-5 mb-3">
            {{ $t('flag.click_if_location_unknown') }}
          </p>
          <base-button
            class="text-white bg-black w-full p-2"
            :action="flagWorksite"
            :alt="$t('flag.location_unknown')"
            >{{ $t('flag.location_unknown') }}</base-button
          >
        </div>
      </div>
      <div v-if="currentFlag.reason_t === 'flag.worksite_upset_client'">
        <div class="border-b py-5">
          <p class="my-3">
            {{ $t('flag.explain_why_client_upset') }}
          </p>
          <textarea
            v-model="currentFlag.notes"
            rows="4"
            class="block w-full border outline-none"
          />
        </div>
        <div class="border-b py-5">
          <div>
            <p>{{ $t('flag.does_issue_involve_you') }}</p>
            <div class="flex mt-2">
              <base-radio
                class="mr-10"
                name="Yes"
                label="Yes"
                :value="radioValue"
                @change="radioValue = $event"
              />
              <base-radio
                class="mr-10"
                name="No"
                label="No"
                :value="radioValue"
                @change="radioValue = $event"
              />
            </div>
          </div>
        </div>
        <div class="py-5">
          <p class="mb-2">
            {{ $t('flag.please_share_other_orgs') }}
          </p>
          <OrganizationSearchInput
            size="large"
            @selectedOrganization="
              (value) => {
                selectedOrganizations = new Set(
                  selectedOrganizations.add(value),
                );
              }
            "
          />
          <div class="py-5">
            <div
              v-for="organization in selectedOrganizations"
              :key="`${organization.id}`"
            >
              {{ organization.name }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentFlag.reason_t === 'flag.worksite_abuse'">
        <div class="mt-8">
          <p class="my-3">
            {{ $t('flag.organizations_complaining_about') }}
          </p>
          <autocomplete
            icon="search"
            :suggestions="organizationResults"
            display-property="name"
            size="large"
            placeholder="Organizations"
            clear-on-selected
            @selected="
              (value) => {
                abusingOrganization = value;
              }
            "
            @search="onOrganizationSearch"
          />
          <p class="my-3">
            {{ $t('flag.must_contact_org_first') }}
          </p>
          <p class="my-3">{{ $t('flag.have_you_contacted_org') }}</p>
          <div class="flex mt-2">
            <base-radio
              class="mr-10"
              name="Yes"
              label="Yes"
              :value="radioValue"
              @change="radioValue = $event"
            />
            <base-radio
              class="mr-10"
              name="No"
              label="No"
              :value="radioValue"
              @change="radioValue = $event"
            />
          </div>
          <p class="my-3">
            {{ $t('flag.outcome_of_contact') }}
          </p>
          <textarea rows="4" class="block w-full border outline-none" />

          <p class="my-3">
            {{ $t('flag.describe_problem') }}
          </p>
          <textarea
            v-model="currentFlag.notes"
            rows="4"
            class="block w-full border outline-none"
          />

          <p class="my-3">{{ $t('flag.suggested_outcome') }}</p>
          <textarea
            v-model="currentFlag.requested_action"
            rows="4"
            class="block w-full border outline-none"
          />

          <p class="my-3">
            {{ $t('flag.warning_ccu_cannot_do_much') }}
          </p>
        </div>
      </div>
    </div>
    <div v-if="currentFlag.reason_t" class="flex justify-center items-center">
      <base-button
        size="medium"
        class="m-1 text-black p-3 px-4 border-2 border-black"
        :text="$t('actions.cancel')"
        :alt="$t('actions.cancel')"
        :action="
          () => {
            currentFlag.reason_t = null;
          }
        "
      />
      <base-button
        v-if="currentFlag.reason_t === 'flag.worksite_wrong_location'"
        size="medium"
        variant="solid"
        class="m-1 text-black p-3 px-4 border-2 border-primary-light"
        :text="$t('actions.update_location')"
        :alt="$t('actions.update_location')"
        :action="updateWorksiteLocation"
      />
      <base-button
        v-else
        size="medium"
        variant="solid"
        class="m-1 text-black p-3 px-4 border-2 border-primary-light"
        :text="$t('actions.submit')"
        :alt="$t('actions.submit')"
        :action="flagWorksite"
      />
    </div>
  </div>
</template>

<script>
import User from '@/models/User';
import Worksite from '@/models/Worksite';
import OrganizationSearchInput from '@/components/OrganizationSearchInput';
import Organization from '@/models/Organization';
import { getGoogleMapsLocation } from '@/utils/map';
import GeocoderService from '@/services/geocoder.service';
import { What3wordsService } from '@/services/what3words.service';
import { orderBy } from 'lodash';

export default {
  name: 'CaseFlag',
  components: { OrganizationSearchInput },
  data() {
    return {
      worksite: {},
      incidents: [],
      ready: false,
      selectedOrganizations: new Set(),
      organizationsWithClaimsInArea: [],
      abusingOrganization: null,
      currentFlag: {
        reason_t: null,
        is_high_priority: false,
        notes: '',
        requested_action: '',
      },
      flagType: null,
      radioValue: null,
      newIncident: null,
      incidentNotFound: false,
      flagTypes: [
        'flag.worksite_high_priority',
        'flag.worksite_upset_client',
        'flag.worksite_mark_for_deletion',
        'flag.worksite_abuse',
        'flag.duplicate',
        'flag.worksite_wrong_location',
        'flag.worksite_wrong_incident',
      ].map((key) => {
        return { key, label: this.$t(key) };
      }),
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  async mounted() {
    this.ready = false;
    try {
      await Worksite.api().fetch(
        this.$route.params.id,
        this.$route.params.incident_id,
      );
    } catch (e) {
      await this.$router.push(
        `/incident/${this.$route.params.incident_id}/cases/new`,
      );
    } finally {
      this.ready = true;
    }
    this.worksite = Worksite.find(this.$route.params.id);
    if (this.$route.query.showOnMap) {
      this.$emit('jumpToCase', this.$route.params.id);
    }
    const organizationResults = await Organization.api().get(
      `/organizations?nearby_claimed=${this.worksite.longitude},${this.worksite.latitude}`,
      {
        dataKey: 'results',
      },
    );
    this.organizationsWithClaimsInArea =
      organizationResults.entities.organizations;

    const response = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/incidents?fields=id,name,start_at&move_case=true&limit=200&ordering=-start_at`,
      {
        save: false,
      },
    );
    this.incidents = orderBy(response.data.results, ['id'], ['desc']);
  },
  methods: {
    async flagWorksite() {
      if (
        this.currentFlag.reason_t === 'flag.worksite_wrong_incident' &&
        this.newIncident
      ) {
        await Worksite.api().patch(`/worksites/${this.$route.params.id}`, {
          incident: this.newIncident,
          skip_duplicate_check: true,
        });
        await this.$toasted.success(this.$t('flag.case_moved_success'));
        this.$emit('reloadMap', this.$route.params.id);
        await this.$router.push(
          `/incident/${this.$route.params.incident_id}/cases/new`,
        );
        return;
      }

      await Worksite.api().addFlag(this.$route.params.id, this.currentFlag);
      await this.$router.push(
        `/incident/${this.$route.params.incident_id}/cases/${this.$route.params.id}`,
      );
    },
    updateWorksite(value, key) {
      Worksite.update({
        where: this.$route.params.id,
        data: {
          [key]: value,
        },
      });
      this.worksite = Worksite.find(this.$route.params.id);
    },
    async updateWorksiteLocation() {
      const latLng = getGoogleMapsLocation(this.currentFlag.requested_action);
      const geocode = await GeocoderService.getLocationDetails(latLng);
      const { lat, lng } = geocode.location;
      this.updateWorksite(
        {
          type: 'Point',
          coordinates: [lng, lat],
        },
        'location',
      );
      const what3words = await What3wordsService.getWords(lat, lng);
      const { location } = this.worksite;
      this.$emit('jumpToCase', this.$route.params.id);
      await Worksite.api().patch(`/worksites/${this.$route.params.id}`, {
        location,
        what3words,
        skip_duplicate_check: true,
      });
      this.$emit('reloadMap');
      await this.$router.push(
        `/incident/${this.$route.params.incident_id}/cases/${this.$route.params.id}`,
      );
    },
  },
};
</script>

<style>
.contact-popover {
  @apply bg-black text-white p-3 outline-none;
  width: 300px;
  left: 0.75rem !important;
  z-index: 1000;
  height: 200px;
  overflow: auto;
}

.main-container {
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: calc(100vh - 370px - var(--safe-area-inset-bottom)) 80px;
}
</style>

<style scoped>
.intake-view {
  height: 600px;
  overflow: auto;
}
</style>
