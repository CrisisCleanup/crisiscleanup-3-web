<template>
  <div style="display: grid; grid-template-rows: auto 1fr">
    <div class="h-16 flex items-center">
      <autocomplete
        icon="search"
        :suggestions="locationResults"
        display-property="name"
        size="large"
        placeholder="$t('layerTool.search_several_area_types')"
        class="w-2/5"
        @selected="onLocationSelected"
        @search="onLocationSearch"
      >
        <template #result="slotProps">
          <div
            class="flex justify-between text-sm p-2 cursor-pointer hover:bg-gray-100 border-b"
          >
            <span>{{ slotProps.suggestion.item.name }}</span>
            <span class="text-crisiscleanup-grey-700">{{
              slotProps.suggestion.item.location_type.name_t
            }}</span>
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
            :actions="[{ id: 'cancel', text: $t('actions.cancel') }]"
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
            :actions="[{ id: 'cancel', text: $t('actions.cancel') }]"
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
            :actions="[{ id: 'cancel', text: $t('actions.cancel') }]"
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
            :disabled="Boolean(!currentDraw) || currentDraw !== 'Buffer'"
            :selected="Boolean(currentDraw) && currentDraw === 'Buffer'"
            @click="enableBuffer"
          />
          <MapButton
            button-class="border bg-white"
            icon="map-sweep"
            @click="clearAll"
          />
        </div>
        <base-button
          class="bg-white p-1 border ml-5 flex items-center justify-center px-2 text-crisiscleanup-lightblue-900"
          style="height: 37px"
          :text="$t('layerTool.upload_layer_plus')"
          :action="
            () => {
              showingUploadModal = true;
            }
          "
        />
        <modal
          v-if="showingUploadModal"
          modal-classes="bg-white w-3/4 shadow"
          :title="$t('layerTool.upload_layer')"
          @ok="applyCurrentLayerUpload"
          @cancel="showingUploadModal = false"
        >
          <LayerUploadTool
            @addedLayer="
              layer => {
                currentLayerUpload = layer;
              }
            "
          />
        </modal>
        <div
          v-if="incident || organization"
          class="bg-white p-1 border ml-5 flex items-center justify-center"
          style="height: 37px"
        >
          <base-checkbox :disabled="worksitesLoading" @input="toggleWorksites">
            {{ $t('layerTool.show_cases') }}
          </base-checkbox>
        </div>
        <div
          v-if="organization"
          class="bg-white p-1 border ml-5 flex items-center justify-center"
          style="height: 37px"
        >
          <base-checkbox @input="toggleIncidents">
            {{ $t('layerTool.show_incidents') }}
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
        {{ $t('layerTool.expand_or_contract') }}
        <div class="my-1 flex flex-col items-center">
          <input
            v-model="currentBufferDistance"
            type="range"
            min="-100"
            max="100"
            step="1"
          />
          <div class="pr-2">
            {{ currentBufferDistance }} {{ $t('layerTool.miles') }}
          </div>
        </div>
        <base-button
          text="Save"
          type="primary"
          class="flex-grow px-3 py-1 my-1"
          :action="
            () => {
              handleMapEvent('buffer', 'Buffer');
            }
          "
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
            text="$t('actions.subtract')"
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
import Organization from '@/models/Organization';
import MapButton from './MapButton';
import LocationType from '@/models/LocationType';
import User from '@/models/User';
import { getWorksiteLayer } from '@/utils/map';
import LayerUploadTool from '@/components/LayerUploadTool';

export default {
  name: 'LayerTool',
  components: { LayerUploadTool, MapButton },
  mixins: [vueUndoRedo],
  props: {
    locations: {
      type: Array,
      default: () => {
        return [];
      },
    },
    incident: {
      type: Number,
      default: null,
    },
    organization: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      currentPolygon: null,
      currentLayerUpload: null,
      showingUploadModal: false,
      locationSearch: '',
      currentDraw: null,
      bufferedLayer: null,
      worksiteLayer: null,
      incidentLayer: new L.LayerGroup(),
      workingLayer: null,
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
      incidentOptions: {
        dashArray: [5, 5],
        weight: '1',
      },
      map: null,
      currentBufferDistance: 0,
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
        currentPolygon: this.currentPolygon,
      };
    },
    ...mapState('incident', ['currentIncidentId']),
  },
  watch: {
    currentPolygon(polygon) {
      this.$emit('changed', polygon);
    },
    currentBufferDistance() {
      this.drawBuffer();
    },
    incident(value) {
      if (value) {
        this.getWorksites({ organization: null, incident: value });
      }
      this.toggleWorksites(false);
    },
    organization(value) {
      if (value) {
        this.getWorksites({ organization: value, incident: null });
      }
      const incidents = Organization.find(this.organization).incident_list;
      this.getIncidentLocations(incidents);

      this.toggleWorksites(false);
    },
  },
  async mounted() {
    const map = L.map('map', {
      zoomControl: false,
    }).setView([35.7465122599185, -96.41150963125656], 5);

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

    map.on('keydown', e => {
      if (e.originalEvent.keyCode === 13) {
        const newPoly = turf.lineToPolygon(this.workingLayer.toGeoJSON());
        this.$log.debug(newPoly);
        this.currentPolygon = L.geoJson(newPoly, this.completedOptions);
        this.applyCurrentLayer();
        this.map.pm.disableDraw();
        this.currentDraw = null;
      }
      if (e.originalEvent.keyCode === 27) {
        this.applyCurrentLayer(false);
        this.map.pm.disableDraw();
        this.currentDraw = null;
      }
    });

    map.on('pm:drawstart', ({ workingLayer }) => {
      this.workingLayer = workingLayer;
      workingLayer.on('pm:snap', () => {
        document.querySelector('.leaflet-tooltip').style.backgroundColor =
          '#13E768';
      });

      workingLayer.on('pm:unsnap', () => {
        document.querySelector('.leaflet-tooltip').style.backgroundColor = '';
      });
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
      this.$nextTick(() => {
        this.showPopup(layer.getBounds().getCenter());
      });
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

    if (this.incident) {
      this.getWorksites({ organization: null, incident: this.incident });
    } else if (this.organization) {
      this.getWorksites({ organization: this.organization, incident: null });
      const incidents = Organization.find(this.organization).incident_list;
      this.getIncidentLocations(incidents);
    }
    this.checkpoint();
  },
  methods: {
    clearAll() {
      this.currentPolygon = null;
      this.applyCurrentLayer();
      this.map.pm.disableDraw();
      this.currentDraw = null;
    },
    restoreCheckpoint(checkpointData) {
      this.map.eachLayer(layer => {
        if (
          layer instanceof L.TileLayer ||
          layer instanceof L.SVG ||
          layer === this.worksiteLayer ||
          layer === this.incidentLayer ||
          this.incidentLayer.hasLayer(layer)
        ) {
          return;
        }
        this.map.removeLayer(layer);
      });

      if (checkpointData.currentPolygon) {
        const [currentPolygonLayer] = checkpointData.currentPolygon.getLayers();
        const currentPolygon = currentPolygonLayer.toGeoJSON();
        this.currentPolygon = L.geoJson(currentPolygon, this.completedOptions);
        this.applyCurrentLayer();
      } else {
        this.currentPolygon = null;
      }
    },
    toggleWorksites(val) {
      if (val) {
        this.worksiteLayer.addTo(this.map);
        this.$nextTick(() => {
          this.map.panBy([1, 0]);
        });
      } else if (this.worksiteLayer) {
        this.map.removeLayer(this.worksiteLayer);
      }
    },
    toggleIncidents(val) {
      if (val) {
        this.incidentLayer.addTo(this.map);
        this.$nextTick(() => {
          this.map.panBy([1, 0]);
        });
      } else if (this.incidentLayer) {
        this.map.removeLayer(this.incidentLayer);
      }
    },
    async getIncidentLocations(incidents) {
      // this.incidentLayer = new L.LayerGroup();
      const incidentLocations = [];
      incidents.forEach(incident => {
        incident.locations.forEach(item => {
          incidentLocations.push(item.location);
        });
      });
      const results = await Location.api().get(
        `/locations?id__in=${incidentLocations.join(',')}`,
        {
          dataKey: 'results',
        },
      );
      const { locations } = results.entities;
      locations.forEach(location => {
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        const geojsonLayer = L.geoJSON(geojsonFeature, this.incidentOptions);
        const [layer] = geojsonLayer.getLayers();
        layer.type = 'Incident';
        layer.addTo(this.incidentLayer);
      });
    },
    async getWorksites({ organization, incident }) {
      this.worksitesLoading = true;
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites_all`,
        {
          params: {
            incident,
            work_type__claimed_by: organization,
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
    applyCurrentLayer(closePopup = true) {
      this.map.eachLayer(layer => {
        if (layer instanceof L.Popup && !closePopup) {
          return;
        }

        if (
          layer instanceof L.TileLayer ||
          layer instanceof L.SVG ||
          layer === this.worksiteLayer ||
          layer === this.incidentLayer ||
          this.incidentLayer.hasLayer(layer)
        ) {
          return;
        }
        this.map.removeLayer(layer);
      });
      if (this.currentPolygon) {
        this.map.addLayer(this.currentPolygon);
      }
    },
    applyCurrentLayerUpload() {
      this.showingUploadModal = false;
      this.onLocationSelected({ id: this.currentLayerUpload[0].id }, true);
      // this.checkpoint();
    },
    enableBuffer() {
      this.drawBuffer();
      this.showPopup();
    },
    drawBuffer() {
      if (this.bufferedLayer) {
        this.bufferedLayer.removeFrom(this.map);
      }
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
        this.checkpoint();
        if (this.currentPolygon) {
          const layers = this.currentPolygon.getLayers();
          const [currentPolygonLayer] = layers;
          const currentPolygon = currentPolygonLayer.toGeoJSON();
          const newPolygon = this.bufferedLayer.toGeoJSON();
          const newPoly = turf.union(currentPolygon, newPolygon);
          if (newPoly) {
            this.currentPolygon = L.geoJson(newPoly, this.completedOptions);
          } else {
            this.currentPolygon = null;
          }
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
        this.checkpoint();
        if (this.currentPolygon) {
          const [currentPolygonLayer] = this.currentPolygon.getLayers();
          const currentPolygon = currentPolygonLayer.toGeoJSON();
          const newPolygon = this.bufferedLayer.toGeoJSON();
          const newPoly = turf.difference(currentPolygon, newPolygon);
          if (newPoly) {
            this.currentPolygon = L.geoJson(newPoly, this.completedOptions);
          } else {
            this.currentPolygon = null;
          }
        }
        this.applyCurrentLayer();
      }

      if (event === 'buffer') {
        this.map.pm.disableDraw(type);
        this.currentDraw = null;
        if (!this.bufferedLayer) return;
        this.checkpoint();
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
        snappable: true,
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
    showPopup(center) {
      const popup = L.popup({
        maxWidth: 'auto',
      });
      this.showingPopup = true;
      popup
        .setLatLng(center || this.bufferedLayer.getBounds().getCenter())
        .setContent(this.$refs.popup)
        .openOn(this.map);
      this.map.on('popupclose', () => {
        this.applyCurrentLayer(false);
        this.map.pm.disableDraw();
        this.currentDraw = null;
      });
    },
    async onLocationSelected(selected, fit = false) {
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
      if (fit) {
        this.map.fitBounds(this.bufferedLayer.getBounds());
      }
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
      this.map.fitBounds(this.currentPolygon.getBounds());
    },
  },
};
</script>

<style scoped>
@import '~leaflet/dist/leaflet.css';
@import '~@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
</style>
