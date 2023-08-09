<template>
  <div>
    <base-button
      v-if="!hideTrigger"
      data-testid="testRequestRedeployButton"
      variant="outline"
      class="mx-1 px-3 py-1"
      :text="$t('requestRedeploy.request_redeploy')"
      :alt="$t('requestRedeploy.request_redeploy')"
      @click="showRedeployModal = true"
    ></base-button>
    <modal
      v-if="showRedeployModal"
      data-testid="testShowRedeployModal"
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
        <div
          data-testid="testChooseAnIncidentDiv"
          class="my-3"
        >
          {{ $t("requestRedeploy.choose_an_incident") }}
        </div>
        <base-select
          :model-value="selectedIncidentId"
          :options="incident_list"
          data-testid="testSelectIncidentSelect"
          searchable
          select-classes="w-full absolute inset-0 outline-none focus:ring-0 appearance-none border-0 text-base font-sans bg-white rounded py-2"
          item-key="id"
          label="name"
          :placeholder="$t('locationVue.select_incident')"
          @update:modelValue="selectedIncidentId = $event"
        >
          <template #option="{ option }">
            <div class="flex items-center w-full">
              <div class="flex items-center justify-between w-full">
                {{ option.name }}
                <span v-if="incidentAlreadyDeployed(option.id)">
                  <font-awesome-icon
                    data-testid="testIncidentAlreadyDeployedIcon"
                    icon="check"
                    size="md"
                    class="mx-1 text-green-600 cursor-pointer"
                    type="up"
                  />
                </span>
                <span v-else-if="incidentAlreadyRequested(option.id)">
                  <font-awesome-icon
                    data-testid="testIncidentAlreadyRequestedIcon"
                    icon="clock"
                    size="md"
                    class="mx-1 cursor-pointer"
                    type="up"
                  />
                </span>
              </div>
            </div>
          </template>
        </base-select>

        <div class="flex items-center gap-2 mt-5">
          <font-awesome-icon
            data-testid="testIncidentAlreadyDeployedIconLegend"
            icon="check"
            size="md"
            class="mx-1 text-green-600 cursor-pointer"
            type="up"
          />
          {{ $t("~~Your organization has access to this incident") }}
        </div>
        <div class="flex items-start gap-2">
          <font-awesome-icon
            data-testid="testIncidentAlreadyRequestedIconLegend"
            icon="clock"
            size="md"
            class="mx-1 cursor-pointer"
            type="up"
          />
          {{ $t("~~Your organization has already requested access to this incident") }}
        </div>
      </div>
      <template #footer>
        <div class="p-3 flex justify-end">
          <base-button
            :text="$t('actions.cancel')"
            :alt="$t('actions.cancel')"
            data-testid="testCancelButton"
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
            data-testid="testSubmitButton"
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
<script lang="ts">
import { computed, onMounted, ref } from "vue";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { getErrorMessage } from "../../utils/errors";
import Organization from "../../models/Organization";
import useCurrentUser from "../../hooks/useCurrentUser";
import type Incident from "@/models/Incident";
import type { IncidentRequest } from "@/models/types";
import useEmitter from "@/hooks/useEmitter";

export default defineComponent({
  name: "RedeployRequest",
  props: {
    openModal: {
      type: Boolean,
      default: false
    },
    hideTrigger: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const $toasted = useToast();
    const { t } = useI18n();

    const { currentUser } = useCurrentUser();

    const { emitter } = useEmitter();
    const showRedeployModal = ref(false);
    const selectedIncidentId = ref(false);
    const incidents = ref<Incident[]>([]);
    const incidentRequests = ref<IncidentRequest[]>([]);

    const currentOrganization = computed(() =>
      Organization.find(currentUser?.organization?.id)
    );

    const incident_list = computed(() => {
      if (incidents.value) {
        return incidents.value;
      }

      return [];
    });

    function incidentAlreadyDeployed(incidentId: number) {
      return currentOrganization.value.approved_incidents.includes(
        incidentId
      );
    }

    function incidentAlreadyRequested(incidentId: number) {
      return incidentRequests.value
        .map((request) => request.incident)
        .includes(incidentId);
    }


    async function requestIncident() {
      if (incidentAlreadyDeployed(selectedIncidentId.value)) {
        emitter.emit('update:incident', selectedIncidentId.value)
        return;
      }

      try {
        await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/incident_requests`,
          {
            organization: currentOrganization?.value?.id,
            incident: selectedIncidentId.value
          }
        );
        showRedeployModal.value = false;
        await $toasted.success(t("requestRedeploy.request_redeploy_success"));
        emit("close");
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    onMounted(async () => {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/incidents_list?fields=id,name,short_name,geofence,locations&limit=50&sort=-start_at`
      );
      const incidentRequestsResponse = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/incident_requests`
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
      incidentAlreadyDeployed,
      incidentAlreadyRequested
    };
  }
});
</script>
