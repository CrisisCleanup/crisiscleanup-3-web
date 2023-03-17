import type { LatLng } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import {
  type Container,
  Graphics,
  Sprite,
  Texture,
  utils as pixiUtils,
} from 'pixi.js';
// eslint-disable-next-line import/named
import { orderBy } from 'lodash';
import type { Ref } from 'vue';
import {
  degreesToRadians,
  findBezierPoints,
  getLiveLayer,
  getMarkerLayer,
  mapAttribution,
  mapTileLayer,
  mapTileLayerDark,
  randomIntFromInterval,
} from '../../utils/map';
import Location from '../../models/Location';
import { i18n } from '../../main';
import { colors, templates } from '@/icons/icons_templates';
import type {
  LiveGraphics,
  PixiLayer,
  LiveSprite,
  LayerGroup,
} from '@/utils/types/map';
import type Worksite from '@/models/Worksite';
import type Incident from '@/models/Incident';

export type MapUtils = {
  getMap: () => L.Map;
  getPixiContainer: () => Container | null;
  getCurrentMarkerLayer: () => (L.Layer & PixiLayer) | null;
  removeLayer: (key: string) => void;
  reloadMap: (markers: (Sprite & Worksite & LiveSprite)[]) => void;
  addMarkerToMap: (location: LatLng) => void;
  fitLocation: (location: Location) => void;
  jumpToCase: (worksite: Worksite, showPopup: boolean) => void;
  applyLocation: (locationId: string, value: boolean) => void;
  applyTeamGeoJson: (teamId: string, value: boolean, geom: any) => void;
  restartLiveEvents: () => void;
  isPaused: Ref<boolean | undefined>;
  pauseGeneratePoints: () => void;
  resumeGeneratePoints: () => void;
  refreshVisibility: () => void;
  refreshTimeline: (index: number) => void;
  refreshSvi: (index: number) => void;
  displayedWorkTypeSvgs: Ref<Record<string, any>[]>;
};

export default (
  markers: (Sprite & Worksite & LiveSprite)[],
  liveEvents: (Sprite & Worksite)[],
  incident: Incident,
  cadence = 0.015,
  reloadFunction: () => PromiseLike<any>,
  onCardAdded: (card: Record<any, any>) => void,
  onClearCards: () => void,
) => {
  let colorMode = 'dark';
  let currentEventIndex = 0;
  const textureMap: Record<string, Texture> = {};
  const displayedWorkTypeSvgs = ref<Record<string, any>[]>([]);
  const visibleWorkTypes = computed(() => {
    const selectedWorkTypes = displayedWorkTypeSvgs.value
      .filter((s) => s.selected)
      .map((s) => s.key);
    if (selectedWorkTypes.length > 0) {
      return selectedWorkTypes;
    }
    return null;
  });
  const displayedWorkTypes: string[] = [];
  const eventsInterval = ref<any>(null);
  const isPaused = ref<boolean | undefined>(false);
  const svg = templates.orb
    .replaceAll('{{fillColor}}', '#61D5F8')
    .replaceAll('{{strokeColor}}', 'black');
  const orbTexture = Texture.from(svg);

  const map = L.map('map', {
    zoomControl: false,
  }).fitBounds([
    [17.644_022_027_872_726, -122.783_144_702_938_76],
    [50.792_047_064_406_866, -69.872_988_452_938_74],
  ]);

  const darkTileLayer = L.tileLayer(mapTileLayerDark, {
    // tileSize: 512,
    // zoomOffset: -1,
    attribution: mapAttribution,
    detectRetina: false,
    maxZoom: 18,
    noWrap: false,
  });

  const lightTileLayer = L.tileLayer(mapTileLayer, {
    // tileSize: 512,
    // zoomOffset: -1,
    attribution: mapAttribution,
    detectRetina: false,
    maxZoom: 18,
    noWrap: false,
  });

  const setLayer = (mode: string) => {
    colorMode = mode;
    if (colorMode === 'dark') {
      map.addLayer(darkTileLayer);
      map.removeLayer(lightTileLayer);
    } else {
      map.addLayer(lightTileLayer);
      map.removeLayer(darkTileLayer);
    }
  };

  const removeLayer = (key: string) => {
    map.eachLayer((layer) => {
      if ((layer as L.Layer & PixiLayer).key === key) {
        map.removeLayer(layer);
      }
    });
  };

  function generatePoints(
    liveMarkers: (Sprite & Worksite & LiveSprite)[],
    markerSpeed: number,
  ) {
    if (eventsInterval.value) {
      clearInterval(eventsInterval.value);
    }
    eventsInterval.value = setInterval(
      () => generateMarker(liveMarkers),
      markerSpeed,
    );
  }

  function pauseGeneratePoints() {
    isPaused.value = true;
  }

  function resumeGeneratePoints() {
    isPaused.value = false;
  }

  const restartLiveEvents = async () => {
    // this.$log.debug('restarting live events');
    const liveMarkers = await reloadFunction();
    // if (liveMarkers.length === 0) {
    //   return restartLiveEvents();
    // }
    currentEventIndex = 0;
    removeLayer('live_layer');
    const liveLayer = getLiveLayer();
    liveLayer.addTo(map);
    onClearCards();
    const markerSpeed: number =
      Number((100 / liveMarkers.length).toFixed(0)) * cadence;
    generatePoints(liveMarkers, markerSpeed);
    return undefined;
  };

  function setLegend(createdWorkTypes: string[]) {
    const workTypes = [
      ...new Set(createdWorkTypes || incident.created_work_types),
    ];
    displayedWorkTypeSvgs.value = workTypes.map((workType) => {
      const template = templates[workType] || templates.unknown;
      const svg = template
        .replaceAll('{{fillColor}}', '#61D5F8')
        .replaceAll('{{strokeColor}}', 'black')
        .replaceAll('{{multiple}}', '');
      return {
        svg,
        key: workType,
        selected: false,
      };
    });
  }

  function getMarkerVisibility(sprite: any) {
    if (!visibleWorkTypes.value) {
      return true;
    }
    return !!(
      visibleWorkTypes.value &&
      visibleWorkTypes.value.includes(sprite.workTypeKey)
    );
  }

  function createCurve(
    actorMarkerSprite: Sprite & LiveSprite,
    patientMarkerSprite: Sprite & LiveSprite,
  ) {
    const x1 = actorMarkerSprite.x; // in pixels
    const y1 = actorMarkerSprite.y;
    const x2 = patientMarkerSprite.x;
    const y2 = patientMarkerSprite.y;
    const ang1 = degreesToRadians(randomIntFromInterval(30, 45)); // in radians
    const ang2 = degreesToRadians(randomIntFromInterval(45, 60));

    const len = Math.hypot(x2 - x1, y2 - y1);
    const ax1 = Math.cos(ang1) * len * (1 / randomIntFromInterval(2, 5));
    const ay1 = Math.sin(ang1) * len * (1 / randomIntFromInterval(2, 5));

    const ax2 = Math.cos(ang2) * len * (1 / randomIntFromInterval(2, 5));
    const ay2 = Math.sin(ang2) * len * (1 / randomIntFromInterval(2, 5));
    const linksGraphics = new Graphics() as Graphics & LiveGraphics;
    linksGraphics.x1 = x1;
    linksGraphics.y1 = y1;
    linksGraphics.bezierParams = [
      x1 + ax1,
      y1 + ay1,
      x2 - ax2,
      y2 - ay2,
      x2,
      y2,
    ];
    linksGraphics.type = 'line';
    linksGraphics.lineStyle(
      15,
      pixiUtils.string2hex(patientMarkerSprite.color),
    );
    linksGraphics.color = patientMarkerSprite.color;
    linksGraphics.workTypeKey = patientMarkerSprite.workTypeKey;
    linksGraphics.visible = getMarkerVisibility(linksGraphics as LiveGraphics);
    linksGraphics.moveTo(x1, y1);
    const [cpX, cpY, cpX2, cpY2, toX, toY] = linksGraphics.bezierParams;
    linksGraphics.bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY);
    linksGraphics.wayPoints = findBezierPoints([
      { x: actorMarkerSprite.x, y: actorMarkerSprite.y },
      { x: x1 + ax1, y: y1 + ay1 },
      { x: x1 + ax1, y: y1 + ay1 },
      { x: patientMarkerSprite.x, y: patientMarkerSprite.y },
    ]);
    linksGraphics.currentPoint = 0;
    return linksGraphics;
  }

  async function generateMarker(
    liveEventMarkers: (Sprite & Worksite & LiveSprite)[],
  ) {
    if (isPaused.value) {
      return;
    }
    map.eachLayer(async (layer) => {
      if ((layer as L.Layer & PixiLayer).key === 'live_layer') {
        currentEventIndex++;
        const marker = liveEventMarkers[currentEventIndex];

        if (currentEventIndex > liveEventMarkers.length) {
          currentEventIndex = 0;
          return;
        }

        if (!marker) {
          (layer as L.Layer & PixiLayer)._renderer.render(
            (layer as L.Layer & PixiLayer)._pixiContainer,
          );
          (layer as L.Layer & PixiLayer).redraw();
          return;
        }
        const card: Record<string, any> = {
          classes: 'border w-full h-32 rounded my-2',
          event: marker,
        };
        const markerTemplate = templates.circle;
        let actorMarkerSprite = null;
        let patientMarkerSprite = null;
        if (marker.actor_blurred_location) {
          const actorCoords = (
            layer as L.Layer & PixiLayer
          ).utils.latLngToLayerPoint([
            marker.actor_blurred_location.coordinates[1],
            marker.actor_blurred_location.coordinates[0],
          ]);

          // const isOrg = (element) =>
          //   element.name === marker.attr.actor_organization_name;

          // const index = this.organizations.findIndex(isOrg);
          // if (index !== -1) {
          //   this.organizations.unshift(
          //     this.organizations.splice(index, 1)[0],
          //   );
          // }

          actorMarkerSprite = new Sprite() as Sprite & LiveSprite;
          actorMarkerSprite.x = actorCoords.x;
          actorMarkerSprite.y = actorCoords.y;
          actorMarkerSprite.x0 = actorCoords.x;
          actorMarkerSprite.y0 = actorCoords.y;
          actorMarkerSprite.interactive = false;
          actorMarkerSprite.anchor.set(0.5, 0.5);
          actorMarkerSprite.type = 'actor';
          actorMarkerSprite.live = true;
          actorMarkerSprite.texture = orbTexture;
          actorMarkerSprite.visible = true;
          card.color = '#61D5F8';
          card.strokeColor = '#61D5F8';
          (layer as L.Layer & PixiLayer)._pixiContainer.addChild(
            actorMarkerSprite,
          );
        }

        if (
          marker.recipient_blurred_location ||
          marker.patient_blurred_location
        ) {
          const location = marker[`${marker.map_destination}_blurred_location`];
          const patientCoords = (
            layer as L.Layer & PixiLayer
          ).utils.latLngToLayerPoint([
            location.coordinates[1],
            location.coordinates[0],
          ]);

          const wwtsp = marker.attr[`${marker.map_destination}_wwtsp`];
          let color = '#61D5F8';
          let strokeColor = '#61D5F8';
          let workTypeKey = null;
          card.color = color;
          card.strokeColor = strokeColor;

          if (wwtsp && wwtsp.length > 0) {
            const workType = orderBy(wwtsp, ['commercial_value'], ['desc'])[0];
            workTypeKey = workType.work_type_key;
            const colorsKey = `${workType.status}_${
              workType.claimed_by ? 'claimed' : 'unclaimed'
            }`;
            displayedWorkTypes.push(workTypeKey);
            // const worksiteTemplate = templates.circle;
            const spriteColors = colors[colorsKey];
            color = spriteColors.fillColor;
            strokeColor = spriteColors.strokeColor;
            card.color = color;
            card.strokeColor = strokeColor;
          } else if (
            marker.attr.recipient_status ||
            marker.attr.patient_status
          ) {
            const statusProp = marker.attr[`${marker.map_destination}_status`];
            const claimed = marker.attr[`${marker.map_destination}_claimed_by`]
              ? 'claimed'
              : 'unclaimed';
            const colorsKey = `${statusProp}_${claimed}`;
            const spriteColors = colors[colorsKey];
            color = spriteColors.fillColor;
            strokeColor = spriteColors.strokeColor;
            workTypeKey =
              marker.attr[`${marker.map_destination}_work_type_key`];
            displayedWorkTypes.push(workTypeKey);
            card.strokeColor = strokeColor;
          }

          patientMarkerSprite = new Sprite() as Sprite & LiveSprite;
          patientMarkerSprite.x = patientCoords.x;
          patientMarkerSprite.y = patientCoords.y;
          patientMarkerSprite.x0 = patientCoords.x;
          patientMarkerSprite.y0 = patientCoords.y;
          patientMarkerSprite.interactive = false;
          patientMarkerSprite.anchor.set(0.5, 0.5);
          patientMarkerSprite.live = true;
          const svg = markerTemplate
            .replaceAll('{{fillColor}}', color)
            .replaceAll('{{strokeColor}}', 'black');
          let texture = textureMap[color];
          if (!texture) {
            textureMap[color] = Texture.from(svg);
            texture = textureMap[color];
          }
          patientMarkerSprite.texture = texture;
          patientMarkerSprite.visible = true;
          patientMarkerSprite.color = color;
          patientMarkerSprite.strokeColor = strokeColor;
          patientMarkerSprite.workTypeKey = workTypeKey;
          patientMarkerSprite.type = 'patient';

          const detailedTemplate = templates[workTypeKey] || templates.unknown;
          const typeSvg = detailedTemplate
            .replaceAll('{{fillColor}}', color)
            .replaceAll('{{strokeColor}}', 'black');

          patientMarkerSprite.basicTexture = texture;
          patientMarkerSprite.detailedTexture = Texture.from(typeSvg);

          (layer as L.Layer & PixiLayer)._pixiContainer.addChild(
            patientMarkerSprite,
          );
        }

        (layer as L.Layer & PixiLayer)._renderer.render(
          (layer as L.Layer & PixiLayer)._pixiContainer,
        );
        (layer as L.Layer & PixiLayer).redraw();

        if (actorMarkerSprite && patientMarkerSprite) {
          const linksGraphics = createCurve(
            actorMarkerSprite,
            patientMarkerSprite,
          );
          linksGraphics.live = true;
          actorMarkerSprite.workTypeKey = patientMarkerSprite.workTypeKey;
          actorMarkerSprite.visible = getMarkerVisibility(actorMarkerSprite);
          patientMarkerSprite.visible =
            getMarkerVisibility(patientMarkerSprite);
          setTimeout(() => {
            (layer as L.Layer & PixiLayer)._pixiContainer.addChild(
              linksGraphics,
            );
            (layer as L.Layer & PixiLayer)._renderer.render(
              (layer as L.Layer & PixiLayer)._pixiContainer,
            );
            (layer as L.Layer & PixiLayer).redraw();
          }, 50);
        }

        onCardAdded(card);
      }
    });
  }

  function addMarker(marker: Worksite & Sprite & LiveSprite, index: number) {
    map.eachLayer((layer) => {
      try {
        if ((layer as L.Layer & PixiLayer).key === 'marker_layer') {
          const markerTemplate = templates.circle;
          let patientMarkerSprite = null;
          if (
            marker.recipient_blurred_location ||
            marker.patient_blurred_location
          ) {
            const location =
              marker[`${marker.map_destination}_blurred_location`];
            const patientCoords = (
              layer as L.Layer & PixiLayer
            ).utils.latLngToLayerPoint([
              location.coordinates[1],
              location.coordinates[0],
            ]);

            const address =
              marker.attr[`${marker.map_destination}_redacted_address`];

            const wwtsp = marker.attr[`${marker.map_destination}_wwtsp`];
            let color = '#d0021b';
            let strokeColor = '#e30001';
            let workTypeKey = null;
            if (wwtsp && wwtsp.length > 0) {
              const workType = orderBy(
                wwtsp,
                ['commercial_value'],
                ['desc'],
              )[0];
              workTypeKey = workType.work_type_key;
              const colorsKey = `${workType.status}_${
                workType.claimed_by ? 'claimed' : 'unclaimed'
              }`;
              // const worksiteTemplate = templates.circle;
              const spriteColors = colors[colorsKey];
              color = spriteColors.fillColor;
              strokeColor = spriteColors.strokeColor;
              displayedWorkTypes.push(workTypeKey);
            } else if (
              marker.attr.recipient_status ||
              marker.attr.patient_status
            ) {
              const statusProp =
                marker.attr[`${marker.map_destination}_status`];
              const claimed = marker.attr[
                `${marker.map_destination}_claimed_by`
              ]
                ? 'claimed'
                : 'unclaimed';
              const colorsKey = `${statusProp}_${claimed}`;
              const spriteColors = colors[colorsKey];
              color = spriteColors.fillColor;
              strokeColor = spriteColors.strokeColor;
              workTypeKey =
                marker.attr[`${marker.map_destination}_work_type_key`];
              displayedWorkTypes.push(workTypeKey);
            }

            patientMarkerSprite = new Sprite() as Sprite & LiveSprite;
            patientMarkerSprite.index = index;
            patientMarkerSprite.id = marker.id;
            patientMarkerSprite.x = patientCoords.x;
            patientMarkerSprite.y = patientCoords.y;
            patientMarkerSprite.x0 = patientCoords.x;
            patientMarkerSprite.y0 = patientCoords.y;
            patientMarkerSprite.interactive = false;
            patientMarkerSprite.anchor.set(0.5, 0.5);
            const svg = markerTemplate
              .replaceAll('{{fillColor}}', color)
              .replaceAll('{{strokeColor}}', 'black');
            let texture = textureMap[color];
            if (!texture) {
              textureMap[color] = Texture.from(svg);
              texture = textureMap[color];
            }
            patientMarkerSprite.texture = texture;
            patientMarkerSprite.visible = true;
            patientMarkerSprite.color = color;
            patientMarkerSprite.strokeColor = strokeColor;
            patientMarkerSprite.workTypeKey = workTypeKey;
            patientMarkerSprite.type = 'patient';
            if (address) {
              patientMarkerSprite.svi = Number(address.svi);
            }

            const detailedTemplate =
              templates[workTypeKey] || templates.unknown;
            const typeSvg = detailedTemplate
              .replaceAll('{{fillColor}}', color)
              .replaceAll('{{strokeColor}}', 'black');

            patientMarkerSprite.basicTexture = texture;
            patientMarkerSprite.detailedTexture = Texture.from(typeSvg);

            (layer as L.Layer & PixiLayer)._pixiContainer.addChild(
              patientMarkerSprite,
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  function setupMap(worksiteMarkers: (Worksite & Sprite & LiveSprite)[]) {
    setLayer('dark');
    removeLayer('marker_layer');
    const worksiteLayer = getMarkerLayer([], map, {});
    worksiteLayer.addTo(map);

    for (const [i, worksiteMarker] of worksiteMarkers.entries()) {
      try {
        addMarker(worksiteMarker, i);
      } catch {
        // this.$log.error(
        //   `Could not add marker for ${JSON.stringify(markers[i])}`,
        // );
        // this.$log.error(error);
      }
    }
    worksiteLayer._renderer.render(worksiteLayer._pixiContainer);
    worksiteLayer.redraw();

    removeLayer('live_layer');
    const liveLayer = getLiveLayer();
    liveLayer.addTo(map);

    map.attributionControl.setPosition('bottomright');
  }
  const reloadMap = (markers: (Sprite & Worksite & LiveSprite)[]) => {
    if (map) {
      setupMap(markers);
      setLegend([...displayedWorkTypes]);
    }
  };

  function getMap() {
    return map;
  }

  function getPixiContainer(): Container | null {
    let container: Container | null = null;
    map.eachLayer((layer) => {
      if ((layer as L.Layer & PixiLayer).key === 'marker_layer') {
        container = (layer as L.Layer & PixiLayer)._pixiContainer;
      }
    });
    return container;
  }

  function getCurrentMarkerLayer() {
    let l = null;
    map.eachLayer((layer) => {
      if ((layer as L.Layer & PixiLayer).key === 'marker_layer') {
        l = layer;
      }
    });
    return l;
  }

  async function addMarkerToMap(location: LatLng) {
    let markerLocation = location;
    const container = getPixiContainer() as any;
    if (!markerLocation) {
      markerLocation = map.getCenter();
    }

    const markerGroup = L.layerGroup() as LayerGroup & L.LayerGroup;
    markerGroup.key = 'temp_markers';

    const svgIcon = L.divIcon({
      className: 'crisiscleanup-map-marker',
      html: templates.map_marker,
      iconAnchor: [20, 40],
      iconSize: [50, 50],
    });

    const marker = L.marker(markerLocation, { draggable: true, icon: svgIcon });
    markerGroup.addTo(map);
    markerGroup.addLayer(marker);

    container.visible = false;
    map.setView([markerLocation.lat, markerLocation.lng], 15);
    marker
      .bindTooltip(i18n.global.t('casesVue.drag_pin_to_correct_location'), {
        direction: 'top',
        offset: L.point({ x: 0, y: -40 }),
      })
      .openTooltip();
    setTimeout(() => {
      container.visible = true;
      map.panBy([1, 0]);
    }, 400);
  }

  function fitLocation(location: Location) {
    if (map) {
      const geojsonFeature = {
        type: 'Feature',
        properties: location.attr,
        geometry: location.poly || location.geom || location.point,
      } as any;
      const polygon = L.geoJSON(geojsonFeature, {
        weight: '1',
        onEachFeature(_: never, layer: L.Layer & PixiLayer) {
          (layer as L.Layer & PixiLayer).location_id = location.id;
        },
      } as any);
      map.fitBounds(polygon.getBounds());
    }
  }

  const jumpToCase = async (worksite: Worksite, showPopup = true) => {
    const container = getPixiContainer();
    if (map && worksite && container) {
      container.visible = false;
      map.setView([worksite.latitude, worksite.longitude], 18);
      if (showPopup) {
        const popup = L.popup({ className: 'pixi-popup' });
        popup
          .setLatLng([worksite.latitude, worksite.longitude])
          .setContent(`<b>${worksite.name} (${worksite.case_number}</b>)`)
          .openOn(map);
        setTimeout(() => {
          map.closePopup();
        }, 5000);
      }

      setTimeout(() => {
        container.visible = true;
        map.panBy([1, 0]);
      }, 400);
    }
  };

  async function applyLocation(locationId: string, value: boolean) {
    if (value && map) {
      await Location.api().fetchById(locationId);
      const location = Location.find(locationId) as any;
      const geojsonFeature = {
        type: 'Feature',
        properties: location?.attr,
        geometry: location?.poly || location?.geom || location?.point,
      } as any;
      const polygon = L.geoJSON(geojsonFeature, {
        weight: '1',
        onEachFeature(_: never, layer: L.Layer & PixiLayer) {
          (layer as L.Layer & PixiLayer).location_id = locationId;
        },
      } as any);
      polygon.addTo(map);
      map.fitBounds(polygon.getBounds());
    } else {
      map.eachLayer((layer) => {
        if (
          (layer as L.Layer & PixiLayer).location_id &&
          (layer as L.Layer & PixiLayer).location_id === locationId
        ) {
          map.removeLayer(layer);
        }
      });
    }
  }

  async function applyTeamGeoJson(teamId: string, value: boolean, geom: any) {
    if (value && map) {
      const geojsonFeature = {
        type: 'Feature',
        properties: {},
        geometry: geom,
      } as any;
      const polygon = L.geoJSON(geojsonFeature, {
        weight: '1',
        onEachFeature(_: never, layer: L.Layer & PixiLayer) {
          (layer as L.Layer & PixiLayer).location_id = teamId;
        },
      } as any);
      polygon.addTo(map);
      map.fitBounds(polygon.getBounds());
    } else {
      map.eachLayer((layer) => {
        if (
          (layer as L.Layer & PixiLayer).location_id &&
          (layer as L.Layer & PixiLayer).location_id === teamId
        ) {
          map.removeLayer(layer);
        }
      });
    }
  }

  function refreshTimeline(index: number) {
    map.eachLayer((layer) => {
      if (
        (layer as L.Layer & PixiLayer).key === 'marker_layer' ||
        (layer as L.Layer & PixiLayer).key === 'live_layer'
      ) {
        const container = (layer as L.Layer & PixiLayer)._pixiContainer;
        for (const markerSprite of container.children as (Worksite &
          Sprite &
          LiveSprite)[]) {
          markerSprite.visible = markerSprite.index <= index;
        }

        (layer as L.Layer & PixiLayer)._renderer.render(container);
        (layer as L.Layer & PixiLayer).redraw();
      }
    });
  }

  function refreshSvi(value: number) {
    map.eachLayer((layer) => {
      if (
        (layer as L.Layer & PixiLayer).key === 'marker_layer' ||
        (layer as L.Layer & PixiLayer).key === 'live_layer'
      ) {
        const container = (layer as L.Layer & PixiLayer)._pixiContainer;
        const sprites = container.children as (Worksite &
          Sprite &
          LiveSprite)[];
        const sviList = sprites.map((marker: any) => {
          return {
            id: marker.id,
            svi: marker.svi,
          };
        });
        sviList.sort((a, b) => {
          return (b.svi || 1) - (a.svi || 1);
        });
        const count = Math.floor((sviList.length * Number(value)) / 100);
        const filteredSvi = sviList.slice(0, count);
        const minSvi = filteredSvi[filteredSvi.length - 1].svi;
        for (const markerSprite of sprites) {
          markerSprite.visible = markerSprite.svi > minSvi;
        }

        (layer as L.Layer & PixiLayer)._renderer.render(container);
        (layer as L.Layer & PixiLayer).redraw();
      }
    });
  }

  function refreshVisibility() {
    map.eachLayer((layer) => {
      if (
        (layer as L.Layer & PixiLayer).key === 'marker_layer' ||
        (layer as L.Layer & PixiLayer).key === 'live_layer'
      ) {
        const container = (layer as L.Layer & PixiLayer)._pixiContainer;
        for (const markerSprite of container.children) {
          markerSprite.visible = getMarkerVisibility(markerSprite);
        }

        (layer as L.Layer & PixiLayer)._renderer.render(container);
        (layer as L.Layer & PixiLayer).redraw();
      }
    });
  }

  setupMap(markers);
  setLegend([...displayedWorkTypes]);

  const mapUtils: MapUtils = {
    getMap,
    getPixiContainer,
    getCurrentMarkerLayer,
    removeLayer,
    reloadMap,
    addMarkerToMap,
    fitLocation,
    jumpToCase,
    applyLocation,
    applyTeamGeoJson,
    restartLiveEvents,
    isPaused,
    pauseGeneratePoints,
    resumeGeneratePoints,
    refreshTimeline,
    refreshSvi,
    refreshVisibility,
    displayedWorkTypeSvgs,
  };
  return mapUtils;
};
