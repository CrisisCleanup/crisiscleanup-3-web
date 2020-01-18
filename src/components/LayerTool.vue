<template>
  <div style="display: grid; grid-template-rows: auto 1fr">
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
    <div class="layers-tool flex-grow relative" style="position: relative;">
      <div
        ref="buttons"
        class="absolute w-full h-8 ml-4 flex"
        style="z-index: 1001;"
      >
        <div class="flex mr-4">
          <MapButton
            button-class="border bg-white"
            icon="map-undo"
            disabled
            @click="() => {}"
          />
          <MapButton
            button-class="border bg-white"
            icon="map-redo"
            disabled
            @click="() => {}"
          />
        </div>
        <div class="flex">
          <MapButton
            button-class="border bg-white"
            icon="map-rect"
            :actions="[
              { id: 'add', text: 'Add' },
              { id: 'exclude', text: 'Exclude' },
              { id: 'cancel', text: 'Cancel' },
            ]"
            :disabled="Boolean(!currentDraw) && currentDraw !== 'Rectangle'"
            :selected="Boolean(currentDraw)"
            @changed="
              event => {
                handleMapButtonEvent(event, 'Rectangle');
              }
            "
            @click="() => enableDraw('Rectangle')"
          />
          <MapButton
            button-class="border bg-white"
            icon="map-poly"
            :actions="[
              { id: 'add', text: 'Add' },
              { id: 'exclude', text: 'Exclude' },
              { id: 'cancel', text: 'Cancel' },
            ]"
            :disabled="Boolean(!currentDraw) && currentDraw !== 'Polygon'"
            :selected="Boolean(currentDraw)"
            @changed="
              event => {
                handleMapButtonEvent(event, 'Polygon');
              }
            "
            @click="() => enableDraw('Polygon')"
          />
          <MapButton
            button-class="border bg-white"
            icon="map-circle"
            :actions="[
              { id: 'add', text: 'Add' },
              { id: 'exclude', text: 'Exclude' },
              { id: 'cancel', text: 'Cancel' },
            ]"
            :disabled="Boolean(!currentDraw) && currentDraw !== 'Circle'"
            :selected="Boolean(currentDraw)"
            @changed="
              event => {
                handleMapButtonEvent(event, 'Circle');
              }
            "
            @click="() => enableDraw('Circle')"
          />
          <MapButton
            button-class="border bg-white"
            icon="map-buffer"
            :actions="[
              { id: 'buffer', text: 'Add' },
              { id: 'cancel', text: 'Cancel' },
            ]"
            :disabled="Boolean(!currentDraw) && currentDraw !== 'Buffer'"
            :selected="Boolean(currentDraw)"
            @changed="
              event => {
                handleMapButtonEvent(event, 'Buffer');
              }
            "
            @click="enableBuffer"
          />
        </div>
      </div>
      <div id="map" class="h-full"></div>
    </div>
  </div>
</template>

<script>
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import * as circleToPolygon from 'circle-to-polygon';
import * as turf from '@turf/turf';
import Location from '@/models/Location';
import MapButton from './MapButton';

export default {
  name: 'LayerTool',
  components: { MapButton },
  props: ['locations'],
  data() {
    return {
      currentPolygon: null,
      locationSearch: '',
      currentDraw: null,
      bufferedLayer: null,
      locationResults: [],
      completedOptions: {
        color: 'orange',
        fillColor: 'orange',
        weight: '2',
      },
      bufferedOptions: {
        color: 'orange',
        fillColor: 'orange',
        dashArray: [5, 5],
        weight: '1',
      },
      map: null,
    };
  },
  watch: {
    currentPolygon(polygon) {
      this.$emit('changed', polygon);
    },
  },
  async mounted() {
    const map = L.map('map', { zoomControl: false }).setView(
      [30.126124, -83.916503],
      5,
    );
    L.tileLayer(
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        id: 'openStreetMap',
      },
    ).addTo(map);

    L.DomEvent.on(this.$refs.buttons, 'click', function(ev) {
      L.DomEvent.stopPropagation(ev);
    });

    map.on('pm:create', e => {
      this.$log.debug(e);

      let { layer } = e;

      if (layer instanceof L.Circle) {
        const radius = e.layer.getRadius();
        const { coordinates } = e.layer.toGeoJSON().geometry;
        const numberOfEdges = 64;
        const geometry = circleToPolygon(coordinates, radius, numberOfEdges);
        const geojsonFeature = {
          type: 'Feature',
          properties: {},
          geometry,
        };
        [layer] = L.geoJSON(geojsonFeature).getLayers();
      }

      this.bufferedLayer = layer;
    });

    this.map = map;

    if (this.locations && this.locations.length) {
      const locationPromises = [];
      this.locations.forEach(location => {
        locationPromises.push(this.onLocationLoaded(location));
      });
      await Promise.all(locationPromises);
    }
  },
  methods: {
    enableBuffer() {
      this.currentDraw = 'Buffer';
      const [currentPolygonLayer] = this.currentPolygon.getLayers();
      const currentPolygon = currentPolygonLayer.toGeoJSON();
      const newPoly = turf.buffer(currentPolygon, 10, {
        units: 'kilometers',
      });
      this.bufferedLayer = L.geoJson(newPoly, this.bufferedOptions);
      this.bufferedLayer.addTo(this.map);
    },
    handleMapButtonEvent(event, type) {
      this.$log.debug(event);
      this.$log.debug(type);

      if (event === 'cancel') {
        this.map.pm.disableDraw(type);
        this.currentDraw = null;
      }

      if (event === 'add') {
        this.map.pm.disableDraw(type);
        this.currentDraw = null;
        if (!this.bufferedLayer) return;
        if (this.currentPolygon) {
          const [currentPolygonLayer] = this.currentPolygon.getLayers();
          const currentPolygon = currentPolygonLayer.toGeoJSON();
          const newPolygon = this.bufferedLayer.toGeoJSON();
          const newPoly = turf.union(currentPolygon, newPolygon);
          this.currentPolygon = L.geoJson(newPoly, this.completedOptions);
        } else {
          this.currentPolygon = L.geoJson(
            this.bufferedLayer.toGeoJSON(),
            this.completedOptions,
          );
        }
        this.map.eachLayer(layer => {
          if (layer instanceof L.TileLayer) {
            return;
          }
          this.map.removeLayer(layer);
        });
        this.map.addLayer(this.currentPolygon);
      }

      if (event === 'exclude') {
        this.map.pm.disableDraw(type);
        this.currentDraw = null;
        if (!this.bufferedLayer) return;
        if (this.currentPolygon) {
          const [currentPolygonLayer] = this.currentPolygon.getLayers();
          const currentPolygon = currentPolygonLayer.toGeoJSON();
          const newPolygon = this.bufferedLayer.toGeoJSON();
          const newPoly = turf.difference(currentPolygon, newPolygon);
          this.currentPolygon = L.geoJson(newPoly, this.completedOptions);
        } else {
          this.currentPolygon = L.geoJson(
            this.bufferedLayer.toGeoJSON(),
            this.completedOptions,
          );
        }
        this.map.eachLayer(layer => {
          if (layer instanceof L.TileLayer) {
            return;
          }
          this.map.removeLayer(layer);
        });
        this.map.addLayer(this.currentPolygon);
      }

      if (event === 'buffer') {
        this.map.pm.disableDraw(type);
        this.currentDraw = null;
        if (!this.bufferedLayer) return;
        this.currentPolygon = L.geoJSON(
          this.bufferedLayer.toGeoJSON(),
          this.completedOptions,
        );
        this.map.eachLayer(layer => {
          if (layer instanceof L.TileLayer) {
            return;
          }
          this.map.removeLayer(layer);
        });
        this.map.addLayer(this.currentPolygon);
      }
    },
    enableDraw(type) {
      const options = {
        snappable: false,
        templineStyle: {
          color: 'orange',
          weight: '1',
        },

        hintlineStyle: {
          color: 'orange',
          dashArray: [5, 5],
          weight: '1',
        },
        pathOptions: this.bufferedOptions,
      };

      // enable drawing mode for shape - e.g. Poly, Line, Circle, etc
      // Add this slight pan to re-render map
      this.currentDraw = type;
      setTimeout(() => {
        this.map.pm.enableDraw(type, options);
      }, 200);
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
      const geojsonLayer = L.geoJSON(geojsonFeature, this.bufferedOptions);
      [this.bufferedLayer] = geojsonLayer.getLayers();
      this.bufferedLayer.addTo(this.map);
    },

    async onLocationLoaded(location_id) {
      await Location.api().fetchById(location_id);
      const location = Location.find(location_id);
      const geojsonFeature = {
        type: 'Feature',
        properties: location.attr,
        geometry: location.poly || location.geom || location.point,
      };
      this.currentPolygon = L.geoJSON(geojsonFeature, this.completedOptions);
      this.currentPolygon.addTo(this.map);
    },
  },
};
</script>

<style scoped>
@import '~leaflet/dist/leaflet.css';
@import '~@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
</style>
