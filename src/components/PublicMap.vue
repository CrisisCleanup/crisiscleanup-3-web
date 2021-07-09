<template>
  <div class="relative w-full h-full">
    <div
      v-if="incident"
      id="map"
      ref="map"
      data-cy="worksitemap-map"
      class="absolute top-0 left-0 right-0 bottom-0"
    ></div>
    <div
      v-if="!mapLoading && !hideLegend"
      style="z-index: 1001"
      class="legend absolute right-0 bottom-0 w-64 bg-white border-2 p-1"
    >
      <div class="text-base font-bold my-1">{{ $t('Legend') }}</div>
      <div class="flex flex-wrap justify-between">
        <div
          v-for="entry in displayedWorkTypeSvgs"
          :key="entry.key"
          class="flex items-center w-1/2 mb-1"
        >
          <div class="map-svg-container" v-html="entry.svg"></div>
          <span class="text-bodyxsm ml-1">{{ workTypes[entry.key] }}</span>
        </div>
      </div>
      <div class="text-base font-bold my-1">
        {{ $t('worksiteMap.case_status') }}
      </div>
      <div class="flex flex-wrap">
        <div
          v-for="(value, key) in legendColors"
          :key="key"
          class="flex items-start w-1/2 mb-1"
        >
          <span class="w-4 mt-1">
            <badge class="mx-1" :color="value" />
          </span>
          <div class="text-bodyxsm ml-1">{{ key }}</div>
        </div>
        <div class="flex items-center w-1/2 mb-1">
          <span class="w-5 h-5" v-html="templates.plus" />
          <div class="text-xs ml-1">
            {{ $t('worksiteMap.multiple_work_types') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as L from 'leaflet';
import { Loader } from 'pixi.js';
import { colors, templates } from '@/icons/icons_templates';
import { getWorksiteLayer, mapAttribution, mapTileLayer } from '../utils/map';

export default {
  name: 'PublicMap',
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
    hideLegend: {
      type: Boolean,
    },
  },
  data() {
    return {
      displayedWorkTypes: {},
      displayedWorkTypeSvgs: [],
      timeout: null,
      legendColors: {
        [this.$t('worksiteMap.unclaimed')]:
          colors.open_unassigned_unclaimed.fillColor,
        [this.$t('worksiteMap.claimed_not_started')]:
          colors.open_unassigned_claimed.fillColor,
        [this.$t('worksiteMap.in_progress')]:
          colors.open_assigned_claimed.fillColor,
        [this.$t('worksiteMap.partially_completed')]:
          colors['open_partially-completed_claimed'].fillColor,
        [this.$t('worksiteMap.needs_follow_up')]:
          colors['open_needs-follow-up_claimed'].fillColor,
        [this.$t('worksiteMap.completed')]:
          colors.closed_completed_claimed.fillColor,
        [this.$t('worksiteMap.done_by_others_no_help_wanted')]:
          colors['closed_done-by-others_unclaimed'].fillColor,
        [this.$t('worksiteMap.out_of_scope_duplicate_unresponsive')]:
          colors.open_unresponsive_unclaimed.fillColor,
      },
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
    locations() {
      this.loadMap();
    },
    displayedWorkTypes: {
      handler(val) {
        this.displayedWorkTypeSvgs = Object.keys(val).map((workType) => {
          const template = templates[workType] || templates.unknown;
          const svg = template
            .replace('{{fillColor}}', 'black')
            .replace('{{strokeColor}}', 'black')
            .replace('{{multiple}}', '');
          return {
            svg,
            key: workType,
          };
        });
      },
      deep: true,
    },
  },
  async mounted() {
    await this.loadMap();
  },
  methods: {
    applyLocation(location, value) {
      if (value && this.map) {
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        const polygon = L.geoJSON(geojsonFeature, {
          weight: '1',
          onEachFeature(feature, layer) {
            layer.location_id = location.id;
          },
        });
        polygon.addTo(this.map);
        this.map.fitBounds(polygon.getBounds());
      } else {
        this.map.eachLayer((layer) => {
          if (layer.location_id && layer.location_id === location.id) {
            this.map.removeLayer(layer);
          }
        });
      }
    },
    async loadMap() {
      this.mapLoading = true;

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites_public`,
        {
          params: { incident: this.incident },
        },
      );

      this.markers = response.data.results;
      await this.renderMap(response.data.results);

      this.$nextTick(() => {
        // Add this slight pan to re-render map
        this.map.panBy([1, 0]);
      });

      this.locations.forEach((location) => {
        this.applyLocation(location, true);
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

          L.tileLayer(mapTileLayer, {
            // tileSize: 512,
            // zoomOffset: -1,
            attribution: mapAttribution,
            detectRetina: false,
            maxZoom: 18,
            noWrap: false,
          }).addTo(map);
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
