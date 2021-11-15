<template>
  <div id="map" ref="map" />
</template>

<script>
import * as L from 'leaflet';
import { mapTileLayer } from '@/utils/map';

export default {
  name: 'LocationViewer',
  data() {
    return {
      map: null,
      markerLayer: L.layerGroup(),
    };
  },
  props: {
    location: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  methods: {
    createTileLayer() {
      return L.tileLayer(mapTileLayer, {
        // tileSize: 512,
        // zoomOffset: -1,
        minZoom: 15,
        maxZoom: 15,
      });
    },
    addMarkerToMap() {
      const markerLocation = this.location;

      this.markerLayer.clearLayers();
      const marker = new L.marker(
        [markerLocation.coordinates[1], markerLocation.coordinates[0]],
        { draggable: 'true' },
      ).addTo(this.markerLayer);
      marker.on('dragend', (event) => {
        this.$emit('updatedLocation', event.target.getLatLng());
      });
      this.map.setView(
        [markerLocation.coordinates[1], markerLocation.coordinates[0]],
        15,
      );
      marker
        .bindTooltip(this.$t('casesVue.drag_pin_to_correct_location'), {
          direction: 'top',
        })
        .openTooltip();
    },
  },
  mounted() {
    this.$nextTick(async () => {
      this.map = L.map('map', {
        zoomControl: false,
      }).setView([35.7465122599185, -96.41150963125656], 3);
      this.createTileLayer().addTo(this.map);
      this.markerLayer.addTo(this.map);
      this.addMarkerToMap();
    });
  },
};
</script>

<style scoped></style>
