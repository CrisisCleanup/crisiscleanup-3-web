<template>
  <div class="flex worksite-actions" style="color: #4c4c4d">
    <base-dropdown class-name="borderless">
      <base-button
        slot="btn"
        variant="text"
        class="text-base font-thin mx-2"
        :text="$t('casesVue.layers')"
        :alt="$t('casesVue.layers')"
        ccu-icon="layers"
        icon-size="medium"
      />
      <template slot="body">
        <ul class="text-base">
          {{
            $t('casesVue.standard_layers')
          }}
          <li class="py-2">
            <base-dropdown
              :trigger="'hover'"
              :role="'sublist'"
              :align="'right'"
            >
              <template slot="btn">{{
                $t('locationTypes.boundary_political_us_state')
              }}</template>
              <template slot="body">
                <ul class="h-64 overflow-auto">
                  <li v-for="state in usStates" :key="`${state.id}`">
                    <base-checkbox
                      :value="appliedLocations.has(state.id)"
                      :ccu-event="
                        appliedLocations.has(state.id)
                          ? 'user_ui-turn-off_layer'
                          : 'user_ui-turn-on_layer'
                      "
                      @input="
                        (value) => {
                          applyLocation(state.id, value);
                        }
                      "
                      >{{ state.name }}</base-checkbox
                    >
                  </li>
                </ul>
              </template>
            </base-dropdown>
          </li>
          <li class="py-2">
            <base-dropdown
              :trigger="'hover'"
              :role="'sublist'"
              :align="'right'"
            >
              <template slot="btn">{{
                $t('locationTypes.boundary_political_us_congress')
              }}</template>
              <template slot="body">
                <ul class="h-64 overflow-auto">
                  <li v-for="district in districts" :key="district.id">
                    <base-checkbox
                      :value="appliedLocations.has(district.id)"
                      :ccu-event="
                        appliedLocations.has(district.id)
                          ? 'user_ui-turn-off_layer'
                          : 'user_ui-turn-on_layer'
                      "
                      @input="
                        (value) => {
                          applyLocation(district.id, value);
                        }
                      "
                      >{{ district.name }}</base-checkbox
                    >
                  </li>
                </ul>
              </template>
            </base-dropdown>
          </li>
          <li class="py-2">
            <base-dropdown
              :trigger="'hover'"
              :role="'sublist'"
              :align="'right'"
            >
              <template slot="btn">{{
                $t('locationTypes.boundary_political_us_county')
              }}</template>
              <template slot="body">
                <ul class="h-64 overflow-auto">
                  <li v-for="county in counties" :key="`${county.id}`">
                    <base-checkbox
                      :value="appliedLocations.has(county.id)"
                      @input="
                        (value) => {
                          applyLocation(county.id, value);
                        }
                      "
                      :ccu-event="
                        appliedLocations.has(county.id)
                          ? 'user_ui-turn-off_layer'
                          : 'user_ui-turn-on_layer'
                      "
                      >{{ county.name }}</base-checkbox
                    >
                  </li>
                </ul>
              </template>
            </base-dropdown>
          </li>
          <li class="py-2">
            <base-dropdown
              :trigger="'hover'"
              :role="'sublist'"
              :align="'right'"
            >
              <template slot="btn">{{ $t('casesVue.teams') }}</template>
              <template slot="body">
                <ul class="h-64 overflow-auto">
                  <li v-for="team in teams" :key="`${team.id}`">
                    <base-checkbox
                      :value="appliedLocations.has(team.id)"
                      :ccu-event="
                        appliedLocations.has(team.id)
                          ? 'user_ui-turn-off_layer'
                          : 'user_ui-turn-on_layer'
                      "
                      @input="
                        (value) => {
                          applyTeamGeoJson(team, value);
                        }
                      "
                      >{{ team.name }}</base-checkbox
                    >
                  </li>
                </ul>
              </template>
            </base-dropdown>
          </li>
          <li class="py-2">
            <base-dropdown
              :trigger="'hover'"
              :role="'sublist'"
              :align="'right'"
            >
              <template slot="btn">{{ $t('casesVue.incident') }}</template>
              <template slot="body">
                <ul class="h-64 overflow-auto">
                  <li
                    v-for="location in currentIncident.locationModels"
                    :key="location.id"
                  >
                    <base-checkbox
                      :value="appliedLocations.has(location.id)"
                      @input="
                        (value) => {
                          applyLocation(location.id, value);
                        }
                      "
                      :ccu-event="
                        appliedLocations.has(location.id)
                          ? 'user_ui-turn-off_layer'
                          : 'user_ui-turn-on_layer'
                      "
                      >{{ location.name }}</base-checkbox
                    >
                  </li>
                  <li
                    v-if="
                      currentOrganization &&
                      currentOrganization.primary_location
                    "
                  >
                    <base-checkbox
                      :value="
                        appliedLocations.has(
                          currentOrganization.primary_location,
                        )
                      "
                      :ccu-event="
                        appliedLocations.has(
                          currentOrganization.primary_location,
                        )
                          ? 'user_ui-turn-off_layer'
                          : 'user_ui-turn-on_layer'
                      "
                      @input="
                        (value) => {
                          applyLocation(
                            currentOrganization.primary_location,
                            value,
                          );
                        }
                      "
                      >{{ $t('casesVue.primary_response_area') }}</base-checkbox
                    >
                  </li>
                  <li
                    v-if="
                      currentOrganization &&
                      currentOrganization.secondary_location
                    "
                  >
                    <base-checkbox
                      :value="
                        appliedLocations.has(
                          currentOrganization.secondary_location,
                        )
                      "
                      :ccu-event="
                        appliedLocations.has(
                          currentOrganization.secondary_location,
                        )
                          ? 'user_ui-turn-off_layer'
                          : 'user_ui-turn-on_layer'
                      "
                      @input="
                        (value) => {
                          applyLocation(
                            currentOrganization.secondary_location,
                            value,
                          );
                        }
                      "
                      >{{
                        $t('casesVue.secondary_response_area')
                      }}</base-checkbox
                    >
                  </li>
                </ul>
              </template>
            </base-dropdown>
          </li>
          <li class="py-2">
            <base-dropdown
              :trigger="'hover'"
              :role="'sublist'"
              :align="'right'"
            >
              <template slot="btn">{{ $t('casesVue.my_layers') }}</template>
              <template slot="body">
                <ul class="h-64 overflow-auto">
                  <li
                    v-for="location in organizationLocations"
                    :key="`${location.id}`"
                  >
                    <base-checkbox
                      :value="appliedLocations.has(location.id)"
                      :ccu-event="
                        appliedLocations.has(location.id)
                          ? 'user_ui-turn-off_layer'
                          : 'user_ui-turn-on_layer'
                      "
                      @input="
                        (value) => {
                          applyLocation(location.id, value);
                        }
                      "
                      >{{ location.name }}</base-checkbox
                    >
                  </li>
                </ul>
              </template>
            </base-dropdown>
          </li>
        </ul>
      </template>
    </base-dropdown>
    <base-button
      class="text-base font-thin mx-2"
      ccu-icon="filters"
      icon-size="medium"
      :alt="$t('casesVue.filters')"
      :action="
                    () => {
                      showingFilters = true;
                    }
                  "
    >
      {{ $t('casesVue.filters') }}
      <span
        v-if="filtersCount > 0"
        class="rounded-full mx-2 px-1 bg-yellow-500 text-xs"
      >{{ filtersCount }}</span
      >
    </base-button>
    <WorksiteFilters
      ref="worksiteFilter"
      :show="showingFilters"
      :current-filters="filters"
      :incident="currentIncident"
      :locations="organizationLocations"
      @closedFilters="showingFilters = false"
      @updatedFilters="handleFilters"
    />
  </div>
</template>

<script lang='ts'>
import { defineComponent, computed, ref, onMounted } from '@vue/composition-api';
import * as L from 'leaflet';
import WorksiteFilters from '@/components/WorksiteFilters.vue';
import LocationType from '@/models/LocationType';
import Location from '@/models/Location';
import Team from '@/models/Team';
import Incident from '@/models/Incident';
import { getQueryString } from '@/utils/urls';
import useHttp from '@/use/useHttp';
import { useGetters } from '@u3u/vue-hooks';
import User from '@/models/User';
import Organization from '@/models/Organization';

export default defineComponent({
  name: 'WorksiteActions',
  components: { WorksiteFilters },
  setup(props, { emit }) {
    const { $http } = useHttp();

    const { userId } = useGetters('auth', ['userId']);
    const currentUser = computed(() => User.find(userId.value));
    const currentOrganization = computed(() =>
      Organization.find(currentUser?.value?.organization?.id),
    );

    const showingFilters = ref<Boolean>(false);
    const filtersCount = ref<Number>(0);
    const filters = ref<any>({});
    const appliedFilters = ref<any>({});

    const appliedLocations = ref<Set<string>>(new Set());
    const locations = ref<any[] | null>(null);
    const usStates = ref<any[]>([]);
    const districts = ref<any[]>([]);
    const counties = ref<any[]>([]);
    const organizationLocations = ref<any[]>([]);

    const teams = computed(() => {
      return Team.all();
    });
    const currentIncident = computed(() => {
      return Incident.find(props.currentIncidentId);
    });

    async function applyLocation(locationId, value) {
      if (value && props.map) {
        await Location.api().fetchById(locationId);
        const location = Location.find(locationId);
        const geojsonFeature = {
          type: 'Feature',
          properties: location?.attr,
          geometry: location?.poly || location?.geom || location?.point,
        };
        const polygon = L.geoJSON(geojsonFeature, {
          weight: '1',
          onEachFeature(feature, layer) {
            layer.location_id = locationId;
          },
        });
        polygon.addTo(props.map);
        props.map.fitBounds(polygon.getBounds());
        appliedLocations.value = new Set(appliedLocations.value.add(locationId));
      } else {
        props.map.eachLayer((layer) => {
          if (layer.location_id && layer.location_id === locationId) {
            props.map.removeLayer(layer);
          }
        });
        appliedLocations.value.delete(locationId)
        appliedLocations.value = new Set(
          appliedLocations.value,
        );
      }
    }
    async function applyTeamGeoJson(team, value) {
      const feature = await Team.api().getCasesArea(
        team.id,
        props.currentIncidentId,
      );
      const locationId = team.id;

      if (value && props.map) {
        const geojsonFeature = {
          type: 'Feature',
          properties: {},
          geometry: feature.response.data,
        };
        const polygon = L.geoJSON(geojsonFeature, {
          weight: '1',
          onEachFeature(_, layer) {
            layer.location_id = locationId;
          },
        });
        polygon.addTo(props.map);
        props.map.fitBounds(polygon.getBounds());
        appliedLocations.value = new Set(appliedLocations.value.add(locationId));
      } else {
        props.map.eachLayer((layer) => {
          if (layer.location_id && layer.location_id === locationId) {
            props.map.removeLayer(layer);
          }
        });
        appliedLocations.value.delete(locationId)
        appliedLocations.value = new Set(
          appliedLocations.value,
        );
      }
    }

    async function getLocations() {
      const locationParams = {
        limit: 200,
        fields: 'id,name,type',
        incident_area: props.currentIncidentId,
      }
      const promiseArray: any = []

      const locationTypesMap = {
        'boundary_political_us_congress': districts,
        'boundary_political_us_state': usStates,
        'boundary_political_us_county': counties
      }

      Object.keys(locationTypesMap).forEach((type) => {
        const promise = $http.get(`${process.env.VUE_APP_API_BASE_URL}/locations`, {
          params: {
            ...locationParams,
            type__key: type
          }
        }).then((response) => locationTypesMap[type].value = response.data.results);
        promiseArray.push(promise)
      })

      return Promise.any(promiseArray);
    }

    async function getOrganizationLocations() {
      const locationParams = {
        limit: 200,
        created_by__organization: currentUser?.value?.organization.id,
        fields: 'id,name,type',
      };
      const queryString = getQueryString(locationParams);
      const response = await $http.get(
        `${process.env.VUE_APP_API_BASE_URL}/locations?${queryString}`,
      );
      organizationLocations.value = response.data.results;
    }

    function handleFilters(f) {
      appliedFilters.value = {};
      filters.value = f.filters;
      Object.values(f.filters).forEach((filter: any) => {
        appliedFilters.value = {
          ...appliedFilters.value,
          ...filter.packFunction(),
        };
      });
      filtersCount.value = f.count

      showingFilters.value = false;
      emit('updatedQuery', appliedFilters.value)
      // this.updateUserState();
    }

    onMounted(async () => {
      await Promise.any([
        getLocations(),
        getOrganizationLocations(),
        LocationType.api().get('/location_types', {
          dataKey: 'results',
        }),
        Team.api().get('/teams', {
          dataKey: 'results',
        }),
        // this.getPdas(),
      ]);
    });

    return { handleFilters, filters, currentIncident, currentOrganization, organizationLocations, showingFilters, usStates, districts, counties, applyLocation, applyTeamGeoJson, appliedLocations, teams, locations, filtersCount };
  },
  props: {
    map: { type: Object, default: null, required: false },
    currentIncidentId: { type: String, default: null, required: false }
  },
});
</script>

<style scoped></style>
