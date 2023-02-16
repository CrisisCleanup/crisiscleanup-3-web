import { Sprite, Texture } from 'pixi.js';
import KDBush from 'kdbush';
import * as turf from '@turf/turf';
import type * as L from 'leaflet';
import type { Feature, Point, Properties } from '@turf/turf';
import { templates, colors } from '../../icons/icons_templates';
import type Worksite from '@/models/Worksite';
import type { PixiLayer } from '@/utils/types/map';
import moment from "moment";

const INTERACTIVE_ZOOM_LEVEL = 12;

interface KDBushPoint {
  x: number;
  y: number;
  id: string;
  case_number: string;
  address: string;
  work_types: any[];
}

export default (
  map: L.Map,
  markers: (Sprite & Worksite)[],
  visibleMarkerIds: string[],
) => {
  const textureMap: Record<string, Texture> = {};
  let workTypes: Record<string, any> = {};
  let points: KDBushPoint[] = [];
  let kdBushIndex: any = null;

  function renderMarkerSprite(marker: Sprite & Worksite, index: number) {
    map.eachLayer((layer: L.Layer) => {
      if ((layer as L.Layer & PixiLayer).key === 'marker_layer') {
        const markerTemplate = templates.circle;
        let sprite = new Sprite() as any;

        const workType = marker.key_work_type || marker.work_types[0];
        const colorsKey = `${workType.status}_${
          workType.claimed_by ? 'claimed' : 'unclaimed'
        }`;
        const spriteColors = colors[colorsKey];
        const { fillColor, strokeColor } = spriteColors;

        const { location } = marker;
        const patientCoords = (
          layer as L.Layer & PixiLayer
        ).utils.latLngToLayerPoint([
          location.coordinates[1],
          location.coordinates[0],
        ]);

        sprite = new Sprite();
        sprite.index = index;
        sprite.id = marker.id;
        const isFilteredMarker = !visibleMarkerIds.includes(marker.id);
        if (isFilteredMarker) {
          sprite.zIndex = 0;
          sprite.alpha = 0.3;
        }

        sprite.svi = marker.svi;
        sprite.work_types = marker.work_types;
        sprite.updated_at = marker.updated_at;
        sprite.updated_at_moment = moment(marker.updated_at);
        sprite.x = patientCoords.x;
        sprite.y = patientCoords.y;
        sprite.x0 = patientCoords.x;
        sprite.y0 = patientCoords.y;
        sprite.anchor.set(0.5, 0.5);
        const svg = markerTemplate
          .replaceAll('{{fillColor}}', isFilteredMarker ? 'white' : fillColor)
          .replaceAll('{{strokeColor}}', isFilteredMarker ? fillColor : 'white');
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
          .replaceAll('{{fillColor}}', isFilteredMarker ? 'white' : fillColor)
          .replaceAll('{{strokeColor}}', isFilteredMarker ? strokeColor : 'white')
          .replaceAll(
            '{{multiple}}',
            sprite.work_types.length > 1 ? templates.plus : '',
          );

        sprite.basicTexture = texture;
        sprite.detailedTexture = Texture.from(typeSvg);

        (layer as L.Layer & PixiLayer)._pixiContainer.addChild(sprite);
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
        address: marker.address,
        work_types: marker.work_types,
      };
    });

    kdBushIndex = new KDBush(
      points,
      function (p: KDBushPoint) {
        return p.x;
      },
      function (p: KDBushPoint) {
        return p.y;
      },
      64,
      Float64Array,
    );
  }

  function calcDist(
    a: Feature<Point, Properties>,
    b: Feature<Point, Properties>,
  ) {
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

  function findMarker(latlng: L.LatLng) {
    if (map.getZoom() < INTERACTIVE_ZOOM_LEVEL) {
      return null;
    }

    const results = kdBushIndex
      ?.within(latlng.lat, latlng.lng, 5)
      .map((id: number) => points[id]);
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
