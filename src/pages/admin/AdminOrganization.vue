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
            :href="`${apiUrl}/ccadmin/organizations/organization/${organization.id}/change/`"
          >
            {{ $t('adminOrganization.see_in_django') }}
          </base-link>
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
              <base-text variant="h2" :weight="600"> Info </base-text>
            </div>
            <base-input
              v-model="organization.name"
              type="text"
              class="input text-sm"
              size="large"
              :placeholder="$t('adminOrganization.name_org')"
            />
            <textarea
              v-model="organization.admin_notes"
              class="
                border border-crisiscleanup-dark-100
                placeholder-crisiscleanup-dark-200
                outline-none
                resize-none
                w-full
              "
              rows="4"
              :placeholder="$t('adminOrganization.admin_notes')"
            />
            <base-input
              v-model="organization.automatically_approve_user_domain"
              :placeholder="$t('adminOrganization.auto_approve_domain')"
              class="input text-sm"
              size="large"
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
              class="
                w-auto
                flex-grow
                border border-crisiscleanup-dark-100
                select
              "
              :options="organizationTypes"
              v-model="organization.type_t"
              item-key="key"
              label="label"
            />
            <form-select
              :placeholder="$t('orgApprovalTable.give_approve_reason')"
              class="
                w-auto
                flex-grow
                border border-crisiscleanup-dark-100
                select
              "
              :options="approveRejectReasons"
              v-model="organization.approve_reject_reason_t"
              item-key="key"
              label="label"
            />

            <div class="flex items-center justify-between">
              <base-text variant="h2" :weight="600">
                {{ $t('adminOrganization.api_keys') }}
              </base-text>
              <base-button
                :text="$t('actions.generate_api_key')"
                variant="solid"
                size="medium"
                :action="generateApiKey"
              />
            </div>
            <template v-if="apiKeys.length">
              <div v-for="key in apiKeys" :key="key">
                {{ key.api_key }} ({{ key.type }})
              </div>
            </template>
          </div>
          <div class="w-1/2 bg-white p-3 shadow text-sm">
            <base-text variant="h3">
              {{ $t('adminOrganization.primary_contacts') }}
            </base-text>
            <div
              style="
                display: grid;
                grid-template-columns: max-content max-content max-content max-content;
                grid-column-gap: 10px;
              "
              class="border px-2 py-1"
            >
              <template v-for="contact in organization.primary_contacts">
                <span class="inline-block" :key="contact.email">
                  {{ contact.first_name }} {{ contact.last_name }}
                </span>
                <span class="inline-block" :key="contact.email">
                  {{ contact.title ? contact.title : '' }}
                </span>
                <span class="inline-block" :key="contact.email">
                  {{ contact.email }}
                </span>
                <span class="inline-block" :key="contact.email">
                  {{ contact.mobile }}
                </span>
              </template>
            </div>
            <base-text variant="h3">
              {{ $t('adminOrganization.ghost_users') }}
            </base-text>
            <div
              style="
                display: grid;
                grid-template-columns: max-content max-content max-content max-content;
                grid-column-gap: 10px;
              "
              class="max-h-xl overflow-auto border px-2 py-1"
            >
              <template v-for="contact in ghostUsers">
                <span class="inline-block" :key="contact.email">
                  {{ contact.first_name }} {{ contact.last_name }}
                </span>
                <span class="inline-block" :key="contact.email">
                  {{ contact.title ? contact.title : '' }}
                </span>
                <span class="inline-block" :key="contact.email">
                  {{ contact.email }}
                </span>
                <span class="inline-block" :key="contact.email">
                  {{ contact.mobile }}
                </span>
              </template>
            </div>
            <div class="flex items-center justify-between my-1">
              <base-text variant="h3">
                {{ $t('adminOrganization.all_users') }}
              </base-text>
              <base-button
                :action="copyUsers"
                :text="$t('actions.copy_users')"
                variant="solid"
                size="small"
              />
            </div>
            <div
              style="
                display: grid;
                grid-template-columns: max-content max-content max-content max-content max-content;
                grid-column-gap: 10px;
              "
              class="max-h-xl overflow-auto border px-2 py-1"
            >
              <template v-for="user in users">
                <span class="inline-block" :key="`${user.id}`">
                  {{ user.first_name }} {{ user.last_name }}
                </span>
                <span class="inline-block" :key="`${user.id}`">
                  {{ user.title ? user.title : '' }}
                </span>
                <span class="inline-block" :key="`${user.id}`">
                  {{ user.email }}
                </span>
                <span class="inline-block" :key="`${user.id}`">
                  {{ user.mobile }}
                </span>
                <base-link
                  :key="`${user.id}`"
                  target="_blank"
                  :href="`${apiUrl}/ccadmin/users/user/${user.id}/change/`"
                >
                  {{ $t('adminOrganization.see_in_django') }}
                </base-link>
              </template>
            </div>
            <base-text variant="h3">
              {{ $t('adminOrganization.general_info') }}
            </base-text>
            <base-text>
              Where are you working:
              {{ organization.where_are_you_working }}</base-text
            >
            <base-text> Facebook: {{ organization.facebook }}</base-text>
            <base-text> Twitter: {{ organization.twitter }}</base-text>
            <base-text> Referral: {{ organization.referral }}</base-text>
            <base-text> Url: {{ organization.url }}</base-text>
            <base-text>
              Accepted Terms: {{ organization.accepted_terms }}
            </base-text>
            <base-text>
              Accepted At: {{ organization.accepted_terms_at }}
            </base-text>
            <base-text variant="h3">
              {{ $t('adminOrganization.activities') }}
            </base-text>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr">
              <div>
                <span>{{ $t('registerOrg.damage_assessment') }}</span>
                <span>{{ organization.does_damage_assessment }}</span>
              </div>
              <div>
                <span>{{ $t('registerOrg.intake_assessment') }}</span>
                <span>{{ organization.does_intake_assessment }}</span>
              </div>
              <div>
                <span>{{ $t('registerOrg.cleanup') }}</span>
                <span>{{ organization.does_cleanup }}</span>
              </div>
              <div>
                <span>{{ $t('registerOrg.follow_up') }}</span>
                <span>{{ organization.does_follow_up }}</span>
              </div>
              <div>
                <span>{{ $t('registerOrg.minor_repairs') }}</span>
                <span>{{ organization.does_minor_repairs }}</span>
              </div>
              <div>
                <span>{{ $t('registerOrg.rebuilding') }}</span>
                <span>{{ organization.does_rebuilding }}</span>
              </div>
              <div>
                <span>{{ $t('registerOrg.coordination') }}</span>
                <span>{{ organization.does_coordination }}</span>
              </div>
              <div>
                <span>{{ $t('registerOrg.government') }}</span>
                <span>{{ organization.government }}</span>
              </div>
              <div>
                <span>{{ $t('registerOrg.review_approve') }}</span>
                <span>{{ organization.review_other_organizations }}</span>
              </div>
              <div>
                <span>{{ $t('registerOrg.other_activity') }}</span>
                <span>{{ organization.does_other_activity }}</span>
              </div>
              <div>
                <span>{{ $t('registerOrg.not_organization') }}</span>
                <span>{{ organization.not_an_org }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white p-3 shadow text-sm mr-4 mt-6">
        <base-text variant="h2" :weight="600"> Roles </base-text>
        <form-select
          :value="organization.approved_roles[0]"
          :placeholder="$t('adminOrganization.role')"
          class="w-auto flex-grow border border-crisiscleanup-dark-100 select"
          :options="roles"
          @input="roleToAdd = $event"
          item-key="id"
          label="name_t"
          searchable
        />
      </div>
      <div class="bg-white p-3 shadow text-sm mr-4 mt-6">
        <base-text variant="h2" :weight="600">
          {{ $t('adminOrganization.capabilities') }}
        </base-text>
        <base-link
          target="_blank"
          :href="`${apiUrl}/ccadmin/capabilities/organizationorganizationscapabilities/?organization__id__exact=${organization.id}`"
        >
          {{ $t('adminOrganization.see_in_django') }}
        </base-link>
        <div class="flex item-start">
          <div>
            <div class="flex items-center justify-start">
              <form-select
                :placeholder="$t('adminOrganization.capability')"
                :value="capabilityToAdd"
                class="
                  w-auto
                  border border-crisiscleanup-dark-100
                  multi-select
                  mr-1
                "
                select-classes="h-full"
                :options="selectableCapabilities"
                multiple
                item-key="id"
                label="name_t"
                searchable
                @input="
                  (value) => {
                    capabilityToAdd = value;
                  }
                "
              />
              <base-button
                :text="$t('actions.add')"
                size="large"
                variant="solid"
                :action="
                  () => {
                    newCapabilities = [...newCapabilities, ...capabilityToAdd];
                    capabilityToAdd = null;
                  }
                "
              />
            </div>
            <base-text variant="h3"> New Capabilties </base-text>
            <div
              v-for="capability in newCapabilities"
              :key="`${capability.id}`"
            >
              {{ capability | getCapabilityName(capabilities) }}
            </div>
          </div>
          <div class="mx-3">
            <base-text variant="h3">
              {{ $t('adminOrganization.current_capabilities') }}
            </base-text>
            <div style="display: grid; grid-column-gap: 10px">
              <div
                class="pr-3"
                v-for="capability in organization.capabilities"
                :key="`${capability.id}`"
              >
                {{ capability | getCapabilityName(capabilities) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white p-3 shadow text-sm mr-4 mt-6">
        <base-text variant="h2" :weight="600"> Incidents </base-text>
        <div class="flex item-start">
          <div>
            <div class="flex items-center justify-start">
              <form-select
                :placeholder="$t('adminOrganization.incident')"
                :value="incidentToAdd"
                class="
                  w-auto
                  border border-crisiscleanup-dark-100
                  multi-select
                  mr-1
                "
                select-classes="h-full"
                :options="selectableIncidents"
                multiple
                item-key="id"
                label="name"
                searchable
                @input="
                  (value) => {
                    incidentToAdd = value;
                  }
                "
              />
              <base-button
                :text="$t('actions.add')"
                size="large"
                variant="solid"
                :action="
                  () => {
                    newIncidents = [...newIncidents, ...incidentToAdd];
                    incidentToAdd = null;
                  }
                "
              />
            </div>
            <base-text variant="h3">
              {{ $t('adminOrganization.new_incidents') }}
            </base-text>
            <div v-for="incident in newIncidents" :key="`${incident.id}`">
              {{ incident | getIncidentName(incidents) }}
            </div>

            <base-text variant="h3">
              {{ $t('adminOrganization.pending_requests') }}
            </base-text>
            <div
              style="
                display: grid;
                grid-template-columns: max-content auto;
                grid-row-gap: 5px;
              "
            >
              <template v-for="request in incidentRequests">
                <div class="flex items-center" :key="`${request.id}`">
                  <div
                    v-tooltip="{
                      content: getContactView(request),
                      trigger: 'hover',
                      classes: 'interactive-tooltip w-72',
                    }"
                  >
                    <ccu-icon
                      :alt="$t('actions.help_alt')"
                      type="info"
                      size="small"
                      class="mr-2"
                    />
                  </div>
                  {{ request.incident | getIncidentName(incidents) }}
                </div>
                <div class="flex" :key="`${request.id}`">
                  <base-button
                    v-if="request.org_verified"
                    :text="$t('actions.approve')"
                    variant="solid"
                    size="small"
                    class="mx-2 w-24"
                    :action="
                      () => {
                        approveIncidentRequest(request.id);
                      }
                    "
                  />
                  <base-button
                    :text="$t('actions.reject')"
                    variant="outline"
                    size="small"
                    class="mx-2 w-24"
                    v-if="request.org_verified"
                    :action="
                      () => {
                        rejectIncidentRequest(request.id);
                      }
                    "
                  />
                </div>
              </template>
            </div>
          </div>
          <div class="mx-3">
            <base-text variant="h3">
              {{ $t('adminOrganization.current_incidents') }}
            </base-text>
            <div
              style="
                display: grid;
                grid-template-columns: max-content max-content;
                grid-column-gap: 10px;
              "
            >
              <div
                class="pr-3"
                v-for="incident in organization.approved_incidents"
                :key="`${incident.id}`"
              >
                {{ incident | getIncidentName(incidents) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-3 shadow text-sm mr-4 mt-6">
        <base-text variant="h2" :weight="600"> Groups </base-text>
        <div class="flex item-start">
          <div>
            <div class="flex items-center justify-start">
              <GroupSearchInput
                @selectedGroup="groupToAdd = $event"
                class="w-108"
                size="large"
              />
              <base-button
                :text="$t('actions.add')"
                size="large"
                variant="solid"
                :action="
                  () => {
                    newGroups = [...newGroups, ...groupToAdd];
                    groupToAdd = null;
                  }
                "
              />
            </div>
            <base-text variant="h3" class="pt-2">
              {{ $t('adminOrganization.new_groups') }}
            </base-text>
            <div v-for="group in newGroups" :key="`${group.id}`">
              {{ group.name }}
            </div>
          </div>
          <div class="mx-3">
            <base-text variant="h3">
              {{ $t('adminOrganization.current_groups') }}
            </base-text>
            <div>
              <div
                class="pr-3 flex items-center"
                v-for="group in groups"
                :key="`${group.id}`"
              >
                {{ group.name }}
                <ccu-icon
                  :alt="$t('actions.delete')"
                  class="ml-1"
                  size="xs"
                  type="cancel"
                  :action="
                    () => {
                      return deleteGroup(group);
                    }
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex">
        <div class="w-1/2 bg-white shadow mt-6 mr-3">
          <div class="border-b px-8 py-4 font-semibold">
            {{ $t('adminOrganization.primary_location') }}
          </div>
          <div class="py-2 flex items-center justify-center">
            <base-button
              v-if="organization.primary_location"
              :text="$t('profileOrg.edit_response_area')"
              variant="solid"
              class="px-2 py-1"
              :action="
                () => {
                  showingLocationModal = true;
                  settingLocation = 'primary_location';
                }
              "
            />
            <base-button
              v-else
              class="px-2 py-1"
              variant="solid"
              :text="$t('profileOrg.add_response_area')"
              :action="
                () => {
                  showingLocationModal = true;
                  settingLocation = 'primary_location';
                }
              "
            />
          </div>
          <div id="primary-location" ref="primaryMap" class="w-full h-84" />
        </div>
        <div class="w-1/2 bg-white shadow mt-6">
          <div class="border-b px-8 py-4 font-semibold">
            {{ $t('adminOrganization.secondary_location') }}
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
            />
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
            />
          </div>
          <div id="secondary-location" ref="secondaryMap" class="w-full h-84" />
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
        <modal
          v-if="showingApiKeyModal"
          :title="$t('adminOrganization.org_api_keys')"
          modal-classes="max-w-sm"
          @close="showingApiKeyModal = false"
          closeable
        >
          <div class="flex flex-col items-center justify-center p-3">
            <base-input
              :value="apiKey"
              disabled
              class="w-full"
              input-classes=""
            />
            <base-button
              :action="copyApiKey"
              :text="$t('actions.copy_key')"
              variant="solid"
              size="medium"
              class="my-2"
            />
          </div>
        </modal>
      </div>
    </template>
  </Loader>
</template>

<script>
import * as L from 'leaflet';
import Location from '@/models/Location';
import Organization from '@/models/Organization';
import User from '@/models/User';
import LocationType from '@/models/LocationType';
import Loader from '../../components/Loader';
import { getErrorMessage } from '../../utils/errors';
import LocationTool from '../../components/LocationTool';
import { hash } from '../../utils/promise';
import { DialogsMixin } from '../../mixins';
import { mapTileLayer } from '../../utils/map';
import GroupSearchInput from '../../components/GroupSearchInput';

export default {
  name: 'AdminOrganization',
  components: { GroupSearchInput, Loader, LocationTool },
  mixins: [DialogsMixin],
  filters: {
    getCapabilityName(value, capabilities) {
      return (
        capabilities.length && capabilities.find((c) => c.id === value).name_t
      );
    },
    getIncidentName(value, incidents) {
      return incidents.length && incidents.find((c) => c.id === value).name;
    },
  },
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
    selectableCapabilities() {
      if (this.organization) {
        return this.capabilities.filter((capability) => {
          return (
            !this.organization.capabilities.includes(capability.id) &&
            !this.newCapabilities.includes(capability.id)
          );
        });
      }
      return [];
    },
    selectableIncidents() {
      if (this.organization) {
        return this.incidents.filter((incident) => {
          return (
            !this.organization.approved_incidents.includes(incident.id) &&
            !this.newIncidents.includes(incident.id)
          );
        });
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
    getContactView(request) {
      const contact = request.requested_by_contact;
      if (!request.requested_by_contact) {
        return '';
      }
      return `
          <div>Requested By</div>
          <div>${contact.first_name} ${contact.last_name}</div>
          <div>${contact.email}</div>
          <div>${contact.mobile}</div>
          </p>
        `;
    },
    async approveIncidentRequest(requestId) {
      await this.$http.post(
        `${process.env.VUE_APP_API_BASE_URL}/incident_requests/${requestId}/respond`,
        {
          action: 'approve',
        },
      );
      this.loadPageData();
    },
    async rejectIncidentRequest(requestId) {
      await this.$http.post(
        `${process.env.VUE_APP_API_BASE_URL}/incident_requests/${requestId}/respond`,
        {
          action: 'reject',
        },
      );
      this.loadPageData();
    },
    async loadPageData() {
      try {
        const pageData = await hash({
          organization: await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/admins/organizations/${this.$route.params.organization_id}`,
          ),
          roles: await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/organization_roles`,
          ),
          capabilities: await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/organization_capabilities?limit=200`,
          ),
          roleRequests: await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/admins/organization_role_requests?organization=${this.$route.params.organization_id}`,
          ),
          incidentRequests: await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/admins/incident_requests?organization=${this.$route.params.organization_id}`,
          ),
          users: await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/users?organization=${this.$route.params.organization_id}`,
          ),
          incidents: await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/incidents?fields=id,name,short_name,geofence,locations&limit=200&sort=-start_at`,
          ),
          apiKeys: await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/admins/organizations/${this.$route.params.organization_id}/get_api_keys`,
          ),
          ghostUsers: await this.getGhostUsers(),
        });

        this.organization = pageData.organization.data;
        this.capabilities = pageData.capabilities.data.results;
        this.roles = pageData.roles.data.results;
        this.roleRequests = pageData.roleRequests.data.results;
        this.incidentRequests = pageData.incidentRequests.data.results;
        this.users = pageData.users.data.results;
        this.incidents = pageData.incidents.data.results;
        this.ghostUsers = pageData.ghostUsers;
        this.apiKeys = pageData.apiKeys.data;

        if (this.organization.approved_groups.length) {
          const groupsResponse = await this.$http.get(
            `${
              process.env.VUE_APP_API_BASE_URL
            }/groups?id__in=${this.organization.approved_groups.join(',')}`,
          );
          this.groups = groupsResponse.data.results;
        } else {
          this.groups = [];
        }
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
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
        await this.$toasted.success(this.$t('info.approved'));
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
        await this.$toasted.success(this.$t('info.rejected'));
        await this.loadPageData();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    createTileLayer() {
      return L.tileLayer(mapTileLayer, {
        // tileSize: 512,
        // zoomOffset: -1,
        maxZoom: 19,
      });
    },
    async saveCurrentLocation() {
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
        name: `${this.organization.name} ${this.$t(locationType.name_t)}`,
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
      const {
        primary_location: primaryLocation,
        secondary_location: secondaryLocation,
      } = this.organization;

      if (primaryLocation) {
        this.primaryLocationMap.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            return;
          }
          this.primaryLocationMap.removeLayer(layer);
        });
        await Location.api().fetchById(primaryLocation);
        const location = Location.find(primaryLocation);
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        L.geoJSON(geojsonFeature, {
          weight: '1',
        }).addTo(this.primaryLocationMap);
      }
      if (secondaryLocation) {
        this.secondaryLocationMap.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            return;
          }
          this.secondaryLocationMap.removeLayer(layer);
        });
        await Location.api().fetchById(secondaryLocation);
        const location = Location.find(secondaryLocation);
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
        await Promise.all(
          this.roleRequests.map((request) =>
            this.$http.delete(
              `${process.env.VUE_APP_API_BASE_URL}/admins/organization_role_requests/${request.id}`,
            ),
          ),
        );
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
    async saveCapabilities() {
      if (this.newCapabilities.length) {
        try {
          await Promise.all(
            this.newCapabilities.map((id) =>
              this.$http.post(
                `${process.env.VUE_APP_API_BASE_URL}/admins/organization_organizations_capabilities`,
                {
                  organization: this.organization.id,
                  capability: id,
                },
              ),
            ),
          );
          this.newCapabilities = [];
        } catch (error) {
          await this.$toasted.error(getErrorMessage(error));
        }
      }
    },
    async saveIncidents() {
      if (this.newIncidents.length) {
        try {
          await Promise.all(
            this.newIncidents.map((id) =>
              this.$http.post(
                `${process.env.VUE_APP_API_BASE_URL}/admins/incident_requests`,
                {
                  organization: this.organization.id,
                  incident: id,
                  approved_at: this.$moment().toISOString(),
                  approved_by: this.currentUser.id,
                  requested_by: this.currentUser.id,
                },
              ),
            ),
          );
          this.newIncidents = [];
        } catch (error) {
          await this.$toasted.error(getErrorMessage(error));
        }
      }
    },
    async saveGroups() {
      if (this.newGroups.length) {
        try {
          await Promise.all(
            this.newGroups.map((group) =>
              this.$http.post(
                `${process.env.VUE_APP_API_BASE_URL}/groups/${group.id}/organizations`,
                {
                  organization: this.organization.id,
                },
              ),
            ),
          );
          this.newGroups = [];
        } catch (error) {
          await this.$toasted.error(getErrorMessage(error));
        }
      }
    },
    async deleteGroup(group) {
      const result = await this.$confirm({
        title: this.$t('~~Remove Organization From Group'),
        content: this.$t(
          '~~Do you want to remove this organization from this group?',
        ),
        actions: {
          no: {
            text: this.$t('actions.cancel'),
            type: 'outline',
            buttonClass: 'border border-black',
          },
          yes: {
            text: this.$t('actions.ok'),
            type: 'solid',
          },
        },
      });
      if (result === 'no' || result === 'cancel') {
        return;
      }

      await this.$http.delete(
        `${process.env.VUE_APP_API_BASE_URL}/groups/${group.id}/organizations`,
        {
          data: { organization: this.organization.id },
        },
      );
      await this.loadPageData();
    },
    async saveOrganization() {
      try {
        await this.$http.put(
          `${process.env.VUE_APP_API_BASE_URL}/admins/organizations/${this.$route.params.organization_id}`,
          {
            ...this.organization,
          },
        );
        await Promise.all([
          this.saveRole(),
          this.saveCapabilities(),
          this.saveIncidents(),
          this.saveGroups(),
        ]);
        await this.loadPageData();
        await this.$toasted.success(this.$t('info.success_saved_organization'));
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async copyUsers() {
      let text = '';
      this.users.forEach((user) => {
        text += `${user.first_name}\t${user.last_name}\t${user.email}\t${user.mobile}\t\n`;
      });
      await this.$copyText(text);
      this.$toasted.success(this.$t('info.users_copied'));
    },
    async copyApiKey() {
      await this.$copyText(this.apiKey);
      this.$toasted.success(this.$t('adminOrganization.api_key_copied'));
    },
    async generateApiKey() {
      const result = await this.$selection({
        title: this.$t('actions.generate_api_key'),
        content: this.$t('adminOrganization.please_select_api_key_type'),
        options: ['public', 'read'],
        placeholder: this.$t('adminOrganization.key_type'),
      });
      if (result) {
        const response = await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/admins/organizations/${this.$route.params.organization_id}/create_api_key`,
          {
            type: result,
          },
        );
        const { api_key: apiKey } = response.data;
        this.apiKey = apiKey;
        this.showingApiKeyModal = true;
        this.loadPageData();
      }
    },
  },
  data() {
    return {
      apiUrl: process.env.VUE_APP_API_BASE_URL,
      loading: false,
      organization: null,
      roleToAdd: null,
      capabilityToAdd: null,
      incidentToAdd: null,
      groupToAdd: null,
      showingLocationModal: false,
      showingApiKeyModal: false,
      apiKey: false,
      currentPolygon: null,
      primaryLocationMap: null,
      secondaryLocationMap: null,
      settingLocation: '',
      incidentRequests: [],
      roles: [],
      apiKeys: [],
      roleRequests: [],
      users: [],
      ghostUsers: [],
      capabilities: [],
      incidents: [],
      newCapabilities: [],
      newIncidents: [],
      groups: [],
      newGroups: [],
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
.multi-select {
  @apply w-120 my-2 text-sm;
  min-height: 3rem;
}
</style>
