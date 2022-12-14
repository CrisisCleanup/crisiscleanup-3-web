import {
  Container,
  settings as PixiSettings,
  Sprite,
  Texture,
  utils as pixiUtils,
} from 'pixi.js';

import * as L from 'leaflet';
import 'leaflet-loading';
// Import 'leaflet.gridlayer.googlemutant';
import 'leaflet-pixi-overlay';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';

import Worksite from '../models/Worksite';
import { PixiUtils } from './types/map';

const INTERACTIVE_ZOOM_LEVEL = 12;

export const mapTileLayer =
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';

export const mapTileLayerDark =
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';

export const mapTileLayerSatellite =
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';

export const googleMapsLayer =
  'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

export const mapAttribution =
  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

export const getGoogleMapsLocation = (url: string) => {
  const regex = new RegExp('@(.*),(.*),');
  const match = url.match(regex) || [0, 0];
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

export function averageGeolocation(coords: number[][]) {
  if (coords.length === 1) {
    return coords[0];
  }

  let x = 0;
  let y = 0;
  let z = 0;

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

export function getMarkerLayer(
  markers: Worksite[],
  map: L.Map,
  context: Record<string, any>,
) {
  const pixiContainer = new Container();
  context.pixiContainer = pixiContainer;

  const layer = (function () {
    let firstDraw = true;
    // Let prevCenter;
    let frame: number | null = null;
    const doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return L.pixiOverlay(
      function (utils: PixiUtils) {
        const zoom = utils.getMap().getZoom();
        // Const center = utils.getMap().getCenter();
        if (frame) {
          cancelAnimationFrame(frame);
          frame = null;
        }

        const container = utils.getContainer();
        const renderer = utils.getRenderer();
        const scale = utils.getScale();
        const invScale = 0.75 / scale;
        if (firstDraw) {
          // PrevZoom = zoom;
          // prevCenter = center;
        }

        let start: number | null = null;
        const delta = 250;

        for (const markerSprite of container.children) {
          if (firstDraw) {
            markerSprite.scale.set(invScale);
          } else {
            markerSprite.currentScale = markerSprite.scale.x;
            markerSprite.targetScale = invScale;
          }
        }

        function animate(timestamp: number) {
          if (start === null) start = timestamp;
          const progress = timestamp - start;
          let lambda = progress / delta;
          if (lambda > 1) lambda = 1;
          lambda *= 0.4 + lambda * (2.2 + lambda * -1.6);
          for (const markerSprite of container.children) {
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
          }

          renderer.render(container);
          if (progress < delta) {
            frame = requestAnimationFrame(animate);
          }
        }

        if (!firstDraw) {
          frame = requestAnimationFrame(animate);
        }

        firstDraw = false;
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
    let previousZoom: any;
    // Let prevCenter;
    let frame: number | null = null;
    const doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return L.pixiOverlay(
      function (utils: PixiUtils) {
        const zoom = utils.getMap().getZoom();
        // Const center = utils.getMap().getCenter();
        if (frame) {
          cancelAnimationFrame(frame);
          frame = null;
        }

        const container = utils.getContainer();
        const renderer = utils.getRenderer();
        const scale = utils.getScale();
        const invScale = 0.75 / scale;
        if (firstDraw) {
          previousZoom = zoom;
          // PrevCenter = center;
        }

        for (const markerSprite of container.children) {
          // If (!markerSprite.type === 'line') return;
          if (firstDraw) {
            markerSprite.scale.set(invScale);
          } else {
            markerSprite.currentScale = markerSprite.scale.x;
            markerSprite.targetScale = invScale;
          }
        }

        let start: number | null = null;
        const delta = 250;

        function createLineAnimation(
          markerSprite: Sprite & Record<string, any>,
          type = 'arc',
        ) {
          if (markerSprite.frame) {
            cancelAnimationFrame(markerSprite.frame);
            markerSprite.frame = null;
          }

          if (markerSprite.currentPoint === 0) {
            markerSprite.clear();
            // MarkerSprite.filters = [new GlowFilter({ distance: 12, outerStrength: 1, color: 0x61d5f8})];
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
                markerSprite.remove();
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

        function animate(timestamp: number) {
          if (start === null) start = timestamp;
          const progress = timestamp - start;
          let lambda = progress / delta;
          if (lambda > 1) lambda = 1;
          lambda *= 0.4 + lambda * (2.2 + lambda * -1.6);
          for (const markerSprite of container.children) {
            if (markerSprite.type === 'line') {
              if (zoom !== previousZoom) {
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
                    markerSprite.remove();
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
          }

          renderer.render(container);
          if (progress < delta) {
            frame = requestAnimationFrame(animate);
          }
        }

        if (!firstDraw) {
          frame = requestAnimationFrame(animate);
        }

        firstDraw = false;
        previousZoom = zoom;
        // PrevCenter = center;
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

export function calcWaypoints(vertices: string | any[]) {
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

export function degreesToRadians(degrees: number) {
  const pi = Math.PI;
  return degrees * (pi / 180);
}

function getCubicBezierXYatPercent(
  startPt: { x: any; y: any },
  controlPt1: { x: any; y: any },
  controlPt2: { x: any; y: any },
  endPt: { x: any; y: any },
  percent: number,
) {
  // Cubic helper formula
  function CubicN(T: number, a: number, b: number, c: number, d: number) {
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

export function findBezierPoints(b: any[]) {
  const startPt = b[0];
  const controlPt1 = b[1];
  const controlPt2 = b[2];
  const endPt = b[3];
  const pts = [b[0]];
  let lastPt = b[0];
  const tests = 25;
  for (let t = 0; t <= tests; t++) {
    // Calc another point along the curve
    const pt = getCubicBezierXYatPercent(
      startPt,
      controlPt1,
      controlPt2,
      endPt,
      t / tests,
    );
    // Add the pt if it's not already in the pts[] array
    const dx = pt.x - lastPt.x;
    const dy = pt.y - lastPt.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const dInt = Number.parseInt(String(d));
    if (dInt > 0 || t === tests) {
      lastPt = pt;
      pts.push(pt);
    }
  }

  return pts;
}

export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
