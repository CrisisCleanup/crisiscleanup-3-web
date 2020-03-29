<template>
  <Loader
    :loading="loading"
    class="p-6 bg-crisiscleanup-light-grey h-full overflow-auto"
  >
    <template #content v-if="organization">
      <div class="flex items-center justify-between">
        <base-text variant="h1" :weight="600">
          {{ organization.id }}: {{ organization.name | upper }}
          <base-link
            target="_blank"
            :href="`${apiUrl}/ccadmin/organizations/organization/${organization.id}/change`"
            >See in Django Admin</base-link
          >
        </base-text>
        <div class="flex py-1">
          <base-button
            :text="$t('actions.save')"
            variant="solid"
            size="medium"
            class="mr-2"
            :action="saveOrganization"
          />
          <template
            v-if="!organization.approved_by && !organization.rejected_by"
          >
            <base-button
              :text="$t('actions.approve')"
              variant="solid"
              size="medium"
              class="mr-2"
              :action="
                () => {
                  approveOrganization(organization.id);
                }
              "
            />
            <base-button
              :text="$t('actions.reject')"
              variant="outline"
              size="medium"
              :action="
                () => {
                  rejectOrganization(organization.id);
                }
              "
            />
          </template>
        </div>
      </div>
      <div>
        <div class="flex">
          <div class="w-1/2 bg-white p-3 shadow text-sm mr-4">
            <div class="flex items-center justify-between">
              <base-text variant="h2" :weight="600">
                Info
              </base-text>
            </div>
            <base-input
              v-model="organization.name"
              type="text"
              class="input text-sm"
              size="large"
              :placeholder="$t('Name')"
              required
            />
            <textarea
              v-model="organization.admin_notes"
              class="border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none resize-none w-full"
              rows="4"
              :placeholder="$t('Admin Notes')"
              required
            />
            <textarea
              v-model="organization.automatically_approve_user_domain"
              class="border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none resize-none w-full"
              rows="4"
              :placeholder="$t('Automatically Approve User Domain')"
              required
            />
            <base-checkbox v-model="organization.is_active">
              Is Active
            </base-checkbox>
            <base-checkbox v-model="organization.org_verified">
              Org Verified
            </base-checkbox>
            <base-checkbox v-model="organization.publish">
              Publish
            </base-checkbox>
            <form-select
              :placeholder="$t('profileOrg.organization_type')"
              class="w-auto flex-grow border border-crisiscleanup-dark-100 select"
              :options="organizationTypes"
              v-model="organization.type_t"
              item-key="key"
              label="label"
            ></form-select>
            <form-select
              :placeholder="$t('Approval/Rejection Reason')"
              class="w-auto flex-grow border border-crisiscleanup-dark-100 select"
              :options="approveRejectReasons"
              v-model="organization.approve_reject_reason_t"
              item-key="key"
              label="label"
            ></form-select>
          </div>
          <div class="w-1/2 bg-white p-3 shadow text-sm">
            <base-text variant="h3">Primary Contacts</base-text>
            <div
              style="
                display: grid;
                grid-template-columns: max-content max-content max-content max-content;
                grid-column-gap: 10px;
              "
            >
              <template v-for="contact in organization.primary_contacts">
                <span class="inline-block"
                  >{{ contact.first_name }} {{ contact.last_name }}</span
                >
                <span class="inline-block">{{
                  contact.title ? contact.title : ''
                }}</span>
                <span class="inline-block">{{ contact.email }}</span>
                <span class="inline-block">{{ contact.mobile }}</span>
              </template>
            </div>
            <base-text variant="h3">Ghost Users</base-text>
            <div
              style="
                display: grid;
                grid-template-columns: max-content max-content max-content max-content;
                grid-column-gap: 10px;
              "
            >
              <template v-for="contact in ghostUsers">
                <span class="inline-block"
                  >{{ contact.first_name }} {{ contact.last_name }}</span
                >
                <span class="inline-block">{{
                  contact.title ? contact.title : ''
                }}</span>
                <span class="inline-block">{{ contact.email }}</span>
                <span class="inline-block">{{ contact.mobile }}</span>
              </template>
            </div>
            <base-text variant="h3">General Info</base-text>
            <base-text> Facebook: {{ organization.facebook }}</base-text>
            <base-text> Twitter: {{ organization.twitter }}</base-text>
            <base-text> Referral: {{ organization.referral }}</base-text>
            <base-text> Url: {{ organization.url }}</base-text>
            <base-text>
              Accepted Terms: {{ organization.accepted_terms }}</base-text
            >
            <base-text>
              Accepted At: {{ organization.accepted_terms_at }}</base-text
            >
            <base-text variant="h3">Activites</base-text>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;">
              <div>
                <span>Damage Assessments:</span>
                <span>{{ organization.does_damage_assessment }}</span>
              </div>
              <div>
                <span>Intake Assessments:</span>
                <span>{{ organization.does_intake_assessment }}</span>
              </div>
              <div>
                <span>Cleanup:</span>
                <span>{{ organization.does_cleanup }}</span>
              </div>
              <div>
                <span>Follow-up:</span>
                <span>{{ organization.does_follow_up }}</span>
              </div>
              <div>
                <span>Minor Repairs:</span>
                <span>{{ organization.does_minor_repairs }}</span>
              </div>
              <div>
                <span>Rebuilding:</span>
                <span>{{ organization.does_rebuilding }}</span>
              </div>
              <div>
                <span>Coordination:</span>
                <span>{{ organization.does_coordination }}</span>
              </div>
              <div>
                <span>Government:</span>
                <span>{{ organization.government }}</span>
              </div>
              <div>
                <span>Review Other Orgs:</span>
                <span>{{ organization.review_other_organizations }}</span>
              </div>
              <div>
                <span>Cleanup:</span>
                <span>{{ organization.does_cleanup }}</span>
              </div>
              <div>
                <span>Other Activity:</span>
                <span>{{ organization.does_other_activity }}</span>
              </div>
              <div>
                <span>Not an Organization:</span>
                <span>{{ organization.not_an_org }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white p-3 shadow text-sm mr-4 mt-6">
        <base-text variant="h2" :weight="600">
          Roles
        </base-text>
        <form-select
          :value="organization.roles[0]"
          :placeholder="$t('Role')"
          class="w-auto flex-grow border border-crisiscleanup-dark-100 select"
          :options="roles"
          @input="roleToAdd = $event"
          item-key="id"
          label="name_t"
        ></form-select>
      </div>
      <div class="flex">
        <div class="w-1/2 bg-white shadow mt-6 mr-3">
          <div class="border-b px-8 py-4 font-semibold">
            {{ $t('Primary Location') }}
          </div>
          <div class="py-2 flex items-center justify-center">
            <base-button
              v-if="organization.primary_location"
              text="$t('profileOrg.edit_response_area')"
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
              text="$t('profileOrg.add_response_area')"
              :action="
                () => {
                  showingLocationModal = true;
                  settingLocation = 'primary_location';
                }
              "
            ></base-button>
          </div>
          <div id="primary-location" ref="primaryMap" class="w-full h-84"></div>
        </div>
        <div class="w-1/2 bg-white shadow mt-6">
          <div class="border-b px-8 py-4 font-semibold">
            {{ $t('Secondary Location') }}
          </div>
          <div class="py-2 flex items-center justify-center">
            <base-button
              v-if="organization.secondary_location"
              :text="$t('profileOrg.edit_response_area')"
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
              :action="
                () => {
                  showingLocationModal = true;
                  settingLocation = 'secondary_location';
                }
              "
            ></base-button>
          </div>
          <div
            id="secondary-location"
            ref="secondaryMap"
            class="w-full h-84"
          ></div>
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
            :organization="organization.id"
            class="h-full p-3"
            :locations="existingLocation"
            @changed="setCurrentLocation"
          />
        </modal>
      </div>
      <IncidentApprovalTable
        class="my-6"
        :requests="incidentRequests"
        @reload="() => {}"
      ></IncidentApprovalTable>
    </template>
  </Loader>
</template>

<script>
import * as L from 'leaflet';
import Location from '@/models/Location';
import Organization from '@/models/Organization';
import User from '@/models/User';
import Loader from '../../components/Loader';
import IncidentApprovalTable from '../../components/IncidentApprovalTable';
import { getErrorMessage } from '../../utils/errors';
import LocationTool from '../../components/LocationTool';
import { hash } from '../../utils/promise';

export default {
  name: 'AdminOrganization',
  components: { IncidentApprovalTable, Loader, LocationTool },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    existingLocation() {
      if (this.settingLocation === 'primary_location') {
        return this.organization.primary_location
          ? [this.organization.primary_location]
          : [];
      }

      if (this.settingLocation === 'secondary_location') {
        return this.organization.secondary_location
          ? [this.organization.secondary_location]
          : [];
      }
      return [];
    },
  },
  async mounted() {
    this.loading = true;
    await this.loadPageData();
    this.loading = false;

    this.$nextTick(async () => {
      this.primaryLocationMap = L.map('primary-location', {
        zoomControl: false,
      }).setView([35.7465122599185, -96.41150963125656], 3);
      this.secondaryLocationMap = L.map('secondary-location', {
        zoomControl: false,
      }).setView([35.7465122599185, -96.41150963125656], 3);
      this.createTileLayer().addTo(this.primaryLocationMap);
      this.createTileLayer().addTo(this.secondaryLocationMap);
      await this.reloadMaps();
    });
  },
  methods: {
    async loadPageData() {
      const pageData = await hash({
        organization: await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/admins/organizations/${this.$route.params.organization_id}`,
        ),
        roles: await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/organization_roles`,
        ),
        roleRequests: await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/admins/organization_role_requests?organization=${this.$route.params.organization_id}`,
        ),
        incidentRequests: await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/incident_requests?organization=${this.$route.params.organization_id}`,
        ),
        users: await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/users?organization=${this.$route.params.organization_id}`,
        ),
        ghostUsers: await this.getGhostUsers(),
      });
      this.organization = pageData.organization.data;
      this.roles = pageData.roles.data.results;
      this.roleRequests = pageData.roleRequests.data.results;
      this.incidentRequests = pageData.incidentRequests.data.results;
      this.users = pageData.users.data.results;
      this.ghostUsers = pageData.ghostUsers;
    },

    async getGhostUsers() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/ghost_users?organization=${this.$route.params.organization_id}`,
      );
      return response.data.results;
    },
    async approveOrganization(organizationId) {
      try {
        await Organization.api().approve(
          organizationId,
          this.organization.approve_reject_reason_t,
        );
        await this.$toasted.success(this.$t('~~Approved'));
        await this.loadPageData();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async rejectOrganization(organizationId) {
      try {
        await Organization.api().reject(
          organizationId,
          this.organization.approve_reject_reason_t,
        );
        await this.$toasted.success(this.$t('~~Rejected'));
        await this.loadPageData();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    createTileLayer() {
      return L.tileLayer(
        'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
        },
      );
    },
    async saveCurrentLocation() {
      let { geometry } = this.currentPolygon.toGeoJSON();
      const { type, features } = this.currentPolygon.toGeoJSON();
      const location = {};
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
        this.organization[this.settingLocation] = locationId;
        await this.reloadMaps();
        this.settingLocation = '';
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    setCurrentLocation(location) {
      this.currentPolygon = location;
    },
    async reloadMaps() {
      const { primary_location, secondary_location } = this.organization;

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
    async saveRole() {
      if (this.roleToAdd) {
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/admins/organization_role_requests`,
          {
            organization: this.organization.id,
            org_role: this.roleToAdd,
            approved_at: this.$moment().toISOString(),
            approved_by: this.currentUser.id,
          },
        );
      }
    },
    async saveOrganization() {
      try {
        await this.$http.put(
          `${process.env.VUE_APP_API_BASE_URL}/admins/organizations/${this.$route.params.organization_id}`,
          {
            ...this.organization,
          },
        );
        await this.saveRole();
        await this.$toasted.success(
          this.$t('~~Successfully Saved Organization'),
        );
        await this.loadPageData();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
  data() {
    return {
      apiUrl: process.env.VUE_APP_API_BASE_URL,
      loading: false,
      organization: null,
      roleToAdd: null,
      showingLocationModal: false,
      currentPolygon: null,
      primaryLocationMap: null,
      secondaryLocationMap: null,
      settingLocation: '',
      incidentRequests: [],
      roles: [],
      roleRequests: [],
      users: [],
      ghostUsers: [],
      organizationTypes: [
        'orgType.voad',
        'orgType.coad',
        'orgType.government',
        'orgType.ltr',
        'orgType.cleanup',
      ].map((key) => {
        return { key, label: this.$t(key) };
      }),
      approveRejectReasons: [
        'approveRejectReasons.approve_none',
        'approveRejectReasons.approve_public',
        'approveRejectReasons.approve_preliminary',
        'approveRejectReasons.approve_statistics',
        'approveRejectReasons.approve_situational_awareness',
        'approveRejectReasons.approve_coordination',
        'approveRejectReasons.approve_ltr',
        'approveRejectReasons.approve_recovery',
        'approveRejectReasons.approve_academic',
        'approveRejectReasons.approve_waiver',
        'approveRejectReasons.reject_not_reputable',
        'approveRejectReasons.reject_spam',
        'approveRejectReasons.reject_contractor',
        'approveRejectReasons.reject_duplicate',
        'approveRejectReasons.reject_inactive',
        'approveRejectReasons.reject_unresponsive',
        'approveRejectReasons.reject_no_capacity',
        'approveRejectReasons.reject_out_of_scope',
        'approveRejectReasons.reject_survivor',
        'approveRejectReasons.reject_volunteer',
        'approveRejectReasons.reject_withdrawn',
      ].map((key) => {
        return { key, label: this.$t(key) };
      }),
    };
  },
};
</script>

<style scoped>
.input {
  @apply w-120 my-1;
}
textarea {
  @apply w-120 my-1;
}
.select {
  @apply w-120 my-2 h-12 text-sm;
}
</style>
