<template>
  <div id="map" ref="map" />
</template>

<script>
import * as L from 'leaflet';
import { nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { mapTileLayer } from '@/utils/map';

export default {
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
    const map = ref(null);
    const markerLayer = ref(L.layerGroup());
    const { t } = useI18n();

    function createTileLayer() {
      return L.tileLayer(mapTileLayer, {
        minZoom: 15,
        maxZoom: 15,
      });
    }
    function addMarkerToMap() {
      const markerLocation = props.location;

      markerLayer.value.clearLayers();
      const marker = new L.marker(
        [markerLocation.coordinates[1], markerLocation.coordinates[0]],
        { draggable: 'true' },
      ).addTo(markerLayer.value);
      marker.on('dragend', (event) => {
        emit('updatedLocation', event.target.getLatLng());
      });
      map.value.setView(
        [markerLocation.coordinates[1], markerLocation.coordinates[0]],
        15,
      );
      marker
        .bindTooltip(t('casesVue.drag_pin_to_correct_location'), {
          direction: 'top',
        })
        .openTooltip();
    }

    onMounted(() => {
      nextTick(async () => {
        map.value = L.map('map', {
          zoomControl: false,
        }).setView([35.746_512_259_918_5, -96.411_509_631_256_56], 3);
        if (props.useGoogleMaps) {
          // L.gridLayer.googleMutant({ type: 'roadmap' }).addTo(this.map); TODO: Fix google maps view
          createTileLayer().addTo(map.value);
        } else {
          createTileLayer().addTo(map.value);
        }
        markerLayer.value.addTo(map.value);
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
};
</script>

<style scoped></style>
