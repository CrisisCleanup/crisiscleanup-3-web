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
        <BaseSelect
          :model-value="selectedIncidentId"
          :options="incident_list"
          searchable
          select-classes="w-full absolute inset-0 outline-none focus:ring-0 appearance-none border-0 text-base font-sans bg-white rounded py-2"
          item-key="id"
          label="name"
          :placeholder="$t('locationVue.select_incident')"
          @update:modelValue="selectedIncidentId = $event"
        />
      </div>
      <template #footer>
        <div class="p-3 flex justify-end">
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
      </template>
    </modal>
  </div>
</template>
<script>
import Organization from '../../models/Organization';
import { getErrorMessage } from '../../utils/errors';
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import useCurrentUser from '../../hooks/useCurrentUser';
import BaseSelect from '../BaseSelect.vue';

export default {
  name: 'RedeployRequest',
  components: { BaseSelect },
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
  setup(props, { emit }) {
    const $toasted = useToast();
    const { t } = useI18n();

    const { currentUser } = useCurrentUser();

    const showRedeployModal = ref(false);
    const selectedIncidentId = ref(false);
    const incidents = ref([]);
    const incidentRequests = ref([]);

    const currentOrganization = computed(() =>
      Organization.find(currentUser?.organization?.id),
    );

    const incident_list = computed(() => {
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
        await $toasted.success(t('requestRedeploy.request_redeploy_success'));
        emit('close');
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    onMounted(async () => {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/incidents_list?fields=id,name,short_name,geofence,locations&limit=200&sort=-start_at`,
      );
      const incidentRequestsResponse = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/incident_requests`,
      );
      incidents.value = response.data.results;
      incidentRequests.value = incidentRequestsResponse.data.results;
      showRedeployModal.value = props.openModal;
    });

    return {
      showRedeployModal,
      selectedIncidentId,
      incidents,
      incidentRequests,
      requestIncident,
      currentOrganization,
      currentUser,
      incident_list,
    };
  },
};
</script>
