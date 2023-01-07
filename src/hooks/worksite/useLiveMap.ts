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
import { orderBy, throttle } from 'lodash';
import {
  getMarkerLayer,
  mapTileLayer,
  mapAttribution,
  mapTileLayerDark,
  degreesToRadians,
  randomIntFromInterval,
  findBezierPoints,
  getLiveLayer,
} from '../../utils/map';
import Location from '../../models/Location';
import { i18n } from '../../main';
import { colors, templates } from '@/icons/icons_templates';

export type MapUtils = {
  getMap: Function;
  getPixiContainer: Function;
  getCurrentMarkerLayer: Function;
  removeLayer: Function;
  reloadMap: Function;
  addMarkerToMap: Function;
  fitLocation: Function;
  jumpToCase: Function;
  applyLocation: Function;
  applyTeamGeoJson: Function;
  addHeatMap: Function;
  removeHeatMap: Function;
  loadMarker: Function | undefined;
  hideMarkers: Function | undefined;
  showMarkers: Function | undefined;
  restartLiveEvents: Function | undefined;
  isPaused: boolean | undefined;
  displayedWorkTypeSvgs: Array;
};

export default (
  markers,
  liveEvents,
  incident,
  cadence = 0.03,
  reloadFunction,
  onCardAdded,
  onClearCards,
) => {
  let loadMarker;
  let colorMode = 'dark';
  let currentEventIndex = 0;
  const textureMap = [];
  const displayedWorkTypeSvgs = ref([]);
  const visibleWorkTypes = computed(() => {
    const selectedWorkTypes = displayedWorkTypeSvgs.value
      .filter((s) => s.selected)
      .map((s) => s.key);
    if (selectedWorkTypes.length > 0) {
      return selectedWorkTypes;
    }
    return null;
  });
  const displayedWorkTypes = [];
  const eventsInterval = ref(null);
  const isPaused = ref(false);
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
      if (layer.key === key) {
        map.removeLayer(layer);
      }
    });
  };

  function generatePoints(liveMarkers, markerSpeed) {
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
    const markerSpeed = Number(100 / liveMarkers.length).toFixed(0) * cadence;
    generatePoints(liveMarkers, markerSpeed);
    return undefined;
  };

  function setLegend(createdWorkTypes) {
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

  function getMarkerVisibility(sprite) {
    if (!visibleWorkTypes.value) {
      return true;
    }
    const visible =
      visibleWorkTypes && visibleWorkTypes.value[sprite.workTypeKey]
        ? true
        : false;
    return visible;
  }

  function createCurve(actorMarkerSprite: Sprite, patientMarkerSprite: Sprite) {
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
    const linksGraphics = new Graphics();
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
    linksGraphics.visible = getMarkerVisibility(linksGraphics);
    linksGraphics.moveTo(x1, y1);
    linksGraphics.bezierCurveTo(...linksGraphics.bezierParams);
    linksGraphics.wayPoints = findBezierPoints([
      { x: actorMarkerSprite.x, y: actorMarkerSprite.y },
      { x: x1 + ax1, y: y1 + ay1 },
      { x: x1 + ax1, y: y1 + ay1 },
      { x: patientMarkerSprite.x, y: patientMarkerSprite.y },
    ]);
    linksGraphics.currentPoint = 0;
    return linksGraphics;
  }

  async function generateMarker(liveEventMarkers) {
    if (isPaused.value) {
      return;
    }
    map.eachLayer(async (layer) => {
      if (layer.key === 'live_layer') {
        currentEventIndex++;
        const marker = liveEventMarkers[currentEventIndex];

        if (currentEventIndex > liveEventMarkers.length) {
          currentEventIndex = 0;
          return;
        }

        if (!marker) {
          layer._renderer.render(layer._pixiContainer);
          layer.redraw();
          return;
        }
        const card = {
          classes: 'border w-full h-32 rounded my-2',
          event: marker,
        };
        const markerTemplate = templates.circle;
        let actorMarkerSprite = null;
        let patientMarkerSprite = null;
        if (marker.actor_blurred_location) {
          const actorCoords = layer.utils.latLngToLayerPoint([
            marker.actor_blurred_location.coordinates[1],
            marker.actor_blurred_location.coordinates[0],
          ]);

          const isOrg = (element) =>
            element.name === marker.attr.actor_organization_name;

          // const index = this.organizations.findIndex(isOrg);
          // if (index !== -1) {
          //   this.organizations.unshift(
          //     this.organizations.splice(index, 1)[0],
          //   );
          // }

          actorMarkerSprite = new Sprite();
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
          layer._pixiContainer.addChild(actorMarkerSprite);
        }

        if (
          marker.recipient_blurred_location ||
          marker.patient_blurred_location
        ) {
          const location = marker[`${marker.map_destination}_blurred_location`];
          const patientCoords = layer.utils.latLngToLayerPoint([
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

          patientMarkerSprite = new Sprite();
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

          layer._pixiContainer.addChild(patientMarkerSprite);
        }

        layer._renderer.render(layer._pixiContainer);
        layer.redraw();

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
            layer._pixiContainer.addChild(linksGraphics);
            layer._renderer.render(layer._pixiContainer);
            layer.redraw();
          }, 50);
        }

        onCardAdded(card);
      }
    });
  }

  function addMarker(marker, index) {
    map.eachLayer((layer) => {
      try {
        if (layer.key === 'marker_layer') {
          const markerTemplate = templates.circle;
          let patientMarkerSprite = null;
          if (
            marker.recipient_blurred_location ||
            marker.patient_blurred_location
          ) {
            const location =
              marker[`${marker.map_destination}_blurred_location`];
            const patientCoords = layer.utils.latLngToLayerPoint([
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

            patientMarkerSprite = new Sprite();
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

            layer._pixiContainer.addChild(patientMarkerSprite);
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  function setupMap(worksiteMarkers, liveEventMarkers) {
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
  const reloadMap = (markers, liveEvents) => {
    if (map) {
      setupMap(markers, liveEvents);
      setLegend([...displayedWorkTypes]);
    }
  };

  function getMap() {
    return map;
  }

  function getPixiContainer(): Container | undefined {
    let container = null;
    map.eachLayer((layer) => {
      if (layer.key === 'marker_layer') {
        container = layer._pixiContainer;
      }
    });
    return container;
  }

  function getCurrentMarkerLayer() {
    let l = null;
    map.eachLayer((layer) => {
      if (layer.key === 'marker_layer') {
        l = layer;
      }
    });
    return l;
  }

  async function addMarkerToMap(location) {
    let markerLocation = location;
    const container = getPixiContainer() as any;
    if (!markerLocation) {
      markerLocation = map.getCenter();
    }

    const markerGroup = L.layerGroup();
    markerGroup.key = 'temp_markers';

    const marker = new L.marker(markerLocation, { draggable: 'true' });
    markerGroup.addTo(map);
    markerGroup.addLayer(marker);

    container.visible = false;
    map.setView([markerLocation.lat, markerLocation.lng], 15);
    marker
      .bindTooltip(i18n.global.t('casesVue.drag_pin_to_correct_location'), {
        direction: 'top',
      })
      .openTooltip();
    setTimeout(() => {
      container.visible = true;
      map.panBy([1, 0]);
    }, 400);
  }

  function fitLocation(location) {
    if (map) {
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
      map.fitBounds(polygon.getBounds());
    }
  }

  const jumpToCase = async (worksite, showPopup = true) => {
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

  async function applyLocation(locationId, value) {
    if (value && map) {
      await Location.api().fetchById(locationId);
      const location = Location.find(locationId) as any;
      const geojsonFeature = {
        type: 'Feature',
        properties: location?.attr,
        geometry: location?.poly || location?.geom || location?.point,
      };
      const polygon = L.geoJSON(geojsonFeature, {
        weight: '1',
        onEachFeature(feature, layer) {
          layer.location_id = locationId;
        },
      });
      polygon.addTo(map);
      map.fitBounds(polygon.getBounds());
    } else {
      map.eachLayer((layer) => {
        if (layer.location_id && layer.location_id === locationId) {
          map.removeLayer(layer);
        }
      });
    }
  }

  async function applyTeamGeoJson(teamId, value, geom) {
    if (value && map) {
      const geojsonFeature = {
        type: 'Feature',
        properties: {},
        geometry: geom,
      };
      const polygon = L.geoJSON(geojsonFeature, {
        weight: '1',
        onEachFeature(_, layer) {
          layer.location_id = teamId;
        },
      });
      polygon.addTo(map);
      map.fitBounds(polygon.getBounds());
    } else {
      map.eachLayer((layer) => {
        if (layer.location_id && layer.location_id === teamId) {
          map.removeLayer(layer);
        }
      });
    }
  }

  function addHeatMap(points) {
    const heatLayer = L.heatLayer(points, { radius: 35 }).addTo(map);
    heatLayer.key = 'heat_layer';
  }

  function removeHeatMap() {
    removeLayer('heat_layer');
  }

  function hideMarkers() {
    const currentMarkerLayer = getCurrentMarkerLayer();
    if (currentMarkerLayer) {
      currentMarkerLayer._pixiContainer.visible = false;
      map.panBy([1, 0]);
    }
  }

  function showMarkers() {
    const currentMarkerLayer = getCurrentMarkerLayer();
    if (currentMarkerLayer) {
      currentMarkerLayer._pixiContainer.visible = true;
      map.panBy([1, 0]);
    }
  }

  function refreshTimeline(index) {
    map.eachLayer((layer) => {
      if (layer.key === 'marker_layer' || layer.key === 'live_layer') {
        const container = layer._pixiContainer;
        for (const markerSprite of container.children) {
          markerSprite.visible = markerSprite.index <= index;
        }

        layer._renderer.render(container);
        layer.redraw();
      }
    });
  }

  function refreshSvi(value) {
    map.eachLayer((layer) => {
      if (layer.key === 'marker_layer' || layer.key === 'live_layer') {
        const container = layer._pixiContainer;
        const sviList = container.children.map((marker) => {
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
        for (const markerSprite of container.children) {
          markerSprite.visible = markerSprite.svi > minSvi;
        }

        layer._renderer.render(container);
        layer.redraw();
      }
    });
  }

  function refreshVisibility() {
    map.eachLayer((layer) => {
      if (layer.key === 'marker_layer' || layer.key === 'live_layer') {
        const container = layer._pixiContainer;
        for (const markerSprite of container.children) {
          markerSprite.visible = getMarkerVisibility(markerSprite);
        }

        layer._renderer.render(container);
        layer.redraw();
      }
    });
  }

  setupMap(markers, liveEvents);
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
    addHeatMap,
    removeHeatMap,
    loadMarker,
    hideMarkers,
    showMarkers,
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
