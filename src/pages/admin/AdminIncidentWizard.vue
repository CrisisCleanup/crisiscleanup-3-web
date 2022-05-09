<template>
  <div class="relative h-full w-full flex flex-col">
    <div class="text-2xl font-bold text-center my-2" v-if="savedIncident">
      {{ savedIncident.id }}: {{ savedIncident.name }}
    </div>

    <Wizard
      class="flex-grow"
      ref="steps"
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
              @onIncidentChange="currentIncident = $event"
              @onAniChange="currentAni = $event"
              @onDeleteAniIncident="deleteAniIncident"
              :incident="savedIncident"
              :ani-incidents="savedAniIncidents"
              :key="savedIncident"
            />
          </Card>
          <IncidentLocationEditor
            :location="
              savedIncident &&
              savedIncident.locations.length &&
              savedIncident.locations[savedIncident.locations.length - 1]
            "
            @onLocationChange="currentLocation = $event"
          />
        </div>
      </Step>
      <Step
        :name="$t('incidentBuilder.create_intake_form')"
        :on-save="saveIncidentFields"
      >
        <IncidentFormBuilder
          @onUpdateForm="formFieldTree = $event"
          :incident="savedIncident"
          :key="savedIncident"
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
                variant="solid"
                class="px-2 py-1"
                :action="() => {}"
              ></base-button>
            </div>
          </template>
          <iframe
            v-if="savedIncident"
            class="h-64 m-5"
            :src="`http://localhost:5000/incidents/${savedIncident.id}/handbill`"
          />
        </Card>
      </Step>
      <Step :name="$t('incidentBuilder.notifications')"></Step>
    </Wizard>
  </div>
</template>

<script>
import Wizard from '@/components/wizard/Wizard';
import Step from '@/components/wizard/Step';
import Card from '@/components/cards/Card';
import Incident from '@/models/Incident';
import IncidentForm from '@/components/admin/incidents/IncidentForm';
import IncidentFormBuilder from '@/components/admin/incidents/IncidentFormBuilder';
import IncidentLocationEditor from '@/pages/admin/IncidentLocationEditor';

export default {
  name: 'AdminIncidentWizard',
  components: {
    IncidentLocationEditor,
    IncidentFormBuilder,
    IncidentForm,
    Card,
    Step,
    Wizard,
  },
  data() {
    return {
      currentIncident: {
        name: '',
        short_name: '',
        timezone: '',
        case_label: '',
        incident_type: '',
        start_at: null,
      },
      currentAni: {
        anis: [],
        start_at: null,
        end_at: null,
        timezone: '',
        use_hotline: false,
      },
      currentLocation: null,
      formFieldTree: null,
      savedIncident: null,
      savedAniIncidents: [],
      loading: false,
    };
  },
  async mounted() {
    if (this.$route.params.incident_id) {
      await this.loadIncident(this.$route.params.incident_id);
    }
  },

  methods: {
    async loadIncident(id) {
      this.loading = true;
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/incidents/${id}`,
      );

      const aniIncidentResponse = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/ani_incidents`,
        {
          params: {
            incident: id,
          },
        },
      );

      this.savedAniIncidents = aniIncidentResponse.data.results;
      this.savedIncident = response.data;
      this.currentIncident = {
        ...this.savedIncident,
      };
      this.loading = false;
    },

    async saveIncidentFields() {
      const result = [];
      const stack = [...this.formFieldTree];
      while (stack.length > 0) {
        const current = stack.pop();

        result.push(current);

        if (current.children && current.children.length > 0) {
          [...current.children].forEach((child, index) => {
            child.field_parent_key = current.field_key;
            child.list_order = index;
            if (!child.phase) {
              child.phase = 4;
            }
            return stack.push(child);
          });
        }
      }
      this.loading = true;

      try {
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/incident_forms`,
          {
            fields: result,
            incident: this.savedIncident.id,
          },
        );
      } finally {
        this.loading = false;
      }
    },
    updateIncident(value, key) {
      Incident.update({
        where: this.currentIncident.id,
        data: {
          [key]: value,
        },
      });
    },
    async saveIncident() {
      let response;
      if (this.savedIncident?.id) {
        response = await this.$http.patch(
          `${process.env.VUE_APP_API_BASE_URL}/incidents/${this.savedIncident.id}`,
          {
            ...this.currentIncident,
            start_at: this.$moment(this.currentIncident.start_at),
          },
        );
      } else {
        response = await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/incidents`,
          {
            ...this.currentIncident,
            start_at: this.$moment(this.currentIncident.start_at),
          },
        );
      }
      const incidentId = response.data.id;

      if (this.currentLocation?.id) {
        await Incident.api().addLocation(incidentId, this.currentLocation.id);
      }

      if (this.currentAni.anis.length) {
        const promises = [];
        this.currentAni.anis.forEach((ani) => {
          promises.push(
            this.$http.post(
              `${process.env.VUE_APP_API_BASE_URL}/ani_incidents`,
              {
                ani,
                incident: incidentId,
                start_at: this.$moment(this.currentAni.start_at),
                end_at: this.$moment(this.currentAni.end_at),
              },
            ),
          );
        });
        await Promise.all(promises);
      }

      await this.loadIncident(incidentId);
    },
    async deleteAniIncident(id) {
      await this.$http.delete(
        `${process.env.VUE_APP_API_BASE_URL}/ani_incidents/${id}`,
      );
      this.savedAniIncidents = this.savedAniIncidents.filter(
        (aniIncident) => aniIncident.id !== id,
      );
    },
  },
};
</script>
