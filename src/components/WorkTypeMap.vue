<template>
    <div class="relative">
      <div
        id="map"
        ref="map"
        class="absolute top-0 left-0 right-0 bottom-0"
      ></div>
    </div>
  </template>
  <!-- <script lang="ts">
  import * as L from 'leaflet';
  import { colors, templates } from '@/icons/icons_templates';
  import { mapAttribution, mapTileLayer } from '../utils/map';
  
  export default {
    name: 'WorkTypeMap',
    props: {
      workTypes: {
        type: Array,
        default: () => {
          return [];
        },
      },
      polygon: {
        type: null,
        default: null,
      },
    },
    setup(props) {
      const markers = ref<Array<unknown>>([]);
      const map = ref<any>(null);
      const mapLoading = ref(false);

      const loadMap = async () => {
        mapLoading.value = true;
  
        markers.value = props.workTypes;
        await renderMap(props.workTypes);
  
        nextTick(() => {
          // Add this slight pan to re-render map
          map.value.panBy([1, 0]);
        });
  
       mapLoading.value = false;
      }

      const renderMap = async (markers) => {
        if (!map.value) {
          map.value = L.map('map', {
            zoomControl: false,
          }).setView([35.7465122599185, -96.41150963125656], 10);
        }
  
        L.tileLayer(mapTileLayer, {
          // tileSize: 512,
          // zoomOffset: -1,
          attribution: mapAttribution,
          detectRetina: false,
          maxZoom: 18,
          noWrap: false,
        }).addTo(map.value);
  
        markers.forEach((wt) => {
          const { coordinates } = wt.location;
          const latLng = L.latLng(coordinates[1], coordinates[0]);
  
          const colorsKey = `${wt.status}_${
            wt.claimed_by ? 'claimed' : 'unclaimed'
          }`;
          const spriteColors = (colors as Record<string, any>)[colorsKey];
          const template = (templates as Record<string, any>)[wt.work_type] || templates.unknown;
          const typeSvg = template
            .replaceAll('{{fillColor}}', spriteColors.fillColor)
            .replaceAll('{{strokeColor}}', spriteColors.strokeColor)
            .replaceAll('{{multiple}}', '');
  
          const iconSettings = {
            mapIconUrl: typeSvg,
            mapIconColor: 'blue',
            mapIconColorInnerCircle: '#fff',
            pinInnerCircleRadius: 48,
          };
  
          const divIcon = L.divIcon({
            className: 'leaflet-data-marker',
            html: L.Util.template(iconSettings.mapIconUrl, iconSettings),
            iconAnchor: [12, 32],
            iconSize: [30, 30],
            popupAnchor: [0, -28],
          });
  
          new L.marker(latLng, { icon: divIcon })?.addTo(map);
          map.panTo(latLng);
        });
  
        map.attributionControl.setPosition('bottomright');
      }

      onMounted(async () => {
        await loadMap();
        if (props.polygon) {
          props.polygon.addTo(map.value);
          map.value.fitBounds(props.polygon.getBounds());
        }
      });
      return {
        markers,
        templates,
        colors,
        map,
        loadMap,
        renderMap,
      };
    },
  };
  </script>
  
  <style>
  @import '~leaflet/dist/leaflet.css';
  
  .leaflet-data-marker svg {
    width: 30px;
    height: 30px;
  }
  </style>
   -->