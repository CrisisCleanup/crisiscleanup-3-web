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
        return {};
      },
    },
  },
  data() {
    return {
      selected: {},
      tileLayer: L.tileLayer(
        'https://api.pitneybowes.com/location-intelligence/geomap/v1/tile/osm/{z}/{x}/{y}.png?api_key={api_key}',
        {
          api_key: process.env.VUE_APP_PITNEYBOWES_API_KEY,
          maxZoom: 18,
          attribution:
            '<a class="leaflet-attribution" target="_blank" href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>',
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
          reject(new Error({{ $t('overlayMap.no_geolocation') }}));
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
