<template>
  <template v-if="organization">
    <div class="flex items-center justify-between">
      <base-text variant="h1" :weight="600">
        {{ organization.id }}: {{ organization.name }}
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
        <template v-if="!organization.approved_by && !organization.rejected_by">
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
      <div class="flex flex-col sm:flex-row">
        <div class="sm:mb-0 mb-7 sm:w-1/2 bg-white p-3 shadow text-sm mr-4">
          <div class="flex items-center justify-between">
            <base-text variant="h2" :weight="600"> Info</base-text>
          </div>
          <FloatingInput
            v-model="organization.name"
            type="text"
            class="input text-sm"
            size="small"
            :placeholder="$t('adminOrganization.name_org')"
          />
          <FloatingInput
            v-model="organization.email"
            type="text"
            class="input text-sm"
            size="large"
            :placeholder="$t('adminOrganization.email')"
          />
          <FloatingInput
            v-model="organization.phone1"
            type="text"
            class="input text-sm"
            size="large"
            :placeholder="$t('adminOrganization.phone1')"
          />
          <FloatingInput
            v-model="organization.address"
            type="text"
            class="input text-sm"
            size="large"
            :placeholder="$t('adminOrganization.address')"
          />
          <FloatingInput
            v-model="organization.url"
            type="text"
            class="input text-sm"
            size="large"
            :placeholder="$t('adminOrganization.url')"
          />
          <div class="sm:flex mb-2 sm:mb-1">
            <div class="flex items-center">
              <img src="@/assets/facebook.svg" class="w-8 mr-2" />
              <label class="pr-3 text-xs">{{
                $t('profileOrg.facebook')
              }}</label>
            </div>
            <base-input
              size="small"
              v-model="organization.facebook"
              :placeholder="$t('profileOrg.facebook')"
            />
          </div>
          <div class="sm:flex mb-2 sm:mb-0">
            <div class="flex items-center">
              <img src="@/assets/twitter.svg" class="ml-1 w-6 mr-2 mb-1" />
              <label class="pr-3 text-xs">{{ $t('profileOrg.twitter') }}</label>
            </div>
            <base-input
              size="small"
              v-model="organization.twitter"
              :placeholder="$t('profileOrg.twitter')"
            />
          </div>
          <textarea
            v-model="organization.admin_notes"
            class="border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none resize-none w-full"
            rows="4"
            :placeholder="$t('adminOrganization.admin_notes')"
          />
          <FloatingInput
            v-model="organization.automatically_approve_user_domain"
            :placeholder="$t('adminOrganization.auto_approve_domain')"
            class="input text-sm pb-4 sm:pb-0"
            size="large"
          />
          <base-checkbox class="mb-4 sm:mb-0" v-model="organization.is_active">
            Is Active
          </base-checkbox>
          <base-checkbox
            class="mb-4 sm:mb-0"
            v-model="organization.is_verified"
          >
            Org Verified
          </base-checkbox>
          <base-checkbox class="mb-4 sm:mb-0" v-model="organization.publish">
            Publish
          </base-checkbox>
          <base-select
            :placeholder="$t('profileOrg.organization_type')"
            class="my-2"
            :options="organizationTypes"
            v-model="organization.type_t"
            select-classes="p-1"
            item-key="key"
            label="label"
          />
          <base-select
            :model-value="currentRole"
            :placeholder="$t('adminOrganization.role')"
            class="my-2"
            :options="roles"
            @update:modelValue="
              (e) => {
                roleToAdd = e;
                currentRole = e;
              }
            "
            select-classes="p-1"
            item-key="id"
            label="name_t"
            searchable
          />
          <base-select
            :placeholder="$t('orgApprovalTable.give_approve_reason')"
            class="my-2"
            :options="approveRejectReasons"
            v-model="organization.approve_reject_reason_t"
            item-key="key"
            label="label"
            select-classes="p-1"
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
          <template v-if="apiKeys.length > 0">
            <div v-for="key in apiKeys" :key="key">
              {{ key.api_key }} ({{ key.type }})
            </div>
          </template>

          <div class="logo-field form-row mt-3">
            <base-text variant="h2" :weight="600">
              {{ $t('profileOrg.organization_logo') }}
            </base-text>
            <div class="flex">
              <div v-if="!logoUrl">
                <DragDrop
                  class="sm:w-84 sm:h-16 text-center mr-6 border border-dashed"
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
                  class="w-84"
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
        </div>
        <div class="sm:w-1/2 bg-white p-3 shadow text-sm">
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
            <template
              v-for="contact in organization.primary_contacts"
              :key="contact.email"
            >
              <span class="inline-block">
                {{ contact.first_name }} {{ contact.last_name }}
              </span>
              <span class="inline-block">
                {{ contact.title ? contact.title : '' }}
              </span>
              <span class="inline-block">
                {{ contact.email }}
              </span>
              <span class="inline-block">
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
            <template v-for="contact in ghostUsers" :key="contact.email">
              <span class="inline-block">
                {{ contact.first_name }} {{ contact.last_name }}
              </span>
              <span class="inline-block">
                {{ contact.title ? contact.title : '' }}
              </span>
              <span class="inline-block">
                {{ contact.email }}
              </span>
              <span class="inline-block">
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
            <template v-for="user in users" :key="user.id">
              <span class="inline-block">
                {{ user.first_name }} {{ user.last_name }}
              </span>
              <span class="inline-block">
                {{ user.title ? user.title : '' }}
              </span>
              <span class="inline-block">
                {{ user.email }}
              </span>
              <span class="inline-block">
                {{ user.mobile }}
              </span>
              <base-link
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
            {{ organization.where_are_you_working }}
          </base-text>
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
      <base-text variant="h2" :weight="600">
        {{ $t('adminOrganization.capabilities') }}
      </base-text>
      <base-link
        target="_blank"
        :href="`${apiUrl}/ccadmin/capabilities/organizationorganizationscapabilities/?organization__id__exact=${organization.id}`"
      >
        {{ $t('adminOrganization.see_in_django') }}
      </base-link>
      <CapabilityGrid
        class="mt-3"
        :organization-capabilities="organizationCapabilities"
        :key="JSON.stringify(organizationCapabilities)"
        @updated="
          (matrix) => {
            updatedOrganizationCapabilitiesMatrix = matrix;
          }
        "
      />
    </div>
    <div class="bg-white p-3 shadow text-sm mr-4 mt-6">
      <base-text variant="h2" :weight="600">
        {{ $t('adminOrganization.incidents') }}
      </base-text>
      <div class="flex flex-col sm:flex-row item-start">
        <div>
          <div class="flex items-center justify-start">
            <base-select
              :placeholder="$t('adminOrganization.incident')"
              :model-value="incidentToAdd"
              class="my-2 mr-1 w-108"
              select-classes="h-full p-1"
              :options="selectableIncidents"
              multiple
              item-key="id"
              label="name"
              searchable
              @update:modelValue="
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
            {{ getIncidentName(incident, incidents) }}
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
            <template
              v-for="request in incidentRequests"
              :key="`${request.id}`"
            >
              <div class="flex items-center">
                <div
                  v-tooltip="{
                    content: getContactView(request),
                    triggers: ['hover'],
                    html: true,
                    popperClass: 'interactive-tooltip w-72',
                  }"
                >
                  <ccu-icon
                    :alt="$t('actions.help_alt')"
                    type="info"
                    size="small"
                    class="mr-2"
                  />
                </div>
                {{ getIncidentName(request.incident, incidents) }}
              </div>
              <div class="flex">
                <base-button
                  v-if="request.is_verified"
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
                  v-if="request.is_verified"
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
              {{ getIncidentName(incident, incidents) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-3 shadow text-sm mr-4 mt-6">
      <base-text variant="h2" :weight="600"> Groups</base-text>
      <div class="flex flex-col sm:flex-row item-start">
        <div class="w-84">
          <div class="flex items-center justify-start w-full">
            <GroupSearchInput
              v-model="groupToAdd"
              class="mr-1 w-108"
              size="large"
            />
            <base-button
              :text="$t('actions.add')"
              size="large"
              variant="solid"
              :action="
                () => {
                  newGroups = [...newGroups, groupToAdd];
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
                editLocation('primary_location');
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
                editLocation('primary_location');
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
                editLocation('secondary_location');
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
                editLocation('secondary_location');
              }
            "
          />
        </div>
        <div id="secondary-location" ref="secondaryMap" class="w-full h-84" />
      </div>
      <modal
        v-if="showingApiKeyModal"
        :title="$t('adminOrganization.org_api_keys')"
        modal-classes="max-w-sm"
        @close="showingApiKeyModal = false"
        closeable
      >
        <div class="flex flex-col items-center justify-center p-3">
          <FloatingInput
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
  <div v-else class="flex h-screen items-center justify-center">
    <font-awesome-icon size="xl" icon="spinner" spin />
  </div>
</template>

<script>
import * as L from 'leaflet';
import { computed, nextTick, onMounted, reactive, toRefs } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { useRoute, useRouter } from 'vue-router';
import moment from 'moment';
import { useMq } from 'vue3-mq';
import { getErrorMessage } from '../../utils/errors';
import LocationTool from '../../components/locations/LocationTool.vue';
import { hash, cachedGet } from '../../utils/promise';
import { mapTileLayer } from '../../utils/map';
import GroupSearchInput from '../../components/GroupSearchInput.vue';
import DragDrop from '../../components/DragDrop.vue';
import CapabilityGrid from '../../components/CapabilityGrid.vue';
import LocationType from '../../models/LocationType';
import Organization from '../../models/Organization';
import Location from '../../models/Location';
import FloatingInput from '../../components/FloatingInput.vue';
import useCurrentUser from '../../hooks/useCurrentUser';
import useDialogs from '../../hooks/useDialogs';
import useCapabilities from '../../hooks/useCapabilities';

export default {
  name: 'AdminOrganization',
  components: {
    FloatingInput,
    DragDrop,
    CapabilityGrid,
    GroupSearchInput,
  },
  setup() {
    const { t } = useI18n();
    const $toasted = useToast();
    const route = useRoute();
    const { confirm, selection, component } = useDialogs();
    const { saveCapabilities } = useCapabilities();
    const mq = useMq();

    const state = reactive({
      apiUrl: import.meta.env.VITE_APP_API_BASE_URL,
      loading: false,
      organization: null,
      roleToAdd: null,
      capabilityToAdd: null,
      incidentToAdd: null,
      groupToAdd: null,
      showingApiKeyModal: false,
      apiKey: '',
      currentPolygon: null,
      primaryLocationMap: null,
      secondaryLocationMap: null,
      settingLocation: '',
      incidentRequests: [],
      currentRole: null,
      roles: [],
      apiKeys: [],
      roleRequests: [],
      users: [],
      ghostUsers: [],
      capabilities: [],
      organizationCapabilities: [],
      updatedOrganizationCapabilitiesMatrix: null,
      incidents: [],
      newCapabilities: [],
      newIncidents: [],
      groups: [],
      newGroups: [],
      uploading: false,
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
        return { key, label: t(key) };
      }),
    });
    const stateRefs = toRefs(state);

    const { currentUser } = useCurrentUser();
    const logoUrl = computed(() => {
      if (stateRefs.organization.value.files.length > 0) {
        const logos = stateRefs.organization.value.files.filter(
          (file) => file.file_type_t === 'fileTypes.logo',
        );
        if (logos.length > 0) {
          return logos[0].small_thumbnail_url;
        }
      }
      return '';
    });

    const existingLocation = computed(() => {
      if (stateRefs.settingLocation.value === 'primary_location') {
        return stateRefs.organization.value.primary_location
          ? [stateRefs.organization.value.primary_location]
          : [];
      }

      if (stateRefs.settingLocation.value === 'secondary_location') {
        return stateRefs.organization.value.secondary_location
          ? [stateRefs.organization.value.secondary_location]
          : [];
      }
      return [];
    });

    const selectableCapabilities = computed(() => {
      if (stateRefs.organization.value) {
        return stateRefs.capabilities.value.filter((capability) => {
          return (
            !stateRefs.organization.value.capabilities.includes(
              capability.id,
            ) && !stateRefs.newCapabilities.value.includes(capability.id)
          );
        });
      }
      return [];
    });

    const selectableIncidents = computed(() => {
      if (stateRefs.organization.value) {
        return stateRefs.incidents.value.filter((incident) => {
          return (
            !stateRefs.organization.value.approved_incidents.includes(
              incident.id,
            ) && !stateRefs.newIncidents.value.includes(incident.id)
          );
        });
      }
      return [];
    });

    async function editLocation(type) {
      stateRefs.settingLocation.value = type;
      const classes = 'h-full p-3';
      const response = await component({
        title: t('profileOrg.select_location'),
        component: LocationTool,
        modalClasses: `w-${mq.current !== 'sm' ? '2/3' : 'full'}`,
        props: {
          organization: stateRefs.organization.value.id,
          class: classes,
          locations: existingLocation.value,
        },
        listeners: {
          changed: (payload) => {
            setCurrentLocation(payload);
          },
        },
      });

      if (response !== 'cancel') {
        await saveCurrentLocation();
      }
    }

    function getCapabilityName(value, capabilities) {
      return (
        capabilities.length > 0 &&
        capabilities.find((c) => c.id === value).name_t
      );
    }
    function getIncidentName(value, incidents) {
      return incidents.length > 0 && incidents.find((c) => c.id === value).name;
    }

    async function handleFileUpload(fileList, type, deleteOldFiles = true) {
      if (fileList.length === 0) {
        stateRefs.uploading.value = false;
        return;
      }
      const formData = new FormData();
      formData.append('upload', fileList[fileList.length - 1]);
      formData.append('type_t', type);
      stateRefs.uploading.value = true;
      try {
        const result = await axios.post(
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

        const files = stateRefs.organization.value.files.filter(
          (picture) => picture.file_type_t === type,
        );

        if (deleteOldFiles) {
          const oldFiles = files.map((picture) =>
            Organization.api().deleteFile(
              stateRefs.organization.value.id,
              picture.file,
            ),
          );
          await Promise.all(oldFiles);
        }

        await Organization.api().addFile(
          stateRefs.organization.value.id,
          file,
          type,
        );
        await saveOrganization();
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        stateRefs.uploading.value = false;
      }
    }
    function getContactView(request) {
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
    }
    async function approveIncidentRequest(requestId) {
      await axios.post(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/incident_requests/${requestId}/respond`,
        {
          action: 'approve',
        },
      );
      await loadPageData();
    }
    async function rejectIncidentRequest(requestId) {
      await axios.post(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/incident_requests/${requestId}/respond`,
        {
          action: 'reject',
        },
      );
      await loadPageData();
    }
    async function loadPageData() {
      try {
        const pageData = await hash({
          organization: await axios.get(
            `${import.meta.env.VITE_APP_API_BASE_URL}/admins/organizations/${
              route.params.organization_id
            }`,
          ),
          roles: await cachedGet(
            `${import.meta.env.VITE_APP_API_BASE_URL}/organization_roles`,
            {},
            'organizations_roles',
          ),
          capabilities: await cachedGet(
            `${
              import.meta.env.VITE_APP_API_BASE_URL
            }/organization_capabilities?limit=200`,
            {},
            'organization_capabilities',
          ),
          organizationCapabilities: await axios.get(
            `${
              import.meta.env.VITE_APP_API_BASE_URL
            }/admins/organization_organizations_capabilities?organization=${
              route.params.organization_id
            }`,
          ),
          roleRequests: await axios.get(
            `${
              import.meta.env.VITE_APP_API_BASE_URL
            }/admins/organization_role_requests?organization=${
              route.params.organization_id
            }`,
          ),
          incidentRequests: await axios.get(
            `${
              import.meta.env.VITE_APP_API_BASE_URL
            }/admins/incident_requests?organization=${
              route.params.organization_id
            }`,
          ),
          users: await axios.get(
            `${import.meta.env.VITE_APP_API_BASE_URL}/users?organization=${
              route.params.organization_id
            }`,
          ),
          incidents: await axios.get(
            `${
              import.meta.env.VITE_APP_API_BASE_URL
            }/incidents?fields=id,name,short_name,geofence,locations,active_phone_number&limit=200&sort=-start_at`,
          ),
          apiKeys: await axios.get(
            `${import.meta.env.VITE_APP_API_BASE_URL}/admins/organizations/${
              route.params.organization_id
            }/get_api_keys`,
          ),
          ghostUsers: await getGhostUsers(),
        });

        stateRefs.organization.value = pageData.organization.data;
        stateRefs.capabilities.value = pageData.capabilities.data.results;
        stateRefs.organizationCapabilities.value =
          pageData.organizationCapabilities.data.results;
        stateRefs.roles.value = pageData.roles.data.results;
        stateRefs.roleRequests.value = pageData.roleRequests.data.results;
        stateRefs.incidentRequests.value =
          pageData.incidentRequests.data.results;
        stateRefs.users.value = pageData.users.data.results;
        stateRefs.incidents.value = pageData.incidents.data.results;
        stateRefs.ghostUsers.value = pageData.ghostUsers;
        stateRefs.apiKeys.value = pageData.apiKeys.data;

        [stateRefs.currentRole.value] =
          stateRefs.organization.value.approved_roles;

        if (stateRefs.organization.value.approved_groups.length > 0) {
          const groupsResponse = await axios.get(
            `${
              import.meta.env.VITE_APP_API_BASE_URL
            }/groups?id__in=${stateRefs.organization.value.approved_groups.join(
              ',',
            )}`,
          );
          stateRefs.groups.value = groupsResponse.data.results;
        } else {
          stateRefs.groups.value = [];
        }
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    async function getGhostUsers() {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/ghost_users?organization=${
          route.params.organization_id
        }`,
      );
      return response.data.results;
    }
    async function approveOrganization(organizationId) {
      try {
        await Organization.api().approve(
          organizationId,
          stateRefs.organization.value.approve_reject_reason_t,
        );
        await $toasted.success(t('info.approved'));
        await loadPageData();
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    async function rejectOrganization(organizationId) {
      try {
        await Organization.api().reject(
          organizationId,
          stateRefs.organization.value.approve_reject_reason_t,
        );
        await $toasted.success(t('info.rejected'));
        await loadPageData();
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    function createTileLayer() {
      return L.tileLayer(mapTileLayer, {
        // tileSize: 512,
        // zoomOffset: -1,
        maxZoom: 19,
      });
    }
    async function saveCurrentLocation() {
      let { geometry } = stateRefs.currentPolygon.value.toGeoJSON();
      const { type, features } = stateRefs.currentPolygon.value.toGeoJSON();
      let locationTypeKey = 'org_primary_response_area';
      if (stateRefs.settingLocation.value === 'secondary_location') {
        locationTypeKey = 'org_secondary_response_area';
      }
      const locationType = LocationType.query()
        .where('key', locationTypeKey)
        .get()[0];
      const location = {
        name: `${stateRefs.organization.value.name} ${t(locationType.name_t)}`,
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
        stateRefs.organization.value[stateRefs.settingLocation.value] =
          locationId;
        await reloadMaps();
        stateRefs.settingLocation.value = '';
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    function setCurrentLocation(location) {
      stateRefs.currentPolygon.value = location;
    }
    async function reloadMaps() {
      const {
        primary_location: primaryLocation,
        secondary_location: secondaryLocation,
      } = stateRefs.organization.value;

      if (primaryLocation) {
        stateRefs.primaryLocationMap.value.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            return;
          }
          stateRefs.primaryLocationMap.value.removeLayer(layer);
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
        }).addTo(stateRefs.primaryLocationMap.value);
      }
      if (secondaryLocation) {
        stateRefs.secondaryLocationMap.value.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            return;
          }
          stateRefs.secondaryLocationMap.value.removeLayer(layer);
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
        }).addTo(stateRefs.secondaryLocationMap.value);
      }
    }
    async function saveRole() {
      if (stateRefs.roleToAdd.value) {
        await Promise.all(
          stateRefs.roleRequests.value.map((request) =>
            axios.delete(
              `${
                import.meta.env.VITE_APP_API_BASE_URL
              }/admins/organization_role_requests/${request.id}`,
            ),
          ),
        );
        await axios.post(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/admins/organization_role_requests`,
          {
            organization: stateRefs.organization.value.id,
            org_role: stateRefs.roleToAdd.value,
            approved_at: moment().toISOString(),
            approved_by: currentUser.id,
          },
        );
      }
    }
    async function saveIncidents() {
      if (stateRefs.newIncidents.value.length > 0) {
        try {
          await Promise.all(
            stateRefs.newIncidents.value.map((id) =>
              axios.post(
                `${
                  import.meta.env.VITE_APP_API_BASE_URL
                }/admins/incident_requests`,
                {
                  organization: stateRefs.organization.value.id,
                  incident: id,
                  approved_at: moment().toISOString(),
                  approved_by: currentUser.id,
                  requested_by: currentUser.id,
                },
              ),
            ),
          );
          stateRefs.newIncidents.value = [];
        } catch (error) {
          await $toasted.error(getErrorMessage(error));
        }
      }
    }
    async function saveGroups() {
      if (stateRefs.newGroups.value.length > 0) {
        try {
          await Promise.all(
            stateRefs.newGroups.value.map((group) =>
              axios.post(
                `${import.meta.env.VITE_APP_API_BASE_URL}/groups/${
                  group.id
                }/organizations`,
                {
                  organization: stateRefs.organization.value.id,
                },
              ),
            ),
          );
          stateRefs.newGroups.value = [];
        } catch (error) {
          await $toasted.error(getErrorMessage(error));
        }
      }
    }
    async function deleteGroup(group) {
      const result = await confirm({
        title: t('adminOrganization.remove_org_from_group'),
        content: t('adminOrganization.remove_org_from_group_confirm'),
        actions: {
          no: {
            text: t('actions.cancel'),
            type: 'outline',
            buttonClass: 'border border-black',
          },
          yes: {
            text: t('actions.ok'),
            type: 'solid',
          },
        },
      });
      if (result === 'no' || result === 'cancel') {
        return;
      }

      await axios.delete(
        `${import.meta.env.VITE_APP_API_BASE_URL}/groups/${
          group.id
        }/organizations`,
        {
          data: { organization: stateRefs.organization.value.id },
        },
      );
      await loadPageData();
    }
    async function saveOrganization() {
      try {
        await axios.put(
          `${import.meta.env.VITE_APP_API_BASE_URL}/admins/organizations/${
            route.params.organization_id
          }`,
          {
            ...stateRefs.organization.value,
          },
        );
        await Promise.all([
          saveRole(),
          saveCapabilities(
            stateRefs.updatedOrganizationCapabilitiesMatrix.value,
            stateRefs.organizationCapabilities.value,
            stateRefs.organization.value,
            true,
          ),
          saveIncidents(),
          saveGroups(),
        ]);
        await loadPageData();
        await $toasted.success(t('info.success_saved_organization'));
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    async function copyUsers() {
      let text = '';
      for (const user of stateRefs.users.value) {
        text += `${user.first_name}\t${user.last_name}\t${user.email}\t${user.mobile}\t\n`;
      }
      await navigator.clipboard.writeText(text);
      $toasted.success(t('info.users_copied'));
    }
    async function copyApiKey() {
      await navigator.clipboard.writeText(stateRefs.apiKey.value);
      $toasted.success(t('adminOrganization.api_key_copied'));
    }
    async function generateApiKey() {
      const result = await selection({
        title: t('actions.generate_api_key'),
        content: t('adminOrganization.please_select_api_key_type'),
        options: ['public', 'read'],
        placeholder: t('adminOrganization.key_type'),
      });
      if (result) {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/admins/organizations/${
            route.params.organization_id
          }/create_api_key`,
          {
            type: result,
          },
        );
        const { api_key: apiKey } = response.data;
        stateRefs.apiKey.value = apiKey;
        stateRefs.showingApiKeyModal.value = true;
        await loadPageData();
      }
    }

    onMounted(async () => {
      stateRefs.loading.value = true;
      await loadPageData();
      stateRefs.loading.value = false;

      nextTick(async () => {
        stateRefs.primaryLocationMap.value = L.map('primary-location', {
          zoomControl: false,
        }).setView([35.746_512_259_918_5, -96.411_509_631_256_56], 3);
        stateRefs.secondaryLocationMap.value = L.map('secondary-location', {
          zoomControl: false,
        }).setView([35.746_512_259_918_5, -96.411_509_631_256_56], 3);
        createTileLayer().addTo(stateRefs.primaryLocationMap.value);
        createTileLayer().addTo(stateRefs.secondaryLocationMap.value);
        await reloadMaps();
      });
    });

    return {
      ...stateRefs,
      currentUser,
      getCapabilityName,
      getIncidentName,
      logoUrl,
      existingLocation,
      selectableCapabilities,
      selectableIncidents,
      handleFileUpload,
      getContactView,
      approveIncidentRequest,
      rejectIncidentRequest,
      loadPageData,
      getGhostUsers,
      approveOrganization,
      rejectOrganization,
      createTileLayer,
      saveCurrentLocation,
      setCurrentLocation,
      reloadMaps,
      saveRole,
      saveIncidents,
      saveGroups,
      deleteGroup,
      saveOrganization,
      copyUsers,
      copyApiKey,
      generateApiKey,
      $mq: mq.current,
      editLocation,
    };
  },
};
</script>

<style scoped>
.input {
  @apply my-1;
}

textarea {
  @apply my-1;
}

.select {
  @apply my-2 h-16 text-sm;
}

.multi-select {
  @apply my-2 text-sm;
  min-height: 3rem;
}
</style>
