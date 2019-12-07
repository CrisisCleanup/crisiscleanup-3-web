<template>
    <a-spin :spinning="mapLoading" class="fullsize-map" style="position: relative;">
        <div class="flex flex-col" style="z-index: 1001; position: absolute; top: 90px; left: 10px">
            <base-button text="" title="Go to Incident" :action="goToIncidentCenter" icon="search-minus" class="w-8 h-8 border-2 my-1 bg-white"/>
            <base-button v-tooltip="{
                            content: 'Zoom to make icons interactive',
                            show: showInteractivePopover,
                            trigger: 'manual',
                            autoHide: true,
                            classes: 'interactive-tooltip',
                            placement: 'right-start',
                          }" text="" title="Go to Interactive" icon="search-plus" :action="goToInteractive"
                         class="w-8 h-8 border-2 my-1 bg-white"/>
            <base-button text="" icon="search-location" :action="goToLocal" class="w-8 h-8 border-2 my-1 bg-white"/>
        </div>
        <div class="home-map" ref="map"></div>
    </a-spin>
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

    import {Container, Loader, Sprite, Texture} from 'pixi.js'
    import * as PIXI from 'pixi.js'
    import * as L from 'leaflet';
    import 'leaflet-loading';
    import 'leaflet.gridlayer.googlemutant';
    import 'leaflet-pixi-overlay'
    import 'leaflet.heat'
    import {solveCollision} from '@/utils/easing';
    import User from "@/models/User";
    import { averageGeolocation } from "@/utils/map";
    import * as moment from 'moment';
    import WorkType from '@/models/WorkType';
    import Status from '@/models/Status';

    L.Icon.Default.imagePath = '.';
    // OR
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    const colors_dict = {
        "open_unassigned": 0xbc0000,
        "open_assigned": 0xd02417,
        "open_partially-completed": 0x22516,
        "open_needs-follow-up": 0xd52417,
        "open_unresponsive": 0x787878,
        "closed_completed": 0x52c41a,
        "closed_partially-completed": 0xFF0000,
        "closed_incomplete": 0x1c1c1c,
        "closed_out-of-scope": 0x767676,
        "closed_done-by-others": 0x008200,
        "closed_no-help-wanted": 0xFF0000,
        "closed_rejected": 0xFF0000,
        "closed_duplicate": 0xFF0000,
        "closed_marked-for-deletion": 0xFF0000
    };

    const getOpacity = (date) => {
        // let opacity_buckets = [100, 75, 60, 35, 20, 10]
        let opacity_buckets = [100, 85, 70, 45, 30, 20]
        const today = moment();
        const sixty_days_ago = moment().subtract(60, 'days');

        let currentDate = moment(date)
        // if (currentDate.isBefore(sixty_days_ago)) {
        //     return 0.1;
        // }

        let spread = today.unix() - sixty_days_ago.unix();
        let percentage = ((currentDate.unix() - sixty_days_ago.unix()) / spread * 100.0)

        const closestOpacity = opacity_buckets.reduce((prev, curr) => Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev);
        // return closestOpacity / 100;
        return 1;
    };

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
                }),
                mapLoading: false,
                markerLayer: L.layerGroup(),
                markers: [],
                showInteractivePopover: false,
                loader: new Loader()
            }
        },
        computed: {
            currentUser() {
                return User.find(this.$store.getters['auth/userId'])
            },
            workTypeList() {
                return WorkType.all().map(type =>type.key)
            },
            statusList() {
                return Status.all().map(status => status.status)
            },
            iconsList() {
                let iconsList = [];
                for (let work_type of this.workTypeList) {
                    for (let status of this.statusList) {
                        for (let claimed_status of ['claimed', 'unclaimed']) {
                            iconsList.push(`${work_type}_${status}_${claimed_status}`);
                        }
                    }
                }
                return iconsList;
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
                this.$emit('initMap', this.map);
                this.map.on('moveend', () => {
                    this.$emit('mapMoved', this.map.getBounds());
                    this.showInteractivePopover = false;
                });
                if (this.currentUser.states && this.currentUser.states.mapViewPort) {
                    let {_northEast, _southWest} = this.currentUser.states.mapViewPort;
                    this.map.fitBounds([
                        [_northEast.lat, _northEast.lng],
                        [_southWest.lat, _southWest.lng]
                    ]);
                }
                this.tileLayer.addTo(this.map);
                this.markerLayer.addTo(this.map);
                this.pullSites();
            },
            goToIncidentCenter() {
                let center = averageGeolocation(this.markers.map(marker => [marker.position.lat, marker.position.lng]))
                this.map.setView([center.latitude, center.longitude], 6);
                this.showInteractivePopover = false;
            },
            goToInteractive() {
                let center = averageGeolocation(this.markers.map(marker => [marker.position.lat, marker.position.lng]))
                this.map.setView([center.latitude, center.longitude], 12);
                this.showInteractivePopover = false;
            },
            goToLocal() {
                let center = averageGeolocation(this.markers.map(marker => [marker.position.lat, marker.position.lng]))
                this.map.setView([center.latitude, center.longitude], 15);
                this.showInteractivePopover = false;
            },
            addWorksite(location) {
                this.markerLayer.clearLayers();
                new L.marker(location).addTo(this.markerLayer);
                this.map.setView([location.lat, location.lng], 15);
            },
            loadMarkersOnMap: function (markers) {
                this.mapLoading = true;
                let map = this.map;
                let loader = this.loader;
                loader.add('marker', 'marker-icon.png');
                loader.add('fire', 'fire.svg');
                loader.add('garbage', 'trash.svg');
                loader.add('landslide', 'landslide.svg');
                loader.add('boot', 'boot.svg');
                loader.add('tent', 'tent-32.png');
                loader.add('tree', 'tree.svg');
                loader.add('fan', 'fan.svg');
                loader.add('broom', 'broom.svg');
                loader.add('dot', 'white-circle.svg');
                // for (let icon of this.iconsList.filter(i => !PIXI.utils.TextureCache[`map_icons/${i}.svg`])) {
                //     loader.add(icon, `map_icons/${icon}.svg`);
                // }
                let self = this;
                loader.load(function (loader, resources) {
                    let mapping = {
                        'muck_out': resources.boot.texture,
                        'trees': resources.tree.texture,
                        'tarp': resources.tent.texture,
                        'debris': resources.garbage.texture,
                        'fire': resources.fire.texture,
                        'mold_remediation': resources.fire.texture,
                        'rebuild': resources.tree.texture,
                        'landslide': resources.landslide.texture,
                        'ash': resources.broom.texture,
                    };
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
                            let invScale = 0.65 / scale;
                            if (firstDraw) {
                                prevZoom = zoom;
                                markers.forEach(function (marker) {
                                    let coords = project([marker.position.lat, marker.position.lng]);
                                    // let markerSprite = new Sprite(mapping[marker.work_types[0].work_type] || resources.marker.texture);
                                    let markerSprite = new Sprite();
                                    let work_type = marker.work_types[0];
                                    const textureKey = `${work_type.work_type}_${work_type.status}_${work_type.claimed_by ? 'claimed': 'unclaimed'}`;
                                    let texture = PIXI.utils.TextureCache[`map_icons/${textureKey}.svg`];
                                    if (!texture) {
                                        texture = Texture.from(`map_icons/${textureKey}.svg`)
                                    }
                                    if (work_type && texture) {
                                        markerSprite.texture = texture;
                                    } else {
                                        markerSprite.texture = PIXI.utils.TextureCache[`unknown_${work_type.status}_${work_type.claimed_by ? 'claimed': 'unclaimed'}`];
                                    }
                                    markerSprite.tint = colors_dict[marker.work_types[0].status];
                                    markerSprite.x = coords.x;
                                    markerSprite.y = coords.y;
                                    markerSprite.x0 = coords.x;
                                    markerSprite.y0 = coords.y;
                                    markerSprite.anchor.set(0.5, 0.5);
                                    markerSprite.alpha = getOpacity(marker.updated_at);
                                    container.addChild(markerSprite);
                                    markerSprites.push(markerSprite);
                                    markerSprite.legend = marker.city || marker.label;
                                    markerSprite.data = marker;
                                    // markerSprite.interactive = true;
                                    // markerSprite.cursor = 'pointer';
                                    // markerSprite.name = marker.case_number;
                                    // markerSprite.on('click', () => {
                                    //     self.onSelectmarker(marker);
                                    // });
                                });

                                let quadTrees = {};
                                for (let z = 12; z <= map.getMaxZoom(); z++) {
                                    let rInit = ((z <= 7) ? 16 : 24) / utils.getScale(z);
                                    quadTrees[z] = solveCollision(markerSprites, {r0: rInit, zoom: z});
                                }
                                const findMarker = (ll) => {
                                    if (utils.getMap().getZoom() < 12) {
                                        return null;
                                    }
                                    let layerPoint = project(ll);
                                    let quadTree = quadTrees[utils.getMap().getZoom()];
                                    let marker;
                                    let rMax = quadTree.rMax;
                                    let found = false;
                                    quadTree.visit(function (quad, x1, y1, x2, y2) {
                                        if (!quad.length) {
                                            let dx = quad.data.x - layerPoint.x;
                                            let dy = quad.data.y - layerPoint.y;
                                            let r = quad.data.scale.x * 16;
                                            if (dx * dx + dy * dy <= r * r) {
                                                marker = quad.data;
                                                found = true;
                                            }
                                        }
                                        return found || x1 > layerPoint.x + rMax || x2 + rMax < layerPoint.x || y1 > layerPoint.y + rMax || y2 + rMax < layerPoint.y;
                                    });
                                    return marker;
                                };

                                // let popup = L.popup({className: 'pixi-popup'})

                                map.on('click', function (e) {
                                    let marker = findMarker(e.latlng);
                                    if (marker) {
                                        self.onSelectmarker(marker.data)
                                        // popup.setLatLng(e.latlng)
                                        //     .setContent(`<b>${marker.data.case_number}</b>`).openOn(map);
                                    } else {
                                        map.closePopup();
                                    }

                                    if (utils.getMap().getZoom() < 12) {
                                        self.showInteractivePopover = true;
                                    }
                                });

                                map.on('mousemove', L.Util.throttle((e) => {
                                    let marker = findMarker(e.latlng);
                                    if (marker) {
                                        L.DomUtil.addClass(this._container, 'cursor-pointer');
                                    } else {
                                        L.DomUtil.removeClass(this._container, 'cursor-pointer');
                                    }
                                }, 32));
                            }
                            if (firstDraw || prevZoom !== zoom) {
                                markerSprites.forEach(function (markerSprite) {
                                    if (zoom < 12) {
                                        markerSprite.texture = resources.dot.texture
                                    } else {
                                        let work_type = markerSprite.data.work_types[0];
                                        const textureKey = `${work_type.work_type}_${work_type.status}_${work_type.claimed_by ? 'claimed': 'unclaimed'}`;
                                        let texture = PIXI.utils.TextureCache[`map_icons/${textureKey}.svg`];
                                        if (!texture) {
                                            texture = Texture.from(`map_icons/${textureKey}.svg`)
                                        }
                                        if (work_type && texture) {
                                            markerSprite.texture = texture;
                                        } else {
                                            markerSprite.texture = Texture.from[`map_icons/unknown_${work_type.status}_${work_type.claimed_by ? 'claimed': 'unclaimed'}.svg`];
                                        }
                                    }
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
                this.mapLoading = true;
                let response = await this.$http
                    .get(url || `${process.env.VUE_APP_API_BASE_URL}/worksites_all`, {
                        params: url ? {} : {...this.query}
                    });

                this.markers = response.data.results.map((worksite) => {
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
                this.mapLoading = false;
            }
        },
        watch: {
            newMarker() {
                this.addWorksite(this.newMarker)
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

    .interactive-tooltip {
        display: block !important;
        z-index: 10000;
    }

    .interactive-tooltip .tooltip-inner {
        background: black;
        color: white;
        border-radius: 16px;
        padding: 5px 10px 4px;
    }

    .interactive-tooltip .tooltip-arrow {
        width: 0;
        height: 0;
        border-style: solid;
        position: absolute;
        margin: 5px;
        border-color: black;
        z-index: 1;
    }

    .interactive-tooltip[x-placement^="top"] {
        margin-bottom: 5px;
    }

    .interactive-tooltip[x-placement^="top"] .tooltip-arrow {
        border-width: 5px 5px 0 5px;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-bottom-color: transparent !important;
        bottom: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
    }

    .interactive-tooltip[x-placement^="bottom"] {
        margin-top: 5px;
    }

    .interactive-tooltip[x-placement^="bottom"] .tooltip-arrow {
        border-width: 0 5px 5px 5px;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-top-color: transparent !important;
        top: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
    }

    .interactive-tooltip[x-placement^="right"] {
        margin-left: 5px;
    }

    .interactive-tooltip[x-placement^="right"] .tooltip-arrow {
        border-width: 5px 5px 5px 0;
        border-left-color: transparent !important;
        border-top-color: transparent !important;
        border-bottom-color: transparent !important;
        left: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
    }

    .interactive-tooltip[x-placement^="left"] {
        margin-right: 5px;
    }

    .interactive-tooltip[x-placement^="left"] .tooltip-arrow {
        border-width: 5px 0 5px 5px;
        border-top-color: transparent !important;
        border-right-color: transparent !important;
        border-bottom-color: transparent !important;
        right: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
    }

    .interactive-tooltip.popover .popover-inner {
        background: #f9f9f9;
        color: black;
        padding: 24px;
        border-radius: 5px;
        box-shadow: 0 5px 30px rgba(black, 0.1);
    }

    .interactive-tooltip.popover .popover-arrow {
        border-color: #f9f9f9;
    }

    .interactive-tooltip[aria-hidden='true'] {
        visibility: hidden;
        opacity: 0;
        transition: opacity .15s, visibility .15s;
    }

    .interactive-tooltip[aria-hidden='false'] {
        visibility: visible;
        opacity: 1;
        transition: opacity .15s;
    }
</style>
