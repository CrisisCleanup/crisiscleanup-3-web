<template>
  <div class="relative">
    <div
      id="map"
      ref="map"
      data-cy="worksitemap-map"
      class="absolute top-0 left-0 right-0 bottom-0"
    ></div>
    <div
      v-if="mapLoading"
      data-cy="worksitemap-loader"
      class="
        absolute
        bottom-0
        left-0
        right-0
        top-0
        bg-crisiscleanup-light-grey
        opacity-75
        flex
        items-center
        justify-center
      "
    >
      <spinner />
    </div>
    <div
      class="flex flex-col absolute"
      style="z-index: 1001; top: 10px; left: 10px"
    >
      <div class="zoom-control flex flex-col mb-5">
        <base-button
          text=""
          icon="plus"
          icon-size="xs"
          ccu-event="user_ui-zoom-in"
          :title="$t('worksiteMap.zoom_in')"
          :alt="$t('worksiteMap.zoom_in')"
          :action="
            () => {
              map.zoomIn();
            }
          "
          class="
            w-8
            h-8
            border-crisiscleanup-dark-100 border-t border-l border-r
            bg-white
            shadow-xl
            text-xl text-crisiscleanup-dark-400
          "
        />
        <base-button
          text=""
          icon="minus"
          icon-size="xs"
          ccu-event="user_ui-zoom-out"
          :title="$t('worksiteMap.zoom_out')"
          :alt="$t('worksiteMap.zoom_out')"
          :action="
            () => {
              map.zoomOut();
            }
          "
          class="
            w-8
            h-8
            border border-crisiscleanup-dark-100
            bg-white
            shadow-xl
            text-xl text-crisiscleanup-dark-400
          "
        />
      </div>
      <base-button
        v-tooltip="{
          content: this.$t('worksiteMap.zoom_to_make_interactive'),
          show: showInteractivePopover,
          trigger: 'manual',
          classes: 'interactive-tooltip',
          placement: 'right-start',
        }"
        text=""
        :title="$t('worksiteMap.zoom_to_interactive')"
        :alt="$t('worksiteMap.zoom_to_interactive')"
        ccu-event="user_ui-zoom-details"
        :action="goToInteractive"
        icon="tree"
        icon-size="lg"
        class="
          w-8
          h-8
          border
          my-1
          border-crisiscleanup-dark-100
          bg-white
          shadow-xl
          text-crisiscleanup-dark-400
        "
        @mouseenter.native="enableInteractiveTooltip"
      />
      <base-button
        text=""
        :title="$t('worksiteMap.zoom_to_incident')"
        :alt="$t('worksiteMap.zoom_to_incident')"
        icon="search-minus"
        ccu-event="user_ui-zoom-all"
        icon-size="lg"
        :action="goToIncidentCenter"
        class="
          w-8
          h-8
          border border-crisiscleanup-dark-100
          my-1
          bg-white
          shadow-xl
          text-crisiscleanup-dark-400
        "
      />
    </div>
    <div
      class="flex flex-col absolute"
      style="z-index: 1001; top: 10px; right: 10px"
      v-show="false"
    >
      <div class="zoom-control flex flex-col mb-5">
        <base-button
          text=""
          icon="map"
          icon-size="xs"
          :title="$t('worksiteMap.satellite_map')"
          :alt="$t('worksiteMap.satellite_map')"
          :action="
            () => {
              map.removeLayer(mapTileLayerSatellite);
              map.addLayer(mapTileLayer);
              selectedLayer = mapTileLayer;
            }
          "
          class="
            w-8
            h-8
            border-crisiscleanup-dark-100 border-t border-l border-r
            shadow-xl
            text-xl
          "
          :class="
            selectedLayer === mapTileLayer
              ? 'bg-crisiscleanup-dark-400 text-white'
              : 'bg-white text-crisiscleanup-dark-400'
          "
        />
        <base-button
          text=""
          icon="satellite"
          icon-size="xs"
          :title="$t('worksiteMap.street_map')"
          :alt="$t('worksiteMap.street_map')"
          :action="
            () => {
              map.removeLayer(mapTileLayer);
              map.addLayer(mapTileLayerSatellite);
              selectedLayer = mapTileLayerSatellite;
            }
          "
          class="w-8 h-8 border border-crisiscleanup-dark-100 shadow-xl text-xl"
          :class="
            selectedLayer === mapTileLayerSatellite
              ? 'bg-crisiscleanup-dark-400 text-white'
              : 'bg-white text-crisiscleanup-dark-400'
          "
        />
      </div>
    </div>
    <template v-if="!mapLoading">
      <div
        style="z-index: 1001"
        class="legend absolute left-0 bottom-0 w-72 bg-white border-2 p-2"
        v-if="showingLegend"
      >
        <div class="flex items-center justify-between">
          <div class="text-base font-bold my-1">{{ $t('Legend') }}</div>
          <font-awesome-icon
            icon="minus"
            size="1x"
            class="cursor-pointer"
            :title="$t('worksiteMap.hide_legend')"
            @click="() => toggleLegend(false)"
          ></font-awesome-icon>
        </div>
        <div class="flex flex-wrap justify-between">
          <div
            v-for="entry in displayedWorkTypeSvgs"
            :key="entry.key"
            class="flex items-center w-1/2 mb-1"
          >
            <div class="map-svg-container" v-html="entry.svg"></div>
            <span class="text-xs ml-1">{{ entry.key | getWorkTypeName }}</span>
          </div>
          <div
            v-for="entry in defaultWorkTypeSvgs"
            :key="entry.name"
            class="flex items-center w-1/2 mb-1"
          >
            <div class="map-svg-container" v-html="entry.svg"></div>
            <span class="text-xs ml-1">{{ entry.name }}</span>
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
            <div class="text-xs ml-1">{{ key }}</div>
          </div>
          <div class="flex items-center w-1/2 mb-1">
            <span class="w-5 h-5" v-html="templates.plus" />
            <div class="text-xs ml-1">
              {{ $t('worksiteMap.multiple_work_types') }}
            </div>
          </div>
        </div>
      </div>
      <div
        style="z-index: 1001"
        class="
          legend
          absolute
          left-0
          bottom-0
          w-16
          bg-white
          border-2
          p-2
          h-24
          flex
          justify-center
        "
        v-else
      >
        <font-awesome-icon
          icon="plus"
          size="1x"
          :title="$t('worksiteMap.show_legend')"
          class="cursor-pointer"
          @click="() => toggleLegend(true)"
        ></font-awesome-icon>
      </div>
    </template>
  </div>
</template>

<script>
import { Loader, Texture, settings as PixiSettings } from 'pixi.js';

import * as L from 'leaflet';
import 'leaflet-loading';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet-pixi-overlay';
import 'leaflet.heat';
import {
  averageGeolocation,
  getWorksiteLayer,
  mapAttribution,
  mapTileLayer,
} from '@/utils/map';
import { colors, templates } from '@/icons/icons_templates';
import { groupBy } from '@/utils/array';
import { mapState } from 'vuex';
import Worksite from '@/models/Worksite';
import User from '@/models/User';
import Incident from '@/models/Incident';

PixiSettings.SPRITE_MAX_TEXTURES = Math.min(
  PixiSettings.SPRITE_MAX_TEXTURES,
  16,
);

L.Icon.Default.imagePath = '.';
// OR
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const INTERACTIVE_ZOOM_LEVEL = 12;

export default {
  props: {
    query: {
      type: Object,
      default: () => {
        return {};
      },
    },
    currentFilters: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      displayedWorkTypes: {},
      displayedWorkTypeSvgs: [],
      defaultWorkTypeSvgs: [
        {
          svg: templates.important.replace('{{fillColor}}', 'black'),
          name: this.$t(`worksiteMap.high_priority`),
        },
        {
          svg: templates.favorite.replace('{{fillColor}}', 'black'),
          name: this.$t(`worksiteMap.member_of_my_organization`),
        },
      ],
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
      showingLegend: true,
      markerLayer: L.layerGroup(),
      markers: [],
      markerSprites: [],
      showInteractivePopover: false,
      mapTileLayerSatellite: null,
      mapTileLayer: null,
      selectedLayer: null,
      templates,
    };
  },
  computed: {
    ...mapState('incident', ['currentIncidentId']),
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  watch: {
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
    if (!this.query.incident) {
      return;
    }
    this.mapLoading = true;
    const allCases = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/worksites_all`,
      {
        params: { incident: this.query.incident },
      },
    );

    this.markers = allCases.data.results;
    const response = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/worksites_all`,
      {
        params: { ...this.query },
      },
    );

    const filtered = response.data.results;
    await this.loadMap(
      allCases.data.results,
      new Set(filtered.map((f) => f.id)),
    );

    const sviList = this.markers.map((marker) => {
      return {
        id: marker.id,
        created_at: marker.created_at,
        svi: marker.svi,
      };
    });
    this.$emit('onSviList', sviList);
    this.$nextTick(() => {
      // Add this slight pan to re-render map
      this.map.panBy([1, 0]);
    });
    this.mapLoading = false;
  },
  methods: {
    async loadMap(markers, filtered = [], center = true) {
      await new Promise((resolve) => {
        const loader = new Loader();
        loader.add('circle', '/circle.svg');
        loader.load(() => {
          const container = L.DomUtil.get('map');
          if (container !== null) {
            container._leaflet_id = null;
          }

          if (!this.map) {
            this.map = L.map('map', { zoomControl: false }).setView(
              [31.0, -100.0],
              12,
            );
          }

          if (
            this.currentUser.states &&
            this.currentUser.states.showingLegend !== undefined
          ) {
            this.showingLegend = this.currentUser.states.showingLegend;
          }
          const { map } = this;
          const states = this.currentUser.getStatesForIncident(
            this.currentIncidentId,
            true,
          );
          if (center) {
            this.goToIncidentCenter();
            if (states && states.mapViewPort) {
              const { _northEast, _southWest } = states.mapViewPort;
              this.map.fitBounds([
                [_northEast.lat, _northEast.lng],
                [_southWest.lat, _southWest.lng],
              ]);
            }
          }
          this.markerLayer.addTo(this.map);

          L.tileLayer(mapTileLayer, {
            attribution: mapAttribution,
            detectRetina: false,
            maxZoom: 18,
            noWrap: false,
          }).addTo(map);
          this.selectedLayer = this.mapTileLayer;
          map.attributionControl.setPosition('bottomright');
          const worksiteLayer = getWorksiteLayer(
            markers,
            map,
            this,
            true,
            new Set(filtered),
          );
          worksiteLayer.addTo(map);
          resolve();
        });
      });
    },
    filterSvi(ids) {
      this.pixiContainer.children.forEach((markerSprite) => {
        markerSprite.visible = Boolean(ids.has(markerSprite.id));
      });
      this.$nextTick(() => {
        this.map.panBy([0, 0]);
      });
    },
    async updateMap(worksiteId) {
      const markerSprite = this.pixiContainer.children.find(
        (ms) => parseInt(ms.id) === parseInt(worksiteId),
      );
      await Worksite.api().fetch(worksiteId);
      const worksite = Worksite.find(worksiteId);
      if (!markerSprite) {
        this.markers.push(worksite);
        const filtered = this.pixiContainer.children
          .filter((sprite) => {
            return !sprite.filtered;
          })
          .map((sprite) => {
            return sprite.id;
          });
        filtered.push(worksite.id);
        await this.loadMap(this.markers, filtered, false);
      } else {
        if (worksite.incident !== this.currentIncidentId) {
          this.pixiContainer.removeChild(markerSprite);
          this.$nextTick(() => {
            this.map.panBy([0, 0]);
          });
          return;
        }

        const workType = Worksite.getWorkType(
          worksite.work_types,
          this.currentFilters,
          this.currentUser.organization,
        );

        const colorsKey = `${workType.status}_${
          workType.claimed_by ? 'claimed' : 'unclaimed'
        }`;
        markerSprite.active_work_type = workType;
        markerSprite.work_types = worksite.work_types;
        markerSprite.colorsKey = colorsKey;
        let detailedTemplate =
          templates[workType.work_type] || templates.unknown;
        const flags = worksite.flags || [];
        const isHighPriority = Boolean(
          flags.filter((flag) => flag.is_high_priority).length,
        );
        if (worksite.favorite || worksite.favorite_id) {
          detailedTemplate = templates.favorite;
        } else if (isHighPriority) {
          detailedTemplate = templates.important;
        }
        const worksiteTemplate =
          this.map.getZoom() < INTERACTIVE_ZOOM_LEVEL
            ? templates.circle
            : detailedTemplate;

        const spriteColors = colors[colorsKey];

        if (spriteColors) {
          const svg = worksiteTemplate
            .replace('{{fillColor}}', spriteColors.fillColor)
            .replace('{{strokeColor}}', spriteColors.strokeColor)
            .replace(
              '{{multiple}}',
              markerSprite.work_types.length > 1 ? templates.plus : '',
            );
          markerSprite.texture = Texture.from(svg);
        }
      }

      this.$nextTick(() => {
        // Add this slight pan to re-render map
        this.map.panBy([1, 0]);
      });
    },
    enableInteractiveTooltip() {
      this.showInteractivePopover = true;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.showInteractivePopover = false;
      }, 5000);
    },
    goToIncidentCenter() {
      this.showInteractivePopover = false;
      const { locationModels } = Incident.find(this.currentIncidentId);
      if (locationModels.length) {
        locationModels.forEach((location) => {
          this.fitLocation(location, true);
        });
      } else {
        const center = averageGeolocation(
          this.markers.map((marker) => [
            marker.location.coordinates[1],
            marker.location.coordinates[0],
          ]),
        );
        if (center.latitude && center.longitude) {
          this.map.setView([center.latitude, center.longitude], 6);
        }
      }
      this.showInteractivePopover = false;
    },
    goToInteractive() {
      if (Incident.find(this.currentIncidentId).locationModels.length) {
        this.goToIncidentCenter();
        this.map.setZoom(INTERACTIVE_ZOOM_LEVEL);
      } else {
        const center = averageGeolocation(
          this.markers.map((marker) => [
            marker.location.coordinates[1],
            marker.location.coordinates[0],
          ]),
        );
        if (center.latitude && center.longitude) {
          this.map.setView(
            [center.latitude, center.longitude],
            INTERACTIVE_ZOOM_LEVEL,
          );
        }
      }
      this.showInteractivePopover = false;
    },
    fitLocation(location) {
      if (this.map) {
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
        this.map.fitBounds(polygon.getBounds());
      }
    },
    workTypesClaimedByOrganization() {
      return this.worksite.work_types.filter(
        (type) => type.claimed_by === this.currentUser.organization.id,
      );
    },
    workTypesClaimedByOthers() {
      const list = this.worksite.work_types.filter(
        (type) =>
          type.claimed_by &&
          type.claimed_by !== this.currentUser.organization.id,
      );
      return groupBy(list, 'claimed_by');
    },
    workTypesUnclaimed() {
      return this.worksite.work_types.filter(
        (type) => type.claimed_by === null,
      );
    },
    toggleLegend(value) {
      this.showingLegend = value;
      User.api().updateUserState(
        {
          showingLegend: value,
        },
        null,
        false,
      );
    },
  },
};
</script>

<style>
@import '~leaflet/dist/leaflet.css';

.map-svg-container svg {
  width: 25px;
  height: 25px;
}
</style>
