<template>
  <div id="map" ref="map" />
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api';
import * as L from 'leaflet';
import { mapTileLayer } from '@/utils/map';

export default defineComponent({
  name: 'LocationViewer',
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
  setup(props, emit) {
    const map = ref(null);
    const markerLayer = L.layerGroup();
    const createTileLayer = () => {
      return L.tileLayer(mapTileLayer, {
        // tileSize: 512,
        // zoomOffset: -1,
        minZoom: 15,
        maxZoom: 15,
      });
    };
    const addMarkerToMap = () => {
      const markerLocation = props.location;

      markerLayer.clearLayers();
      const marker = new L.marker(
        [markerLocation.coordinates[1], markerLocation.coordinates[0]],
        { draggable: 'true' },
      ).addTo(markerLayer);
      marker.on('dragend', (event) => {
        emit('updatedLocation', event.target.getLatLng());
      });
      map.value.setView(
        [markerLocation.coordinates[1], markerLocation.coordinates[0]],
        15,
      );
      marker
        .bindTooltip(this.$t('casesVue.drag_pin_to_correct_location'), {
          direction: 'top',
        })
        .openTooltip();
    };
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
