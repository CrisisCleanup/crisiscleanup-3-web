<template>
  <div class="flex h-full relative">
    <div
      v-if="loading"
      style="z-index: 1001"
      class="
        absolute
        bottom-0
        left-0
        right-0
        top-0
        bg-crisiscleanup-light-grey
        opacity-75
        flex
        items-center
        justify-center
      "
    >
      <spinner />
    </div>
    <div v-else class="mx-2 flex flex-col pt-2 w-84">
      <div class="flex items-center justify-between">
        <div v-if="isNew" class="font-bold">
          {{ $t('actions.new_location') }}
        </div>
        <div v-else class="font-bold w-4/5">
          {{ $t('actions.edit') }} {{ currentLocation && currentLocation.name }}
        </div>
        <div class="flex">
          <ccu-icon
            v-show="false"
            :alt="$t('actions.edit_location')"
            size="small"
            class="p-1 py-2"
            type="edit"
            @click.native="() => {}"
          />
          <ccu-icon
            v-if="!isNew"
            :alt="$t('locationVue.download_as_shapefile')"
            size="small"
            class="p-1 py-2"
            type="download"
            @click.native="downloadCurrentLocation"
          />
          <ccu-icon
            v-show="false"
            v-if="!isNew"
            :alt="$t('actions.share_location')"
            size="small"
            class="p-1 py-2"
            type="share"
          />
          <ccu-icon
            v-if="!isNew"
            :alt="$t('actions.delete')"
            size="small"
            class="p-1 py-2"
            type="trash"
            @click.native="deleteCurrentLocation"
          />
        </div>
      </div>
      <form
        v-if="currentLocation"
        ref="form"
        class="form flex-grow flex flex-col justify-between w-full"
      >
        <div class="flex flex-col">
          <base-input
            v-model="currentLocation.name"
            type="text"
            class="input my-2"
            size="large"
            required
            :placeholder="$t('locationVue.location_name')"
          />
          <form-select
            v-if="!loading"
            :value="currentLocation.type"
            :options="locationTypes"
            item-key="id"
            label="name_t"
            :required="true"
            :placeholder="$t('locationVue.location_type')"
            select-classes="bg-white border border-crisiscleanup-dark-100 h-12"
            @input="
              (type) => {
                currentLocation.type = type;
                selectedIncidentId = null;
                selectedOrganization = null;
              }
            "
          />

          <div v-if="!currentLocation.id" class="extra-actions">
            <div v-if="isPrimaryResponseArea || isSecondaryResponseArea">
              <autocomplete
                class="my-2"
                icon="search"
                :suggestions="organizationResults"
                display-property="name"
                size="large"
                :placeholder="$t('locationVue.search_for_organization')"
                clear-on-selected
                @selected="onSelectOrganization"
                @search="onOrganizationSearch"
              />
            </div>
            <div v-if="isIncidentRelated">
              <form-select
                :value="selectedIncidentId"
                class="my-2"
                :options="incidents"
                searchable
                select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-12 mb-3"
                item-key="id"
                label="name"
                :placeholder="$t('locationVue.select_incident')"
                @input="onSelectIncident"
              />
            </div>
          </div>

          <div v-else>
            <div
              v-if="
                (isPrimaryResponseArea || isSecondaryResponseArea) &&
                relatedOrganizations.length
              "
            >
              <base-text :weight="400">{{
                $t('locationVue.related_organizations')
              }}</base-text>
              <div
                v-for="organization in relatedOrganizations"
                :key="`${organization.id}`"
                class="my-1 flex items-center justify-between"
              >
                {{ organization.name }}
                <ccu-icon
                  type="trash"
                  size="small"
                  :alt="$t('actions.clear_location')"
                  @click.native="
                    () => {
                      detachLocationFromOrganization(organization);
                    }
                  "
                />
              </div>
            </div>
            <div v-if="isIncidentRelated && relatedIncidents.length">
              <base-text :weight="400">{{
                $t('locationVue.related_incidents')
              }}</base-text>
              <div
                v-for="incident in relatedIncidents"
                :key="`${incident.id}`"
                class="my-1 flex items-center justify-between"
              >
                {{ incident.name }}
                <ccu-icon
                  type="trash"
                  size="small"
                  :alt="$t('actions.clear_location')"
                  @click.native="
                    () => {
                      detachLocationFromIncident(incident);
                    }
                  "
                />
              </div>
            </div>
          </div>

          <textarea
            v-model="currentLocation.notes"
            class="
              text-base
              my-2
              border border-crisiscleanup-dark-100
              placeholder-crisiscleanup-dark-200
              outline-none
              p-2
              resize-none
            "
            rows="4"
            :placeholder="$t('locationVue.notes')"
          />
          <div>
            <div class="mt-8 text-base">{{ $t('locationVue.access') }}</div>
            <div class="flex flex-wrap mt-2">
              <base-radio
                class="mr-4"
                label="shared"
                :name="$t('locationVue.shared')"
                :value="currentLocation.shared"
                @change="currentLocation.shared = $event"
              />
              <base-radio
                class="mr-4"
                label="private"
                :name="$t('locationVue.private')"
                :value="currentLocation.shared"
                @change="currentLocation.shared = $event"
              />
              <base-radio
                class="mr-4"
                label="public"
                :name="$t('locationVue.public')"
                :value="currentLocation.shared"
                @change="currentLocation.shared = $event"
              />
            </div>
          </div>
        </div>
        <div v-if="selectedOrganization">
          <div class="text-base">
            {{ $t('locationVue.organization_incidents') }}
          </div>
          <div class="h-48 overflow-auto">
            <div
              v-for="incident in selectedOrganization.incident_list"
              :key="`${incident.id}`"
            >
              {{ incident.name }}
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end h-16">
          <base-button
            :text="$t('actions.reset')"
            :alt="$t('actions.reset')"
            class="border border-black p-2 mr-1"
          />
          <base-button
            :text="$t('actions.save_location')"
            :alt="$t('actions.save_location')"
            class="p-2 mr-1"
            variant="solid"
            :action="saveLocation"
          />
          <base-button
            v-if="isNew"
            :text="$t('actions.save_and_new')"
            :alt="$t('actions.save_and_new')"
            class="p-2"
            variant="solid"
            :action="
              () => {
                saveLocation(true);
              }
            "
          />
        </div>
      </form>
    </div>
    <div class="flex-grow flex flex-col">
      <LocationTool
        v-if="currentLocation"
        ref="locationTool"
        :key="$route.params.location_id"
        :incident="selectedIncidentId"
        :organization="selectedOrganization && selectedOrganization.id"
        class="h-full"
        :locations="
          $route.params.location_id ? [$route.params.location_id] : []
        "
        @changed="setCurrentLocation"
      />
    </div>
  </div>
</template>

<script>
import { create } from 'vue-modal-dialogs';
import Location from '@/models/Location';
import LocationType from '@/models/LocationType';
import Organization from '@/models/Organization';
import Incident from '@/models/Incident';
import LocationTool from '@/components/LocationTool';
import { forceFileDownload } from '@/utils/downloads';
import { getErrorMessage } from '@/utils/errors';
import MessageBox from '@/components/dialogs/MessageBox';
const messageBox = create(MessageBox);
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'Location',
  components: { LocationTool },
  setup(props, ctx) {
    const route = useRoute();
    const router = useRouter();
    const currentLocation = ref();
    const currentPolygon = ref(null);
    const loading = ref(false);
    const locationAccess = ref('Public');
    const organizationResults = ref([]);
    const selectedOrganization = ref();
    const selectedIncidentId = ref();
    const relatedOrganizations = ref([]);
    const relatedIncidents = ref([]);
    const isNew = computed(() => {
      return !route.params.location_id;
    });
    const locationTypes = computed(() => LocationType.all());
    const selectedIncident = computed(() => {
      if (this.selectedIncidentId) {
        return Incident.find(this.selectedIncidentId);
      }
      return null;
    });
    const incidents = computed(() => {
      return Incident.query().orderBy('id', 'desc').get();
    });
    const isPrimaryResponseArea = computed(() => {
      return (
        LocationType.query().where('key', 'org_primary_response_area').get()[0]
          .id === this.currentLocation.type
      );
    });
    const isSecondaryResponseArea = computed(() => {
      return (
        LocationType.query()
          .where('key', 'org_secondary_response_area')
          .get()[0].id === this.currentLocation.type
      );
    });
    const isIncidentRelated = computed(() => {
      const incidentRelatedTypes = LocationType.query()
        .where('key', (key) =>
          [
            'incident_primary_damaged_area',
            'incident_storm_track',
            'incident_furthest_damaged_area',
            'incident_damage',
          ].includes(key),
        )
        .get();
      return incidentRelatedTypes.some(
        (key) => key.id === this.currentLocation.type,
      );
    });
    const reset = () => {
      currentLocation.value = new Location();
      currentPolygon.value = null;
      selectedIncidentId.value = null;
      selectedOrganization.value = null;
      if (this.$refs.locationTool) {
        this.$refs.locationTool.reset();
      }
    };
    const downloadCurrentLocation = async () => {
      loading.value = true;
      const shapefile = await Location.api().download(
        route.params.location_id,
      );
      forceFileDownload(shapefile.response);
      loading.value = false;
    }
    const setCurrentLocation = (location) => {
      currentPolygon.value = location;
    }
    const deleteCurrentLocation = async () => {
      loading.value = true;
      try {
        await Location.api().delete(
          `/locations/${route.params.location_id}`,
          {
            delete: route.params.location_id,
          },
        );
        await this.$toasted.success(this.$t('locationVue.location_deleted'));
        reset();
        await router.push('/locations/new');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        loading.value = false;
      }
    }
    const onSelectOrganization = async (value) => {
      selectedOrganization.value = value;
      if (!currentLocation.value.name) {
        currentLocation.value.name = `${selectedOrganization.value.name} ${currentLocation.value.location_type.name_t}`;
      }
      if (isPrimaryResponseArea.value && value.primary_location) {
        const result = await messageBox({
          title: this.$t('locationVue.existing_location'),
          content: this.$t('locationVue.location_already_exists_organization', {
            organization: value.name,
          }),
          actions: {
            continue: {
              text: this.$t('actions.create_new'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            edit: {
              text: this.$t('actions.edit_existing'),
              type: 'solid',
              buttonClass: 'border border-black',
            },
          },
        });

        if (result === 'edit') {
          await router.push(`/locations/${value.primary_location}/edit`);
        }
      }
    }
    const onSelectIncident = async (value) => {
      selectedIncidentId.value = value;
      let incident = Incident.find(value);
      if (!currentLocation.value.name) {
        currentLocation.value.name = `${incident.name} ${currentLocation.value.location_type.name_t}`;
      }
      if (isIncidentRelated.value && incident.locations.length) {
        await Incident.api().fetchById(value);
        incident = Incident.find(value);
        const existingLocation = incident.locationModels.find(
          (location) => location.type === currentLocation.value.type,
        );
        if (existingLocation) {
          const result = await messageBox({
            title: this.$t('locationVue.existing_location'),
            content: this.$t('locationVue.location_already_exists_incident', {
              incident: incident.name,
            }),
            actions: {
              continue: {
                text: this.$t('actions.create_new'),
                type: 'outline',
                buttonClass: 'border border-black',
              },
              edit: {
                text: this.$t('actions.edit_existing'),
                type: 'outline',
                buttonClass: 'border border-black',
              },
            },
          });

          if (result === 'edit') {
            await router.push(`/locations/${existingLocation.id}/edit`);
          }
        }
      }
    }
    const onOrganizationSearch = async (value) => {
      const results = await Organization.api().get(
        `/organizations?search=${value}&limit=10&fields=id,name&is_active=true`,
        {
          dataKey: 'results',
        },
      );
      organizationResults.value = results.entities.organizations;
    }
    const saveLocation = async (goToNew) => {
      const isValid = this.$refs.form.reportValidity();
      if (!isValid) {
        return;
      }

      if (!currentPolygon.value) {
        this.$toasted.error(this.$t('locationVue.no_valid_drawing_found'));
        return;
      }

      loading.value = true;
      let { geometry } = currentPolygon.value.toGeoJSON();
      const { type, features } = currentPolygon.value.toGeoJSON();
      if (type === 'FeatureCollection') {
        const [feature] = features;
        geometry = feature.geometry;
      }

      currentLocation.value.point = null;
      currentLocation.value.poly = null;
      currentLocation.value.geom = null;

      if (geometry.type === 'Point') {
        currentLocation.value.point = geometry;
      } else if (geometry.type === 'Polygon') {
        currentLocation.value.poly = geometry;
      } else if (geometry.type === 'MultiPolygon') {
        currentLocation.value.geom = geometry;
      }

      try {
        let response;
        if (route.params.location_id) {
          response = await Location.api().put(
            `/locations/${route.params.location_id}`,
            currentLocation.value,
          );
        } else {
          response = await Location.api().post(
            '/locations',
            currentLocation.value,
          );
          if (isPrimaryResponseArea.value) {
            await Organization.api().patch(
              `/organizations/${selectedOrganization.value.id}`,
              {
                primary_location: response.response.data.id,
              },
            );
          }

          if (isSecondaryResponseArea.value) {
            await Organization.api().patch(
              `/organizations/${selectedOrganization.value.id}`,
              {
                secondary_location: response.response.data.id,
              },
            );
          }

          if (isIncidentRelated.value) {
            await Incident.api().addLocation(
              selectedIncidentId.value,
              response.response.data.id,
            );
          }
        }
        await this.$toasted.success(this.$t('locationVue.location_saved'));

        if (goToNew) {
          reset();
        } else {
          const locationId = response.response.data.id;
          await router.push(`/locations/${locationId}/edit`);
          await loadLocation();
        }
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        loading.value = false;
      }
    }
    const loadRelatedEntities = async () => {
      relatedOrganizations.value = [];
      relatedIncidents.value = [];
      if (isPrimaryResponseArea.value) {
        const results = await Organization.api().get(
          `/organizations?primary_location=${route.params.location_id}&fields=id,name`,
          {
            dataKey: 'results',
          },
        );
        relatedOrganizations.value = [...results.entities.organizations];
      }
      if (isSecondaryResponseArea.value) {
        const results = await Organization.api().get(
          `/organizations?secondary_location=${route.params.location_id}&fields=id,name`,
          {
            dataKey: 'results',
          },
        );
        relatedOrganizations.value = [...results.entities.organizations];
      }
      if (isIncidentRelated.value) {
        const incidentIds = currentLocation.value.joins.map(
          (join) => join.object_id,
        );
        const incidents = Incident.query().whereIdIn(incidentIds).get();
        relatedIncidents.value = [...incidents];
      }
    }
    const detachLocationFromOrganization = async (organization) => {
      const data = {};
      if (isPrimaryResponseArea.value) {
        data.primary_location = null;
      }
      if (isSecondaryResponseArea.value) {
        data.secondary_location = null;
      }
      await Organization.api().patch(`/organizations/${organization.id}`, data);
      await loadLocation();
    }
    const detachLocationFromIncident = async (incident) => {
      await Incident.api().removeLocation(incident.id, currentLocation.value.id);
      await loadLocation();
    }
    const loadLocation = async () => {
      loading.value = true;
      await LocationType.api().get('/location_types', {
        dataKey: 'results',
      });
      if (route.params.location_id) {
        try {
          await Location.api().fetchById(route.params.location_id);
          currentLocation.value = Location.find(route.params.location_id);
          this.loadRelatedEntities();
        } catch (e) {
          currentLocation.value = new Location();
          await router.replace(`/locations/new`);
        } finally {
          this.loading = false;
        }
      } else {
        reset();
      }
      loading.value = false;
    };
    onMounted(() => {
      loadLocation();
    });
    return {
      currentLocation,
      loading,
      locationAccess,
      organizationResults,
      selectedOrganization,
      selectedIncidentId,
      relatedOrganizations,
      relatedIncidents,
      isNew,
      locationTypes,
      selectedIncident,
      incidents,
      isPrimaryResponseArea,
      isSecondaryResponseArea,
      isIncidentRelated,
      reset,
      downloadCurrentLocation,
      deleteCurrentLocation,
      setCurrentLocation,
      onSelectOrganization,
      onSelectIncident,
      onOrganizationSearch,
      saveLocation,
      loadRelatedEntities,
      detachLocationFromOrganization,
      detachLocationFromIncident
    };
  },
};
</script>

<style scoped>
.form-field {
  @apply my-2;
}
</style>
