<template>
  <div class="p-2" style="display: grid; grid-template-rows: auto 1fr">
    <div class="h-16 flex items-center w-full p-6" style="z-index: 10000">
      <base-select
        class="flex-1"
        :placeholder="$t('locationTool.search_several_area_types')"
        searchable
        item-key="id"
        label="name"
        :options="onLocationSearch"
        @update:modelValue="
          (value: string) => {
            onLocationSelected(value);
          }
        "
      >
        <template #option="{ option }">
          <div class="flex justify-between text-sm p-2 cursor-pointer w-full">
            <span class="mr-1">{{ option.name }}</span>
            <span class="text-crisiscleanup-grey-700">{{
              option.location_type && option.location_type.name_t
            }}</span>
          </div>
        </template>
      </base-select>

      <base-select
        :model-value="currentLocationType"
        :options="locationTypes"
        item-key="id"
        label="name_t"
        class="ml-3 flex-1"
        searchable
        :placeholder="$t('locationVue.location_type')"
        @update:modelValue="
          (type: string) => {
            currentLocationType = type;
          }
        "
      />
    </div>
    <div class="layers-tool flex-grow relative map-item">
      <div
        ref="buttons"
        class="absolute w-full h-8 ml-4 mt-4 flex"
        style="z-index: 1001"
      >
        <div class="flex mr-4">
          <MapButton
            button-class="border bg-white"
            icon="map-undo"
            :disabled="history.length === 0"
            :title="$t('actions.undo')"
            ccu-event="user_ui-draw-undo"
            @click="
              () => {
                undo();
                applyCurrentLayer();
              }
            "
          />
          <MapButton
            button-class="border bg-white"
            icon="map-redo"
            :disabled="history.length === 0"
            :title="$t('actions.redo')"
            @click="
              () => {
                redo();
                applyCurrentLayer();
              }
            "
          />
        </div>
        <div class="flex">
          <MapButton
            button-class="border bg-white"
            icon="map-rect"
            :title="$t('locationTool.draw_rectangle')"
            :actions="[{ id: 'cancel', text: $t('actions.cancel') }]"
            :disabled="Boolean(!currentDraw) || currentDraw !== 'Rectangle'"
            :selected="Boolean(currentDraw) && currentDraw === 'Rectangle'"
            @changed="
              (event: string) => {
                handleMapEvent(event, 'Rectangle');
              }
            "
            @click="() => enableDraw('Rectangle')"
          />
          <MapButton
            button-class="border bg-white"
            :title="$t('locationTool.draw_polygon')"
            icon="map-poly"
            :actions="[{ id: 'cancel', text: $t('actions.cancel') }]"
            :disabled="Boolean(!currentDraw) || currentDraw !== 'Polygon'"
            :selected="Boolean(currentDraw) && currentDraw === 'Polygon'"
            @changed="
              (event: string) => {
                handleMapEvent(event, 'Polygon');
              }
            "
            @click="() => enableDraw('Polygon')"
          />
          <MapButton
            button-class="border bg-white"
            :title="$t('locationTool.draw_circle')"
            icon="map-circle"
            :actions="[{ id: 'cancel', text: $t('actions.cancel') }]"
            :disabled="Boolean(!currentDraw) || currentDraw !== 'Circle'"
            :selected="Boolean(currentDraw) && currentDraw === 'Circle'"
            @changed="
              (event: string) => {
                handleMapEvent(event, 'Circle');
              }
            "
            @click="() => enableDraw('Circle')"
          />
          <MapButton
            v-if="currentPolygon"
            button-class="border bg-white"
            :title="$t('locationTool.grow_shrink')"
            icon="map-buffer"
            :disabled="Boolean(!currentDraw) || currentDraw !== 'Buffer'"
            :selected="Boolean(currentDraw) && currentDraw === 'Buffer'"
            @click="enableBuffer"
          />
          <MapButton
            button-class="border bg-white"
            icon="map-sweep"
            :title="$t('locationTool.clear_drawing')"
            @click="clearAll"
          />
        </div>
        <base-button
          class="bg-white p-1 border ml-5 flex items-center justify-center px-2"
          style="height: 37px"
          :text="$t('locationTool.upload_layer_plus')"
          :action="
            () => {
              showingUploadModal = true;
            }
          "
        />
        <modal
          v-if="showingUploadModal"
          modal-classes="bg-white w-3/4 shadow"
          :title="$t('locationTool.upload_layer')"
          @cancel="showingUploadModal = false"
        >
          <div class="flex items-center justify-center w-full">
            <LayerUploadTool
              :key="currentLayerUpload"
              class="flex w-full justify-center items-center"
              @addedLayer="
                (layer) => {
                  currentLayerUpload = layer;
                }
              "
            />
          </div>
          <div v-if="currentLayerUpload" class="text-center">
            {{ $t('Selected Location:') }} {{ currentLayerUpload[0].name }}
          </div>
          <div slot="footer" class="p-3 flex items-center justify-center">
            <base-button
              :action="
                () => {
                  showingUploadModal = false;
                }
              "
              :text="$t('actions.cancel')"
              variant="outline"
              class="ml-2 p-3 px-6 text-xs"
            />
            <base-button
              variant="solid"
              :action="applyCurrentLayerUpload"
              :text="$t('actions.apply')"
              class="ml-2 p-3 px-6 text-xs"
            />
          </div>
        </modal>
        <div
          v-if="incident || organization"
          class="bg-white p-1 border ml-5 flex items-center justify-center"
          style="height: 37px"
        >
          <base-checkbox
            :disabled="worksitesLoading"
            @update:modelValue="toggleWorksites"
          >
            {{ $t('locationTool.show_cases') }}
          </base-checkbox>
        </div>
        <div
          v-if="organization"
          class="bg-white p-1 border ml-5 flex items-center justify-center"
          style="height: 37px"
        >
          <base-checkbox @update:modelValue="toggleIncidents">
            {{ $t('locationTool.show_incidents') }}
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
        {{ $t('locationTool.expand_or_contract') }}
        <div class="my-1 flex flex-col items-center">
          <input
            v-model="currentBufferDistance"
            type="range"
            min="-100"
            max="100"
            step="1"
          />
          <div class="pr-2 flex items-center justify-center gap-2">
            <base-input
              v-model="currentBufferDistance"
              width="50"
              height="25"
            />
            {{ $t('locationTool.miles') }}
          </div>
        </div>
        <base-button
          :text="$t('actions.save')"
          variant="solid"
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
            :text="$t('actions.add')"
            ccu-event="user_ui-draw-add"
            :action="
              () => {
                handleMapEvent('add', 'Location');
              }
            "
            type="bare"
            class="text-xs p-1"
          />
          <base-button
            :text="$t('actions.subtract')"
            ccu-event="user_ui-draw-subtract"
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

<script lang="ts">
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import * as turf from '@turf/turf';
import { useStore } from 'vuex';
import _ from 'lodash';
import { useRefHistory } from '@vueuse/core';
import type { PropType } from 'vue';
import {
  reactive,
  toRefs,
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
} from 'vue';
import axios from 'axios';
import type { GeoJsonObject } from 'geojson';
import type { LatLng } from 'leaflet';
import LayerUploadTool from './LayerUploadTool.vue';
import MapButton from './MapButton.vue';
import { getQueryString } from '@/utils/urls';
import Location from '@/models/Location';
import Organization from '@/models/Organization';
import LocationType from '@/models/LocationType';
import type { MapUtils } from '@/hooks/worksite/useWorksiteMap';
import useWorksiteMap from '@/hooks/worksite/useWorksiteMap';
import useCurrentUser from '@/hooks/useCurrentUser';
import useLogEvent from '@/hooks/useLogEvent';
import BaseInput from '@/components/BaseInput.vue';
import type Incident from '@/models/Incident';
import type { PixiLayer } from '@/utils/types/map';

export default defineComponent({
  name: 'LocationTool',
  components: { BaseInput, LayerUploadTool, MapButton },
  props: {
    locations: {
      type: Array as PropType<string[]>,
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
  emits: ['changed'],
  setup(props, { emit }) {
    const { currentUser } = useCurrentUser();
    const store = useStore();

    const currentPolygon = ref<L.GeoJSON | null>(null);
    let mapUtils: MapUtils;
    const popup = ref(null);
    const buttons = ref(null);
    const state = reactive({
      currentLayerUpload: null as any,
      showingUploadModal: false,
      locationSearch: '',
      currentDraw: null as string | null,
      bufferedLayer: null as any,
      worksiteLayer: null,
      incidentLayer: new L.LayerGroup() as L.LayerGroup,
      workingLayer: null as L.Layer | null,
      showingPopup: false,
      locationResults: [],
      completedOptions: {
        color: 'orange',
        fillColor: 'orange',
        weight: '2',
      } as L.GeoJSONOptions,
      bufferedOptions: {
        color: 'orange',
        fillColor: 'orange',
        dashArray: [5, 5],
        weight: '1',
      } as L.GeoJSONOptions,
      incidentOptions: {
        dashArray: [5, 5],
        weight: '1',
      } as L.GeoJSONOptions,
      map: null as L.Map | null,
      currentLocationType: null as string | null,
      currentBufferDistance: 0,
      markers: [],
      worksitesLoading: false,
    });

    const stateRefs = toRefs(state);

    const { history, undo, redo } = useRefHistory(currentPolygon, {
      dump: (poly: L.GeoJSON) => {
        if (poly) {
          const [currentPolygonLayer] = poly.getLayers() as L.LayerGroup[];
          return currentPolygonLayer.toGeoJSON();
        }
        return null;
      },
      parse: (geojson: GeoJsonObject) => {
        return L.geoJson(
          geojson,
          stateRefs.completedOptions.value as L.GeoJSONOptions,
        );
      },
    } as any);
    const locationTypes = computed(() => store.getters['enums/locationTypes']);
    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );

    function clearAll() {
      currentPolygon.value = null;
      applyCurrentLayer();
      stateRefs.map?.value?.pm.disableDraw();
      stateRefs.currentDraw.value = null;
    }
    function reset() {
      clearAll();
      toggleWorksites(false);
      toggleIncidents(false);
    }
    function toggleWorksites(value: boolean) {
      if (value) {
        mapUtils.showMarkers();
      } else {
        mapUtils.hideMarkers();
      }
    }
    function toggleIncidents(value: boolean) {
      if (value) {
        stateRefs.incidentLayer.value.addTo(mapUtils.getMap());
        nextTick(() => {
          stateRefs.map?.value?.panBy([1, 0]);
        });
      } else if (stateRefs.incidentLayer.value) {
        mapUtils
          .getMap()
          .removeLayer(stateRefs.incidentLayer.value as L.LayerGroup);
      }
    }
    async function getIncidentLocations(incidents: Incident[]) {
      stateRefs.incidentLayer.value = new L.LayerGroup();
      const incidentLocations = [];
      for (const incident of incidents) {
        for (const item of incident.locations) {
          incidentLocations.push(item.location);
        }
      }
      if (incidentLocations.length > 0) {
        const results = await Location.api().get(
          `/locations?id__in=${incidentLocations.join(',')}`,
          {
            dataKey: 'results',
          },
        );
        const { locations } = results.entities as { locations: Location[] };
        for (const location of locations) {
          const geojsonFeature = {
            type: 'Feature',
            properties: location.attr,
            geometry: location.poly || location.geom || location.point,
          } as GeoJsonObject;
          const geojsonLayer = L.geoJSON(
            geojsonFeature,
            stateRefs.incidentOptions.value as any,
          );
          const [layer] = geojsonLayer.getLayers() as any;
          layer.type = 'Incident';
          layer.addTo(stateRefs.incidentLayer.value as L.LayerGroup);
        }
      }
    }
    async function getWorksites({
      organization,
      incident,
    }: {
      organization: number | null;
      incident: number | null;
    }) {
      stateRefs.worksitesLoading.value = true;
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/worksites_all`,
        {
          params: {
            incident,
            work_type__claimed_by: organization,
          },
        },
      );
      mapUtils?.reloadMap(
        response.data.results,
        response.data.results.map((m: any) => m.id),
      );
      mapUtils.hideMarkers();
      stateRefs.worksitesLoading.value = false;
    }
    function applyCurrentLayer(closePopup = true) {
      stateRefs.map?.value?.eachLayer((layer) => {
        if (layer instanceof L.Popup && !closePopup) {
          return;
        }

        if (
          layer instanceof L.TileLayer ||
          layer instanceof L.SVG ||
          (layer as L.Layer & PixiLayer).key === 'marker_layer' ||
          layer === (stateRefs.incidentLayer.value as L.LayerGroup) ||
          stateRefs.incidentLayer.value.hasLayer(layer)
        ) {
          return;
        }
        stateRefs.map?.value?.removeLayer(layer);
      });
      if (currentPolygon.value) {
        stateRefs.map?.value?.addLayer(currentPolygon.value as any);
        emit('changed', currentPolygon.value);
      }
    }
    function applyCurrentLayerUpload() {
      stateRefs.showingUploadModal.value = false;
      if (stateRefs.currentLayerUpload.value) {
        onLocationSelected(stateRefs.currentLayerUpload.value[0].id, true);
      }
    }
    function enableBuffer() {
      drawBuffer();
      showPopup(null);
    }
    function drawBuffer() {
      if (stateRefs.bufferedLayer.value) {
        stateRefs.bufferedLayer.value.removeFrom(stateRefs.map?.value as L.Map);
      }
      stateRefs.currentDraw.value = 'Buffer';
      if (currentPolygon.value) {
        const [currentPolygonLayer] =
          currentPolygon.value.getLayers() as L.LayerGroup[];
        const currentPolygonGeoJSON = currentPolygonLayer.toGeoJSON();
        const newPoly = turf.buffer(
          currentPolygonGeoJSON as any,
          stateRefs.currentBufferDistance.value,
          {
            units: 'miles',
          },
        );
        [stateRefs.bufferedLayer.value] = L.geoJson(
          newPoly,
          stateRefs.bufferedOptions.value as L.GeoJSONOptions,
        ).getLayers();
        stateRefs.bufferedLayer.value.addTo(stateRefs.map?.value as L.Map);
      }
    }
    function handleMapEvent(event: string, type: string) {
      if (event === 'cancel') {
        stateRefs.map?.value?.pm.disableDraw(type);
        stateRefs.currentDraw.value = null;
        applyCurrentLayer();
      }

      if (event === 'add') {
        stateRefs.map?.value?.pm.disableDraw(type);
        stateRefs.currentDraw.value = null;
        if (!stateRefs.bufferedLayer.value) return;
        if (currentPolygon.value) {
          const layers = currentPolygon.value.getLayers();
          const [currentPolygonLayer] = layers as L.LayerGroup[];
          const currentPolygonLayerGeoJSON = currentPolygonLayer.toGeoJSON();
          const newPolygon = (
            stateRefs.bufferedLayer.value as L.LayerGroup
          ).toGeoJSON();
          const newPoly = turf.union(
            currentPolygonLayerGeoJSON as any,
            newPolygon as any,
          );
          currentPolygon.value = newPoly
            ? L.geoJson(
                newPoly as any,
                stateRefs.completedOptions.value as L.GeoJSONOptions,
              )
            : null;
        } else {
          currentPolygon.value = L.geoJson(
            (stateRefs.bufferedLayer.value as L.LayerGroup).toGeoJSON(),
            stateRefs.completedOptions.value as L.GeoJSONOptions,
          );
        }
        applyCurrentLayer();
      }

      if (event === 'exclude') {
        stateRefs.map?.value?.pm.disableDraw(type);
        stateRefs.currentDraw.value = null;
        if (!stateRefs.bufferedLayer.value) return;
        if (currentPolygon.value) {
          const [currentPolygonLayer] =
            currentPolygon.value.getLayers() as L.LayerGroup[];
          const currentPolygonLayerGeoJSON = currentPolygonLayer.toGeoJSON();
          const newPolygon = (
            stateRefs.bufferedLayer.value as L.LayerGroup
          ).toGeoJSON();
          const newPoly = turf.difference(
            currentPolygonLayerGeoJSON as any,
            newPolygon as any,
          );
          currentPolygon.value = newPoly
            ? L.geoJson(
                newPoly as any,
                stateRefs.completedOptions.value as L.GeoJSONOptions,
              )
            : null;
        }
        applyCurrentLayer();
      }

      if (event === 'buffer') {
        stateRefs.map?.value?.pm.disableDraw(type);
        stateRefs.currentDraw.value = null;
        if (!stateRefs.bufferedLayer.value) return;
        currentPolygon.value = L.geoJSON(
          (stateRefs.bufferedLayer.value as L.LayerGroup).toGeoJSON(),
          stateRefs.completedOptions.value as L.GeoJSONOptions,
        );
        applyCurrentLayer();
      }
    }
    function enableDraw(type: string) {
      stateRefs.map?.value?.pm.disableDraw(type);
      stateRefs.currentDraw.value = null;
      applyCurrentLayer();

      const options = {
        snappable: true,
        templineStyle: stateRefs.bufferedOptions.value,

        hintlineStyle: stateRefs.bufferedOptions.value,
        pathOptions: stateRefs.bufferedOptions.value,
      };

      // enable drawing mode for shape - e.g. Poly, Line, Circle, etc
      // Add this slight pan to re-render map
      stateRefs.currentDraw.value = type;
      setTimeout(() => {
        stateRefs.map?.value?.pm.enableDraw(type, options);
      }, 500);
    }

    function showPopup(center: LatLng | null) {
      const p = L.popup({
        closeOnClick: false,
      });
      stateRefs.showingPopup.value = true;
      p.setLatLng(
        center ||
          (stateRefs.bufferedLayer?.value as any).getBounds().getCenter(),
      )
        .setContent(popup.value || '')
        .openOn(stateRefs.map?.value as L.Map);
      stateRefs.map?.value?.on('popupclose', () => {
        applyCurrentLayer(false);
        stateRefs.map?.value?.pm.disableDraw();
        stateRefs.currentDraw.value = null;
      });
    }
    async function onLocationSelected(selected: string, fit = false) {
      applyCurrentLayer();
      await Location.api().fetchById(selected);
      const location = Location.find(selected);
      const geojsonFeature = {
        type: 'Feature',
        properties: location?.attr,
        geometry: location?.poly || location?.geom || location?.point,
      };
      const geojsonLayer = L.geoJSON(
        geojsonFeature as never,
        stateRefs.bufferedOptions.value as L.GeoJSONOptions,
      );
      [stateRefs.bufferedLayer.value] = geojsonLayer.getLayers();
      (stateRefs.bufferedLayer.value as any).name = location?.name;
      stateRefs.bufferedLayer.value.addTo(stateRefs.map?.value as L.Map);
      if (fit) {
        stateRefs.map?.value?.fitBounds(
          (stateRefs.bufferedLayer.value as any).getBounds(),
        );
      }
      showPopup(null);
    }

    async function onLocationLoaded(locationId: string) {
      await Location.api().fetchById(locationId);
      const location = Location.find(locationId);
      const geojsonFeature = {
        type: 'Feature',
        properties: location?.attr,
        geometry: location?.poly || location?.geom || location?.point,
      };
      currentPolygon.value = L.geoJSON(
        geojsonFeature as never,
        stateRefs.completedOptions.value as L.GeoJSONOptions,
      );
      currentPolygon.value.addTo(stateRefs.map?.value as L.Map);
      stateRefs.map?.value?.fitBounds(currentPolygon.value.getBounds());
    }

    async function onLocationSearch(value: string) {
      const parameters = {
        search: value,
        limit: 10,
        fields: 'id,name,type',
      } as Record<string, any>;
      if (stateRefs.currentLocationType.value) {
        parameters.type = stateRefs.currentLocationType.value;
      }

      const queryString = getQueryString(parameters);
      const results = await Location.api().get(`/locations?${queryString}`, {
        dataKey: 'results',
      });
      return results.entities?.locations;
    }

    watch(currentPolygon.value as object, (newValue) => {
      emit('changed', newValue);
    });

    watch(stateRefs.currentBufferDistance, () => {
      drawBuffer();
    });

    watch(props.incident as any, (newValue: number) => {
      if (newValue) {
        getWorksites({ organization: null, incident: newValue });
      }
      toggleWorksites(false);
    });

    watch(props.organization as any, (newValue: number) => {
      if (newValue) {
        getWorksites({ organization: newValue, incident: null });
      }
      const organization = Organization.find(newValue);
      const incidents = organization?.incident_list;
      getIncidentLocations(incidents || []);
      toggleWorksites(false);
      toggleIncidents(false);
      stateRefs.incidentLayer.value = new L.LayerGroup();
    });

    onMounted(async () => {
      LocationType.api().get('/location_types', {
        dataKey: 'results',
      });
      mapUtils = useWorksiteMap(
        [],
        [],
        () => {
          return undefined;
        },
        () => {
          return undefined;
        },
      );
      const leafletMap = mapUtils.getMap();
      leafletMap.setView([35.746_512_259_918_5, -96.411_509_631_256_56], 5);

      // L.DomEvent.on(buttons.value, 'click', function (ev) {
      //   L.DomEvent.stopPropagation(ev);
      // });

      leafletMap.on('keydown', (e) => {
        if (e.originalEvent.keyCode === 13) {
          const newPoly = turf.lineToPolygon(
            (stateRefs.workingLayer.value as any)?.toGeoJSON(),
          );
          // this.$log.debug(newPoly);
          currentPolygon.value = L.geoJson(
            newPoly,
            stateRefs.completedOptions.value as L.GeoJSONOptions,
          );
          applyCurrentLayer();
          stateRefs.map?.value?.pm.disableDraw();
          stateRefs.currentDraw.value = null;
        }
        if (e.originalEvent.keyCode === 27) {
          applyCurrentLayer(false);
          stateRefs.map?.value?.pm.disableDraw();
          stateRefs.currentDraw.value = null;
        }
      });

      leafletMap.on('pm:drawstart', ({ workingLayer }) => {
        stateRefs.workingLayer.value = workingLayer;
        workingLayer.on('pm:snap', () => {
          const leafletTooltip = document.querySelector(
            '.leaflet-tooltip',
          ) as HTMLDivElement;
          leafletTooltip.style.backgroundColor = '#13E768';
        });

        workingLayer.on('pm:unsnap', () => {
          const leafletTooltip = document.querySelector(
            '.leaflet-tooltip',
          ) as HTMLDivElement;
          leafletTooltip.style.backgroundColor = '';
        });
      });

      leafletMap.on('pm:create', (e) => {
        const { layer } = e as any;
        let newLayer = L.geoJSON(layer.toGeoJSON());

        if (layer instanceof L.Circle) {
          const numberOfEdges = 64;
          // eslint-disable-next-line import/namespace
          const geometry = L.PM.Utils.circleToPolygon(layer, numberOfEdges);
          newLayer = L.geoJSON(geometry.toGeoJSON());
        }

        [stateRefs.bufferedLayer.value] = newLayer.getLayers();
        nextTick(() => {
          showPopup(layer.getBounds().getCenter());
        });
        const { logEvent } = useLogEvent();
        logEvent('user_ui-draw');
      });

      stateRefs.map.value = leafletMap;

      if (props.locations && props.locations.length > 0) {
        const locationPromises = [];
        for (const location of props.locations) {
          locationPromises.push(onLocationLoaded(location));
        }
        await Promise.all(locationPromises);
      }

      if (props.incident) {
        getWorksites({ organization: null, incident: props.incident }).then(
          () => {
            return undefined;
          },
        );
      } else if (props.organization) {
        getWorksites({
          organization: props.organization,
          incident: null,
        }).then(() => {
          return undefined;
        });
        Organization.api()
          .get(`/organizations?id__in=${[props.organization].join(',')}`, {
            dataKey: 'results',
          })
          .then(() => {
            const organization = Organization.find(props.organization);
            const incidents = organization?.incident_list;
            getIncidentLocations(incidents || []).then(() => {
              return undefined;
            });
          });
      }
    });

    return {
      ...stateRefs,
      locationTypes,
      currentIncidentId,
      history,
      undo,
      redo,
      throttle: _.throttle,
      currentUser,
      popup,
      applyCurrentLayerUpload,
      enableBuffer,
      handleMapEvent,
      enableDraw,
      onLocationSearch,
      onLocationSelected,
      applyCurrentLayer,
      currentPolygon,
      toggleWorksites,
      toggleIncidents,
      clearAll,
    };
  },
});
</script>

<style scoped>
.select__container {
  @apply w-full;
}

.map-item {
  position: relative;
  min-height: 400px;
}
@media only screen and (max-width: 1223px) and (orientation: landscape) {
  .map-item {
    min-height: 200px;
  }
}
</style>
