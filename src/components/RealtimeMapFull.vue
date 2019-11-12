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

    import { Loader, Container, Sprite } from 'pixi.js'
    import * as L from 'leaflet';
    import 'leaflet-loading';
    import 'leaflet.gridlayer.googlemutant';
    import 'leaflet-pixi-overlay'
    import 'leaflet.heat'
    import { solveCollision } from '@/utils/easing'
    import { scaleLinear } from 'd3-scale'

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
            query: Array
        },
        data() {
            return {
                ready: false,
                points: [],
                autoplay: true,
                mapTimers: [],
                // tileLayer: L.tileLayer('https://api.pitneybowes.com/location-intelligence/geomap/v1/tile/osm/{z}/{x}/{y}.png?api_key={api_key}', {
                //     api_key: process.env.VUE_APP_PITNEYBOWES_API_KEY,
                //     maxZoom: 18,
                //     attribution: '<a class="leaflet-attribution" target="_blank" href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>',
                // }),
                tileLayer: L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
                    "attribution": "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, &copy; <a href=\"http://cartodb.com/attributions\">CartoDB</a>",
                    "detectRetina": false,
                    "maxZoom": 18,
                    "noWrap": false,
                    "subdomains": "abc"
                }),
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

                let loader = new Loader();
                let map = this.map;
                loader.add('marker', 'marker-icon.png');
                loader.add('fire', 'flame.png');
                loader.add('garbage', 'garbage.png');
                loader.add('boot', 'rubber.png');
                loader.add('tent', 'tent.png');
                loader.add('tree', 'tree.png');
                let mapping = {
                    'muck_out': 'boot',
                    'trees': 'tree',
                    'tarp': 'tent',
                    'debris': 'garbage',
                    'fire': 'fire'
                };
                loader.load(function(loader, resources) {
                    var textures = [resources.fire.texture, resources.marker.texture, resources.garbage.texture, resources.boot.texture, resources.tent.texture, resources.tree.texture];
                    var pixiLayer = (function() {
                        var firstDraw = true;
                        var prevZoom;
                        var markerSprites = [];
                        var frame = null;
                        var pixiContainer = new Container();
                        var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                        return L.pixiOverlay(function(utils) {
                            var zoom = utils.getMap().getZoom();
                            if (frame) {
                                cancelAnimationFrame(frame);
                                frame = null;
                            }
                            var container = utils.getContainer();
                            var renderer = utils.getRenderer();
                            var project = utils.latLngToLayerPoint;
                            var scale = utils.getScale();
                            var invScale = 1 / scale;
                            if (firstDraw) {
                                prevZoom = zoom;
                                markers.forEach(function(marker) {
                                    var coords = project([marker.position.lat, marker.position.lng]);
                                    var index = Math.floor(Math.random() * textures.length);
                                    var markerSprite = new Sprite(textures[index]);
                                    markerSprite.textureIndex = index;
                                    markerSprite.x = coords.x;
                                    markerSprite.y = coords.y;
                                    markerSprite.anchor.set(0.5, 0.5);
                                    container.addChild(markerSprite);
                                    markerSprites.push(markerSprite);
                                    markerSprite.legend = marker.city || marker.label;
                                });
                            }
                            if (firstDraw || prevZoom !== zoom) {
                                markerSprites.forEach(function(markerSprite) {
                                    if (firstDraw) {
                                        markerSprite.scale.set(invScale);
                                    } else {
                                        markerSprite.currentScale = markerSprite.scale.x;
                                        markerSprite.targetScale = invScale;
                                    }
                                });
                            }

                            var start = null;
                            var delta = 250;
                            function animate(timestamp) {
                                var progress;
                                if (start === null) start = timestamp;
                                progress = timestamp - start;
                                var lambda = progress / delta;
                                if (lambda > 1) lambda = 1;
                                lambda = lambda * (0.4 + lambda * (2.2 + lambda * -1.6));
                                markerSprites.forEach(function(markerSprite) {
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
                            doubleBuffering: doubleBuffering
                        });
                    })();
                    pixiLayer.addTo(map);
                });
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
