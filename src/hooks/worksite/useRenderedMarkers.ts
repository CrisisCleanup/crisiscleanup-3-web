import { Sprite, Texture } from 'pixi.js';
import KDBush from 'kdbush';
import * as turf from '@turf/turf';
import { templates, colors } from '../../icons/icons_templates';

const INTERACTIVE_ZOOM_LEVEL = 12;

export default (map, markers, visibleMarkerIds) => {
  const textureMap = {};
  let workTypes = {};
  let points = [];
  let kdBushIndex: KDBush = null;

  function renderMarkerSprite(marker, index) {
    map.eachLayer((layer) => {
      if (layer.key === 'marker_layer') {
        const markerTemplate = templates.circle;
        let sprite = new Sprite() as any;

        const workType = marker.key_work_type;
        const colorsKey = `${workType.status}_${
          workType.claimed_by ? 'claimed' : 'unclaimed'
        }`;
        const spriteColors = colors[colorsKey];
        const { fillColor, strokeColor } = spriteColors;

        const { location } = marker;
        const patientCoords = layer.utils.latLngToLayerPoint([
          location.coordinates[1],
          location.coordinates[0],
        ]);

        sprite = new Sprite();
        sprite.index = index;
        sprite.id = marker.id;
        if (!visibleMarkerIds.includes(marker.id)) {
          sprite.zIndex = 0;
          sprite.alpha = 0.3;
        }

        sprite.svi = marker.svi;
        sprite.work_types = marker.work_types;
        sprite.updated_at = marker.updated_at;
        sprite.x = patientCoords.x;
        sprite.y = patientCoords.y;
        sprite.x0 = patientCoords.x;
        sprite.y0 = patientCoords.y;
        sprite.anchor.set(0.5, 0.5);
        const svg = markerTemplate
          .replaceAll('{{fillColor}}', fillColor)
          .replaceAll('{{strokeColor}}', 'white');
        let texture = textureMap[fillColor];
        if (!texture) {
          textureMap[fillColor] = Texture.from(svg);
          texture = textureMap[fillColor];
        }

        sprite.texture = texture;
        sprite.visible = true;
        sprite.color = fillColor;
        sprite.strokeColor = strokeColor;
        sprite.workTypeKey = workType?.work_type;

        if (workType?.work_type) {
          workTypes[workType?.work_type] = true;
          workTypes = { ...workTypes };
        }

        const detailedTemplate =
          templates[workType?.work_type] || templates.unknown;
        const typeSvg = detailedTemplate
          .replaceAll('{{fillColor}}', fillColor)
          .replaceAll('{{strokeColor}}', strokeColor);

        sprite.basicTexture = texture;
        sprite.detailedTexture = Texture.from(typeSvg);

        layer._pixiContainer.addChild(sprite);
      }
    });
  }

  function calculateKdBushIndex() {
    points = markers.map(function (marker) {
      return {
        x: Number.parseFloat(marker.location.coordinates[1]),
        y: Number.parseFloat(marker.location.coordinates[0]),
        id: marker.id,
        case_number: marker.case_number,
      };
    });

    kdBushIndex = new KDBush(
      points,
      function (p) {
        return p.x;
      },
      function (p) {
        return p.y;
      },
      64,
      Float64Array,
    );
  }

  function calcDist(a, b) {
    const p1 = map.latLngToContainerPoint([
      a.geometry.coordinates[1],
      a.geometry.coordinates[0],
    ]);
    const p2 = map.latLngToContainerPoint([
      b.geometry.coordinates[1],
      b.geometry.coordinates[0],
    ]);

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }

  function findMarker(latlng) {
    if (map.getZoom() < INTERACTIVE_ZOOM_LEVEL) {
      return null;
    }

    const results = kdBushIndex
      ?.within(latlng.lat, latlng.lng, 5)
      .map((id) => points[id]);
    let minDist = Number.MAX_VALUE;
    let minpxDist = 0;
    let minDistItem = null;
    if (results.length > 0) {
      for (const d of results) {
        const mouseCursor = turf.point([latlng.lng, latlng.lat]);
        const toPoint = turf.point([d.y, d.x]);

        const dist = turf.distance(mouseCursor, toPoint);
        const pxDist = calcDist(mouseCursor, toPoint);
        if (dist < minDist) {
          minDist = dist;
          minDistItem = d;
          minpxDist = pxDist;
        }
      }
    }

    if (minpxDist < 25) {
      return minDistItem;
    }

    return null;
  }

  calculateKdBushIndex();
  for (const [i, marker] of markers.entries()) {
    try {
      renderMarkerSprite(marker, i);
    } catch (error) {
      console.log(error);
    }
  }

  return {
    workTypes,
    findMarker,
    renderMarkerSprite,
  };
};
