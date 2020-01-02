<template>
  <div class="fullsize-map" style="position: relative;">
    <div
      v-if="mapLoading"
      style="z-index: 1001;"
      class="absolute bottom-0 left-0 right-0 top-0 bg-gray-100 opacity-75 flex items-center justify-center"
    >
      <spinner />
    </div>
    <div
      class="flex flex-col absolute"
      style="z-index: 1001; top: 110px; left: 10px"
    >
      <base-button
        text=""
        :title="$t('Go to Incident')"
        :alt="$t('Go to Incident')"
        :action="goToIncidentCenter"
        icon="search-minus"
        class="w-8 h-8 border-2 my-1 bg-white"
      />
      <base-button
        v-tooltip="{
          content: this.$t('Zoom to make icons interactive'),
          show: showInteractivePopover,
          trigger: 'manual',
          autoHide: true,
          classes: 'interactive-tooltip',
          placement: 'right-start',
        }"
        text=""
        :title="$t('Go to Interactive')"
        :alt="$t('Go to Interactive')"
        icon="search-plus"
        :action="goToInteractive"
        class="w-8 h-8 border-2 my-1 bg-white"
      />
      <base-button
        text=""
        :title="$t('Go to Local')"
        :alt="$t('Go to Local')"
        icon="search-location"
        :action="goToLocal"
        class="w-8 h-8 border-2 my-1 bg-white"
      />
    </div>
    <div
      v-if="!mapLoading"
      style="z-index: 1001;"
      class="legend absolute left-0 bottom-0 h-96 w-72 bg-white border p-2"
    >
      <div class="text-base font-bold my-1">{{ $t('Legend') }}</div>
      <div class="flex flex-wrap justify-between">
        <div
          v-for="entry in displayedWorkTypeSvgs"
          class="flex items-center w-1/2 mb-1"
        >
          <div class="map-svg-container" v-html="entry.svg"></div>
          <span class="text-xs ml-1">{{ entry.key | getWorkTypeName }}</span>
        </div>
      </div>
      <div class="text-base font-bold my-1">
        {{ $t('Work Order/Claim Status') }}
      </div>
      <div class="flex flex-wrap">
        <div
          v-for="(value, key) in legendColors"
          class="flex items-center w-1/2 mb-1"
        >
          <span class="w-4">
            <badge class="mx-1" :color="value" />
          </span>
          <div class="text-xs ml-1">{{ key }}</div>
        </div>
      </div>
    </div>
    <div ref="map" class="home-map"></div>
  </div>
</template>
<style>
.fullsize-map {
  height: 100vh;
  width: 100%;
}
</style>

<script>
import { Container, Loader, Sprite, Texture } from 'pixi.js';
import * as L from 'leaflet';
import 'leaflet-loading';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet-pixi-overlay';
import 'leaflet.heat';
import * as moment from 'moment';
import { solveCollision } from '@/utils/easing';
import User from '@/models/User';
import { averageGeolocation } from '@/utils/map';
import { colors, templates } from '@/icons/icons_templates';
import { groupBy } from '@/utils/array';
import Worksite from '@/models/Worksite';

L.Icon.Default.imagePath = '.';
// OR
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const INTERACTIVE_ZOOM_LEVEL = 12;

const getOpacity = date => {
  // let opacity_buckets = [100, 75, 60, 35, 20, 10]
  const opacity_buckets = [100, 85, 70, 45, 30, 20];
  const today = moment();
  const sixty_days_ago = moment().subtract(60, 'days');

  const currentDate = moment(date);
  // if (currentDate.isBefore(sixty_days_ago)) {
  //     return 0.1;
  // }

  const spread = today.unix() - sixty_days_ago.unix();
  const percentage =
    ((currentDate.unix() - sixty_days_ago.unix()) / spread) * 100.0;

  // TODO: refactor
  // eslint-disable-next-line no-unused-vars
  const closestOpacity = opacity_buckets.reduce((prev, curr) =>
    Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev,
  );
  // return closestOpacity / 100;
  return 1;
};

export default {
  props: {
    query: Object,
    currentFilters: Object,
    newMarker: Object,
  },
  data() {
    return {
      ready: false,
      points: [],
      autoplay: true,
      mapTimers: [],
      // tileLayer: L.tileLayer('https://api.pitneybowes.com/location-intelligence/geomap/v1/tile/osm/{z}/{x}/{y}.png?api_key={api_key}', {
      //     api_key: process.env.VUE_APP_PITNEYBOWES_API_KEY,
      //     maxZoom: 18,
      //     attribution: '<a class="leaflet-attribution" target="_blank" href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>',
      // }),
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
      mapLoading: false,
      markerLayer: L.layerGroup(),
      markers: [],
      showInteractivePopover: false,
      loader: new Loader(),
      colors,
      templates,
      pixiContainer: new Container(),
      displayedWorkTypes: {},
      displayedWorkTypeSvgs: [],
      legendColors: {
        [this.$t('Unclaimed')]: colors.open_unassigned_unclaimed.fillColor,
        [this.$t('Claimed, not started')]: colors.open_unassigned_claimed
          .fillColor,
        [this.$t('In progress')]: colors.open_assigned_claimed.fillColor,
        [this.$t('Partially completed')]: colors[
          'open_partially-completed_claimed'
        ].fillColor,
        [this.$t('Needs follow-up')]: colors['open_needs-follow-up_claimed']
          .fillColor,
        [this.$t('Completed')]: colors.closed_completed_claimed.fillColor,
        [this.$t(
          'Done by others, no help wanted, or partially completed',
        )]: colors['closed_done-by-others_unclaimed'].fillColor,
        [this.$t('Duplicate or Unresponsive')]: colors
          .open_unresponsive_unclaimed.fillColor,
        [this.$t('Out of scope')]: colors['closed_out-of-scope_unclaimed']
          .fillColor,
      },
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  watch: {
    newMarker() {
      this.addWorksite(this.newMarker);
    },
    displayedWorkTypes: {
      handler(val) {
        this.displayedWorkTypeSvgs = Object.keys(val).map(workType => {
          const template = this.templates[workType] || this.templates.unknown;
          const svg = template
            .replace('{{fillColor}}', 'black')
            .replace('{{strokeColor}}', 'black')
            .replace('{{multple}}', '');
          return {
            svg,
            key: workType,
          };
        });
      },
      deep: true,
    },
  },
  mounted() {
    const options = {
      center: L.latLng(39, -90),
      zoom: 4,
      loadingControl: true,
      preferCanvas: true,
    };
    this.initMap(options);
    this.ready = true;
  },
  beforeDestroy() {
    this.map.off();
    this.map.remove();
  },
  methods: {
    async initMap(options) {
      if (this.map) {
        this.map.off();
        this.map.remove();
        this.map = null;
      }

      this.map = L.map(this.$refs.map, options);
      this.$emit('initMap', this.map);
      this.map.on('moveend', () => {
        this.$emit('mapMoved', this.map.getBounds());
        this.showInteractivePopover = false;
      });
      if (this.currentUser.states && this.currentUser.states.mapViewPort) {
        const { _northEast, _southWest } = this.currentUser.states.mapViewPort;
        this.map.fitBounds([
          [_northEast.lat, _northEast.lng],
          [_southWest.lat, _southWest.lng],
        ]);
      }
      this.tileLayer.addTo(this.map);
      this.markerLayer.addTo(this.map);
      await this.pullSites();
    },
    async updateMap(worksite_id) {
      if (!worksite_id) {
        this.initMap();
      } else {
        const markerSprite = this.pixiContainer.children.find(
          ms => parseInt(ms.data.id) === parseInt(worksite_id),
        );
        markerSprite.data = Worksite.find(worksite_id);

        const work_type = Worksite.getWorkType(
          markerSprite.data.work_types,
          this.currentFilters,
          this.currentUser.organization,
        );

        const colorsKey = `${work_type.status}_${
          work_type.claimed_by ? 'claimed' : 'unclaimed'
        }`;
        const worksiteTemplate =
          this.map.getZoom() < INTERACTIVE_ZOOM_LEVEL
            ? this.templates.circle
            : this.templates[work_type.work_type] || this.templates.unknown;
        const spriteColors = this.colors[colorsKey];

        if (spriteColors) {
          const svg = worksiteTemplate
            .replace('{{fillColor}}', spriteColors.fillColor)
            .replace('{{strokeColor}}', spriteColors.strokeColor)
            .replace(
              '{{multiple}}',
              markerSprite.data.work_types.length > 1
                ? this.templates.plus
                : '',
            );
          markerSprite.texture = Texture.from(svg);
        }

        this.$nextTick(() => {
          // Add this slight pan to re-render map
          this.map.panBy([1, 0]);
        });
      }
    },
    goToIncidentCenter() {
      const center = averageGeolocation(
        this.markers.map(marker => [marker.position.lat, marker.position.lng]),
      );
      this.map.setView([center.latitude, center.longitude], 6);
      this.showInteractivePopover = false;
    },
    goToInteractive() {
      const center = averageGeolocation(
        this.markers.map(marker => [marker.position.lat, marker.position.lng]),
      );
      this.map.setView(
        [center.latitude, center.longitude],
        INTERACTIVE_ZOOM_LEVEL,
      );
      this.showInteractivePopover = false;
    },
    goToLocal() {
      const center = averageGeolocation(
        this.markers.map(marker => [marker.position.lat, marker.position.lng]),
      );
      this.map.setView([center.latitude, center.longitude], 15);
      this.showInteractivePopover = false;
    },
    addWorksite(location) {
      this.markerLayer.clearLayers();
      new L.marker(location).addTo(this.markerLayer);
      this.map.setView([location.lat, location.lng], 15);
    },
    workTypesClaimedByOrganization() {
      return this.worksite.work_types.filter(
        type => type.claimed_by === this.currentUser.organization.id,
      );
    },
    workTypesClaimedByOthers() {
      const list = this.worksite.work_types.filter(
        type =>
          type.claimed_by &&
          type.claimed_by !== this.currentUser.organization.id,
      );
      return groupBy(list, 'claimed_by');
    },
    workTypesUnclaimed() {
      return this.worksite.work_types.filter(type => type.claimed_by === null);
    },
    loadMarkersOnMap(markers) {
      for (let i = this.pixiContainer.children.length - 1; i >= 0; i--) {
        this.pixiContainer.removeChild(this.pixiContainer.children[i]);
        this.displayedWorkTypes = {};
      }
      this.pixiContainer.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });

      this.pixiContainer = new Container();

      const { map } = this;
      const self = this;
      const pixiLayer = (function() {
        let firstDraw = true;
        let prevZoom;
        const markerSprites = [];
        let frame = null;
        const doubleBuffering =
          /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        return L.pixiOverlay(
          function(utils) {
            const zoom = utils.getMap().getZoom();
            if (frame) {
              cancelAnimationFrame(frame);
              frame = null;
            }
            const container = utils.getContainer();
            const renderer = utils.getRenderer();
            const project = utils.latLngToLayerPoint;
            const scale = utils.getScale();
            const invScale = 0.75 / scale;
            if (firstDraw) {
              prevZoom = zoom;
              markers.forEach(function(marker) {
                const coords = project([
                  marker.position.lat,
                  marker.position.lng,
                ]);
                const markerSprite = new Sprite();
                const work_type = Worksite.getWorkType(
                  marker.work_types,
                  self.currentFilters,
                  self.currentUser.organization,
                );

                self.displayedWorkTypes[work_type.work_type] = true;
                self.displayedWorkTypes = { ...self.displayedWorkTypes };

                const colorsKey = `${work_type.status}_${
                  work_type.claimed_by ? 'claimed' : 'unclaimed'
                }`;
                const worksiteTemplate =
                  zoom < INTERACTIVE_ZOOM_LEVEL
                    ? self.templates.circle
                    : self.templates[work_type.work_type] ||
                      self.templates.unknown;
                const spriteColors = self.colors[colorsKey];

                if (spriteColors) {
                  const svg = worksiteTemplate
                    .replace('{{fillColor}}', spriteColors.fillColor)
                    .replace('{{strokeColor}}', spriteColors.strokeColor)
                    .replace(
                      '{{multple}}',
                      marker.work_types.length > 1 ? self.templates.plus : '',
                    );
                  markerSprite.texture = Texture.from(svg);
                }
                markerSprite.x = coords.x;
                markerSprite.y = coords.y;
                markerSprite.x0 = coords.x;
                markerSprite.y0 = coords.y;
                markerSprite.anchor.set(0.5, 0.5);
                markerSprite.alpha = getOpacity(marker.updated_at);
                container.addChild(markerSprite);
                markerSprites.push(markerSprite);
                markerSprite.legend = marker.city || marker.label;
                markerSprite.data = marker;
                // markerSprite.interactive = true;
                // markerSprite.cursor = 'pointer';
                // markerSprite.name = marker.case_number;
                // markerSprite.on('click', () => {
                //     self.onSelectmarker(marker);
                // });
              });

              const quadTrees = {};
              for (let z = INTERACTIVE_ZOOM_LEVEL; z <= map.getMaxZoom(); z++) {
                const rInit = (z <= 7 ? 16 : 24) / utils.getScale(z);
                quadTrees[z] = solveCollision(markerSprites, {
                  r0: rInit,
                  zoom: z,
                });
              }
              const findMarker = ll => {
                if (utils.getMap().getZoom() < INTERACTIVE_ZOOM_LEVEL) {
                  return null;
                }
                const layerPoint = project(ll);
                const quadTree = quadTrees[utils.getMap().getZoom()];
                let marker;
                const { rMax } = quadTree;
                let found = false;
                quadTree.visit(function(quad, x1, y1, x2, y2) {
                  if (!quad.length) {
                    const dx = quad.data.x - layerPoint.x;
                    const dy = quad.data.y - layerPoint.y;
                    const r = quad.data.scale.x * 16;
                    if (dx * dx + dy * dy <= r * r) {
                      marker = quad.data;
                      found = true;
                    }
                  }
                  return (
                    found ||
                    x1 > layerPoint.x + rMax ||
                    x2 + rMax < layerPoint.x ||
                    y1 > layerPoint.y + rMax ||
                    y2 + rMax < layerPoint.y
                  );
                });
                return marker;
              };

              map.on('click', function(e) {
                const marker = findMarker(e.latlng);
                if (marker) {
                  self.$emit('onSelectmarker', marker.data);
                } else {
                  map.closePopup();
                }

                if (utils.getMap().getZoom() < INTERACTIVE_ZOOM_LEVEL) {
                  self.showInteractivePopover = true;
                }
              });

              map.on(
                'mousemove',
                L.Util.throttle(e => {
                  const marker = findMarker(e.latlng);
                  if (marker) {
                    L.DomUtil.addClass(this._container, 'cursor-pointer');
                  } else {
                    L.DomUtil.removeClass(this._container, 'cursor-pointer');
                  }
                }, 32),
              );
            }
            if (firstDraw || prevZoom !== zoom) {
              markerSprites.forEach(function(markerSprite) {
                const work_type = Worksite.getWorkType(
                  markerSprite.data.work_types,
                  self.currentFilters,
                  self.currentUser.organization,
                );

                const colorsKey = `${work_type.status}_${
                  work_type.claimed_by ? 'claimed' : 'unclaimed'
                }`;
                const worksiteTemplate =
                  zoom < INTERACTIVE_ZOOM_LEVEL
                    ? self.templates.circle
                    : self.templates[work_type.work_type] ||
                      self.templates.unknown;
                const spriteColors = self.colors[colorsKey];

                if (spriteColors) {
                  const svg = worksiteTemplate
                    .replace('{{fillColor}}', spriteColors.fillColor)
                    .replace('{{strokeColor}}', spriteColors.strokeColor)
                    .replace(
                      '{{multiple}}',
                      markerSprite.data.work_types.length > 1
                        ? self.templates.plus
                        : '',
                    );
                  markerSprite.texture = Texture.from(svg);
                }

                if (firstDraw) {
                  markerSprite.scale.set(invScale);
                } else {
                  markerSprite.currentScale = markerSprite.scale.x;
                  markerSprite.targetScale = invScale;
                }
              });
            }

            let start = null;
            const delta = 250;

            function animate(timestamp) {
              if (start === null) start = timestamp;
              const progress = timestamp - start;
              let lambda = progress / delta;
              if (lambda > 1) lambda = 1;
              lambda *= 0.4 + lambda * (2.2 + lambda * -1.6);
              markerSprites.forEach(function(markerSprite) {
                markerSprite.scale.set(
                  markerSprite.currentScale +
                    lambda *
                      (markerSprite.targetScale - markerSprite.currentScale),
                );
              });
              renderer.render(container);
              if (progress < delta) {
                frame = requestAnimationFrame(animate);
              }
            }

            if (!firstDraw && prevZoom !== zoom) {
              frame = requestAnimationFrame(animate);
            }
            firstDraw = false;
            prevZoom = zoom;
            renderer.render(container);
          },
          self.pixiContainer,
          {
            doubleBuffering,
            reloadOnAdd: true,
          },
        );
      })();
      pixiLayer.addTo(map);
    },
    async pullSites(url) {
      if (!this.query.incident) {
        return;
      }
      this.mapLoading = true;
      try {
        const response = await this.$http.get(
          url || `${process.env.VUE_APP_API_BASE_URL}/worksites_all`,
          {
            params: url ? {} : { ...this.query },
          },
        );

        this.markers = response.data.results.map(worksite => {
          return {
            ...worksite,
            position: {
              lat: worksite.location ? worksite.location.coordinates[1] : 10,
              lng: worksite.location ? worksite.location.coordinates[0] : 10,
            },
          };
        });
      } catch (e) {
        this.markers = [];
      }

      this.$log.debug(`Loading ${this.markers.length} markers`);
      await this.loadMarkersOnMap(this.markers);
      this.$nextTick(() => {
        // Add this slight pan to re-render map
        this.map.panBy([1, 0]);
      });
      this.mapLoading = false;
    },
  },
};
</script>

<style>
@import '~leaflet/dist/leaflet.css';
@import '~leaflet-loading/src/Control.Loading.css';
@import '~leaflet.markercluster/dist/MarkerCluster.Default.css';
@import '~leaflet.markercluster/dist/MarkerCluster.css';

/*.home-map {*/
/*    height: 100%;*/
/*}*/

.map-svg-container svg {
  width: 25px;
  height: 25px;
}

.leaflet-pane {
  z-index: 5;
}

.interactive-tooltip {
  display: block !important;
  z-index: 10000;
}

.interactive-tooltip .tooltip-inner {
  background: black;
  color: white;
  border-radius: 16px;
  padding: 5px 10px 4px;
}

.interactive-tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: black;
  z-index: 1;
}

.interactive-tooltip[x-placement^='top'] {
  margin-bottom: 5px;
}

.interactive-tooltip[x-placement^='top'] .tooltip-arrow {
  border-width: 5px 5px 0 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  bottom: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.interactive-tooltip[x-placement^='bottom'] {
  margin-top: 5px;
}

.interactive-tooltip[x-placement^='bottom'] .tooltip-arrow {
  border-width: 0 5px 5px 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.interactive-tooltip[x-placement^='right'] {
  margin-left: 5px;
}

.interactive-tooltip[x-placement^='right'] .tooltip-arrow {
  border-width: 5px 5px 5px 0;
  border-left-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
  left: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.interactive-tooltip[x-placement^='left'] {
  margin-right: 5px;
}

.interactive-tooltip[x-placement^='left'] .tooltip-arrow {
  border-width: 5px 0 5px 5px;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  right: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.interactive-tooltip.popover .popover-inner {
  background: #f9f9f9;
  color: black;
  padding: 24px;
  border-radius: 5px;
  box-shadow: 0 5px 30px rgba(black, 0.1);
}

.interactive-tooltip.popover .popover-arrow {
  border-color: #f9f9f9;
}

.interactive-tooltip[aria-hidden='true'] {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s, visibility 0.15s;
}

.interactive-tooltip[aria-hidden='false'] {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.15s;
}
</style>
