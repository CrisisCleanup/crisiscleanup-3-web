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

    import {Container, Loader, Sprite} from 'pixi.js'
    import * as L from 'leaflet';
    import 'leaflet-loading';
    import 'leaflet.gridlayer.googlemutant';
    import 'leaflet-pixi-overlay'
    import 'leaflet.heat'

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
            newMarker: Function,
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
                markerLayer: L.layerGroup(),
                markers: [],
            }
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
                this.markerLayer.addTo(this.map);
                this.pullSites();
            },
            addWorksite(location) {
                this.markerLayer.clearLayers();
                new L.marker(location).addTo(this.markerLayer);
                this.map.setView([location.lat, location.lng], 15);
            },
            loadMarkersOnMap: function (markers) {
                let loader = new Loader();
                let map = this.map;
                loader.add('marker', 'marker-icon.png');
                loader.add('fire', 'flame.png');
                loader.add('garbage', 'garbage.png');
                loader.add('boot', 'rubber.png');
                loader.add('tent', 'tent.png');
                loader.add('tree', 'tree.png');
                let self = this;
                loader.load(function (loader, resources) {
                    let textures = [resources.fire.texture, resources.marker.texture, resources.garbage.texture, resources.boot.texture, resources.tent.texture, resources.tree.texture];
                    let pixiLayer = (function () {
                        let firstDraw = true;
                        let prevZoom;
                        let markerSprites = [];
                        let frame = null;
                        let pixiContainer = new Container();
                        let doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                        return L.pixiOverlay(function (utils) {
                            let zoom = utils.getMap().getZoom();
                            if (frame) {
                                cancelAnimationFrame(frame);
                                frame = null;
                            }
                            let container = utils.getContainer();
                            let renderer = utils.getRenderer();
                            let project = utils.latLngToLayerPoint;
                            let scale = utils.getScale();
                            let invScale = 1 / scale;
                            if (firstDraw) {
                                prevZoom = zoom;
                                let popup = L.popup({className: 'pixi-popup'})
                                markers.forEach(function (marker) {
                                    let coords = project([marker.position.lat, marker.position.lng]);
                                    let index = Math.floor(Math.random() * textures.length);
                                    let markerSprite = new Sprite(textures[index]);
                                    markerSprite.interactive = true;
                                    markerSprite.cursor = 'pointer';
                                    markerSprite.name = marker.case_number;
                                    markerSprite.on('click', () => {
                                        self.onSelectmarker(marker);
                                        popup.setContent(`<b>${marker.case_number}</b>`).openOn(utils.getMap());
                                    });
                                    markerSprite.textureIndex = index;
                                    markerSprite.x = coords.x;
                                    markerSprite.y = coords.y;
                                    markerSprite.x0 = coords.x;
                                    markerSprite.y0 = coords.y;
                                    markerSprite.anchor.set(0.5, 0.5);
                                    container.addChild(markerSprite);
                                    markerSprites.push(markerSprite);
                                    markerSprite.legend = marker.city || marker.label;
                                    markerSprite.data = marker;
                                });
                            }
                            if (firstDraw || prevZoom !== zoom) {
                                markerSprites.forEach(function (markerSprite) {
                                    if (firstDraw) {
                                        markerSprite.scale.set(invScale);
                                    } else {
                                        markerSprite.currentScale = markerSprite.scale.x;
                                        markerSprite.targetScale = invScale;
                                    }
                                });
                            }

                            let start = null;
                            let delta = 250;

                            function animate(timestamp) {
                                let progress;
                                if (start === null) start = timestamp;
                                progress = timestamp - start;
                                let lambda = progress / delta;
                                if (lambda > 1) lambda = 1;
                                lambda = lambda * (0.4 + lambda * (2.2 + lambda * -1.6));
                                markerSprites.forEach(function (markerSprite) {
                                    markerSprite.scale.set(markerSprite.currentScale + lambda * (markerSprite.targetScale - markerSprite.currentScale));
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
                            renderer.render(container);


                        }, pixiContainer, {
                            doubleBuffering: doubleBuffering,
                            reloadOnAdd: true
                        });
                    })();
                    pixiLayer.addTo(map);
                });
            },
            async pullSites(url) {
                let response = await this.$http
                    .get(url || "http://api.staging.crisiscleanup.io/worksites_map", {
                        params: url ? {} : {...this.query, limit: 5000, fields: 'id,location'}
                    });

                this.markers = response.data.map((worksite) => {
                    return {
                        ...worksite,
                        position: {
                            lat: worksite.location ? worksite.location.coordinates[1] : 10,
                            lng: worksite.location ? worksite.location.coordinates[0] : 10,
                        }
                    }
                });

                this.$log.debug(`Loading ${this.markers.length} markers`)

                this.loadMarkersOnMap(this.markers);
            }
        },
        watch: {
            newMarker() {
                this.addWorksite(this.newMarker)
            }
        }
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
