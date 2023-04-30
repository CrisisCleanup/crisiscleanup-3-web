<template>
  <Home>
    <div class="grid--main">
      <div class="text-4xl">
        {{ $t('mapVue.visualize_disaster') }}
      </div>
      <div class="text-xl">
        {{ $t('mapVue.choose_incident_dropdown') }}
      </div>

      <base-select
        :model-value="selectedIncident"
        class="form-field"
        :options="incidents"
        style="z-index: 10000; position: relative"
        searchable
        select-classes="bg-white outline-none h-12 mb-3 w-72"
        item-key="id"
        label="name"
        :placeholder="$t('mapVue.disaster')"
        @update:modelValue="
          (value) => {
            selectedIncident = value;
            reloadMap();
            setLocations(value);
          }
        "
      />

      <div class="h-120 border bg-crisiscleanup-light-grey relative">
        <SimpleMap
          :map-loading="false"
          :available-work-types="availableWorkTypes"
          :show-legend="Object.keys(availableWorkTypes)"
        />
      </div>

      <div class="text-lg my-1">
        {{ $t('mapVue.personal_info_hidden') }}
      </div>
    </div>
  </Home>
</template>

<script lang="ts">
import axios from 'axios';
import { reactive, toRefs, onMounted } from 'vue';
import * as L from 'leaflet';
import Home from '@/layouts/Home.vue';
import SimpleMap from '@/components/SimpleMap.vue';
import useWorksiteMap from '@/hooks/worksite/useWorksiteMap';

export default defineComponent({
  name: 'Map',
  components: { Home, SimpleMap },
  setup() {
    let mapUtils;
    const state = reactive({
      incidents: [],
      locations: [],
      workTypeMap: {},
      statusMap: {},
      selectedIncident: null,
      availableWorkTypes: {},
    });

    async function setLocations(incidentId) {
      const incident = state.incidents.find((i) => i.id === incidentId);
      if (incident.locations.length > 0) {
        const locationIds = incident.locations.map(
          (location) => location.location,
        );
        const locationsResponse = await axios.get(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/locations?id__in=${locationIds.join(',')}`,
        );
        state.locations = locationsResponse.data.results;
      } else {
        state.locations = [];
      }

      mapUtils?.removeLayer('public_incident_objects');

      for (const location of state.locations) {
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        const geojsonLayer = L.geoJSON(geojsonFeature);
        const [layer] = geojsonLayer.getLayers();
        layer.key = 'public_incident_objects';
        layer.addTo(mapUtils.getMap());
      }
    }
    function displayWorksite(worksite) {
      const popup = L.popup({ className: 'pixi-popup' });
      let popupContent = `<b>${worksite.address} (${worksite.case_number}</b>)`;

      for (const worktype of worksite.work_types) {
        popupContent += `<div>${state.workTypeMap[worktype.work_type]}(${
          state.statusMap[worktype.status]
        })</div>`;
      }

      popup
        .setLatLng([worksite.x, worksite.y])
        .setContent(popupContent)
        .openOn(mapUtils.getMap());
    }

    async function loadCases() {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/worksites_public`,
        {
          params: { incident: state.selectedIncident },
        },
      );

      const markers = response.data.results;
      return markers;
    }

    async function reloadMap() {
      const cases = await loadCases();
      mapUtils?.reloadMap(
        cases,
        cases.map((m) => m.id),
      );
    }

    onMounted(async () => {
      const incidentsResponse = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/incidents_list?fields=id,name,short_name,geofence,locations,turn_on_release&limit=200&sort=-start_at`,
      );
      const workTypesResponse = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/work_types`,
      );
      const statusResponse = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/statuses`,
      );
      state.incidents = incidentsResponse.data.results;
      state.workTypeMap = workTypesResponse.data.results.reduce(function (
        map,
        obj,
      ) {
        map[obj.key] = obj.name_t;
        return map;
      },
      {});
      state.statusMap = statusResponse.data.results.reduce(function (map, obj) {
        map[obj.status] = obj.status_name_t;
        return map;
      }, {});
      state.selectedIncident = state.incidents[0].id;
      const markers = await loadCases();

      mapUtils = useWorksiteMap(
        markers,
        markers.map((m) => m.id),
        displayWorksite,
        ({ workTypes }) => {
          state.availableWorkTypes = workTypes;
        },
      );

      await setLocations(state.incidents[0].id);
    });
    return {
      ...toRefs(state),
      setLocations,
      reloadMap,
    };
  },
});
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      'nav main main main main main'
      'nav main main main main main'
      'nav main main main main main'
      'actions . . . . .'
      '. . . . . .'
      '. . . . footer footer';

    .grid {
      &--main {
        @apply mx-16;
      }
      &--overlay {
        grid-row: 1 / span 7;
      }
    }
  }
}
@media only screen and (max-width: 640px) {
  .homegrid {
    height: 100vh;
    &.grid-container {
      grid:
        [r1] 'logo survivors' [r1end]
        [r2] 'nav nav' [r2end]
        [r3] 'actions actions' [r3end]
        [r4] 'footer footer' [r4end]
        [r5] 'main main' [r5end]
        [r6] 'main main' [r6end]
        / auto;
      grid-template-rows: 1fr 1fr 1fr 1fr;
    }
  }
}
.input {
  @apply m-2;
}
</style>
