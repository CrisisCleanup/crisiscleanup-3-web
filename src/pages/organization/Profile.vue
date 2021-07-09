<template>
  <div class="flex flex-col w-3/4 m-auto">
    <div class="w-full bg-white shadow mt-6">
      <div
        class="
          border-b
          px-4
          py-2
          font-semibold
          flex
          justify-between
          items-center
        "
      >
        {{ $t('profileOrg.general_information') }}
        <base-button
          variant="solid"
          class="px-4 py-2"
          :text="$t('actions.save')"
          :alt="$t('actions.save')"
          :action="saveOrganization"
        />
      </div>
      <div class="px-8 pb-6 mt-2">
        <div class="flex">
          <div v-if="!logoUrl" class="flex">
            <DragDrop
              class="w-48 h-32 text-center mr-6 border border-dashed"
              :choose-title="$t('profileOrg.upload_org_logo')"
              :drag-title="$t('profileOrg.logo_specs')"
              :multiple="false"
              @files="
                (files) => {
                  handleFileUpload(files, 'fileTypes.logo');
                }
              "
            ></DragDrop>

            <div class="mt-4">
              <div class="py-1">{{ $t('profileOrg.provide_logo') }}</div>
              <div class="text-xs py-1 text-crisiscleanup-grey-700">
                {{ $t('profileOrg.logo_customizes_website') }}
              </div>
            </div>
          </div>
          <div v-else>
            <img
              class="w-48 h-32"
              :src="logoUrl"
              :alt="$t('profileOrg.organization_logo')"
            />
            <DragDrop
              class="text-primary-dark cursor-pointer"
              :disabled="uploading"
              :multiple="false"
              @files="
                (files) => {
                  handleFileUpload(files, 'fileTypes.logo');
                }
              "
            >
              <base-button
                class="text-center pb-4 cursor-pointer"
                :show-spinner="uploading"
                :disabled="uploading"
                >{{ $t('actions.update_logo') }}
              </base-button>
            </DragDrop>
          </div>
        </div>
        <div class="divider" />
        <form ref="form" class="org-form">
          <div class="form-row">
            <base-input
              class="mr-2 w-1/2"
              :placeholder="$t('profileOrg.organization_name')"
              :value="currentOrganization.name"
              required
              @input="
                (value) => {
                  updateOrganization(value, 'name');
                }
              "
            ></base-input>
            <form-select
              :placeholder="$t('profileOrg.organization_type')"
              class="w-1/2 flex-grow border border-crisiscleanup-dark-100"
              :options="organizationTypes"
              :value="currentOrganization.type_t"
              item-key="key"
              label="label"
              @input="
                (value) => {
                  updateOrganization(value, 'type_t');
                }
              "
            ></form-select>
          </div>
          <div class="form-row">
            <base-input
              class="mr-2 w-1/2"
              :placeholder="$t('profileOrg.address')"
              :value="currentOrganization.address"
              @input="
                (value) => {
                  updateOrganization(value, 'address');
                }
              "
            ></base-input>
            <base-input
              class="mr-2 w-1/2"
              :placeholder="$t('profileOrg.url')"
              :value="currentOrganization.url"
              @input="
                (value) => {
                  updateOrganization(value, 'url');
                }
              "
            ></base-input>
          </div>
          <div class="form-row">
            <base-input
              class="mr-2 w-1/2"
              :placeholder="$t('profileOrg.email')"
              :value="currentOrganization.email"
              @input="
                (value) => {
                  updateOrganization(value, 'email');
                }
              "
            ></base-input>
          </div>
          <div class="divider" />
          <div class="form-row">
            <base-input
              class="mr-2 w-1/2"
              :placeholder="$t('profileOrg.phone')"
              :value="currentOrganization.phone"
              :validator="validatePhoneNumber"
              @input="
                (value) => {
                  updateOrganization(value, 'phone');
                }
              "
            ></base-input>
          </div>
          <div class="divider" />
          <div class="pb-2">{{ $t('profileOrg.linkedin') }}</div>
          <div class="form-row">
            <div class="w-32 flex items-center">
              <img
                src="https://simpleicons.org/icons/facebook.svg"
                class="w-8 mr-2"
              />
              <label class="pr-3">{{ $t('profileOrg.facebook') }}</label>
            </div>
            <base-input
              size="small"
              :value="currentOrganization.facebook"
              :placeholder="$t('profileOrg.facebook')"
              @input="
                (value) => {
                  updateOrganization(value, 'facebook');
                }
              "
            />
          </div>
          <div class="form-row">
            <div class="w-32 flex items-center">
              <img
                src="https://simpleicons.org/icons/twitter.svg"
                class="w-8 mr-2"
              />
              <label class="pr-3">{{ $t('profileOrg.twitter') }}</label>
            </div>
            <base-input
              size="small"
              :value="currentOrganization.twitter"
              :placeholder="$t('profileOrg.twitter')"
              @input="
                (value) => {
                  updateOrganization(value, 'twitter');
                }
              "
            />
          </div>
          <div class="divider" />
          <div class="form-row">
            <UserSearchInput :placeholder="$t('profileOrg.primary_contact')" />
          </div>
        </form>
      </div>
    </div>
    <div class="w-full bg-white shadow mt-6">
      <div
        class="
          border-b
          px-4
          py-2
          font-semibold
          flex
          justify-between
          items-center
        "
      >
        {{ $t('profileOrg.incident_information') }}
      </div>
      <div class="px-8 pb-6 mt-2"></div>
    </div>
    <div class="flex">
      <div class="w-1/2 bg-white shadow mt-6 mr-3">
        <div class="border-b px-8 py-4 font-semibold">
          {{ $t('profileOrg.primary_response_area') }}
        </div>
        <div class="py-2 flex items-center justify-center">
          <base-button
            v-if="currentOrganization.primary_location"
            :text="$t('profileOrg.edit_response_area')"
            :alt="$t('profileOrg.edit_response_area')"
            variant="solid"
            class="px-2 py-1"
            :action="
              () => {
                showingLocationModal = true;
                settingLocation = 'primary_location';
              }
            "
          ></base-button>
          <base-button
            v-else
            class="px-2 py-1"
            variant="solid"
            :text="$t('profileOrg.add_response_area')"
            :alt="$t('profileOrg.add_response_area')"
            :action="
              () => {
                showingLocationModal = true;
                settingLocation = 'primary_location';
              }
            "
          ></base-button>
        </div>
        <div id="primary-location" class="w-full h-64"></div>
      </div>
      <div class="w-1/2 bg-white shadow mt-6">
        <div class="border-b px-8 py-4 font-semibold">
          {{ $t('profileOrg.secondary_response_area') }}
        </div>
        <div class="py-2 flex items-center justify-center">
          <base-button
            v-if="currentOrganization.secondary_location"
            :text="$t('profileOrg.edit_response_area')"
            :alt="$t('profileOrg.edit_response_area')"
            variant="solid"
            class="px-2 py-1"
            :action="
              () => {
                showingLocationModal = true;
                settingLocation = 'secondary_location';
              }
            "
          ></base-button>
          <base-button
            v-else
            class="px-2 py-1"
            variant="solid"
            :text="$t('profileOrg.add_response_area')"
            :alt="$t('profileOrg.add_response_area')"
            :action="
              () => {
                showingLocationModal = true;
                settingLocation = 'secondary_location';
              }
            "
          ></base-button>
        </div>
        <div id="secondary-location" class="w-full h-64"></div>
      </div>
      <modal
        v-if="showingLocationModal"
        :title="$t('profileOrg.select_location')"
        modal-style="height: 70%"
        modal-classes="w-3/5"
        @close="showingLocationModal = false"
        @ok="saveCurrentLocation"
      >
        <LocationTool
          :organization="currentOrganization.id"
          class="h-full p-3"
          :locations="existingLocation"
          @changed="setCurrentLocation"
        />
      </modal>
    </div>
    <div class="w-full bg-white shadow mt-6 mb-32">
      <div
        class="
          border-b
          px-4
          py-2
          font-semibold
          flex
          justify-between
          items-center
        "
      >
        {{ $t('profileOrg.custom_terms_waivers') }}
        {{ $t('profileOrg.custom_terms_waivers_description') }}
        <base-button
          variant="solid"
          class="px-4 py-2"
          :text="$t('actions.save')"
          :alt="$t('actions.save')"
          :action="saveOrganization"
        />
      </div>
      <div class="px-8 pb-6 mt-4">
        <div class="my-1">
          {{ $t('profileOrg.custom_work_order_instructions') }}
        </div>
        <textarea
          :value="currentOrganization.custom_ops_message"
          @input="
            (event) => {
              updateOrganization(event.target.value, 'custom_ops_message');
            }
          "
          :placeholder="$t('profileOrg.add_work_order_instructions')"
          rows="4"
          class="
            text-base
            border border-crisiscleanup-dark-100
            placeholder-crisiscleanup-dark-200
            outline-none
            p-1
            resize-none
            w-72
          "
        />
      </div>
      <hr />
      <div class="px-8 pb-6 mt-4">
        <div class="my-1">{{ $t('profileOrg.add_custom_tos') }}</div>
        <div class="flex items-center">
          <font-awesome-icon
            class="mx-1 text-crisiscleanup-dark-400 mr-2"
            size="lg"
            icon="file"
          />
          <base-input
            size="small"
            class="w-64 mr-2"
            input-classes="text-xs"
            disabled
            :value="termsOfService ? termsOfService.filename_original : ''"
          ></base-input>
          <ccu-icon
            v-if="termsOfService"
            :alt="$t('actions.delete')"
            size="small"
            class="p-1 py-2"
            type="trash"
            @click.native="
              () => {
                deleteFile(termsOfService.file);
              }
            "
          />
        </div>
        <DragDrop
          class="cursor-pointer w-64 py-2"
          container-class="items-start"
          :disabled="uploading"
          :multiple="false"
          @files="
            (files) => {
              handleFileUpload(files, 'fileTypes.terms_of_service');
            }
          "
        >
          <base-button
            class="cursor-pointer px-3 py-1"
            variant="solid"
            :text="$t('actions.add_terms')"
            :alt="$t('actions.add_terms')"
            :show-spinner="uploading"
            :disabled="uploading"
          />
        </DragDrop>
        <textarea
          :value="currentOrganization.custom_legal_tos"
          @input="
            (event) => {
              updateOrganization(event.target.value, 'custom_legal_tos');
            }
          "
          :placeholder="$t('profileOrg.add_tos_text')"
          rows="4"
          class="
            text-base
            border border-crisiscleanup-dark-100
            placeholder-crisiscleanup-dark-200
            outline-none
            p-1
            resize-none
            w-72
          "
        />
      </div>
      <hr />
      <div class="px-8 pb-6 mt-4">
        <div class="my-1">{{ $t('profileOrg.add_custom_liability') }}</div>
        <div class="flex items-center">
          <font-awesome-icon
            class="mx-1 text-crisiscleanup-dark-400 mr-2"
            size="lg"
            icon="file"
          />
          <base-input
            size="small"
            class="w-64 mr-2"
            input-classes="text-xs"
            disabled
            :value="liabilityWaiver ? liabilityWaiver.filename_original : ''"
          ></base-input>
          <ccu-icon
            v-if="liabilityWaiver"
            :alt="$t('actions.delete')"
            size="small"
            class="p-1 py-2"
            type="trash"
            @click.native="
              () => {
                deleteFile(liabilityWaiver.file);
              }
            "
          />
        </div>
        <DragDrop
          class="cursor-pointer w-64 py-2"
          container-class="items-start"
          :disabled="uploading"
          :multiple="false"
          @files="
            (files) => {
              handleFileUpload(files, 'fileTypes.liability_waiver');
            }
          "
        >
          <base-button
            class="cursor-pointer px-3 py-1"
            variant="solid"
            :text="$t('profileOrg.custom_survivor_waiver')"
            :alt="$t('profileOrg.custom_survivor_waiver')"
            :show-spinner="uploading"
            :disabled="uploading"
          />
        </DragDrop>
        <textarea
          :value="currentOrganization.custom_legal_survivor_waiver"
          @input="
            (event) => {
              updateOrganization(
                event.target.value,
                'custom_legal_survivor_waiver',
              );
            }
          "
          :placeholder="$t('profileOrg.add_survivor_waiver_text')"
          rows="4"
          class="
            text-base
            border border-crisiscleanup-dark-100
            placeholder-crisiscleanup-dark-200
            outline-none
            p-1
            resize-none
            w-72
          "
        />
      </div>
    </div>
  </div>
</template>

<script>
import * as L from 'leaflet';
import Organization from '@/models/Organization';
import Location from '@/models/Location';
import User from '@/models/User';
import { getErrorMessage } from '@/utils/errors';
import UserSearchInput from '@/components/UserSearchInput';
import LocationType from '@/models/LocationType';
import { ValidateMixin } from '@/mixins';
import DragDrop from '../../components/DragDrop';
import LocationTool from '../../components/LocationTool';
import { mapTileLayer } from '../../utils/map';

export default {
  name: 'Profile',
  components: { UserSearchInput, DragDrop, LocationTool },
  mixins: [ValidateMixin],
  data() {
    return {
      showingLocationModal: false,
      currentPolygon: null,
      primaryLocationMap: null,
      secondaryLocationMap: null,
      settingLocation: '',
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
      uploading: false,
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    currentOrganization() {
      return Organization.find(this.currentUser.organization.id);
    },
    existingLocation() {
      if (this.settingLocation === 'primary_location') {
        return this.currentOrganization.primary_location
          ? [this.currentOrganization.primary_location]
          : [];
      }

      if (this.settingLocation === 'secondary_location') {
        return this.currentOrganization.secondary_location
          ? [this.currentOrganization.secondary_location]
          : [];
      }
      return [];
    },
    logoUrl() {
      if (this.currentOrganization.files.length) {
        const logos = this.currentOrganization.files.filter(
          (file) => file.file_type_t === 'fileTypes.logo',
        );
        if (logos.length) {
          return logos[0].small_thumbnail_url;
        }
      }
      return '';
    },
    termsOfService() {
      if (this.currentOrganization.files.length) {
        return this.currentOrganization.files.find(
          (file) => file.file_type_t === 'fileTypes.terms_of_service',
        );
      }
      return null;
    },
    liabilityWaiver() {
      if (this.currentOrganization.files.length) {
        return this.currentOrganization.files.find(
          (file) => file.file_type_t === 'fileTypes.liability_waiver',
        );
      }
      return null;
    },
  },
  async mounted() {
    this.primaryLocationMap = L.map('primary-location', {
      zoomControl: false,
    }).setView([35.7465122599185, -96.41150963125656], 3);
    this.secondaryLocationMap = L.map('secondary-location', {
      zoomControl: false,
    }).setView([35.7465122599185, -96.41150963125656], 3);
    this.createTileLayer().addTo(this.primaryLocationMap);
    this.createTileLayer().addTo(this.secondaryLocationMap);
    await this.reloadMaps();
  },
  methods: {
    setCurrentLocation(location) {
      this.currentPolygon = location;
    },
    async reloadMaps() {
      const { primary_location, secondary_location } = this.currentOrganization;

      if (primary_location) {
        this.primaryLocationMap.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            return;
          }
          this.primaryLocationMap.removeLayer(layer);
        });
        await Location.api().fetchById(primary_location);
        const location = Location.find(primary_location);
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        L.geoJSON(geojsonFeature, {
          weight: '1',
        }).addTo(this.primaryLocationMap);
      }
      if (secondary_location) {
        this.secondaryLocationMap.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            return;
          }
          this.secondaryLocationMap.removeLayer(layer);
        });
        await Location.api().fetchById(secondary_location);
        const location = Location.find(secondary_location);
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        L.geoJSON(geojsonFeature, {
          weight: '1',
        }).addTo(this.secondaryLocationMap);
      }
    },
    async saveOrganization() {
      const isValid = this.$refs.form.reportValidity();
      if (!isValid) {
        return;
      }
      try {
        await Organization.api().patch(
          `/organizations/${this.currentOrganization.id}`,
          this.currentOrganization.$toJson(),
        );
        await this.$toasted.success(
          this.$t('profileOrg.sucessfully_saved_organization'),
        );
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async saveCurrentLocation() {
      this.loading = true;
      let { geometry } = this.currentPolygon.toGeoJSON();
      const { type, features } = this.currentPolygon.toGeoJSON();
      let locationTypeKey = 'org_primary_response_area';
      if (this.settingLocation === 'secondary_location') {
        locationTypeKey = 'org_secondary_response_area';
      }
      const locationType = LocationType.query()
        .where('key', locationTypeKey)
        .get()[0];
      const location = {
        name: `${this.currentOrganization.name} ${this.$t(
          locationType.name_t,
        )}`,
        type: locationType.id,
      };
      if (type === 'FeatureCollection') {
        const [feature] = features;
        geometry = feature.geometry;
      }

      if (geometry.type === 'Point') {
        location.point = geometry;
      } else if (geometry.type === 'Polygon') {
        location.poly = geometry;
      } else if (geometry.type === 'MultiPolygon') {
        location.geom = geometry;
      }

      try {
        const response = await Location.api().post('/locations', location);
        const locationId = response.response.data.id;
        await Location.api().fetchById(locationId);
        this.updateOrganization(locationId, this.settingLocation);
        await Organization.api().patch(
          `/organizations/${this.currentOrganization.id}`,
          {
            [this.settingLocation]: locationId,
          },
        );
        await this.reloadMaps();
        this.settingLocation = '';
      } catch (e) {
        this.$log.error(e);
      } finally {
        this.loading = false;
      }
    },
    createTileLayer() {
      return L.tileLayer(mapTileLayer, {
        // tileSize: 512,
        // zoomOffset: -1,
        maxZoom: 19,
      });
    },
    updateOrganization(value, key) {
      Organization.update({
        where: this.currentOrganization.id,
        data: {
          [key]: value,
        },
      });
    },
    async deleteFile(file) {
      await Organization.api().deleteFile(this.currentOrganization.id, file);
      await Organization.api().get(
        `/organizations/${this.currentOrganization.id}`,
      );
    },
    async handleFileUpload(fileList, type, deleteOldFiles = true) {
      if (fileList.length === 0) {
        this.uploading = false;
        return;
      }
      const formData = new FormData();
      formData.append('upload', fileList[fileList.length - 1]);
      formData.append('type_t', type);
      this.uploading = true;
      try {
        const result = await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/files`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          },
        );
        const file = result.data.id;

        const files = this.currentOrganization.files.filter(
          (picture) => picture.file_type_t === type,
        );

        if (deleteOldFiles) {
          const oldFiles = files.map((picture) =>
            Organization.api().deleteFile(
              this.currentOrganization.id,
              picture.file,
            ),
          );
          await Promise.all(oldFiles);
        }

        await Organization.api().addFile(
          this.currentOrganization.id,
          file,
          type,
        );
        await Organization.api().get(
          `/organizations/${this.currentOrganization.id}`,
        );
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>

<style scoped>
.divider {
  width: 36rem;
  @apply my-4 border-b;
}

.org-form {
  width: 36rem;
}

.form-row {
  @apply flex pb-4;
}
</style>
