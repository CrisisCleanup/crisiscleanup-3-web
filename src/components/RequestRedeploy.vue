<template>
  <div class="p-3 h-full">
    <div>
      <form-select
        :value="selectedIncidentId"
        :options="incident_list"
        searchable
        select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-12 mb-3"
        item-key="id"
        label="name"
        :placeholder="$t('locationVue.select_incident')"
        @input="selectedIncidentId = $event"
      />
    </div>
    <base-button
      variant="solid"
      :action="requestIncident"
      :text="$t('actions.submit')"
      :alt="$t('actions.submit')"
      class="p-1 px-6 text-xs"
    />
  </div>
</template>
<script>
import Organization from '../models/Organization';
import User from '../models/User';
import { getErrorMessage } from '../utils/errors';

export default {
  name: 'RequestRedeploy',
  async mounted() {
    const response = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/incidents_list?fields=id,name,short_name,geofence,locations&limit=200&sort=-start_at`,
    );
    const incidentRequestsResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/incident_requests`,
    );
    this.incidents = response.data.results;
    this.incidentRequests = incidentRequestsResponse.data.results;
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
