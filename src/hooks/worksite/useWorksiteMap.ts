import * as L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import type { Sprite } from 'pixi.js';
import { type Container } from 'pixi.js';
import type { LatLng, HeatLayer, LeafletMouseEvent } from 'leaflet';
import { getMarkerLayer, mapTileLayer, mapAttribution } from '../../utils/map';
import Location from '../../models/Location';
import { i18n } from '../../main';
import useRenderedMarkers from './useRenderedMarkers';
import type { LayerGroup, PixiLayer } from '@/utils/types/map';
import type Worksite from '@/models/Worksite';
import useEmitter from '@/hooks/useEmitter';
import '@/external/Leaflet.GoogleMutant/index';
import { templates } from '@/icons/icons_templates';

export type MapUtils = {
  getMap: () => L.Map;
  getPixiContainer: () => Container | null;
  getCurrentMarkerLayer: () => (L.Layer & PixiLayer) | null;
  removeLayer: (key: string) => void;
  reloadMap: (newMarkers: (Sprite & Worksite)[], visibleIds: string[]) => void;
  addMarkerToMap: (location: LatLng) => void;
  fitLocation: (location: Location) => void;
  jumpToCase: (worksite: Worksite | null, showPopup: boolean) => void;
  applyLocation: (locationId: string, value: boolean) => void;
  applyTeamGeoJson: (teamId: string, value: boolean, geom: any) => void;
  addHeatMap: (points: LatLng[]) => void;
  removeHeatMap: () => void;
  loadMarker: (marker: Sprite & Worksite, index: number) => void;
  hideMarkers: () => void;
  showMarkers: () => void;
};

export default (
  markers: (Sprite & Worksite)[],
  visibleMarkerIds: string[],
  onMarkerClick: (marker: Sprite & Worksite) => void,
  onLoadMarkers: (fn: { workTypes: Record<string, any> }) => void,
  useGoogleMaps = false,
) => {
  let loadMarker: (marker: Sprite & Worksite, index: number) => void = (
    marker,
    index,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) => {};
  const map = L.map('map', {
    zoomControl: false,
  }).fitBounds([
    [17.644_022_027_872_726, -122.783_144_702_938_76],
    [50.792_047_064_406_866, -69.872_988_452_938_74],
  ]);
  if (useGoogleMaps) {
    L.gridLayer.googleMutant({ type: 'roadmap' }).addTo(map);
  } else {
    L.tileLayer(mapTileLayer, {
      attribution: mapAttribution,
      detectRetina: false,
      maxZoom: 18,
      noWrap: false,
    }).addTo(map);
  }

  const removeLayer = (key: string) => {
    map.eachLayer((layer) => {
      if ((layer as L.Layer & PixiLayer).key === key) {
        map.removeLayer(layer);
      }
    });
  };

  function setupMap(
    worksiteMarkers: (Sprite & Worksite)[],
    visibleIds: string[],
  ) {
    removeLayer('marker_layer');
    const worksiteLayer = getMarkerLayer([], map, {});
    worksiteLayer.addTo(map);
    const { workTypes, findMarker, renderMarkerSprite } = useRenderedMarkers(
      map,
      worksiteMarkers,
      visibleIds,
    );
    loadMarker = renderMarkerSprite;
    map.on('click', (e) => {
      const marker = findMarker(e.latlng);
      if (marker) {
        onMarkerClick(marker);
      }
    });

    function addCursor(e: LeafletMouseEvent) {
      const marker = findMarker(e.latlng);
      if (marker) {
        L.DomUtil.addClass(worksiteLayer._container, 'cursor-pointer');
        worksiteLayer._container.setAttribute('title', marker.case_number);
      } else {
        L.DomUtil.removeClass(worksiteLayer._container, 'cursor-pointer');
        worksiteLayer._container.setAttribute('title', '');
      }
    }

    map.on('mousemove', L.Util.throttle(addCursor as any, 32, {}));
    map.panBy([1, 0]);
    return { workTypes, sprites: getPixiContainer()?.children };
  }

  onLoadMarkers(setupMap(markers, visibleMarkerIds));
  const reloadMap = (
    newMarkers: (Sprite & Worksite)[],
    visibleIds: string[],
  ) => {
    if (map) {
      onLoadMarkers(setupMap(newMarkers, visibleIds));
    }
  };

  function getMap() {
    return map;
  }

  function getPixiContainer(): Container | null {
    let container = null;
    map.eachLayer((layer) => {
      if ((layer as L.Layer & PixiLayer).key === 'marker_layer') {
        container = (layer as L.Layer & PixiLayer)._pixiContainer;
      }
    });
    return container;
  }

  function getCurrentMarkerLayer(): (L.Layer & PixiLayer) | null {
    let l: (L.Layer & PixiLayer) | null = null;
    map.eachLayer((layer) => {
      if ((layer as L.Layer & PixiLayer).key === 'marker_layer') {
        l = layer as L.Layer & PixiLayer;
      }
    });
    return l;
  }

  async function addMarkerToMap(location: LatLng) {
    removeLayer('temp_markers');
    const { emitter } = useEmitter();

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

    const marker: L.Marker = L.marker(markerLocation, {
      icon: svgIcon,
      draggable: true,
    });
    markerGroup.addTo(map);
    markerGroup.addLayer(marker);

    marker.on('dragend', function (event) {
      emitter.emit('updatedWorksiteLocation', event.target.getLatLng());
    });

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

  const jumpToCase = async (worksite: Worksite | null, showPopup = true) => {
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
          layer.location_id = locationId;
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

  function addHeatMap(points: LatLng[]) {
    // eslint-disable-next-line import/namespace
    const heatLayer = L.heatLayer(points, {
      radius: 35,
    }).addTo(map);
    (heatLayer as HeatLayer & PixiLayer).key = 'heat_layer';
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
  };
  return mapUtils;
};
