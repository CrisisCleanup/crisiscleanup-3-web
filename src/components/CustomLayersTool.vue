<template>
  <div class="flex flex-col">
    <div class="h-16 flex items-center">
      <autocomplete
        icon="search"
        :suggestions="locationResults"
        display-property="name"
        size="large"
        placeholder="Search by state, city, county and zipcode"
        class="w-108"
        @selected="onLocationSelected"
        @search="onLocationSearch"
      >
        <template #result="slotProps">
          <div
            class="flex flex-col text-sm p-2 cursor-pointer hover:bg-gray-100 border-b"
          >
            {{ slotProps.suggestion.item.name }}
          </div>
        </template>
      </autocomplete>
    </div>
    <div class="layers-tool flex-grow" style="position: relative;">
      <div ref="map" class="home-map"></div>
    </div>
  </div>
</template>

<script>
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import Location from '@/models/Location';

export default {
  name: 'CustomLayersTool',
  props: ['locations'],
  data() {
    return {
      selected: {},
      tileLayer: L.tileLayer(
        'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
          detectRetina: false,
          maxZoom: 18,
          noWrap: false,
        },
      ),
      map: null,
      drawnItems: new L.FeatureGroup(),
      locationSearch: '',
      locationResults: [],
    };
  },
  async mounted() {
    const options = {
      zoom: 14,
      loadingControl: true,
      preferCanvas: true,
    };
    this.initMap(options);

    if (this.locations && this.locations.length) {
      const locationPromises = [];
      this.locations.forEach(location => {
        locationPromises.push(this.onLocationSelected({ id: location }));
      });
      await Promise.all(locationPromises);
    }
  },
  methods: {
    initMap(options) {
      this.map = L.map(this.$refs.map, options);
      this.map.pm.addControls({
        position: 'topleft',
      });
      this.map.setView([30.126124, -83.916503], 5);
      this.tileLayer.addTo(this.map);

      this.map.on('pm:create', e => {
        this.drawnItems.addLayer(e.layer);
      });

      this.map.on('pm:remove', e => {
        this.drawnItems.getLayers().forEach(location => {
          if (location.toGeoJSON === e.layer.toGeoJSON) {
            this.drawnItems.removeLayer(location);
          }
        });
      });

      this.map.addLayer(this.drawnItems);
    },
    async onLocationSearch(value) {
      const results = await Location.api().get(
        `/locations?search=${value}&limit=10&fields=id,name,type`,
        {
          dataKey: 'results',
        },
      );
      this.locationResults = results.entities.locations;
    },
    async onLocationSelected(selected) {
      await Location.api().fetchById(selected.id);
      const location = Location.find(selected.id);
      const geojsonFeature = {
        type: 'Feature',
        properties: location.attr,
        geometry: location.poly || location.geom || location.point,
      };
      const geojsonLayer = L.geoJSON(geojsonFeature);
      geojsonLayer.eachLayer(l => {
        l.locationID = selected.id;
        this.drawnItems.addLayer(l);
      });
    },
  },
};
</script>

<style>
@import '~leaflet/dist/leaflet.css';
@import '~@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

.home-map {
  height: 100%;
}
.leaflet-pane {
  z-index: 5;
}
</style>
