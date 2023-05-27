<template>
  <div
    class="relative h-full w-full flex flex-col"
    data-testid="testGeneralIncidentInfoDiv"
  >
    <div v-if="savedIncident" class="text-2xl font-bold text-center my-2">
      {{ savedIncident.id }}: {{ savedIncident.name }}
    </div>

    <Wizard
      ref="steps"
      class="flex-grow"
      step-classes="text-xs"
      step-details-classes="p-2 pt-16"
      step-default-classes="flex items-center justify-center h-8 cursor-pointer px-2"
      step-active-classes=""
      :loading="loading"
    >
      <Step
        :name="$t('incidentBuilder.general_incident_info')"
        :on-save="saveIncident"
      >
        <div class="grid grid-cols-2 gap-2">
          <Card>
            <IncidentForm
              :key="savedIncident"
              :incident="savedIncident"
              :ani-incidents="savedAniIncidents"
              @onIncidentChange="currentIncident = $event"
              @onAniChange="currentAni = $event"
              @onDeleteAniIncident="deleteAniIncident"
            />
          </Card>
          <IncidentLocationEditor
            :key="currentIncidentLocation"
            :location="currentIncidentLocation"
            @onLocationChange="currentLocation = $event"
          />
        </div>
      </Step>
      <Step
        :name="$t('incidentBuilder.create_intake_form')"
        :on-save="saveIncidentFields"
      >
        <IncidentFormBuilder
          :key="savedIncident"
          :incident="savedIncident"
          @onUpdateForm="formFieldTree = $event"
        />
      </Step>
      <Step :name="$t('incidentBuilder.assets')">
        <Card>
          <template #header>
            <div class="flex items-center justify-between w-full mr-4">
              <base-text class="px-5 py-3">
                {{ $t('incidentBuilder.handbill') }}
              </base-text>
              <base-button
                :text="$t('actions.create')"
                :alt="$t('actions.create')"
                data-testid="testCreateButton"
                variant="solid"
                class="px-2 py-1"
                :action="() => {}"
              ></base-button>
            </div>
          </template>
          <iframe v-if="savedIncident" class="h-64 m-5" :src="handBillUrl" />
        </Card>
      </Step>
      <Step :name="$t('incidentBuilder.notifications')"></Step>
    </Wizard>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import moment from 'moment';
import { useRoute } from 'vue-router';
import Wizard from '@/components/wizard/Wizard.vue';
import Step from '@/components/wizard/Step.vue';
import Card from '@/components/cards/Card.vue';
import Incident from '@/models/Incident';
import IncidentForm from '@/components/admin/incidents/IncidentForm.vue';
import IncidentFormBuilder from '@/components/admin/incidents/IncidentFormBuilder.vue';
import IncidentLocationEditor from '@/components/admin/incidents/IncidentLocationEditor.vue';

export default defineComponent({
  name: 'AdminIncidentWizard',
  components: {
    IncidentLocationEditor,
    IncidentFormBuilder,
    IncidentForm,
    Card,
    Step,
    Wizard,
  },
  setup(props, { emit }) {
    const route = useRoute();

    const currentIncident = ref({
      name: '',
      short_name: '',
      timezone: '',
      case_label: '',
      incident_type: '',
      start_at: null,
    });
    const currentAni = ref({
      anis: [],
      start_at: null,
      end_at: null,
      timezone: '',
      use_hotline: false,
    });
    const currentLocation = ref(null);
    const formFieldTree = ref(null);
    const savedIncident = ref(null);
    const savedAniIncidents = ref([]);
    const loading = ref(false);

    const handBillUrl = computed(() => {
      if (savedIncident.value) {
        return `${import.meta.env.VITE_APP_API_BASE_URL}/incidents/${
          savedIncident.value.id
        }/handbill`;
      }

      return null;
    });

    const currentIncidentLocation = computed(() => {
      if (savedIncident.value && savedIncident.value.locations.length > 0) {
        return savedIncident.value.locations[
          savedIncident.value.locations.length - 1
        ];
      }

      return null;
    });

    async function loadIncident(id) {
      loading.value = true;
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/incidents/${id}`,
      );

      const aniIncidentResponse = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/ani_incidents`,
        {
          params: {
            incident: id,
          },
        },
      );

      savedAniIncidents.value = aniIncidentResponse.data.results;
      savedIncident.value = response.data;
      currentIncident.value = {
        ...savedIncident.value,
      };
      loading.value = false;
    }

    async function saveIncidentFields() {
      const result = [];
      const stack = [...formFieldTree.value];
      while (stack.length > 0) {
        const current = stack.pop();

        result.push(current);

        if (current.children && current.children.length > 0) {
          for (const [index, child] of [...current.children].entries()) {
            child.field_parent_key = current.field_key;
            child.list_order = index;
            if (!child.phase) {
              child.phase = 4;
            }

            stack.push(child);
            continue;
          }
        }
      }

      loading.value = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/incident_forms`,
          {
            fields: result,
            incident: savedIncident.value.id,
          },
        );
      } finally {
        loading.value = false;
      }
    }

    function updateIncident(value, key) {
      Incident.update({
        where: currentIncident.value.id,
        data: {
          [key]: value,
        },
      });
    }

    async function saveIncident() {
      let response;
      if (savedIncident.value?.id) {
        response = await axios.patch(
          `${import.meta.env.VITE_APP_API_BASE_URL}/incidents/${
            savedIncident.value.id
          }`,
          {
            ...currentIncident.value,
            start_at: moment(currentIncident.value.start_at),
          },
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/incidents`,
          {
            ...currentIncident.value,
            start_at: moment(currentIncident.value.start_at),
          },
        );
      }

      const incidentId = response.data.id;

      if (currentLocation.value?.id) {
        await Incident.api().addLocation(incidentId, currentLocation.value.id);
      }

      if (currentAni.value.anis.length > 0) {
        const promises = [];
        for (const ani of currentAni.value.anis) {
          promises.push(
            axios.post(
              `${import.meta.env.VITE_APP_API_BASE_URL}/ani_incidents`,
              {
                ani,
                incident: incidentId,
                start_at: moment(currentAni.value.start_at),
                end_at: moment(currentAni.value.end_at),
              },
            ),
          );
        }

        await Promise.all(promises);
      }

      await loadIncident(incidentId);
    }

    async function deleteAniIncident(id) {
      await axios.delete(
        `${import.meta.env.VITE_APP_API_BASE_URL}/ani_incidents/${id}`,
      );
      savedAniIncidents.value = savedAniIncidents.value.filter(
        (aniIncident) => aniIncident.id !== id,
      );
    }

    onMounted(async () => {
      if (route.params.incident_id) {
        await loadIncident(route.params.incident_id);
      }
    });

    return {
      loadIncident,
      saveIncidentFields,
      updateIncident,
      saveIncident,
      deleteAniIncident,
      currentIncident,
      currentAni,
      currentLocation,
      formFieldTree,
      savedIncident,
      savedAniIncidents,
      loading,
      handBillUrl,
      currentIncidentLocation,
    };
  },
});
</script>
