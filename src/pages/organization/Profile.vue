<template>
  <div class="flex flex-col sm:w-3/4 w-11/12 m-auto">
    <base-button
      variant="solid"
      class="px-4 py-2 self-end mt-6"
      :text="$t('actions.save')"
      :alt="$t('actions.save')"
      :action="saveOrganization"
    />
    <div class="mt-6 grid sm:grid-cols-2 gap-x-6">
      <Card>
        <template #header>
          <base-text class="px-5 py-3">{{
            $t('profileOrg.main_info')
          }}</base-text>
        </template>
        <div class="px-5 py-3">
          <div class="logo-field form-row">
            <div>{{ $t('profileOrg.logo') }}</div>
            <div class="flex">
              <div v-if="!logoUrl">
                <DragDrop
                  class="w-full sm:w-84 h-16 text-center mr-6 border border-dashed"
                  container-class="flex-row items-center justify-center"
                  :choose-title="$t('profileOrg.upload_org_logo')"
                  :drag-title="$t('profileOrg.logo_specs')"
                  :multiple="false"
                  @files="
                    (files) => {
                      handleFileUpload(files, 'fileTypes.logo');
                    }
                  "
                ></DragDrop>
              </div>
              <div v-else>
                <img
                  class="w-full sm:w-84"
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
          </div>
          <div class="form-row">
            <FloatingInput
              class="mr-2 w-full sm:w-84"
              :placeholder="$t('profileOrg.organization_name')"
              :value="currentOrganization.name"
              required
              @input="
                (value) => {
                  updateOrganization(value, 'name');
                }
              "
            />
          </div>
          <div class="form-row">
            <FloatingInput
              class="mr-2 w-full sm:w-84"
              :placeholder="$t('profileOrg.address')"
              :value="currentOrganization.address"
              required
              @input="
                (value) => {
                  updateOrganization(value, 'address');
                }
              "
            />
          </div>
          <div class="form-row">
            <FloatingInput
              class="mr-2 w-full sm:w-84"
              :placeholder="$t('profileOrg.url')"
              :value="currentOrganization.url"
              required
              @input="
                (value) => {
                  updateOrganization(value, 'url');
                }
              "
            />
          </div>
          <div class="form-row">
            <FloatingInput
              class="mr-2 w-full sm:w-84"
              :placeholder="$t('profileOrg.email')"
              :value="currentOrganization.email"
              required
              @input="
                (value) => {
                  updateOrganization(value, 'email');
                }
              "
            />
          </div>
          <div class="form-row">
            <FloatingInput
              class="mr-2 w-full sm:w-84"
              :placeholder="$t('profileOrg.phone')"
              :value="currentOrganization.phone1"
              required
              @input="
                (value) => {
                  updateOrganization(value, 'phone1');
                }
              "
            />
          </div>
          <div class="form-row">
            <form-select
              :placeholder="$t('profileOrg.organization_type')"
              select-classes="h-12"
              class="w-full sm:w-84 flex-grow border border-crisiscleanup-dark-100"
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
        </div>
      </Card>
      <Card>
        <template #header>
          <base-text class="px-5 py-3">{{
            $t('profileOrg.general_information')
          }}</base-text>
        </template>
        <div class="px-5 py-3">
          <div class="form-row">
            <div class="font-semibold">
              {{ $t('profileOrg.primary_contacts') }}
            </div>
            <div
              style="
                display: grid;
                grid-template-columns: max-content max-content max-content max-content;
                grid-column-gap: 15px;
                grid-row-gap: 5px;
              "
              class="py-1"
            >
              <template v-for="contact in organization.primary_contacts">
                <span :key="contact.id" class="inline-block">
                  {{ contact.first_name }} {{ contact.last_name }}
                </span>
                <div :key="contact.email">
                  <a
                    :href="`mailto:${contact.email}`"
                    :title="contact.email"
                    :alt="contact.email"
                  >
                    <font-awesome-icon icon="envelope" />
                  </a>
                </div>
                <div :key="`phone:${contact.id}`">
                  <a
                    v-show="contact.mobile"
                    :href="`tel:${contact.mobile}`"
                    :title="contact.mobile"
                    :alt="contact.mobile"
                  >
                    <font-awesome-icon icon="phone" />
                  </a>
                </div>
                <ccu-icon
                  :key="`delete:${contact.id}`"
                  :alt="$t('actions.delete')"
                  class="ml-1"
                  size="xs"
                  type="cancel"
                  :action="
                    () => {
                      return deletePrimaryContact(contact);
                    }
                  "
                />
              </template>
            </div>

            <UserSearchInput
              :key="JSON.stringify(organization.primary_contacts)"
              class="h-12 w-full sm:w-84"
              :placeholder="$t('profileOrg.add_primary_contacts')"
              @selectedUser="
                (user) => {
                  makePrimaryContact(user);
                }
              "
            />
          </div>
          <div class="form-row">
            <div>{{ $t('profileOrg.social_media') }}</div>
            <div class="form-row flex">
              <div class="w-32 flex items-center">
                <img src="@/assets/facebook.svg" class="w-8 mr-2" />
                <label class="pr-3 text-xs">{{
                  $t('profileOrg.facebook')
                }}</label>
              </div>
              <base-input
                class="w-full sm:w-84"
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
            <div class="form-row flex">
              <div class="w-32 flex items-center">
                <img src="@/assets/twitter.svg" class="ml-1 w-6 mr-2" />
                <label class="pr-3 text-xs">{{
                  $t('profileOrg.twitter')
                }}</label>
              </div>
              <base-input
                class="w-full sm:w-84"
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
          </div>
          <div class="form-row">
            <FloatingInput
              class="mr-2 w-full sm:w-84"
              :placeholder="$t('profileOrg.donation_url')"
              :value="currentOrganization.donate_url"
              required
              @input="
                (value) => {
                  updateOrganization(value, 'donate_url');
                }
              "
            />
          </div>
        </div>
      </Card>
    </div>
    <div class="mt-6">
      <Card>
        <template #header>
          <base-text class="px-5 py-3">{{
            $t('profileOrg.capabilities')
          }}</base-text>
        </template>
        <Capability
          :key="JSON.stringify(organizationCapabilities)"
          class="px-5 py-3"
          :organization-capabilities="organizationCapabilities"
          @updated="
            (matrix) => {
              updatedOrganizationCapabilitiesMatrix = matrix;
            }
          "
        />
      </Card>
    </div>
    <div class="mt-6 grid sm:grid-cols-2 gap-x-6">
      <Card>
        <template #header>
          <base-text class="px-5 py-3">
            {{ $t('requestRedeploy.request_redeploy') }}
          </base-text>
        </template>
        <RequestRedeploy />
      </Card>
      <Card>
        <template #header>
          <base-text class="px-5 py-3">
            {{ $t('profileOrg.current_incidents') }}
          </base-text>
        </template>
        <div class="px-5 py-1 font-semibold">
          {{ $t('profileOrg.approved') }}
        </div>
        <div class="px-5 py-1 grid grid-cols-2 gap-x-6">
          <div
            v-for="incident in currentOrganization.approved_incidents"
            :key="`${incident}`"
          >
            {{ incident | getIncidentName }}
          </div>
        </div>
        <div class="px-5 py-1 font-semibold">
          {{ $t('profileOrg.pending') }}
        </div>
        <div class="px-5 py-1 grid grid-cols-2 gap-x-6">
          <div
            v-for="incident in currentOrganization.pending_incidents"
            :key="`${incident}`"
          >
            {{ incident | getIncidentName }}
          </div>
        </div>
      </Card>
    </div>
    <div class="mt-6 grid sm:grid-cols-2 gap-x-6">
      <Card>
        <template #header>
          <base-text class="px-5 py-3">
            {{ $t('profileOrg.primary_response_area') }}
          </base-text>
        </template>
        <div
          v-if="canEditLocation"
          class="py-2 flex items-center justify-center"
        >
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
        <div v-else class="py-2 flex items-center justify-center">
          <base-button
            :text="$t('profileOrg.contact_help_change_response')"
            :alt="$t('profileOrg.contact_help_change_response')"
            variant="solid"
            class="px-2 py-1"
            disabled
          ></base-button>
        </div>
        <div id="primary-location" class="w-full h-64"></div>
      </Card>
      <Card>
        <template #header>
          <base-text class="px-5 py-3">
            {{ $t('profileOrg.secondary_response_area') }}
          </base-text>
        </template>
        <div
          v-if="canEditLocation"
          class="py-2 flex items-center justify-center"
        >
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
        <div v-else class="py-2 flex items-center justify-center">
          <base-button
            :text="$t('profileOrg.contact_help_change_response')"
            :alt="$t('profileOrg.contact_help_change_response')"
            variant="solid"
            class="px-2 py-1"
            disabled
          ></base-button>
        </div>
        <div id="secondary-location" class="w-full h-64"></div>
      </Card>
      <modal
        v-if="showingLocationModal"
        :title="$t('profileOrg.select_location')"
        modal-style="height: 90%"
        modal-classes="sm:w-3/5"
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
        class="border-b px-4 py-2 font-semibold flex justify-between items-center"
      >
        {{ $t('profileOrg.custom_materials') }}
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
          :placeholder="$t('profileOrg.add_work_order_instructions')"
          :disabled="!currentUser.isPrimaryContact && !currentUser.isAdmin"
          rows="4"
          class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-1 resize-none w-full sm:w-72"
          @input="
            (event) => {
              updateOrganization(event.target.value, 'custom_ops_message');
            }
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
            class="w-full sm:w-64 mr-2"
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
          class="cursor-pointer w-full sm:w-64 py-2"
          container-class="items-start"
          :disabled="
            uploading || (!currentUser.isPrimaryContact && !currentUser.isAdmin)
          "
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
            :disabled="
              uploading ||
              (!currentUser.isPrimaryContact && !currentUser.isAdmin)
            "
          />
        </DragDrop>
        <textarea
          :value="currentOrganization.custom_legal_tos"
          :disabled="!currentUser.isPrimaryContact && !currentUser.isAdmin"
          :placeholder="$t('profileOrg.add_tos_text')"
          rows="4"
          class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-1 resize-none w-full sm:w-72"
          @input="
            (event) => {
              updateOrganization(event.target.value, 'custom_legal_tos');
            }
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
            class="w-full sm:w-64 mr-2"
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
          class="cursor-pointer w-full sm:w-64 py-2"
          container-class="items-start"
          :disabled="
            uploading || (!currentUser.isPrimaryContact && !currentUser.isAdmin)
          "
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
            :disabled="
              uploading ||
              (!currentUser.isPrimaryContact && !currentUser.isAdmin)
            "
          />
        </DragDrop>
        <textarea
          :value="currentOrganization.custom_legal_survivor_waiver"
          :disabled="!currentUser.isPrimaryContact && !currentUser.isAdmin"
          :placeholder="$t('profileOrg.add_survivor_waiver_text')"
          rows="4"
          class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-1 resize-none w-full sm:w-72"
          @input="
            (event) => {
              updateOrganization(
                event.target.value,
                'custom_legal_survivor_waiver',
              );
            }
          "
        />
      </div>
    </div>
  </div>
</template>

<script>
import * as L from 'leaflet';
import DragDrop from '../../components/DragDrop.vue';
import LocationTool from '../../components/LocationTool';
import { mapTileLayer } from '../../utils/map';
import Organization from '@/models/Organization';
import Role from '@/models/Role';
import UserRole from '@/models/UserRole';
import Location from '@/models/Location';
import Incident from '@/models/Incident';
import User from '@/models/User';
import { getErrorMessage } from '@/utils/errors';
import UserSearchInput from '@/components/UserSearchInput';
import LocationType from '@/models/LocationType';
import { ValidateMixin, CapabilityMixin } from '@/mixins';
import FloatingInput from '@/components/FloatingInput.vue';
import Card from '@/components/cards/Card';
import Capability from '@/pages/unauthenticated/Capability';
import RequestRedeploy from '@/components/RequestRedeploy';

export default {
  name: 'Profile',
  components: {
    RequestRedeploy,
    Capability,
    Card,
    FloatingInput,
    UserSearchInput,
    DragDrop,
    LocationTool,
  },
  filters: {
    getIncidentName(value) {
      const incident = Incident.query().where('id', Number(value)).first();
      return incident ? incident.name : '';
    },
  },
  mixins: [ValidateMixin, CapabilityMixin],
  data() {
    return {
      showingLocationModal: false,
      currentPolygon: null,
      primaryLocationMap: null,
      secondaryLocationMap: null,
      settingLocation: '',
      organizationCapabilities: [],
      updatedOrganizationCapabilitiesMatrix: null,
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
    roles() {
      return Role.all();
    },
    canEditLocation() {
      return (
        this.organization.approved_roles &&
        this.organization.approved_roles.some((role) => [11, 8].includes(role))
      );
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    currentOrganization() {
      return Organization.find(this.currentUser.organization.id);
    },
    organization() {
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
      if (this.currentOrganization.files.length > 0) {
        const logos = this.currentOrganization.files.filter(
          (file) => file.file_type_t === 'fileTypes.logo',
        );
        if (logos.length > 0) {
          return logos[0].small_thumbnail_url;
        }
      }
      return '';
    },
    termsOfService() {
      if (this.currentOrganization.files.length > 0) {
        return this.currentOrganization.files.find(
          (file) => file.file_type_t === 'fileTypes.terms_of_service',
        );
      }
      return null;
    },
    liabilityWaiver() {
      if (this.currentOrganization.files.length > 0) {
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
    }).setView([35.746_512_259_918_5, -96.411_509_631_256_56], 3);
    this.secondaryLocationMap = L.map('secondary-location', {
      zoomControl: false,
    }).setView([35.746_512_259_918_5, -96.411_509_631_256_56], 3);
    this.createTileLayer().addTo(this.primaryLocationMap);
    this.createTileLayer().addTo(this.secondaryLocationMap);
    await this.reloadMaps();
    await this.getOrganizationCapabilities();
  },
  methods: {
    async getOrganizationCapabilities() {
      const organizationCapabilities = await this.$http.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/organization_organizations_capabilities`,
      );
      this.organizationCapabilities = organizationCapabilities.data.results;
    },
    setCurrentLocation(location) {
      this.currentPolygon = location;
    },
    async makePrimaryContact(user) {
      await UserRole.api().post(`/user_roles`, {
        user_role: Role.query().where('id', 3).first().id,
        user: user.id,
      });
      await this.saveOrganization();
    },
    async deletePrimaryContact(user) {
      const results = await UserRole.api().get(`/user_roles?user=${user.id}`, {
        dataKey: 'results',
      });
      let { user_roles } = results.entities;
      user_roles = user_roles || [];

      const currentUserRole = user_roles.find((ur) => ur.user_role === 3);

      await UserRole.api().delete(`/user_roles/${currentUserRole.id}`, {});
      await this.saveOrganization();
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
      try {
        await Organization.api().patch(
          `/organizations/${this.currentOrganization.id}`,
          this.currentOrganization.$toJson(),
        );
        await this.saveCapabilities();
        await this.getOrganizationCapabilities();
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

      switch (geometry.type) {
        case 'Point': {
          location.point = geometry;

          break;
        }
        case 'Polygon': {
          location.poly = geometry;

          break;
        }
        case 'MultiPolygon': {
          location.geom = geometry;

          break;
        }
        // No default
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
      } catch (error) {
        this.$log.error(error);
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
          `${import.meta.env.VITE_APP_API_BASE_URL}/files`,
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
  @apply pb-4;
}
</style>

<style>
.form-row #autosuggest__input {
  height: 3rem !important;
}

.form-row .icon-container {
  height: 3rem !important;
}

.form-row .form-field {
  padding: 0 !important;
  margin: 0 !important;
}
</style>
