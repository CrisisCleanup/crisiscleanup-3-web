import { Container, settings as PixiSettings, Sprite, Texture } from 'pixi.js';

import * as L from 'leaflet';
import 'leaflet-loading';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet-pixi-overlay';
import 'leaflet.heat';
import * as moment from 'moment';
import { solveCollision } from '@/utils/easing';
import { colors, templates } from '@/icons/icons_templates';
import Worksite from '@/models/Worksite';

const INTERACTIVE_ZOOM_LEVEL = 12;

export const mapTileLayer =
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';

// export const mapTileLayerDark =
//   'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';

export const mapTileLayerSatellite =
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';

export const mapAttribution =
  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

export const getGoogleMapsLocation = (url) => {
  const regex = new RegExp('@(.*),(.*),');
  const match = url.match(regex);
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  return {
    longitude,
    latitude,
  };
};

const getOpacity = (date) => {
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

/**
 * Calculate the center/average of multiple GeoLocation coordinates
 * Expects an array of objects with .latitude and .longitude properties
 *
 * @url http://stackoverflow.com/a/14231286/538646
 */
/* eslint-disable no-restricted-syntax */
export function averageGeolocation(coords) {
  if (coords.length === 1) {
    return coords[0];
  }

  let x = 0.0;
  let y = 0.0;
  let z = 0.0;

  for (const coord of coords) {
    const latitude = (coord[0] * Math.PI) / 180;
    const longitude = (coord[1] * Math.PI) / 180;

    x += Math.cos(latitude) * Math.cos(longitude);
    y += Math.cos(latitude) * Math.sin(longitude);
    z += Math.sin(latitude);
  }

  const total = coords.length;

  x /= total;
  y /= total;
  z /= total;

  const centralLongitude = Math.atan2(y, x);
  const centralSquareRoot = Math.sqrt(x * x + y * y);
  const centralLatitude = Math.atan2(z, centralSquareRoot);

  return {
    latitude: (centralLatitude * 180) / Math.PI,
    longitude: (centralLongitude * 180) / Math.PI,
  };
}

PixiSettings.SPRITE_MAX_TEXTURES = Math.min(
  PixiSettings.SPRITE_MAX_TEXTURES,
  16,
);

export function getWorksiteLayer(
  worksites,
  map,
  context,
  interactive = true,
  filtered = null,
) {
  const pixiContainer = new Container();
  context.pixiContainer = pixiContainer;

  const layer = (function () {
    let firstDraw = true;
    let prevZoom;
    let prevCenter;
    const markerSprites = [];
    let frame = null;
    const doubleBuffering =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    return L.pixiOverlay(
      function (utils) {
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
          worksites.forEach(function (marker) {
            const coords = project([
              marker.location.coordinates[1],
              marker.location.coordinates[0],
            ]);

            const markerSprite = new Sprite();
            markerSprite.filtered = filtered && !filtered.has(marker.id);
            const workType =
              marker.key_work_type ||
              Worksite.getWorkType(
                marker.work_types,
                context.currentFilters,
                context.currentUser && context.currentUser.organization,
              );

            if (context.displayedWorkTypes) {
              context.displayedWorkTypes[workType.work_type] = true;
            }

            const colorsKey = `${workType.status}_${
              workType.claimed_by ? 'claimed' : 'unclaimed'
            }`;
            const worksiteTemplate = templates.circle;
            const spriteColors = colors[colorsKey];
            if (spriteColors) {
              let { fillColor, strokeColor } = spriteColors;
              if (markerSprite.filtered) {
                fillColor = 'white';
              } else {
                strokeColor = 'white';
              }
              const svg = worksiteTemplate
                .replace('{{fillColor}}', fillColor)
                .replace('{{strokeColor}}', strokeColor)
                .replace(
                  '{{multiple}}',
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
            markerSprite.name = marker.name;
            markerSprite.address = marker.address;
            markerSprite.flags = marker.flags || [];
            markerSprite.favorite_id = marker.favorite_id;
            markerSprite.case_number = marker.case_number;
            markerSprite.svi = marker.svi;
            markerSprite.work_types = marker.work_types;
            markerSprite.active_work_type = workType;
            markerSprite.colorsKey = colorsKey;
            markerSprite.id = marker.id;
            markerSprite.alpha = getOpacity(marker.updated_at);
          });
          context.displayedWorkTypes = { ...context.displayedWorkTypes };
          const quadTrees = {};
          if (interactive) {
            for (let z = INTERACTIVE_ZOOM_LEVEL; z <= map.getMaxZoom(); z++) {
              const rInit = (z <= 7 ? 16 : 24) / utils.getScale(z);
              quadTrees[z] = solveCollision(markerSprites, {
                r0: rInit,
                zoom: z,
              });
            }
          }
          const findMarker = (ll) => {
            const currentMap = utils.getMap() || context.map;
            if (currentMap.getZoom() < INTERACTIVE_ZOOM_LEVEL || !interactive) {
              return null;
            }
            const layerPoint = project(ll);
            const quadTree = quadTrees[currentMap.getZoom()];
            let marker;
            try {
              const { rMax } = quadTree;
              let found = false;
              quadTree.visit(function (quad, x1, y1, x2, y2) {
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
            } catch {
              return null;
            }
            return marker;
          };

          if (interactive) {
            map.on('click', function (e) {
              const currentMap = utils.getMap() || context.map;
              const marker = findMarker(e.latlng);
              if (marker) {
                context.$emit('onSelectmarker', marker);
              } else {
                map.closePopup();
              }

              if (currentMap.getZoom() < INTERACTIVE_ZOOM_LEVEL) {
                if (context.enableInteractiveTooltip) {
                  context.enableInteractiveTooltip();
                }
              }
            });

            map.on(
              'mousemove',
              L.Util.throttle((e) => {
                const marker = findMarker(e.latlng);
                if (marker) {
                  L.DomUtil.addClass(this._container, 'cursor-pointer');
                  this._container.setAttribute('title', marker.case_number);
                } else {
                  L.DomUtil.removeClass(this._container, 'cursor-pointer');
                  this._container.setAttribute('title', '');
                }
              }, 32),
            );
          }
        }
        if (firstDraw || prevZoom !== zoom || prevCenter !== center) {
          context.$emit('mapMoved', map.getBounds());
          markerSprites.forEach(function (markerSprite) {
            if (zoom >= INTERACTIVE_ZOOM_LEVEL && interactive) {
              if (
                utils
                  .getMap()
                  .getBounds()
                  .contains([
                    markerSprite.location.coordinates[1],
                    markerSprite.location.coordinates[0],
                  ])
              ) {
                const workType = markerSprite.active_work_type;

                const colorsKey = `${workType.status}_${
                  workType.claimed_by ? 'claimed' : 'unclaimed'
                }`;

                const spriteColors = colors[colorsKey];

                let detailedTemplate =
                  templates[workType.work_type] || templates.unknown;
                const isHighPriority = Boolean(
                  markerSprite.flags.filter((flag) => flag.is_high_priority)
                    .length,
                );
                if (markerSprite.favorite_id) {
                  detailedTemplate = templates.favorite;
                } else if (isHighPriority) {
                  detailedTemplate = templates.important;
                }
                if (spriteColors) {
                  let { fillColor } = spriteColors;
                  const { strokeColor } = spriteColors;
                  if (markerSprite.filtered) {
                    fillColor = 'white';
                  }
                  const typeSvg = detailedTemplate
                    .replace('{{fillColor}}', fillColor)
                    .replace('{{strokeColor}}', strokeColor)
                    .replace(
                      '{{multiple}}',
                      markerSprite.work_types.length > 1 ? templates.plus : '',
                    );

                  markerSprite.texture = Texture.from(typeSvg);
                }
              }
            } else {
              const { colorsKey } = markerSprite;
              const spriteColors = colors[colorsKey];
              if (spriteColors) {
                let { fillColor, strokeColor } = spriteColors;
                if (markerSprite.filtered) {
                  fillColor = 'white';
                } else {
                  strokeColor = 'white';
                }
                const template = templates.circle;
                const typeSvg = template
                  .replace('{{fillColor}}', fillColor)
                  .replace('{{strokeColor}}', strokeColor)
                  .replace(
                    '{{multiple}}',
                    markerSprite.work_types.length > 1 ? templates.plus : '',
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
          markerSprites.forEach(function (markerSprite) {
            markerSprite.scale.set(
              markerSprite.currentScale +
                lambda * (markerSprite.targetScale - markerSprite.currentScale),
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
  layer.key = 'worksite_layer';
  return layer;
}

export function getMarkerLayer(markers, map, context) {
  const pixiContainer = new Container();
  context.pixiContainer = pixiContainer;

  const layer = (function () {
    let firstDraw = true;
    let prevZoom;
    let prevCenter;
    const markerSprites = [];
    let frame = null;
    const doubleBuffering =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    return L.pixiOverlay(
      function (utils) {
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
          markers.forEach(function (marker) {
            marker.location = marker.patient_location;
            const coords = project([
              marker.location.coordinates[1],
              marker.location.coordinates[0],
            ]);

            const markerSprite = new Sprite();
            const markerTemplate = templates.circle;
            markerSprite.x = coords.x;
            markerSprite.y = coords.y;
            markerSprite.x0 = coords.x;
            markerSprite.y0 = coords.y;
            markerSprite.interactive = true;
            markerSprite.anchor.set(0.5, 0.5);
            markerSprite.on('click', function () {
              alert();
            });
            const svg = markerTemplate
              .replace('{{fillColor}}', 'red')
              .replace('{{strokeColor}}', 'black');
            markerSprite.texture = Texture.from(svg);
            container.addChild(markerSprite);
            markerSprites.push(markerSprite);
          });
        }
        if (firstDraw || prevZoom !== zoom || prevCenter !== center) {
          context.$emit('mapMoved', map.getBounds());
          markerSprites.forEach(function (markerSprite) {
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
          markerSprites.forEach(function (markerSprite) {
            markerSprite.scale.set(
              markerSprite.currentScale +
                lambda * (markerSprite.targetScale - markerSprite.currentScale),
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
  layer.key = 'marker_layer';
  return layer;
}
