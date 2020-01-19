<template>
  <div style="display: grid; grid-template-rows: auto 1fr">
    <div class="h-16 flex items-center">
      <autocomplete
        icon="search"
        :suggestions="locationResults"
        display-property="name"
        size="large"
        placeholder="Search by state, city, county and zipcode"
        class="w-1/3"
        @selected="onLocationSelected"
        @search="onLocationSearch"
      >
        <template #result="slotProps">
          <div
            class="flex justify-between text-sm p-2 cursor-pointer hover:bg-gray-100 border-b"
          >
            <span>{{ slotProps.suggestion.item.name }}</span>
          </div>
        </template>
      </autocomplete>
    </div>
    <div class="layers-tool flex-grow relative" style="position: relative;">
      <div
        ref="buttons"
        class="absolute w-full h-8 ml-4 mt-4 flex"
        style="z-index: 1001;"
      >
        <div class="flex mr-4">
          <MapButton
            button-class="border bg-white"
            icon="map-undo"
            :disabled="!canUndo"
            @click="undo"
          />
          <MapButton
            button-class="border bg-white"
            icon="map-redo"
            :disabled="!canRedo"
            @click="redo"
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
            :disabled="Boolean(!currentDraw) || currentDraw !== 'Rectangle'"
            :selected="Boolean(currentDraw) && currentDraw === 'Rectangle'"
            @changed="
              event => {
                handleMapEvent(event, 'Rectangle');
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
            :disabled="Boolean(!currentDraw) || currentDraw !== 'Polygon'"
            :selected="Boolean(currentDraw) && currentDraw === 'Polygon'"
            @changed="
              event => {
                handleMapEvent(event, 'Polygon');
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
            :disabled="Boolean(!currentDraw) || currentDraw !== 'Circle'"
            :selected="Boolean(currentDraw) && currentDraw === 'Circle'"
            @changed="
              event => {
                handleMapEvent(event, 'Circle');
              }
            "
            @click="() => enableDraw('Circle')"
          />
          <MapButton
            v-if="currentPolygon"
            button-class="border bg-white"
            icon="map-buffer"
            :actions="[
              { id: 'buffer', text: 'Add' },
              { id: 'cancel', text: 'Cancel' },
            ]"
            :disabled="Boolean(!currentDraw) || currentDraw !== 'Buffer'"
            :selected="Boolean(currentDraw) && currentDraw === 'Buffer'"
            @changed="
              event => {
                handleMapEvent(event, 'Buffer');
              }
            "
            @click="enableBuffer"
          />
        </div>
        <base-button
          class="bg-white p-1 border ml-5 flex items-center justify-center px-2 text-crisiscleanup-lightblue-900"
          style="height: 37px"
          :text="$t('+ Upload Layer')"
        />
        <div
          class="bg-white p-1 border ml-5 flex items-center justify-center"
          style="height: 37px"
        >
          <base-checkbox :disabled="worksitesLoading" @input="toggleWorksites">
            {{ $t('~~Show Cases') }}
          </base-checkbox>
        </div>
      </div>
      <div id="map" class="h-full"></div>
    </div>
    <div
      v-show="showingPopup"
      ref="popup"
      class="popup-content flex flex-col items-center justify-center w-40"
    >
      <div
        v-if="currentDraw === 'Buffer'"
        class="flex flex-col items-center justify-center"
      >
        {{ $t('~~Add or Exclude Distance') }}
        <div class="my-1 border">
          <base-input
            v-model="currentBufferDistance"
            input-style="width: 100%; height: 30px; border: 0"
          >
            <div class="pr-2">{{ $t('~~Miles') }}</div>
          </base-input>
        </div>
        <base-button
          text="Save"
          type="primary"
          class="flex-grow px-3 py-1 my-1"
          :action="enableBuffer"
        />
      </div>
      <div v-else>
        {{ bufferedLayer && bufferedLayer.name }}
        <div class="flex text-primary-dark">
          <base-button
            text="Add"
            :action="
              () => {
                handleMapEvent('add', 'Location');
              }
            "
            type="bare"
            class="text-xs p-1"
          />
          <base-button
            text="Exclude"
            :action="
              () => {
                handleMapEvent('exclude', 'Location');
              }
            "
            type="bare"
            class="text-xs p-1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import * as circleToPolygon from 'circle-to-polygon';
import * as turf from '@turf/turf';
import { mapState } from 'vuex';
import vueUndoRedo from 'vue-undo-redo-stack';
import Location from '@/models/Location';
import MapButton from './MapButton';
import LocationType from '@/models/LocationType';
import User from '@/models/User';
import { getWorksiteLayer } from '@/utils/map';

export default {
  name: 'LayerTool',
  components: { MapButton },
  mixins: [vueUndoRedo],
  props: {
    locations: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      currentPolygon: null,
      locationSearch: '',
      currentDraw: null,
      bufferedLayer: null,
      worksiteLayer: null,
      showingPopup: false,
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
      currentBufferDistance: -31,
      markers: [],
      worksitesLoading: false,
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    checkpointData() {
      return {
        currentPolygon: this.currentPolygon && this.currentPolygon.toGeoJSON(),
      };
    },
    ...mapState('incident', ['currentIncidentId']),
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

    map.fitBounds([
      [47.47266286861342, -116.76269531250001],
      [34.542762387234845, -84.94628906250001],
    ]);

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
      const { layer } = e;
      let newLayer = L.geoJSON(layer.toGeoJSON());

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
        newLayer = L.geoJSON(geojsonFeature);
      }

      [this.bufferedLayer] = newLayer.getLayers();
    });

    this.map = map;

    if (this.locations && this.locations.length) {
      const locationPromises = [];
      this.locations.forEach(location => {
        locationPromises.push(this.onLocationLoaded(location));
      });
      await Promise.all(locationPromises);
    }
    await LocationType.api().get('/location_types', {
      dataKey: 'results',
    });

    this.getWorksites();
  },
  methods: {
    restoreCheckpoint(checkpointData) {
      this.map.eachLayer(layer => {
        if (layer instanceof L.TileLayer || layer === this.worksiteLayer) {
          return;
        }
        this.map.removeLayer(layer);
      });

      this.currentPolygon = checkpointData.currentPolygon;

      if (this.currentPolygon) {
        const newLayer = L.geoJSON(this.currentPolygon, this.completedOptions);
        [this.currentPolygon] = newLayer.getLayers();
        this.currentPolygon.addTo(this.map);
      }

      // this.bufferedLayer = checkpointData.bufferedLayer;
      // if (this.bufferedLayer) {
      //   const newLayer = L.geoJSON(this.bufferedLayer, this.bufferedOptions);
      //   [this.bufferedLayer] = newLayer.getLayers();
      //   this.bufferedLayer.addTo(this.map);
      // }
    },
    toggleWorksites(val) {
      if (val) {
        this.worksiteLayer.addTo(this.map);
        this.$nextTick(() => {
          this.map.panBy([1, 0]);
        });
      } else {
        this.map.removeLayer(this.worksiteLayer);
      }
    },
    async getWorksites() {
      this.worksitesLoading = true;
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites_all`,
        {
          params: {
            incident: this.currentIncidentId,
          },
        },
      );
      this.markers = response.data.results;
      this.worksiteLayer = getWorksiteLayer(
        this.markers,
        this.map,
        this,
        false,
      );
      this.worksitesLoading = false;
    },
    applyCurrentLayer() {
      this.map.eachLayer(layer => {
        if (layer instanceof L.TileLayer || layer === this.worksiteLayer) {
          return;
        }
        this.map.removeLayer(layer);
      });
      if (this.currentPolygon) {
        this.map.addLayer(this.currentPolygon);
      }
      this.checkpoint();
    },
    enableBuffer() {
      this.drawBuffer();
      this.showPopup();
    },
    drawBuffer() {
      this.applyCurrentLayer();
      this.currentDraw = 'Buffer';
      const [currentPolygonLayer] = this.currentPolygon.getLayers();
      const currentPolygon = currentPolygonLayer.toGeoJSON();
      const newPoly = turf.buffer(currentPolygon, this.currentBufferDistance, {
        units: 'miles',
      });
      [this.bufferedLayer] = L.geoJson(
        newPoly,
        this.bufferedOptions,
      ).getLayers();
      this.bufferedLayer.addTo(this.map);
    },
    handleMapEvent(event, type) {
      if (event === 'cancel') {
        this.map.pm.disableDraw(type);
        this.currentDraw = null;
        this.applyCurrentLayer();
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
        this.applyCurrentLayer();
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
        this.applyCurrentLayer();
      }

      if (event === 'buffer') {
        this.map.pm.disableDraw(type);
        this.currentDraw = null;
        if (!this.bufferedLayer) return;
        this.currentPolygon = L.geoJSON(
          this.bufferedLayer.toGeoJSON(),
          this.completedOptions,
        );
        this.applyCurrentLayer();
      }
    },
    enableDraw(type) {
      this.map.pm.disableDraw(type);
      this.currentDraw = null;
      this.applyCurrentLayer();

      const options = {
        snappable: false,
        templineStyle: this.bufferedOptions,

        hintlineStyle: this.bufferedOptions,
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
    showPopup() {
      const popup = L.popup({
        maxWidth: 'auto',
      });
      this.showingPopup = true;
      popup
        .setLatLng(this.bufferedLayer.getCenter())
        .setContent(this.$refs.popup)
        .openOn(this.map);
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
      this.bufferedLayer.name = location.name;
      this.bufferedLayer.addTo(this.map);
      this.showPopup();
    },

    async onLocationLoaded(locationId) {
      await Location.api().fetchById(locationId);
      const location = Location.find(locationId);
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
