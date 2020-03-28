<template>
  <div class="overlay-map" style="position: relative;">
    <div ref="map" class="home-map"></div>
  </div>
</template>
<style>
.overlay-map {
  height: 500px;
  width: 100%;
}
</style>

<script>
import * as L from 'leaflet';

export default {
  props: {
    initialLocation: {
      type: Object,
      default: () => {
        return null;
      },
    },
  },
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
      markers: L.layerGroup(),
    };
  },
  async mounted() {
    const options = {
      zoom: 14,
      loadingControl: true,
      preferCanvas: true,
    };
    try {
      if (this.initialLocation) {
        const { coordinates } = this.initialLocation;
        this.markers.clearLayers();
        const latLng = L.latLng(coordinates[1], coordinates[0]);
        options.center = latLng;
        new L.marker(latLng).addTo(this.markers);
      } else {
        const location = await this.getLocation();
        if (location.coords) {
          options.center = L.latLng(
            location.coords.latitude,
            location.coords.longitude,
          );
        }
      }
    } catch (e) {
      this.$log.debug(e);
    }
    this.initMap(options);
  },
  methods: {
    initMap(options) {
      this.map = L.map(this.$refs.map, options);
      this.tileLayer.addTo(this.map);
      this.markers.addTo(this.map);
      this.map.on('click', this.addMarker);
    },
    addMarker(e) {
      this.markers.clearLayers();
      new L.marker(e.latlng).addTo(this.markers);
      this.$emit('addedMarker', e.latlng);
    },
    async getLocation() {
      return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          reject(new Error(this.$t('overlayMap.no_geolocation')));
        }
        navigator.geolocation.getCurrentPosition(
          pos => {
            resolve(pos);
          },
          err => {
            reject(err);
          },
        );
      });
    },
  },
};
</script>

<style>
@import '~leaflet/dist/leaflet.css';

.home-map {
  height: 100%;
}
.leaflet-pane {
  z-index: 5;
}
</style>
