<template>
  <div class="relative w-full h-full">
    <div
      v-if="incident"
      id="map"
      ref="map"
      data-cy="worksitemap-map"
      class="absolute top-0 left-0 right-0 bottom-0"
    ></div>
  </div>
</template>
<script>
  import * as L from 'leaflet';
  import { Loader } from 'pixi.js';
  import { colors, templates } from '@/icons/icons_templates';
  import { getWorksiteLayer } from '../utils/map';

  export default {
    name: 'WorkTypeMap',
    props: {
      incident: {
        type: Number,
        default: 0,
      },
      workTypes: {
        type: Object,
        default: () => {
          return {};
        },
      },
      locations: {
        type: Array,
        default: () => {
          return [];
        },
      },
    },
    data() {
      return {
        displayedWorkTypes: {},
        displayedWorkTypeSvgs: [],
        timeout: null,
        mapLoading: false,
        markerLayer: L.layerGroup(),
        markers: [],
        markerSprites: [],
        incidents: [],
        templates,
        showInteractivePopover: false,
      };
    },
    watch: {
      incident(value) {
        if (value) {
          if (this.map) {
            this.map.eachLayer((layer) => {
              if (layer.location_id) {
                this.map.removeLayer(layer);
              }
            });
            this.map.eachLayer((layer) => {
              if (layer.key === 'worksite_layer') {
                this.map.removeLayer(layer);
              }
            });
          }
        }
      },
    },
    async mounted() {
      await this.loadMap();
    },
    methods: {
      async loadMap() {
        this.mapLoading = true;

        this.markers = workTypes;
        await this.renderMap(workTypes);

        this.$nextTick(() => {
          // Add this slight pan to re-render map
          this.map.panBy([1, 0]);
        });

        this.mapLoading = false;
      },
      async renderMap(markers) {
        await new Promise((resolve) => {
          const loader = new Loader();
          loader.add('circle', '/circle.svg');
          loader.load(() => {
            const container = L.DomUtil.get('map');
            if (container !== null) {
              container._leaflet_id = null;
            }

            if (!this.map) {
              this.map = L.map('map', {
                zoomControl: false,
              }).setView([35.7465122599185, -96.41150963125656], 5);
            }
            const { map } = this;
            this.markerLayer.addTo(this.map);

            L.tileLayer(
              'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
              {
                attribution:
                  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                detectRetina: false,
                maxZoom: 18,
                noWrap: false,
              },
            ).addTo(map);
            map.attributionControl.setPosition('bottomright');
            const worksiteLayer = getWorksiteLayer(markers, map, this);
            worksiteLayer.addTo(map);
            resolve();
          });
        });
      },
    },
  };
</script>

<style>
  @import '~leaflet/dist/leaflet.css';

  .map-svg-container svg {
    width: 15px;
    height: 15px;
  }
</style>
