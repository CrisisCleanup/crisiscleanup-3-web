<template>
  <div class="flex h-full relative">
    <div
      v-if="loading"
      style="z-index: 1001"
      class="absolute inset-0 bg-crisiscleanup-light-grey opacity-75 flex items-center justify-center"
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
          />
          <ccu-icon
            v-if="!isNew"
            :alt="$t('locationVue.download_as_shapefile')"
            size="small"
            class="p-1 py-2"
            type="download"
            @click="downloadCurrentLocation"
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
            @click="deleteCurrentLocation"
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
          <base-select
            v-if="!loading"
            :model-value="currentLocation.type"
            :options="locationTypes"
            item-key="id"
            label="name_t"
            :placeholder="$t('locationVue.location_type')"
            @update:model-value="
              (t) => {
                currentLocation.type = t;
                selectedIncidentId = null;
                selectedOrganization = null;
              }
            "
          />

          <div v-if="!currentLocation.id" class="extra-actions">
            <div v-if="isPrimaryResponseArea || isSecondaryResponseArea">
              <base-select
                label="name"
                item-key="id"
                :options="onOrganizationSearch"
                :placeholder="$t('locationVue.search_for_organization')"
                :model-value="selectedOrganization"
                searchable
                object
                @update:model-value="onSelectOrganization"
              />
            </div>
            <div v-if="isIncidentRelated">
              <base-select
                :value="selectedIncidentId"
                :options="incidents"
                searchable
                item-key="id"
                label="name"
                :placeholder="$t('locationVue.select_incident')"
                @update:model-value="onSelectIncident"
              />
            </div>
          </div>

          <div v-else>
            <div
              v-if="
                (isPrimaryResponseArea || isSecondaryResponseArea) &&
                relatedOrganizations.length > 0
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
                  @click="
                    () => {
                      detachLocationFromOrganization(organization);
                    }
                  "
                />
              </div>
            </div>
            <div v-if="isIncidentRelated && relatedIncidents.length > 0">
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
                  @click="() => detachLocationFromIncident(incident)"
                />
              </div>
            </div>
          </div>

          <textarea
            v-model="currentLocation.notes"
            class="text-base my-2 border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 resize-none"
            rows="4"
            :placeholder="$t('locationVue.notes')"
          />
          <div>
            <div class="mt-20 text-base">{{ $t('locationVue.access') }}</div>
            <div class="flex flex-wrap mt-2">
              <base-radio
                v-model="currentLocation.shared"
                class="mr-4"
                label="shared"
                :name="$t('locationVue.shared')"
              />
              <base-radio
                v-model="currentLocation.shared"
                class="mr-4"
                label="private"
                :name="$t('locationVue.private')"
              />
              <base-radio
                v-model="currentLocation.shared"
                class="mr-4"
                label="public"
                :name="$t('locationVue.public')"
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
            :action="() => saveLocation(true)"
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

<script lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import useDialogs from '@/hooks/useDialogs';
import Location from '@/models/Location';
import LocationType from '@/models/LocationType';
import Organization from '@/models/Organization';
import Incident from '@/models/Incident';
import LocationTool from '@/components/locations/LocationTool.vue';
import { forceFileDownload } from '@/utils/downloads';
import { getErrorMessage } from '@/utils/errors';
import BaseSelect from '@/components/BaseSelect.vue';

export default defineComponent({
  name: 'Location',
  components: { BaseSelect, LocationTool },
  setup(props, ctx) {
    const { confirm: messageBox } = useDialogs();
    const { t } = useI18n();
    const $toasted = useToast();
    const route = useRoute();
    const router = useRouter();
    const currentLocation = ref<Location>();
    const currentPolygon = ref();
    const loading = ref(false);
    const locationAccess = ref('Public');
    const organizationResults = ref<Array<Organization>>([]);
    const selectedOrganization = ref<Organization | null>();
    const selectedIncidentId = ref<string | null>();
    const relatedOrganizations = ref<Array<Organization>>([]);
    const relatedIncidents = ref<Array<Incident>>([]);
    const locationTool = ref();
    const form = ref<HTMLFormElement | null>(null);
    const isNew = computed(() => {
      return !route.params.location_id;
    });
    const locationTypes = computed(() => LocationType.all());
    const selectedIncident = computed(() => {
      if (selectedIncidentId.value) {
        return Incident.find(selectedIncidentId.value);
      }

      return null;
    });
    const incidents = computed(() => {
      return Incident.query().orderBy('id', 'desc').get();
    });
    const isPrimaryResponseArea = computed(() => {
      return (
        LocationType.query().where('key', 'org_primary_response_area').get()[0]
          .id === currentLocation.value?.type
      );
    });
    const isSecondaryResponseArea = computed(() => {
      return (
        LocationType.query()
          .where('key', 'org_secondary_response_area')
          .get()[0].id === currentLocation.value?.type
      );
    });
    const isIncidentRelated = computed(() => {
      const incidentRelatedTypes = LocationType.query()
        .where('key', (key: string) =>
          [
            'incident_primary_damaged_area',
            'incident_storm_track',
            'incident_furthest_damaged_area',
            'incident_damage',
          ].includes(key),
        )
        .get();
      return incidentRelatedTypes.some(
        (key) => key.id === currentLocation.value?.type,
      );
    });
    const reset = () => {
      currentLocation.value = new Location();
      currentPolygon.value = null;
      selectedIncidentId.value = null;
      selectedOrganization.value = null;
      if (locationTool.value) {
        locationTool.value.reset();
      }
    };

    const downloadCurrentLocation = async () => {
      loading.value = true;
      const shapefile = await Location.api().download(route.params.location_id);
      forceFileDownload(shapefile.response);
      loading.value = false;
    };

    const setCurrentLocation = (location: Location) => {
      currentPolygon.value = location;
    };

    const deleteCurrentLocation = async () => {
      loading.value = true;
      try {
        await Location.api().delete(`/locations/${route.params.location_id}`, {
          delete: route.params.location_id as string,
        });
        await $toasted.success(t('locationVue.location_deleted'));
        reset();
        await router.push('/locations/new');
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        loading.value = false;
      }
    };

    const onSelectOrganization = async (value: Organization) => {
      selectedOrganization.value = value;
      if (currentLocation.value && !currentLocation.value.name) {
        currentLocation.value.name = `${selectedOrganization.value?.name} ${currentLocation.value.location_type?.name_t}`;
      }

      if (isPrimaryResponseArea.value && value.primary_location) {
        const result = await messageBox({
          title: t('locationVue.existing_location'),
          content: t('locationVue.location_already_exists_organization', {
            organization: value.name,
          }),
          actions: {
            continue: {
              text: t('actions.create_new'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            edit: {
              text: t('actions.edit_existing'),
              type: 'solid',
              buttonClass: 'border border-black',
            },
          },
        });

        if (result === 'edit') {
          await router.push(`/locations/${value.primary_location}/edit`);
        }
      }
    };

    const onSelectIncident = async (value: string) => {
      selectedIncidentId.value = value;
      let incident = Incident.find(value);
      if (currentLocation.value && !currentLocation.value.name) {
        currentLocation.value.name = `${incident?.name} ${currentLocation.value.location_type?.name_t}`;
      }

      if (isIncidentRelated.value && incident?.locations.length) {
        await Incident.api().fetchById(value);
        incident = Incident.find(value);
        const existingLocation = incident?.locationModels.find(
          (location) => location.type === currentLocation.value?.type,
        );
        if (existingLocation) {
          const result = await messageBox({
            title: t('locationVue.existing_location'),
            content: t('locationVue.location_already_exists_incident', {
              incident: incident?.name,
            }),
            actions: {
              continue: {
                text: t('actions.create_new'),
                type: 'outline',
                buttonClass: 'border border-black',
              },
              edit: {
                text: t('actions.edit_existing'),
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
    };

    const onOrganizationSearch = async (value: string) => {
      const results = await Organization.api().get(
        `/organizations?search=${value}&limit=10&fields=id,name&is_active=true`,
        {
          dataKey: 'results',
        },
      );
      organizationResults.value = (results.entities?.organizations ||
        []) as Array<Organization>;
      return organizationResults.value;
    };

    const saveLocation = async (goToNew: boolean) => {
      if (!form.value) {
        console.error('Form ref not found!');
        return;
      }

      const isValid = form.value.reportValidity();
      if (!isValid) {
        console.error('Form is not valid!');
        $toasted.error(t('locationVue.form_not_valid'));
        return;
      }

      if (!currentPolygon.value) {
        $toasted.error(t('locationVue.no_valid_drawing_found'));
        return;
      }

      loading.value = true;
      let { geometry } = currentPolygon.value.toGeoJSON();
      const { type, features } = currentPolygon.value.toGeoJSON();
      if (type === 'FeatureCollection') {
        const [feature] = features;
        geometry = feature.geometry;
      }

      if (currentLocation.value) {
        currentLocation.value.point = null;
        currentLocation.value.poly = null;
        currentLocation.value.geom = null;

        switch (geometry.type) {
          case 'Point': {
            currentLocation.value.point = geometry;

            break;
          }

          case 'Polygon': {
            currentLocation.value.poly = geometry;

            break;
          }

          case 'MultiPolygon': {
            currentLocation.value.geom = geometry;

            break;
          }
          // No default
        }
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
              `/organizations/${selectedOrganization.value?.id}`,
              {
                primary_location: response.response.data.id,
              },
            );
          }

          if (isSecondaryResponseArea.value) {
            await Organization.api().patch(
              `/organizations/${selectedOrganization.value?.id}`,
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

        await $toasted.success(t('locationVue.location_saved'));

        if (goToNew) {
          reset();
        } else {
          const locationId = response.response.data.id;
          await router.push(`/locations/${locationId}/edit`);
          await loadLocation();
        }
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        loading.value = false;
      }
    };

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
        if (results.entities) {
          relatedOrganizations.value = [
            ...results.entities.organizations,
          ] as Organization[];
        }
      }

      if (isSecondaryResponseArea.value) {
        const results = await Organization.api().get(
          `/organizations?secondary_location=${route.params.location_id}&fields=id,name`,
          {
            dataKey: 'results',
          },
        );
        relatedOrganizations.value = (results.entities?.organizations ||
          []) as Organization[];
      }

      if (isIncidentRelated.value) {
        const incidentIds = currentLocation.value?.joins.map(
          (join) => join.object_id,
        );
        const incidents = Incident.query().whereIdIn(incidentIds).get();
        relatedIncidents.value = [...incidents] as Incident[];
      }
    };

    const detachLocationFromOrganization = async (
      organization: Organization,
    ) => {
      const data: Record<string, unknown> = {};
      if (isPrimaryResponseArea.value) {
        data.primary_location = null;
      }

      if (isSecondaryResponseArea.value) {
        data.secondary_location = null;
      }

      await Organization.api().patch(`/organizations/${organization.id}`, data);
      await loadLocation();
    };

    const detachLocationFromIncident = async (incident: Incident) => {
      await Incident.api().removeLocation(
        incident.id,
        currentLocation.value?.id,
      );
      await loadLocation();
    };

    const loadLocation = async () => {
      loading.value = true;
      await LocationType.api().get('/location_types', {
        dataKey: 'results',
      });
      if (route.params.location_id) {
        try {
          await Location.api().fetchById(route.params.location_id);
          currentLocation.value = Location.find(
            route.params.location_id,
          ) as Location;
          await loadRelatedEntities();
        } catch (error) {
          $toasted.error(getErrorMessage(error));
          currentLocation.value = new Location();
          await router.replace(`/locations/new`);
        } finally {
          loading.value = false;
        }
      } else {
        reset();
      }

      loading.value = false;
    };

    onMounted(async () => {
      await loadLocation();
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
      locationTool,
      form,
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
      detachLocationFromIncident,
    };
  },
});
</script>

<style lang="postcss" scoped>
.form-field {
  @apply my-2;
}
</style>
