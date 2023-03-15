<template>
  <div id="map" ref="map" />
</template>

<script lang="ts">
import * as L from 'leaflet';
import { nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { mapTileLayer } from '@/utils/map';
import '@/external/Leaflet.GoogleMutant/index';
import { templates } from '@/icons/icons_templates';
import type { LeafletEvent } from 'leaflet';

export default defineComponent({
  name: 'LocationViewer',
  props: {
    location: {
      type: Object,
      default: () => {
        return {};
      },
    },
    useGoogleMaps: {
      type: Boolean,
    },
  },
  emits: ['updatedLocation'],
  setup(props, { emit }) {
    const map = ref<L.Map | null>(null);
    const markerLayer = ref(L.layerGroup());
    const { t } = useI18n();

    function createTileLayer() {
      return L.tileLayer(mapTileLayer, {
        minZoom: 15,
        maxZoom: 15,
      });
    }
    function addMarkerToMap() {
      const svgIcon = L.divIcon({
        className: 'crisiscleanup-map-marker',
        html: templates.map_marker,
        iconAnchor: [20, 40],
        iconSize: [50, 50],
      });

      const markerLocation = props.location;

      markerLayer.value.clearLayers();
      const marker = new (L.marker as any)(
        [markerLocation.coordinates[1], markerLocation.coordinates[0]],
        { draggable: 'true', icon: svgIcon },
      );
      marker.addTo(markerLayer.value);
      marker.on('dragend', (event: LeafletEvent) => {
        emit('updatedLocation', event.target.getLatLng());
      });
      map.value?.setView(
        [markerLocation.coordinates[1], markerLocation.coordinates[0]],
        15,
      );
      marker
        .bindTooltip(t('casesVue.drag_pin_to_correct_location'), {
          direction: 'top',
          offset: L.point({ x: 0, y: -40 }),
        })
        .openTooltip();
    }

    onMounted(() => {
      nextTick(async () => {
        map.value = L.map('map', {
          zoomControl: false,
        }).setView([35.746_512_259_918_5, -96.411_509_631_256_56], 3);
        if (props.useGoogleMaps) {
          L.gridLayer
            .googleMutant({ type: 'roadmap' })
            .addTo(map.value as L.Map);
        } else {
          createTileLayer().addTo(map.value as L.Map);
        }
        markerLayer.value.addTo(map.value as L.Map);
        addMarkerToMap();
      });
    });

    return {
      map,
      markerLayer,
      createTileLayer,
      addMarkerToMap,
    };
  },
});
</script>

<style scoped></style>
