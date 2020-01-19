<template>
  <div
    v-if="ready"
    class="bg-white flex flex-col flex-grow justify-between p-3"
  >
    <div class="flex-grow overflow-auto" style="height: 600px">
      <form-select
        v-model="currentFlag.reason_t"
        :options="flagTypes"
        :placeholder="$t('~~Choose Problem')"
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
            {{ $t('~~Flag as high priority') }}
          </base-checkbox>
        </div>
        <div>
          <p class="my-3">
            {{
              $t(
                '~~Please describe why this client needs urgent or immediate help',
              )
            }}
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
            {{ $t('~~Choose correct incident') }}
          </p>
          <form-select
            v-model="currentFlag.requested_action"
            :options="incidents"
            searchable
            select-classes="bg-white border w-full h-12 mb-3"
            item-key="id"
            label="name"
          />
          <base-checkbox
            v-model="currentFlag.notes"
            class="text-crisiscleanup-red-700"
          >
            {{ $t("~~Incident that I'm looking for is not listed") }}
          </base-checkbox>
        </div>
      </div>
      <div v-if="currentFlag.reason_t === 'flag.worksite_wrong_location'">
        <div class="text-sm">
          <p class="mt-5 font-semibold">
            {{ $t('~~Move Worksite Pin') }}
          </p>
          <div>
            <ol class="mt-2 mb-5 list-decimal ml-4">
              <li>{{ $t('~~Find the correct location on Google Maps') }}</li>
              <li>{{ $t('~~Zoom all the way in') }}</li>
              <li>{{ $t('~~Copy the URL and paste it here') }}</li>
            </ol>
          </div>
          <base-input
            v-model="currentFlag.requested_action"
            :placeholder="$t('Google Map URL')"
          />
          <p class="mt-5 mb-3">
            {{
              $t(
                '~~If you do not know the correct location, click Location Unknown',
              )
            }}
          </p>
          <base-button class="text-white bg-black w-full p-2">{{
            $t('~~Location Unknown')
          }}</base-button>
        </div>
      </div>
      <div v-if="currentFlag.reason_t === 'flag.worksite_upset_client'">
        <div class="border-b py-5">
          <p class="my-3">
            {{
              $t(
                '~~Please explain why the client is upset. Some reasons might be missed expectations, slow service, bad behaviour from a relief organization, etc.',
              )
            }}
          </p>
          <textarea
            v-model="currentFlag.notes"
            rows="4"
            class="block w-full border outline-none"
          />
        </div>
        <div class="border-b py-5">
          <div>
            <p>{{ $t('~~Does this issue involve your organization?') }}</p>
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
            {{
              $t(
                '~~If other organizations are involved, please indicate which ones',
              )
            }}
          </p>
          <autocomplete
            icon="search"
            :suggestions="organizationResults"
            display-property="name"
            size="large"
            placeholder="Organizations"
            clear-on-selected
            @selected="
              value => {
                selectedOrganizations = new Set(
                  selectedOrganizations.add(value),
                );
              }
            "
            @search="onOrganizationSearch"
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
            {{ $t('~~Which organization are you complaining about') }}
          </p>
          <autocomplete
            icon="search"
            :suggestions="organizationResults"
            display-property="name"
            size="large"
            placeholder="Organizations"
            clear-on-selected
            @selected="
              value => {
                abusingOrganization = value;
              }
            "
            @search="onOrganizationSearch"
          />
          <p class="my-3">
            {{
              $t(
                '~~If another organization is behaving poorly, you must contact the organization first, prior to flagging them. View contact information by clicking "Other Organizations"',
              )
            }}
          </p>
          <p class="my-3">{{ $t('~~Have you contacted the organization?') }}</p>
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
            {{ $t('~~What was the outcome of that contact?') }}
          </p>
          <textarea rows="4" class="block w-full border outline-none" />

          <p class="my-3">
            {{
              $t(
                '~~Please describe the problem. Be as specific as possible. Give names, locations, specific examples, or any other evidence that supports your complaint',
              )
            }}
          </p>
          <textarea
            v-model="currentFlag.notes"
            rows="4"
            class="block w-full border outline-none"
          />

          <p class="my-3">{{ $t('~~What do you think should be done?') }}</p>
          <textarea
            v-model="currentFlag.requested_action"
            rows="4"
            class="block w-full border outline-none"
          />

          <p class="my-3">
            {{
              $t(
                '~~Please remember that 95% of most issues are best solved between you and the organization directly, or your local VOAD. Crisis Cleanup can only take action if an organization is violating the Crisis Cleanup terms of service, and cannot force anyone to do anything.',
              )
            }}
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
        type="primary"
        class="m-1 text-black p-3 px-4 border-2 border-primary-light"
        :text="$t('actions.update_location')"
        :action="updateWorksiteLocation"
      />
      <base-button
        v-else
        size="medium"
        type="primary"
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
import Organization from '@/models/Organization';
import Incident from '@/models/Incident';
import { getGoogleMapsLocation } from '@/utils/map';
import GeocoderService from '@/services/geocoder.service';
import { What3wordsService } from '@/services/what3words.service';

export default {
  name: 'CaseFlag',
  data() {
    return {
      worksite: {},
      ready: false,
      organizationResults: [],
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
      flagTypes: [
        'flag.worksite_high_priority',
        'flag.worksite_upset_client',
        'flag.worksite_mark_for_deletion',
        'flag.worksite_abuse',
        'flag.duplicate',
        'flag.worksite_wrong_location',
        'flag.worksite_wrong_incident',
      ].map(key => {
        return { key, label: this.$t(key) };
      }),
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    incidents() {
      return Incident.query()
        .orderBy('id', 'desc')
        .get();
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
    async onOrganizationSearch(value) {
      const results = await Organization.api().get(
        `/organizations?search=${value}&limit=10&fields=id,name`,
        {
          dataKey: 'results',
        },
      );
      this.organizationResults = results.entities.organizations;
    },
    async flagWorksite() {
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
      const geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
      const latLng = getGoogleMapsLocation(this.currentFlag.requested_action);
      const geocode = await GeocoderService.getLocationDetails(latLng);
      geocodeKeys.forEach(key =>
        this.updateWorksite(geocode.address_components[key], key),
      );
      const { lat, lng } = geocode.location;
      this.updateWorksite(
        {
          type: 'Point',
          coordinates: [lng, lat],
        },
        'location',
      );
      const what3words = await What3wordsService.getWords(lat, lng);
      await this.flagWorksite();
      const {
        address,
        city,
        county,
        state,
        postal_code,
        location,
      } = this.worksite;
      await Worksite.api().patch(`/worksites/${this.$route.params.id}`, {
        address,
        city,
        county,
        state,
        postal_code,
        location,
        what3words,
        skip_duplicate_check: true,
      });
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
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.intake-view::-webkit-scrollbar {
  /* WebKit */
  width: 0;
  height: 0;
}
</style>
