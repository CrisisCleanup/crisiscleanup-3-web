<template>
  <div>
    <base-button
      v-if="!hideTrigger"
      variant="outline"
      class="mx-1 px-3 py-1"
      :text="$t('requestRedeploy.request_redeploy')"
      :alt="$t('requestRedeploy.request_redeploy')"
      @click.native="showRedeployModal = true"
    ></base-button>
    <modal
      v-if="showRedeployModal"
      modal-classes="bg-white max-w-lg shadow"
      :title="$t('requestRedeploy.request_redeploy')"
      closeable
      @close="
        () => {
          showRedeployModal = false;
          $emit('close');
        }
      "
    >
      <div class="text-justify flex flex-col p-3 justify-center">
        <div class="my-3">
          {{ $t('requestRedeploy.choose_an_incident') }}
        </div>
        <form-select
          :value="selectedIncidentId"
          class="form-field"
          :options="incident_list"
          searchable
          select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-12 mb-3"
          item-key="id"
          label="name"
          :placeholder="$t('locationVue.select_incident')"
          @input="selectedIncidentId = $event"
        />
      </div>
      <div slot="footer" class="p-3 flex justify-end">
        <base-button
          :text="$t('actions.cancel')"
          :alt="$t('actions.cancel')"
          class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
          :action="
            () => {
              showRedeployModal = false;
              $emit('close');
            }
          "
        />
        <base-button
          variant="solid"
          :action="requestIncident"
          :text="$t('actions.submit')"
          :alt="$t('actions.submit')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </modal>
  </div>
</template>
<script>
import Organization from '../models/Organization';
import User from '../models/User';
import { getErrorMessage } from '../utils/errors';

export default {
  name: 'RedeployRequest',
  props: {
    openModal: {
      type: Boolean,
      default: false,
    },
    hideTrigger: {
      type: Boolean,
      default: false,
    },
  },
  async mounted() {
    const response = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/incidents_list?fields=id,name,short_name,geofence,locations&limit=200&sort=-start_at`,
    );
    const incidentRequestsResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/incident_requests`,
    );
    this.incidents = response.data.results;
    this.incidentRequests = incidentRequestsResponse.data.results;
    this.showRedeployModal = this.openModal;
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    incident_list() {
      if (this.incidents) {
        return this.incidents.filter(
          (incident) =>
            !this.currentOrganization.approved_incidents.includes(
              incident.id,
            ) &&
            !this.incidentRequests
              .map((request) => request.incident)
              .includes(incident.id),
        );
      }
      return [];
    },
    currentOrganization() {
      return Organization.find(this.currentUser.organization.id);
    },
  },
  methods: {
    async requestIncident() {
      try {
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/incident_requests`,
          {
            organization: this.currentOrganization.id,
            incident: this.selectedIncidentId,
          },
        );
        this.showRedeployModal = false;
        await this.$toasted.success(
          this.$t('requestRedeploy.request_redeploy_success'),
        );
        this.$emit('close');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
  data() {
    return {
      showRedeployModal: false,
      selectedIncidentId: false,
      incidents: [],
      incidentRequests: [],
    };
  },
};
</script>
