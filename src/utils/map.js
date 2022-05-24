import {
  Container,
  settings as PixiSettings,
  Sprite,
  Texture,
  utils as pixiUtils,
} from 'pixi.js';

import * as L from 'leaflet';
import 'leaflet-loading';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet-pixi-overlay';
import 'leaflet.heat';
import { solveCollision } from '@/utils/easing';
import { colors, templates } from '@/icons/icons_templates';
import Worksite from '@/models/Worksite';
// import { GlowFilter } from '@pixi/filter-glow';

const INTERACTIVE_ZOOM_LEVEL = 12;

export const mapTileLayer =
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';

export const mapTileLayerDark =
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';

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
        container.sortableChildren = true;
        const renderer = utils.getRenderer();
        const project = utils.latLngToLayerPoint;
        const scale = utils.getScale();
        const invScale = 0.75 / scale;
        if (firstDraw) {
          prevZoom = zoom;
          prevCenter = center;
          worksites.forEach(function (marker) {
            if (marker.work_types.length === 0) {
              return;
            }
            const coords = project([
              marker.location.coordinates[1],
              marker.location.coordinates[0],
            ]);

            const markerSprite = new Sprite();
            markerSprite.filtered = filtered && !filtered.has(marker.id);
            if (markerSprite.filtered) {
              markerSprite.zIndex = 0;
              markerSprite.alpha = 0.3;
            } else {
              markerSprite.zIndex = 2;
            }
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
            markerSprite.created_at = marker.created_at;
            markerSprite.updated_at = marker.updated_at;
            markerSprite.work_types = marker.work_types;
            markerSprite.active_work_type = workType;
            markerSprite.colorsKey = colorsKey;
            markerSprite.id = marker.id;
            // markerSprite.alpha = getOpacity(marker.updated_at);
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
                if (context.onSelectMarker) {
                  context.onSelectMarker(marker);
                }
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
    // let prevZoom;
    // let prevCenter;
    let frame = null;
    const doubleBuffering =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    return L.pixiOverlay(
      function (utils) {
        const zoom = utils.getMap().getZoom();
        // const center = utils.getMap().getCenter();
        if (frame) {
          cancelAnimationFrame(frame);
          frame = null;
        }
        const container = utils.getContainer();
        const renderer = utils.getRenderer();
        const scale = utils.getScale();
        const invScale = 0.75 / scale;
        if (firstDraw) {
          // prevZoom = zoom;
          // prevCenter = center;
        }

        let start = null;
        const delta = 250;

        container.children.forEach(function (markerSprite) {
          // if (!markerSprite.type === 'line') return;
          if (firstDraw) {
            markerSprite.scale.set(invScale);
          } else {
            markerSprite.currentScale = markerSprite.scale.x;
            markerSprite.targetScale = invScale;
          }
        });

        function animate(timestamp) {
          if (start === null) start = timestamp;
          const progress = timestamp - start;
          let lambda = progress / delta;
          if (lambda > 1) lambda = 1;
          lambda *= 0.4 + lambda * (2.2 + lambda * -1.6);
          container.children.forEach(function (markerSprite) {
            if (zoom >= INTERACTIVE_ZOOM_LEVEL) {
              markerSprite.texture =
                markerSprite.detailedTexture || markerSprite.basicTexture;
            } else {
              markerSprite.texture = markerSprite.basicTexture;
            }
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

        if (!firstDraw) {
          frame = requestAnimationFrame(animate);
        }
        firstDraw = false;
        // prevZoom = zoom;
        // prevCenter = center;
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

export function getLiveLayer() {
  const pixiContainer = new Container();

  const layer = (function () {
    let firstDraw = true;
    let prevZoom;
    // let prevCenter;
    let frame = null;
    const doubleBuffering =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    return L.pixiOverlay(
      function (utils) {
        const zoom = utils.getMap().getZoom();
        // const center = utils.getMap().getCenter();
        if (frame) {
          cancelAnimationFrame(frame);
          frame = null;
        }
        const container = utils.getContainer();
        const renderer = utils.getRenderer();
        const scale = utils.getScale();
        const invScale = 0.75 / scale;
        if (firstDraw) {
          prevZoom = zoom;
          // prevCenter = center;
        }
        container.children.forEach(function (markerSprite) {
          // if (!markerSprite.type === 'line') return;
          if (firstDraw) {
            markerSprite.scale.set(invScale);
          } else {
            markerSprite.currentScale = markerSprite.scale.x;
            markerSprite.targetScale = invScale;
          }
        });

        let start = null;
        const delta = 250;

        function createLineAnimation(markerSprite, type = 'arc') {
          if (markerSprite.frame) {
            cancelAnimationFrame(markerSprite.frame);
            markerSprite.frame = null;
          }
          if (markerSprite.currentPoint === 0) {
            markerSprite.clear();
            // markerSprite.filters = [new GlowFilter({ distance: 12, outerStrength: 1, color: 0x61d5f8})];
          }
          const lineColor = pixiUtils.string2hex(markerSprite.color);
          markerSprite.lineStyle(2.5 / scale, lineColor);
          markerSprite.currentPoint++;
          if (markerSprite.currentPoint > markerSprite.wayPoints.length - 1) {
            markerSprite.alpha -= 0.0035;
            if (markerSprite.alpha === 0) {
              setTimeout(() => {
                markerSprite.texture.destroy();
                markerSprite.clear();
                container.removeChild(markerSprite);
              }, 3000);
            }
            return;
          }
          markerSprite.moveTo(
            markerSprite.wayPoints[markerSprite.currentPoint - 1].x,
            markerSprite.wayPoints[markerSprite.currentPoint - 1].y,
          );
          if (type === 'arc') {
            markerSprite.arc(
              markerSprite.wayPoints[markerSprite.currentPoint].x,
              markerSprite.wayPoints[markerSprite.currentPoint].y,
              0,
              0,
              Math.PI * 2,
            );
          } else {
            markerSprite.lineTo(
              markerSprite.wayPoints[markerSprite.currentPoint].x,
              markerSprite.wayPoints[markerSprite.currentPoint].y,
            );
          }
        }

        function animate(timestamp) {
          if (start === null) start = timestamp;
          const progress = timestamp - start;
          let lambda = progress / delta;
          if (lambda > 1) lambda = 1;
          lambda *= 0.4 + lambda * (2.2 + lambda * -1.6);
          container.children.forEach(function (markerSprite) {
            if (markerSprite.type === 'line') {
              if (zoom !== prevZoom) {
                markerSprite.clear();
              }
              createLineAnimation(markerSprite);
              markerSprite.frame = requestAnimationFrame(animate);
            } else {
              if (markerSprite.type === 'actor') {
                markerSprite.alpha -= 0.0025;
                if (markerSprite.alpha === 0) {
                  setTimeout(() => {
                    markerSprite.texture.destroy();
                    markerSprite.clear();
                    container.removeChild(markerSprite);
                  }, 3000);
                }
              } else if (markerSprite.type === 'patient') {
                if (zoom >= INTERACTIVE_ZOOM_LEVEL) {
                  markerSprite.texture =
                    markerSprite.detailedTexture || markerSprite.basicTexture;
                } else {
                  markerSprite.texture = markerSprite.basicTexture;
                }
              }
              markerSprite.scale.set(
                markerSprite.currentScale +
                  lambda *
                    (markerSprite.targetScale - markerSprite.currentScale),
              );
            }
          });
          renderer.render(container);
          if (progress < delta) {
            frame = requestAnimationFrame(animate);
          }
        }

        if (!firstDraw) {
          frame = requestAnimationFrame(animate);
        }
        firstDraw = false;
        prevZoom = zoom;
        // prevCenter = center;
        renderer.render(container);
      },
      pixiContainer,
      {
        doubleBuffering,
        destroyInteractionManager: true,
      },
    );
  })();
  layer.key = 'live_layer';
  return layer;
}

export function calcWaypoints(vertices) {
  const waypoints = [];
  for (let i = 1; i < vertices.length; i++) {
    const pt0 = vertices[i - 1];
    const pt1 = vertices[i];
    const dx = pt1.x - pt0.x;
    const dy = pt1.y - pt0.y;
    for (let j = 0; j < 250; j++) {
      const x = pt0.x + (dx * j) / 250;
      const y = pt0.y + (dy * j) / 250;
      waypoints.push({ x, y });
    }
  }
  return waypoints;
}

export function degreesToRadians(degrees) {
  const pi = Math.PI;
  return degrees * (pi / 180);
}

function getCubicBezierXYatPercent(
  startPt,
  controlPt1,
  controlPt2,
  endPt,
  percent,
) {
  // cubic helper formula
  function CubicN(T, a, b, c, d) {
    const t2 = T * T;
    const t3 = t2 * T;
    return (
      a +
      (-a * 3 + T * (3 * a - a * T)) * T +
      (3 * b + T * (-6 * b + b * 3 * T)) * T +
      (c * 3 - c * 3 * T) * t2 +
      d * t3
    );
  }

  const x = CubicN(percent, startPt.x, controlPt1.x, controlPt2.x, endPt.x);
  const y = CubicN(percent, startPt.y, controlPt1.y, controlPt2.y, endPt.y);
  return {
    x,
    y,
  };
}

export function findBezierPoints(b) {
  const startPt = b[0];
  const controlPt1 = b[1];
  const controlPt2 = b[2];
  const endPt = b[3];
  const pts = [b[0]];
  let lastPt = b[0];
  const tests = 25;
  for (let t = 0; t <= tests; t++) {
    // calc another point along the curve
    const pt = getCubicBezierXYatPercent(
      startPt,
      controlPt1,
      controlPt2,
      endPt,
      t / tests,
    );
    // add the pt if it's not already in the pts[] array
    const dx = pt.x - lastPt.x;
    const dy = pt.y - lastPt.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const dInt = parseInt(d);
    if (dInt > 0 || t === tests) {
      lastPt = pt;
      pts.push(pt);
    }
  }
  return pts;
}

export function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
