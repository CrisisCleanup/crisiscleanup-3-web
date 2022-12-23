<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between w-full mr-4">
        <base-input
          v-model="currentLocation.name"
          type="text"
          class="input m-2 w-108"
          size="small"
          :placeholder="$t('locationVue.location_name')"
        />
        <base-button
          :text="$t('profileOrg.add_response_area')"
          :alt="$t('profileOrg.edit_response_area')"
          variant="solid"
          class="px-2 py-1"
          :action="addLayer"
        ></base-button>
      </div>
    </template>
    <div class="flex justify-center flex-col m-5">
      <div id="incident-map" class="w-full h-64"></div>
      <div>
        <div class="mt-8 text-base">{{ $t('locationVue.access') }}</div>
        <div class="flex flex-wrap mt-2">
          <base-radio
            class="m-4"
            label="shared"
            :name="$t('locationVue.shared')"
            :model-value="currentLocation.shared"
            @update:modelValue="currentLocation.shared = $event"
          />
          <base-radio
            class="m-4"
            label="private"
            :name="$t('locationVue.private')"
            :model-value="currentLocation.shared"
            @update:modelValue="currentLocation.shared = $event"
          />
          <base-radio
            class="m-4"
            label="public"
            :name="$t('locationVue.public')"
            :model-value="currentLocation.shared"
            @update:modelValue="currentLocation.shared = $event"
          />
        </div>
      </div>
    </div>
  </Card>
</template>
<script lang="ts">
import * as L from 'leaflet';
import { ref, defineComponent, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import LocationType from '@/models/LocationType';
import Location from '@/models/Location';
import { getErrorMessage } from '@/utils/errors';
import { mapTileLayer } from '@/utils/map';
import Card from '@/components/cards/Card.vue';
import LocationTool from '@/components/locations/LocationTool.vue';
import useDialogs from '@/hooks/useDialogs.js';

export default defineComponent({
  name: 'IncidentLocationEditor',
  components: { Card },
  props: {
    currentIncident: {
      type: Object,
      default: () => ({}),
    },
    location: {
      type: Object,
      default: null,
    },
  },
  setup(props, { emit }) {
    const { component } = useDialogs();
    const { t } = useI18n();
    const $toasted = useToast();

    const classNames = 'p-3';

    const currentLocation = ref({
      name: '',
      shared: '',
      notes: '',
    });
    const locationLayer = ref(L.layerGroup());

    async function saveLocation(polygon) {
      let { geometry } = polygon.toGeoJSON();
      const { type, features } = polygon.toGeoJSON();
      const locationTypeKey = 'incident_primary_damaged_area';
      const locationType = LocationType.query()
        .where('key', locationTypeKey)
        .get()[0];
      const location = {
        type: locationType.id,
        ...currentLocation.value,
      };
      if (type === 'FeatureCollection') {
        const [feature] = features;
        geometry = feature.geometry;
      }

      switch (geometry.type) {
        case 'Point': {
          location.point = geometry;

          break;
        }
        case 'Polygon': {
          location.poly = geometry;

          break;
        }
        case 'MultiPolygon': {
          location.geom = geometry;

          break;
        }
        // No default
      }

      try {
        const response = await Location.api().post('/locations', location);
        const locationId = response.response.data.id;
        await Location.api().fetchById(locationId);
        emit('onLocationChange', response.response.data);
        locationLayer.value.clearLayers();
        polygon.addTo(locationLayer.value);
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    async function addLayer() {
      let polygon;
      const response = await component({
        title: t('actions.edit'),
        component: LocationTool,
        actionText: t('actions.save'),
        classes: 'w-full h-144 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        listeners: {
          changed: (payload) => {
            polygon = payload;
          },
        },
        props: {
          class: classNames,
        },
      });

      if (response === 'ok' && polygon) {
        await saveLocation(polygon);
      }
    }

    onMounted(async () => {
      if (props.location) {
        await Location.api().fetchById(props.location.location);
        const location = Location.find(props.location.location);
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        L.geoJSON(geojsonFeature, {
          weight: '1',
        }).addTo(locationLayer.value);

        currentLocation.value = location;
      }

      nextTick(() => {
        const map = L.map('incident-map', {
          zoomControl: false,
        }).setView([35.746_512_259_918_5, -96.411_509_631_256_56], 3);
        L.tileLayer(mapTileLayer, {
          // tileSize: 512,
          // zoomOffset: -1,
          maxZoom: 19,
        }).addTo(map);
        locationLayer.value.addTo(map);
      });
    });

    return {
      currentLocation,
      locationLayer,
      addLayer,
    };
  },
});
</script>
