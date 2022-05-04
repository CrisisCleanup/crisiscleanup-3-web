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
          :text="$t('~~Add Layer on Map')"
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
  </Card>
</template>
<script>
import * as L from 'leaflet';
import { DialogsMixin } from '@/mixins';
import LocationType from '@/models/LocationType';
import Location from '@/models/Location';
import { getErrorMessage } from '@/utils/errors';
import { mapTileLayer } from '@/utils/map';
import Card from '@/components/cards/Card';

export default {
  name: 'IncidentLocationEditor',
  components: { Card },
  mixins: [DialogsMixin],
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
  data() {
    return {
      currentLocation: {
        name: '',
        shared: '',
        notes: '',
      },
      locationLayer: L.layerGroup(),
    };
  },
  async mounted() {
    this.$nextTick(async () => {
      this.map = L.map('incident-map', {
        zoomControl: false,
      }).setView([35.7465122599185, -96.41150963125656], 3);
      L.tileLayer(mapTileLayer, {
        // tileSize: 512,
        // zoomOffset: -1,
        maxZoom: 19,
      }).addTo(this.map);

      this.locationLayer.addTo(this.map);

      if (this.location) {
        // this.currentLocation = { ...this.currentLocation, ...this.location };

        await Location.api().fetchById(this.location.location);
        const location = Location.find(this.location.location);
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        L.geoJSON(geojsonFeature, {
          weight: '1',
        }).addTo(this.locationLayer);

        this.currentLocation = location;
      }
    });
  },
  methods: {
    async addLayer() {
      let polygon;
      const response = await this.$component({
        title: this.$t('~~Edit Item'),
        component: 'LocationTool',
        actionText: this.$t('~~Save'),
        classes: 'w-full h-144 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        listeners: {
          changed: (payload) => {
            polygon = payload;
          },
        },
        props: {
          class: 'p-3',
        },
      });

      if (response === 'ok' && polygon) {
        await this.saveLocation(polygon);
      }
    },
    async saveLocation(polygon) {
      let { geometry } = polygon.toGeoJSON();
      const { type, features } = polygon.toGeoJSON();
      const locationTypeKey = 'incident_primary_damaged_area';
      const locationType = LocationType.query()
        .where('key', locationTypeKey)
        .get()[0];
      const location = {
        type: locationType.id,
        ...this.currentLocation,
      };
      if (type === 'FeatureCollection') {
        const [feature] = features;
        geometry = feature.geometry;
      }

      if (geometry.type === 'Point') {
        location.point = geometry;
      } else if (geometry.type === 'Polygon') {
        location.poly = geometry;
      } else if (geometry.type === 'MultiPolygon') {
        location.geom = geometry;
      }

      try {
        const response = await Location.api().post('/locations', location);
        const locationId = response.response.data.id;
        await Location.api().fetchById(locationId);
        this.$emit('onLocationChange', response.response.data);
        this.locationLayer.clearLayers();
        polygon.addTo(this.locationLayer);
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
};
</script>
