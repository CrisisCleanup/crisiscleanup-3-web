<template>
  <div class="h-full overflow-auto main">
    <div class="logo flex justify-center p-3 border border-b">
      <img src="@/assets/ccu-logo-black-500w.png" style="height: 53px" />
    </div>
    <section class="main p-5" v-if="survivorToken">
      <div class="text-2xl text-center mb-3 font-bold">
        Case Number: {{ survivorToken.worksite.case_number }}
      </div>
      <div class="text-lg mb-1">Hi {{ survivorToken.worksite.name }},</div>
      <div class="text-lg">{{ $t(survivorToken.survivor_message) }}</div>
      <div>
        <div class="text-lg font-bold my-2">
          {{ $t('~~Let us know if you still need help') }}
        </div>
        <div class="flex flex-col mt-2">
          <base-radio
            class="mb-3 border pt-2 pb-4 px-2"
            :class="[
              survivorToken.status_t === 'survivorContact.help_needed'
                ? 'bg-primary-light border-primary-light bg-opacity-25'
                : '',
            ]"
            label-class="pt-1 text-xl"
            label="survivorContact.help_needed"
            :name="$t('~~I still need help')"
            :value="survivorToken.status_t"
            @change="survivorToken.status_t = $event"
          />
          <base-radio
            class="mb-3 border pt-2 pb-4 px-2"
            :class="[
              survivorToken.status_t === 'survivorContact.help_not_needed'
                ? 'bg-primary-light border-primary-light bg-opacity-25'
                : '',
            ]"
            label-class="pt-1 text-xl"
            label="survivorContact.help_not_needed"
            :name="$t('~~I do not need help')"
            :value="survivorToken.status_t"
            @change="survivorToken.status_t = $event"
          />
          <base-radio
            class="mb-3 border pt-2 pb-4 px-2"
            :class="[
              survivorToken.status_t === 'survivorContact.already_helped'
                ? 'bg-primary-light border-primary-light bg-opacity-25'
                : '',
            ]"
            label-class="pt-1 text-xl"
            label="survivorContact.already_helped"
            :name="$t('~~Someone already helped me')"
            :value="survivorToken.status_t"
            @change="survivorToken.status_t = $event"
          />
          <base-radio
            class="mb-3 border pt-2 pb-4 px-2"
            :class="[
              survivorToken.status_t ===
              'survivorContact.already_helped_help_needed'
                ? 'bg-primary-light border-primary-light bg-opacity-25'
                : '',
            ]"
            label-class="pt-1 text-xl"
            label="survivorContact.already_helped_help_needed"
            :name="$t('~~Someone already helped me, but I need more help')"
            :value="survivorToken.status_t"
            @change="survivorToken.status_t = $event"
          />
          <div
            v-if="
              survivorToken.work_types &&
              closedWorkTypes.length === survivorToken.work_types.length &&
              [
                'survivorContact.already_helped_help_needed',
                'survivorContact.help_needed',
              ].includes(survivorToken.status_t)
            "
          >
            <div class="p-3">
              <div class="my-2">
                {{ $t('~~What do you need help with?') }}
              </div>
              <base-checkbox
                v-for="work_type_help_needed in survivorToken.work_types"
                class="mb-3"
                :value="workTypeHelpNeeded.has(work_type_help_needed.id)"
                :key="work_type_help_needed.id"
                @input="
                  (value) => {
                    updateWorkTypesHelpNeeded(value, work_type_help_needed);
                  }
                "
              >
                <div class="flex items-center">
                  <div
                    class="svg-container mr-3"
                    v-html="getWorkTypeImage(work_type_help_needed)"
                  ></div>
                  <span class="text-sm">{{
                    work_type_help_needed.work_type | getWorkTypeName
                  }}</span>
                </div>
              </base-checkbox>
            </div>
          </div>
        </div>
      </div>
      <hr class="my-4" />

      <div class="pt-2" v-if="!survivorToken.address_confirmed_at">
        <div>
          <div class="text-lg my-2 font-bold">
            {{ $t('~~Check your property location') }}
          </div>
          <div
            v-if="addressSet"
            class="
              rounded-lg
              shadow-lg
              p-5
              border
              flex
              justify-between
              items-center
            "
          >
            <div class="flex items-start">
              <ccu-icon
                type="pin"
                class="mr-1"
                size="small"
                style="margin-top: 3px"
                :alt="$t('~~Location')"
              />
              <span v-html="worksiteAddress"></span>
            </div>
            <div class="flex">
              <ccu-icon
                :fa="true"
                type="check"
                size="small"
                class="mx-3"
                :alt="$t('~~Confirm address')"
                @click.native="confirmAddress"
              />
              <ccu-icon
                type="edit"
                size="small"
                class="mx-1"
                :alt="$t('~~Edit address')"
                @click.native="unlockLocationFields"
              />
            </div>
          </div>
          <WorksiteSearchInput
            v-else
            :value="survivorToken.worksite.address"
            selector="js-worksite-address"
            :suggestions="[
              {
                name: 'geocoder',
                data: geocoderResults || [],
                key: 'description',
              },
            ]"
            @clearSuggestions="
              () => {
                geocoderResults = [];
              }
            "
            display-property="description"
            :placeholder="$t('~~Full Address')"
            size="large"
            @input="() => {}"
            @selectedGeocode="onGeocodeSelect"
            @search="geocoderSearch"
          />
        </div>
        <base-button
          type="bare"
          icon="street-view"
          class="text-gray-700 pt-3 w-full p-5 mt-5 border text-2xl"
          :action="locateMe"
          :text="$t('caseForm.use_my_location')"
        />
        <LocationViewer
          :location="survivorToken.worksite.location"
          :key="JSON.stringify(survivorToken.worksite.location)"
          class="h-84 mt-4 w-full"
          @updatedLocation="(latLng) => geocodeWorksite(latLng.lat, latLng.lng)"
        />
      </div>

      <div v-else class="pt-2">
        <div
          class="
            rounded-lg
            shadow-lg
            p-5
            border
            flex
            justify-center
            items-center
            bg-crisiscleanup-green-600
            text-white
          "
        >
          <ccu-icon
            type="privacy"
            class="mr-2"
            size="small"
            style="margin-top: 3px"
            :alt="$t('~~Address Confirmed')"
          />
          {{ $t('~~Address Confirmed') }}
        </div>
      </div>

      <hr class="my-4" />

      <div>
        <div class="text-lg my-2 font-bold">
          {{ $t('~~Please upload pictures of damage to your property') }}
        </div>
        <WorksiteImageSection
          :worksite="survivorToken"
          :key="JSON.stringify(survivorToken)"
          :is-survivor-token="true"
          @photosChanged="() => getSurvivorToken(true)"
        />
      </div>
      <hr class="my-4" />

      <div>
        <div class="text-lg my-2 font-bold">
          {{ $t('~~How often can we ask to update your status') }}
        </div>
        <div class="w-full flex text-center text-lg">
          <div
            class="w-1/3 border-t border-b border-r rounded-l-xl p-3"
            :class="
              survivorToken.worksite.auto_contact_frequency_t ===
              'formOptions.often'
                ? 'bg-primary-light'
                : ''
            "
            @click="
              survivorToken.worksite.auto_contact_frequency_t =
                'formOptions.often'
            "
          >
            {{ $t('~~formOptions.often') }}
          </div>
          <div
            class="w-1/3 border-t border-b border-r p-3"
            :class="
              survivorToken.worksite.auto_contact_frequency_t ===
              'formOptions.not_often'
                ? 'bg-primary-light'
                : ''
            "
            @click="
              survivorToken.worksite.auto_contact_frequency_t =
                'formOptions.not_often'
            "
          >
            {{ $t('formOptions.not_often') }}
          </div>
          <div
            class="w-1/3 border rounded-r-xl p-3"
            :class="
              survivorToken.worksite.auto_contact_frequency_t ===
              'formOptions.never'
                ? 'bg-primary-light'
                : ''
            "
            @click="
              survivorToken.worksite.auto_contact_frequency_t =
                'formOptions.never'
            "
          >
            {{ $t('formOptions.never') }}
          </div>
        </div>
        <div class="text-lg mt-2">
          {{
            $t(
              '~~In the beginning, we may ask you for an update every day. After a week or so, that will decrease to every other day, and then down to once a week. We will stop asking once most of the volunteers go home, which is typically 3-5 weeks after the disaster.',
            )
          }}
        </div>
      </div>
      <hr class="my-4" />

      <div>
        <div class="text-lg my-2 font-bold">
          {{
            $t(
              '~~Please share any details you would like volunteers to know about your situation. Please do not include sensitive personal information, such as social security numbers or health information.',
            )
          }}
        </div>

        <WorksiteNotes
          :can-add="false"
          :worksite="survivorToken"
          v-if="survivorToken.notes.length > 0"
        />

        <textarea
          v-model="currentNote"
          rows="5"
          class="
            text-base
            border border-crisiscleanup-dark-100
            placeholder-crisiscleanup-dark-200
            outline-none
            p-2
            my-2
            resize-none
            w-full
          "
          :placeholder="$t('phoneDashboard.notes')"
          required
        ></textarea>
      </div>

      <base-checkbox
        v-model="survivorToken.accept_terms"
        class="block my-1 text-xl"
        v-if="!survivorToken.tos_accepted_at"
      >
        <div class="privacy" v-html="$t('registerOrg.tos_priv_agree')"></div>
      </base-checkbox>

      <base-button
        class="w-full p-5 mt-5 text-2xl"
        variant="solid"
        :disabled="
          !survivorToken.accept_terms && !survivorToken.tos_accepted_at
        "
        :action="saveSurvivorToken"
        :text="$t('Save')"
      />
    </section>
  </div>
</template>

<script>
import { getErrorMessage } from '@/utils/errors';
import WorksiteSearchInput from '@/components/WorksiteSearchInput';
import GeocoderService from '@/services/geocoder.service';
import LocationViewer from '@/components/LocationViewer';
import WorksiteImageSection from '@/components/WorksiteImageSection';
import WorksiteNotes from '@/pages/WorksiteNotes';
import { getWorkTypeImage } from '@/filters';

export default {
  name: 'Survivors',
  components: {
    WorksiteNotes,
    WorksiteImageSection,
    LocationViewer,
    WorksiteSearchInput,
  },
  async mounted() {
    await this.getSurvivorToken();
  },
  data() {
    return {
      loading: false,
      gettingLocation: false,
      addressSet: true,
      hideDetailedAddressFields: true,
      survivorToken: null,
      geocoderResults: [],
      workTypeHelpNeeded: new Set(),
      currentNote: '',
      getWorkTypeImage,
    };
  },
  computed: {
    worksiteAddress() {
      if (this.survivorToken?.worksite) {
        // eslint-disable-next-line camelcase
        const {
          address,
          city,
          state,
          postal_code: postalCode,
          county,
        } = this.survivorToken.worksite;
        return `${address} <br> ${city}, ${state}, ${county || ''} <br> ${
          postalCode || ''
        }`;
      }
      return '';
    },
    closedWorkTypes() {
      return (
        this.survivorToken &&
        this.survivorToken.work_types.filter((wt) =>
          wt.status.includes('closed'),
        )
      );
    },
    openWorkTypes() {
      return (
        this.survivorToken &&
        this.survivorToken.work_types.filter((wt) => wt.status.includes('open'))
      );
    },
  },
  methods: {
    updateWorkTypesHelpNeeded(value, workTypeToClaim) {
      if (value) {
        this.workTypeHelpNeeded.add(workTypeToClaim.id);
      } else {
        this.workTypeHelpNeeded.delete(workTypeToClaim.id);
      }
      this.workTypeHelpNeeded = new Set(this.workTypeHelpNeeded);
    },
    unlockLocationFields() {
      this.hideDetailedAddressFields = false;
      this.addressSet = false;
    },
    async confirmAddress() {
      this.survivorToken.confirm_address = true;
      await this.saveSurvivorToken();
    },
    async locateMe() {
      this.gettingLocation = true;
      try {
        this.gettingLocation = false;
        this.location = await this.getLocation();
        const { latitude, longitude } = this.location.coords;
        await this.geocodeWorksite(latitude, longitude);
      } catch (e) {
        this.gettingLocation = false;
        this.errorStr = e.message;
      }
    },
    async geocodeWorksite(latitude, longitude, skipAddress = false) {
      const geocode = await GeocoderService.getLocationDetails({
        latitude,
        longitude,
      });
      if (!skipAddress) {
        const geocodeKeys = [
          'address',
          'city',
          'county',
          'state',
          'postal_code',
        ];
        geocodeKeys.forEach((key) => {
          this.survivorToken.worksite[key] = geocode.address_components[key];
        });
      }
      this.survivorToken.worksite.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
      return geocode;
    },
    async getLocation() {
      return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          reject(new Error('Geolocation is not available.'));
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve(pos);
          },
          (err) => {
            reject(err);
          },
        );
      });
    },
    async geocoderSearch(value) {
      this.geocoderResults = await GeocoderService.getMatchingAddresses(
        value,
        'USA',
      );
    },
    async onGeocodeSelect(value) {
      const geocode = await GeocoderService.getPlaceDetails(
        value.description,
        value.data.place_id,
      );
      const { lat, lng } = geocode.location;
      const geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
      geocodeKeys.forEach((key) => {
        this.survivorToken.worksite[key] = geocode.address_components[key];
      });

      this.survivorToken.worksite.location = {
        type: 'Point',
        coordinates: [lng, lat],
      };

      this.hideDetailedAddressFields = true;
      this.addressSet = true;

      this.$log.debug(geocode.location);
      // await this.updateWorksiteFields(geocode);
    },
    async getSurvivorToken(filesOnly = false) {
      this.loading = true;
      try {
        const response = await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/survivor_tokens/${this.$route.params.token}`,
          {
            headers: {
              Authorization: null,
            },
          },
        );
        if (filesOnly) {
          this.survivorToken.files = response.data.files;
        } else {
          this.survivorToken = response.data;
        }
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
        this.$log.debug(error);
      } finally {
        this.loading = false;
      }
    },
    async saveSurvivorToken() {
      this.loading = true;
      try {
        await this.$http.put(
          `${process.env.VUE_APP_API_BASE_URL}/survivor_tokens/${this.$route.params.token}`,
          {
            ...this.survivorToken,
            help_needed_work_types: Array.from(this.workTypeHelpNeeded),
          },
        );
        if (this.currentNote) {
          await this.$http.post(
            `${process.env.VUE_APP_API_BASE_URL}/survivor_tokens/${this.$route.params.token}/notes`,
            { note: this.currentNote },
          );
          this.currentNote = '';
        }
        await this.$toasted.success(
          this.$t('~~Your case was updated successfully'),
        );
        await this.getSurvivorToken();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
        this.$log.debug(error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.main {
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
}
.svg-container svg {
  width: 26px !important;
  height: 26px !important;
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