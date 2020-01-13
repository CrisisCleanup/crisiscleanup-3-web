<template>
  <div class="relative">
    <div
      id="map"
      ref="map"
      class="absolute top-0 left-0 right-0 bottom-0"
    ></div>
    <div
      v-if="mapLoading"
      class="absolute bottom-0 left-0 right-0 top-0 bg-gray-100 opacity-75 flex items-center justify-center"
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
          :title="$t('worksiteMap.zoom_in')"
          :alt="$t('worksiteMap.zoom_in')"
          :action="
            () => {
              map.zoomIn();
            }
          "
          class="w-8 h-8 border-crisiscleanup-dark-100 border-t border-l border-r bg-white shadow-xl text-xl text-crisiscleanup-dark-400"
        />
        <base-button
          text=""
          icon="minus"
          icon-size="xs"
          :title="$t('worksiteMap.zoom_out')"
          :alt="$t('worksiteMap.zoom_out')"
          :action="
            () => {
              map.zoomOut();
            }
          "
          class="w-8 h-8 border border-crisiscleanup-dark-100 bg-white shadow-xl text-xl text-crisiscleanup-dark-400"
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
        :action="goToInteractive"
        icon="tree"
        icon-size="lg"
        class="w-8 h-8 border my-1 border-crisiscleanup-dark-100 bg-white shadow-xl text-crisiscleanup-dark-400"
        @mouseenter.native="enableInteractiveTooltip"
      />
      <base-button
        text=""
        :title="$t('worksiteMap.zoom_to_incident')"
        :alt="$t('worksiteMap.zoom_to_incident')"
        icon="search-minus"
        icon-size="lg"
        :action="goToIncidentCenter"
        class="w-8 h-8 border border-crisiscleanup-dark-100 my-1 bg-white shadow-xl text-crisiscleanup-dark-400"
      />
    </div>
    <div
      v-if="!mapLoading"
      style="z-index: 1001;"
      class="legend absolute left-0 bottom-0 w-72 bg-white border-2 p-2"
    >
      <div class="text-base font-bold my-1">{{ $t('Legend') }}</div>
      <div class="flex flex-wrap justify-between">
        <div
          v-for="entry in displayedWorkTypeSvgs"
          :key="entry.key"
          class="flex items-center w-1/2 mb-1"
        >
          <div class="map-svg-container" v-html="entry.svg"></div>
          <span class="text-xs ml-1">{{ entry.key | getWorkTypeName }}</span>
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
  </div>
</template>

<script>
import {
  Container,
  Loader,
  Sprite,
  Texture,
  settings as PixiSettings,
} from 'pixi.js';

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

const getOpacity = date => {
  // let opacityBuckets = [100, 75, 60, 35, 20, 10]
  const opacityBuckets = [100, 85, 70, 45, 30, 20];
  const today = moment();
  const sixtyDaysAgo = moment().subtract(60, 'days');

  const currentDate = moment(date);
  // if (currentDate.isBefore(sixtyDaysAgo)) {
  //     return 0.1;
  // }

  const spread = today.unix() - sixtyDaysAgo.unix();
  const percentage =
    ((currentDate.unix() - sixtyDaysAgo.unix()) / spread) * 100.0;

  // TODO: refactor
  // eslint-disable-next-line no-unused-vars
  const closestOpacity = opacityBuckets.reduce((prev, curr) =>
    Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev,
  );
  // return closestOpacity / 100;
  return 1;
};

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
      timeout: null,
      legendColors: {
        [this.$t('worksiteMap.unclaimed')]: colors.open_unassigned_unclaimed
          .fillColor,
        [this.$t('worksiteMap.claimed_not_started')]: colors
          .open_unassigned_claimed.fillColor,
        [this.$t('worksiteMap.in_progress')]: colors.open_assigned_claimed
          .fillColor,
        [this.$t('worksiteMap.partially_completed')]: colors[
          'open_partially-completed_claimed'
        ].fillColor,
        [this.$t('worksiteMap.needs_follow_up')]: colors[
          'open_needs-follow-up_claimed'
        ].fillColor,
        [this.$t('worksiteMap.completed')]: colors.closed_completed_claimed
          .fillColor,
        [this.$t('worksiteMap.done_by_others_no_help_wanted')]: colors[
          'closed_done-by-others_unclaimed'
        ].fillColor,
        [this.$t('worksiteMap.out_of_scope_duplicate_unresponsive')]: colors
          .open_unresponsive_unclaimed.fillColor,
      },
      mapLoading: false,
      markerLayer: L.layerGroup(),
      markers: [],
      markerSprites: [],
      showInteractivePopover: false,
      templates,
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  watch: {
    displayedWorkTypes: {
      handler(val) {
        this.displayedWorkTypeSvgs = Object.keys(val).map(workType => {
          const template = templates[workType] || templates.unknown;
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
  async mounted() {
    if (!this.query.incident) {
      return;
    }
    this.mapLoading = true;
    const response = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/worksites_all`,
      {
        params: { ...this.query },
      },
    );

    this.markers = response.data.results;
    await this.loadMap(response.data.results);

    this.$nextTick(() => {
      // Add this slight pan to re-render map
      this.map.panBy([1, 0]);
    });
    this.mapLoading = false;
  },
  methods: {
    async loadMap(markers) {
      await new Promise(resolve => {
        const self = this;
        const loader = new Loader();
        loader.add('circle', '/circle.svg');
        loader.load(() => {
          this.map = L.map('map', { zoomControl: false }).setView(
            [31.0, -100.0],
            12,
          );
          const { map } = this;
          if (this.currentUser.states && this.currentUser.states.mapViewPort) {
            const {
              _northEast,
              _southWest,
            } = this.currentUser.states.mapViewPort;
            this.map.fitBounds([
              [_northEast.lat, _northEast.lng],
              [_southWest.lat, _southWest.lng],
            ]);
          }
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
          const pixiLayer = (function() {
            let firstDraw = true;
            let prevZoom;
            let prevCenter;
            const markerSprites = [];
            let frame = null;
            const pixiContainer = new Container();
            self.pixiContainer = pixiContainer;
            const doubleBuffering =
              /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            return L.pixiOverlay(
              function(utils) {
                const zoom = utils.getMap().getZoom();
                const center = utils.getMap().getCenter();
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
                  prevCenter = center;
                  markers.forEach(function(marker) {
                    const coords = project([
                      marker.location.coordinates[1],
                      marker.location.coordinates[0],
                    ]);

                    const markerSprite = new Sprite();
                    const workType = Worksite.getWorkType(
                      marker.work_types,
                      self.currentFilters,
                      self.currentUser.organization,
                    );

                    self.displayedWorkTypes[workType.work_type] = true;
                    self.displayedWorkTypes = { ...self.displayedWorkTypes };

                    const colorsKey = `${workType.status}_${
                      workType.claimed_by ? 'claimed' : 'unclaimed'
                    }`;
                    const worksiteTemplate = templates.circle;
                    const spriteColors = colors[colorsKey];

                    if (spriteColors) {
                      const svg = worksiteTemplate
                        .replace('{{fillColor}}', spriteColors.fillColor)
                        .replace('{{strokeColor}}', spriteColors.strokeColor)
                        .replace(
                          '{{multple}}',
                          marker.work_types.length > 1 ? templates.plus : '',
                        );
                      markerSprite.texture = Texture.from(svg);
                    }
                    markerSprite.x = coords.x;
                    markerSprite.y = coords.y;
                    markerSprite.x0 = coords.x;
                    markerSprite.y0 = coords.y;
                    markerSprite.anchor.set(0.5, 0.5);
                    // markerSprite.alpha = getOpacity(marker.updated_at);
                    container.addChild(markerSprite);
                    markerSprites.push(markerSprite);
                    markerSprite.legend = marker.city || marker.label;
                    markerSprite.location = marker.location;
                    markerSprite.work_types = marker.work_types;
                    markerSprite.active_work_type = workType;
                    markerSprite.colorsKey = colorsKey;
                    markerSprite.id = marker.id;
                    markerSprite.alpha = getOpacity(marker.updated_at);
                  });

                  const quadTrees = {};
                  for (
                    let z = INTERACTIVE_ZOOM_LEVEL;
                    z <= map.getMaxZoom();
                    z++
                  ) {
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
                      self.$emit('onSelectmarker', marker);
                    } else {
                      map.closePopup();
                    }

                    if (utils.getMap().getZoom() < INTERACTIVE_ZOOM_LEVEL) {
                      self.enableInteractiveTooltip();
                    }
                  });

                  map.on(
                    'mousemove',
                    L.Util.throttle(e => {
                      const marker = findMarker(e.latlng);
                      if (marker) {
                        L.DomUtil.addClass(this._container, 'cursor-pointer');
                      } else {
                        L.DomUtil.removeClass(
                          this._container,
                          'cursor-pointer',
                        );
                      }
                    }, 32),
                  );
                }
                if (firstDraw || prevZoom !== zoom || prevCenter !== center) {
                  self.$emit('mapMoved', map.getBounds());
                  markerSprites.forEach(function(markerSprite) {
                    if (zoom >= INTERACTIVE_ZOOM_LEVEL) {
                      if (
                        utils
                          .getMap()
                          .getBounds()
                          .contains([
                            markerSprite.location.coordinates[1],
                            markerSprite.location.coordinates[0],
                          ])
                      ) {
                        const workType = Worksite.getWorkType(
                          markerSprite.work_types,
                          self.currentFilters,
                          self.currentUser.organization,
                        );

                        const colorsKey = `${workType.status}_${
                          workType.claimed_by ? 'claimed' : 'unclaimed'
                        }`;

                        const spriteColors = colors[colorsKey];
                        if (spriteColors) {
                          const template =
                            templates[workType.work_type] || templates.unknown;
                          const typeSvg = template
                            .replace('{{fillColor}}', spriteColors.fillColor)
                            .replace(
                              '{{strokeColor}}',
                              spriteColors.strokeColor,
                            )
                            .replace(
                              '{{multiple}}',
                              markerSprite.work_types.length > 1
                                ? templates.plus
                                : '',
                            );

                          markerSprite.texture = Texture.from(typeSvg);
                        }
                      }
                    } else {
                      const { colorsKey } = markerSprite;
                      const spriteColors = colors[colorsKey];
                      if (spriteColors) {
                        const template = templates.circle;
                        const typeSvg = template
                          .replace('{{fillColor}}', spriteColors.fillColor)
                          .replace('{{strokeColor}}', spriteColors.strokeColor)
                          .replace(
                            '{{multiple}}',
                            markerSprite.work_types.length > 1
                              ? templates.plus
                              : '',
                          );

                        markerSprite.texture = Texture.from(typeSvg);
                      }
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
                          (markerSprite.targetScale -
                            markerSprite.currentScale),
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
                prevCenter = center;
                renderer.render(container);
              },
              pixiContainer,
              {
                doubleBuffering,
                destroyInteractionManager: true,
              },
            );
          })();

          pixiLayer.addTo(map);
          resolve();
        });
      });
    },
    async updateMap(worksiteId) {
      if (!worksiteId) {
        this.initMap();
      } else {
        const markerSprite = this.pixiContainer.children.find(
          ms => parseInt(ms.id) === parseInt(worksiteId),
        );
        const worksite = Worksite.find(worksiteId);

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

        const worksiteTemplate =
          this.map.getZoom() < INTERACTIVE_ZOOM_LEVEL
            ? templates.circle
            : templates[workType.work_type] || templates.unknown;
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

        this.$nextTick(() => {
          // Add this slight pan to re-render map
          this.map.panBy([1, 0]);
        });
      }
    },
    enableInteractiveTooltip() {
      this.showInteractivePopover = true;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.showInteractivePopover = false;
      }, 5000);
    },
    goToIncidentCenter() {
      const center = averageGeolocation(
        this.markers.map(marker => [
          marker.location.coordinates[1],
          marker.location.coordinates[0],
        ]),
      );
      this.map.setView([center.latitude, center.longitude], 6);
      this.showInteractivePopover = false;
    },
    goToInteractive() {
      const center = averageGeolocation(
        this.markers.map(marker => [
          marker.location.coordinates[1],
          marker.location.coordinates[0],
        ]),
      );
      this.map.setView(
        [center.latitude, center.longitude],
        INTERACTIVE_ZOOM_LEVEL,
      );
      this.showInteractivePopover = false;
    },
    goToLocal() {
      const center = averageGeolocation(
        this.markers.map(marker => [
          marker.location.coordinates[1],
          marker.location.coordinates[0],
        ]),
      );
      this.map.setView([center.latitude, center.longitude], 15);
      this.showInteractivePopover = false;
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
