import * as L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import { type Container } from 'pixi.js';
import { useI18n } from 'vue-i18n';
import { getMarkerLayer, mapTileLayer, mapAttribution } from '../../utils/map';
import Location from '../../models/Location';
import useRenderedMarkers from './useRenderedMarkers';

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
};

export default (
  markers,
  visibleMarkerIds,
  onMarkerClick,
  onLoadMarkers,
  useGoogleMaps = false,
) => {
  let loadMarker;
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

  const removeLayer = (key) => {
    map.eachLayer((layer) => {
      if (layer.key === key) {
        map.removeLayer(layer);
      }
    });
  };

  function setupMap(worksiteMarkers, visibleIds) {
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

    map.on(
      'mousemove',
      L.Util.throttle((e) => {
        const marker = findMarker(e.latlng);
        if (marker) {
          L.DomUtil.addClass(worksiteLayer._container, 'cursor-pointer');
          worksiteLayer._container.setAttribute('title', marker.case_number);
        } else {
          L.DomUtil.removeClass(worksiteLayer._container, 'cursor-pointer');
          worksiteLayer._container.setAttribute('title', '');
        }
      }, 32),
    );
    map.panBy([1, 0]);
    return { workTypes };
  }

  onLoadMarkers(setupMap(markers, visibleMarkerIds));

  const reloadMap = (newMarkers, visibleIds) => {
    if (map) {
      onLoadMarkers(setupMap(newMarkers, visibleIds));
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
      .bindTooltip(useI18n().t('casesVue.drag_pin_to_correct_location'), {
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
  };
  return mapUtils;
};
