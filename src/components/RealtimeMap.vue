<template>
    <div class="fullsize-map" style="position: relative;">
        <div class="home-map" ref="map">
        </div>
    </div>
</template>
<style>

    html, body {
        height: 100%;
        width: 100%;
    }

    .fullsize-map {
        height: 100vh;
        width: 100%;
    }
</style>

<script>

    import * as L from 'leaflet';
    import 'leaflet-loading';
    import 'leaflet.gridlayer.googlemutant';
    import 'leaflet.markercluster'

    L.Icon.Default.imagePath = '.';
    // OR
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    export default {
        props: {
            query: Object,
            onSelectmarker: Function,
        },
        data() {
            return {
                ready: false,
                points: [],
                autoplay: true,
                mapTimers: [],
                tileLayer: L.tileLayer('https://api.pitneybowes.com/location-intelligence/geomap/v1/tile/osm/{z}/{x}/{y}.png?api_key={api_key}', {
                    api_key: process.env.VUE_APP_PITNEYBOWES_API_KEY,
                    maxZoom: 18,
                    attribution: '<a class="leaflet-attribution" target="_blank" href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>',
                }),
            };
        },
        mounted() {
            const options = {
                center: L.latLng(39, -90),
                zoom: 4,
                loadingControl: true,
                preferCanvas: true
            };
            this.initMap(options);
            this.ready = true;
        },
        methods: {
            initMap(options) {
                this.map = L.map(this.$refs.map, options);
                this.tileLayer.addTo(this.map);
                this.pullSites();
            },
            async pullSites(url) {
              let response = await this.$http
                    .get(url || "http://api.staging.crisiscleanup.io/worksites_map", {
                        params: url ? {} : {...this.query, limit: 5000, fields: 'id,location'}
                    });

                let markers = response.data.map((worksite) => {
                    return {
                        ...worksite,
                        position: {
                            lat: worksite.location ? worksite.location.coordinates[1]: 10,
                            lng: worksite.location ? worksite.location.coordinates[0]: 10,
                        }
                    }
                });

                var cluster = L.markerClusterGroup({
                    // disableClusteringAtZoom: 10,
                    // spiderfyOnMaxZoom: false
                });

                for (let marker of markers) {
                    let item = L.marker(marker.position);
                    item.on("click", () => {
                        this.onSelectmarker(marker)
                    });
                    cluster.addLayer(item)
                }
                this.map.addLayer(cluster)
            }
        },
    };
</script>

<style>
    @import "~leaflet/dist/leaflet.css";
    @import "~leaflet-loading/src/Control.Loading.css";
    @import "~leaflet.markercluster/dist/MarkerCluster.Default.css";
    @import "~leaflet.markercluster/dist/MarkerCluster.css";

    .home-map {
        height: 100%;
    }
    .leaflet-pane {
        z-index: 5;
    }
</style>
