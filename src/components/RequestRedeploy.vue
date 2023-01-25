<template>
  <div class="p-3 h-full">
    <div>
      <base-select
        v-model="selectedIncidentId"
        :placeholder="$t('locationVue.select_incident')"
        :label="$t('locationVue.select_incident')"
        :options="incidentList"
        :min-chars="1"
        :add-option-on="['enter', 'tab']"
        item-key="id"
        searchable
      >
        <template #option="{ option }">
          <div class="flex items-center">
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">
                {{ option.name }}
              </div>
            </div>
          </div>
        </template>
      </base-select>
      {{ selectedIncidentName }}
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

<script lang="ts">
import axios from 'axios';
import { useToast } from 'vue-toastification';
import type Incident from '@/models/Incident';
import Organization from '@/models/Organization';
import User from '@/models/User';
import { getErrorMessage } from '@/utils/errors';

export default defineComponent({
  name: 'RequestRedeploy',
  setup() {
    const store = useStore();
    const { t } = useI18n();
    const toast = useToast();

    const showRedeployModal = ref(false);
    const selectedIncidentId = ref();
    const incidents = ref<Incident[]>([]);
    const incidentRequests = ref<
      (Record<string, any> & { incident: string })[]
    >([]);

    const currentUser = computed(() => {
      return User.find(store.getters['auth/userId']) as User;
    });
    const currentOrganization = computed(() => {
      return Organization.find(
        currentUser.value.organization.id,
      ) as Organization;
    });
    const incidentList = computed(() => {
      if (incidents.value) {
        return incidents.value.filter(
          (incident) =>
            !currentOrganization.value.approved_incidents.includes(
              incident.id,
            ) &&
            !incidentRequests.value
              .map((request) => request.incident)
              .includes(incident.id),
        );
      }
      return [];
    });
    const selectedIncidentName = computed(() => {
      const incident = incidents.value.find(
        (incident) => incident.id === selectedIncidentId.value,
      );
      return incident ? incident.name : '';
    });

    onMounted(async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/incidents_list`,
        {
          params: {
            fields: 'id,name,short_name,geofence,locations',
            limit: 200,
            sort: '-start_at',
          },
        },
      );
      const incidentRequestsResponse = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/incident_requests`,
      );
      incidents.value = response.data.results;
      incidentRequests.value = incidentRequestsResponse.data.results;
    });

    async function requestIncident() {
      try {
        await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/incident_requests`,
          {
            organization: currentOrganization.value.id,
            incident: selectedIncidentId.value,
          },
        );
        showRedeployModal.value = false;
        await toast.success(t('requestRedeploy.request_redeploy_success'));
      } catch (error) {
        await toast.error(getErrorMessage(error));
      }
    }

    return {
      showRedeployModal,
      selectedIncidentId,
      selectedIncidentName,
      incidentList,
      requestIncident,
    };
  },
});
</script>

<style lang="postcss" scoped></style>
