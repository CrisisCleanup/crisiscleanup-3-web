<template>
  <div
    v-if="ready"
    class="bg-white flex flex-col flex-grow justify-between p-3"
  >
    <div class="flex-grow overflow-auto" style="height: 600px;">
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
              :key="organization.id"
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
        :action="updateWorksiteLocation"
      />
      <base-button
        v-else
        size="medium"
        variant="solid"
        class="m-1 text-black p-3 px-4 border-2 border-primary-light"
        :text="$t('actions.submit')"
        :action="flagWorksite"
      />
    </div>
  </div>
</template>

<script>
import User from '@/models/User';
import Worksite from '@/models/Worksite';
import OrganizationSearchInput from '@/components/OrganizationSearchInput';
import Incident from '@/models/Incident';
import { getGoogleMapsLocation } from '@/utils/map';
import GeocoderService from '@/services/geocoder.service';
import { What3wordsService } from '@/services/what3words.service';

export default {
  name: 'CaseFlag',
  components: { OrganizationSearchInput },
  data() {
    return {
      worksite: {},
      ready: false,
      selectedOrganizations: new Set(),
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
    incidents() {
      return Incident.query().orderBy('id', 'desc').get();
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
        await this.$router.replace(
          `/incident/${this.newIncident}/cases/${this.$route.params.id}`,
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
.user-popover {
  @apply bg-black text-white p-3 outline-none;
  width: 230px;
  left: 0.75rem !important;
  z-index: 100;
}
</style>

<style scoped>
.intake-view {
  height: 600px;
  overflow: scroll;
}
</style>
