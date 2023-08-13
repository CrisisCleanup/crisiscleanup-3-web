<template>
  <div
    v-if="survivorToken"
    class="survivors-page h-full overflow-auto main"
    data-testid="testSurvivorsDiv"
  >
    <div
      v-if="survivorToken.worksite && survivorToken.worksite.invalidated_at"
      data-testid="testInvalidatedTokenDiv"
      class="bg-red-300 text-2xl"
    >
      {{ $t('survivorContact.deleted_notice') }}
    </div>
    <div id="top" class="logo flex justify-center p-3 border border-b">
      <img
        id="header"
        data-testid="testCcuLogoIcon"
        src="@/assets/ccu-logo-black-500w.png"
        style="height: 53px"
      />
    </div>
    <section v-if="survivorToken" class="main p-8">
      <div
        class="text-2xl text-center mb-3 font-bold"
        data-testid="testCaseNumberDiv"
      >
        {{ $t('survivorContact.case_number') }}:
        {{ survivorToken.worksite.case_number }}
      </div>
      <div class="text-lg mb-1" data-testid="testNameDiv">
        {{ survivorToken.worksite.name }}:
      </div>
      <div class="text-lg" v-html="$t(survivorToken.survivor_message)"></div>
      <div>
        <div class="text-lg font-bold my-2" data-testid="testDoYouNeedHelpDiv">
          {{ $t('survivorContact.do_you_need_help') }}
        </div>
        <div class="flex flex-col mt-2">
          <base-radio
            class="mb-3 border pt-2 pb-4 px-2"
            data-testid="testHelpNeededRadio"
            :class="[
              survivorToken.status_t === 'survivorContact.help_needed'
                ? 'bg-primary-light border-primary-light bg-opacity-25'
                : '',
            ]"
            label-class="pt-1 text-xl"
            label="survivorContact.help_needed"
            :name="$t('survivorContact.help_needed')"
            :model-value="survivorToken.status_t"
            @update:modelValue="survivorToken.status_t = $event"
          />
          <base-radio
            class="mb-3 border pt-2 pb-4 px-2"
            data-testid="testHelpNotNeededRadio"
            :class="[
              survivorToken.status_t === 'survivorContact.help_not_needed'
                ? 'bg-primary-light border-primary-light bg-opacity-25'
                : '',
            ]"
            label-class="pt-1 text-xl"
            label="survivorContact.help_not_needed"
            :name="$t('survivorContact.help_not_needed')"
            :model-value="survivorToken.status_t"
            @update:modelValue="survivorToken.status_t = $event"
          />
          <base-radio
            class="mb-3 border pt-2 pb-4 px-2"
            data-testid="testAlreadyHelpedRadio"
            :class="[
              survivorToken.status_t === 'survivorContact.already_helped'
                ? 'bg-primary-light border-primary-light bg-opacity-25'
                : '',
            ]"
            label-class="pt-1 text-xl"
            label="survivorContact.already_helped"
            :name="$t('survivorContact.already_helped')"
            :model-value="survivorToken.status_t"
            @update:modelValue="survivorToken.status_t = $event"
          />
          <base-radio
            class="mb-3 border pt-2 pb-4 px-2"
            data-testid="testAlreadyHelpedHelpNeededRadio"
            :class="[
              survivorToken.status_t ===
              'survivorContact.already_helped_help_needed'
                ? 'bg-primary-light border-primary-light bg-opacity-25'
                : '',
            ]"
            label-class="pt-1 text-xl"
            label="survivorContact.already_helped_help_needed"
            :name="$t('survivorContact.already_helped_help_needed')"
            :model-value="survivorToken.status_t"
            @update:modelValue="survivorToken.status_t = $event"
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
                {{ $t('survivorContact.unmet_need') }}
              </div>
              <base-checkbox
                v-for="work_type_help_needed in survivorToken.work_types"
                :data-testid="`testWorkTypeHelpNeeded${work_type_help_needed.id}Checkbox`"
                :key="work_type_help_needed.id"
                class="mb-3"
                :model-value="workTypeHelpNeeded.has(work_type_help_needed.id)"
                @update:modelValue="
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

      <div v-if="!survivorToken.address_confirmed_at" class="pt-2">
        <div>
          <div class="text-lg my-2 font-bold" data-testid="testUnconfirmedAddressDiv">
            {{ $t('survivorContact.confirm_address_instructions') }}
          </div>
          <div
            v-if="addressSet"
            class="rounded-lg shadow-lg p-5 border flex justify-between items-center"
          >
            <div class="flex items-start">
              <ccu-icon
                type="pin"
                data-testid="testLocationIcon"
                class="mr-1"
                size="small"
                style="margin-top: 3px"
                :alt="$t('survivorContact.location')"
              />
              <span v-html="worksiteAddress"></span>
            </div>
            <div class="flex">
              <base-button
                class="px-3 py-1 bg-crisiscleanup-green-700 text-white mx-1"
                data-testid="testConfirmAddressButton"
                :text="$t('survivorContact.confirm_address')"
                :alt="$t('survivorContact.confirm_address')"
                :action="confirmAddress"
              />
              <base-button
                variant="solid"
                data-testid="testEditAddressButton"
                class="px-3 py-1 mx-1"
                :text="$t('survivorContact.edit_address')"
                :alt="$t('survivorContact.edit_address')"
                :action="unlockLocationFields"
              />
            </div>
          </div>
          <WorksiteSearchInput
            v-else
            data-testid="testFullAddressSearch"
            :value="survivorToken.worksite.address"
            selector="js-worksite-address"
            display-property="description"
            :placeholder="$t('survivorContact.full_address')"
            size="large"
            required
            use-geocoder
            :use-worksites="false"
            skip-validation
            class="w-full"
            @input="() => {}"
            @selectedGeocode="onGeocodeSelect"
          />
        </div>
        <base-button
          type="bare"
          data-testid="testUseMyLocationButton"
          icon="street-view"
          class="text-gray-700 pt-3 w-full p-5 mt-5 border text-2xl"
          :action="locateMe"
          :text="$t('caseForm.use_my_location')"
          :alt="$t('caseForm.use_my_location')"
        />
        <LocationViewer
          :key="JSON.stringify(survivorToken.worksite.location)"
          :location="survivorToken.worksite.location"
          data-testid="testLocationViewerDiv"
          class="h-84 mt-4 w-full"
          use-google-maps
          @updatedLocation="(latLng) => geocodeWorksite(latLng.lat, latLng.lng)"
        />
      </div>

      <div v-else class="pt-2">
        <div
          class="rounded-lg shadow-lg p-5 border flex justify-center items-center bg-crisiscleanup-green-600 text-white"
        >
          <ccu-icon
            type="privacy"
            data-testid="testAddressConfirmedIcon"
            class="mr-2"
            size="small"
            style="margin-top: 3px"
            :alt="$t('survivorContact.address_confirmed')"
          />
          {{ $t('survivorContact.address_confirmed') }}
        </div>
      </div>

      <hr class="my-4" />

      <div class="w-full">
        <div class="text-lg my-2 font-bold">
          {{ $t('survivorContact.upload_photos') }}
        </div>
        <WorksiteImageSection
          :key="JSON.stringify(survivorToken)"
          :worksite="survivorToken"
          :is-survivor-token="true"
          data-testid="testUploadPhotosFile"
          @photosChanged="() => getSurvivorToken(true)"
          @image-click="showImage"
        />
        <base-checkbox :model-value="survivorToken.allow_sharing" @update:modelValue="survivorToken.allow_sharing = $event" class="w-full mt-2" data-testid="survivorContactSharePermissionSwitch">
          {{$t('survivorContact.share_permission')}}
        </base-checkbox>
      </div>
      <hr class="my-4" />

      <div>
        <div
          class="text-lg my-2 font-bold"
          v-html="$t('survivorContact.how_often_update')"
          data-testid="testAutoContactFrequencyDiv"
        ></div>
        <div class="w-full flex text-center text-lg">
          <div
            class="w-1/3 border-t border-b border-r rounded-l-xl p-3"
            data-testid="testAutoContactFrequencyOftenDiv"
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
            {{ $t('formOptions.often') }}
          </div>
          <div
            class="w-1/3 border-t border-b border-r p-3"
            data-testid="testAutoContactFrequencyNotOftenDiv"
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
            data-testid="testAutoContactFrequencyNeverDiv"
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
        <div
          class="text-lg mt-2"
          v-html="$t('survivorContact.frequency_statement')"
        ></div>
      </div>
      <hr class="my-4" />

      <div>
        <div
          class="text-lg my-2 font-bold"
          v-html="$t('survivorContact.notes_instructions')"
        ></div>

        <WorksiteNotes
          v-if="survivorToken.notes.length > 0"
          :can-add="false"
          :worksite="survivorToken"
        />

        <textarea
          v-model="currentNote"
          data-testid="testAddNoteTextArea"
          rows="5"
          class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 my-2 resize-none w-full"
          :placeholder="$t('survivorContact.notes')"
          required
        ></textarea>
      </div>

      <base-checkbox
        v-if="!survivorToken.tos_accepted_at"
        data-testid="testAcceptTermsCheckbox"
        v-model="survivorToken.accept_terms"
        class="block my-1 text-xl"
      >
        <div class="privacy" v-html="$t('registerOrg.tos_priv_agree')"></div>
      </base-checkbox>

      <base-button
        class="w-full p-5 mt-5 text-2xl"
        data-testid="testSaveButton"
        variant="solid"
        :disabled="
          !survivorToken.accept_terms && !survivorToken.tos_accepted_at
        "
        :action="saveSurvivorToken"
        :text="$t('actions.save')"
        :alt="$t('actions.save')"
      />

      <div class="text-xl my-2 font-bold">
        {{ $t('survivorContact.faqs') }}
      </div>
      <ul>
        <li v-for="faq in faqs" :key="faq.id">
          <div
            class="text-lg my-1 font-bold"
            :data-testid="`testFaq${faq.id}Div`"
            v-html="$t(formatCmsItem(faq.title))"
          ></div>
          <div class="text-lg" v-html="$t(formatCmsItem(faq.content))"></div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { getErrorMessage } from '@/utils/errors';
import WorksiteSearchInput from '@/components/work/WorksiteSearchInput.vue';
import GeocoderService from '@/services/geocoder.service';
import LocationViewer from '@/components/locations/LocationViewer.vue';
import WorksiteImageSection from '@/components/work/WorksiteImageSection.vue';
import WorksiteNotes from '@/components/work/WorksiteNotes.vue';
import { getWorkTypeImage } from '@/filters';
import { formatCmsItem } from '@/utils/helpers';
import survivor from "@/pages/home/Survivor.vue";
import BaseCheckbox from "@/components/BaseCheckbox.vue";

export default defineComponent({
  name: 'Survivors',
  computed: {
    survivor() {
      return survivor
    }
  },
  components: {
    BaseCheckbox,
    WorksiteNotes,
    WorksiteImageSection,
    LocationViewer,
    WorksiteSearchInput,
  },
  setup() {
    const route = useRoute();
    const $toasted = useToast();
    const { t } = useI18n();

    const state = reactive({
      scale: 1,
      numClicks: 0,
      imageIndex: 0,
      imageList: [],
      showImgModal: false,
      loading: false,
      gettingLocation: false,
      addressSet: true,
      hideDetailedAddressFields: true,
      survivorToken: null,
      geocoderResults: [],
      faqs: [],
      workTypeHelpNeeded: new Set(),
      currentNote: '',
      getWorkTypeImage,
      formatCmsItem,
    });

    const worksiteAddress = computed(() => {
      if (state.survivorToken?.worksite) {
        const {
          address,
          city,
          state: addressState,
          postal_code: postalCode,
          county,
        } = state.survivorToken.worksite;
        return `${address} <br> ${city}, ${addressState}, ${
          county || ''
        } <br> ${postalCode || ''}`;
      }

      return '';
    });

    const closedWorkTypes = computed(() => {
      return (
        state.survivorToken &&
        state.survivorToken.work_types.filter((wt) =>
          wt.status.includes('closed'),
        )
      );
    });

    const openWorkTypes = computed(() => {
      return (
        state.survivorToken &&
        state.survivorToken.work_types.filter((wt) =>
          wt.status.includes('open'),
        )
      );
    });

    function showImage(image, index, fileList) {
      state.imageIndex = index;
      state.imageList = fileList;
      state.showImgModal = true;
    }

    function updateWorkTypesHelpNeeded(value, workTypeToClaim) {
      if (value) {
        state.workTypeHelpNeeded.add(workTypeToClaim.id);
      } else {
        state.workTypeHelpNeeded.delete(workTypeToClaim.id);
      }

      state.workTypeHelpNeeded = new Set(state.workTypeHelpNeeded);
    }

    function unlockLocationFields() {
      state.hideDetailedAddressFields = false;
      state.addressSet = false;
    }

    async function confirmAddress() {
      state.survivorToken.confirm_address = true;
      await saveSurvivorToken();
    }

    async function locateMe() {
      state.gettingLocation = true;
      try {
        state.gettingLocation = false;
        state.location = await getLocation();
        const { latitude, longitude } = state.location.coords;
        await geocodeWorksite(latitude, longitude);
      } catch (error) {
        state.gettingLocation = false;
        state.errorStr = error.message;
      }
    }

    async function geocodeWorksite(latitude, longitude, skipAddress = false) {
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
        for (const key of geocodeKeys) {
          state.survivorToken.worksite[key] = geocode.address_components[key];
        }
      }

      state.survivorToken.worksite.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
      return geocode;
    }

    async function getLocation() {
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
    }

    async function geocoderSearch(value) {
      state.geocoderResults = await GeocoderService.getMatchingAddresses(
        value,
        'USA',
      );
    }

    async function onGeocodeSelect(value) {
      const geocode = await GeocoderService.getPlaceDetails(
        value.description,
        value.data.place_id,
      );
      const { lat, lng } = geocode.location;
      const geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
      for (const key of geocodeKeys) {
        state.survivorToken.worksite[key] = geocode.address_components[key];
      }

      state.survivorToken.worksite.location = {
        type: 'Point',
        coordinates: [lng, lat],
      };

      state.hideDetailedAddressFields = true;
      state.addressSet = true;

      // this.$log.debug(geocode.location);
      // await this.updateWorksiteFields(geocode);
    }

    async function getSurvivorToken(filesOnly = false) {
      state.loading = true;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/survivor_tokens/${
            route.params.token
          }`,
          {
            headers: {
              Authorization: null,
            },
          },
        );
        if (filesOnly) {
          state.survivorToken.files = response.data.files;
        } else {
          state.survivorToken = response.data;
          state.survivorToken.allow_sharing = !!state.survivorToken.permission_public_share_at;
        }
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
        // this.$log.debug(error);
      } finally {
        state.loading = false;
      }
    }

    async function saveSurvivorToken() {
      document.querySelector('#header').scrollIntoView();
      state.loading = true;
      try {
        await axios.put(
          `${import.meta.env.VITE_APP_API_BASE_URL}/survivor_tokens/${
            route.params.token
          }`,
          {
            ...state.survivorToken,
            help_needed_work_types: [...state.workTypeHelpNeeded],
          },
        );
        if (state.currentNote) {
          await axios.post(
            `${import.meta.env.VITE_APP_API_BASE_URL}/survivor_tokens/${
              route.params.token
            }/notes`,
            { note: state.currentNote },
          );
          state.currentNote = '';
        }

        await $toasted.success(t('survivorContact.case_update_success'));
        await getSurvivorToken();
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
        // this.$log.debug(error);
      } finally {
        state.loading = false;
      }
    }

    async function getFaqs() {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/cms?tags=faq`,
      );
      state.faqs = response.data.results;
    }

    onMounted(async () => {
      await getFaqs();
      await getSurvivorToken();
    });

    return {
      ...toRefs(state),
      worksiteAddress,
      closedWorkTypes,
      openWorkTypes,
      showImage,
      updateWorkTypesHelpNeeded,
      unlockLocationFields,
      confirmAddress,
      locateMe,
      geocodeWorksite,
      geocoderSearch,
      onGeocodeSelect,
      getSurvivorToken,
      saveSurvivorToken,
      getFaqs,
    };
  },
});
</script>

<style scoped>
.main {
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
}
.svg-container svg {
  width: 26px !important;
  height: 26px !important;
}
.modal {
  @apply relative;
  z-index: 10001;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.9);
}

.modal-content {
  @apply w-full flex items-center justify-center mt-80;
}
</style>

<style lang="postcss">
.survivors-page {
  a {
    @apply text-primary-dark;
    text-decoration: underline !important;
    &:hover {
      text-decoration: none;
    }
  }

  li {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
}
</style>
