<template>
    <div class="flex h-full overflow-hidden">
        <div :class="{'w-4/5': currentIncident && currentWorksite, 'w-full': !currentWorksite}">
            <div class="flex flex-col h-full">
                <div style="background-color: white" class="p-3 border border-gray-300 card-header">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <ccu-icon alt="Toggle Map View" size="medium" class="mr-4 cursor-pointer" :class="showingMap ? 'filter-yellow' : 'filter-gray'" type="map" @click.native="toggleView('showingMap')" />
                            <ccu-icon alt="Toggle Table View" size="medium" class="mr-4 cursor-pointer" :class="showingTable ? 'filter-yellow' : 'filter-gray'" type="table" @click.native="toggleView('showingTable')" />
                            <span class="font-thin" v-if="totalWorksites">
                                <span v-if="pagination.total === totalWorksites">
                                    Cases: {{pagination.total | numeral('0,0')}}
                                </span>
                                <span v-else>
                                    Cases: {{pagination.total | numeral('0,0')}} of {{totalWorksites| numeral('0,0')}}
                                </span>
                            </span>
                            <div class="flex justify-start w-auto">
                                <WorksiteSearchInput @selectedExisting="handleChange" width="300px"
                                                 @search="onSearch" icon="search"
                                                 :suggestions="[{name:'worksites', data: searchWorksites || [], key: 'name' }]"
                                                 display-property="name" placeholder="Search" size="medium" class="mx-2"/>
                            </div>
                        </div>
                        <div class="flex worksite-actions" style="color: #4c4c4d">
                            <base-dropdown class-name="layers-dropdown">
                                <base-button slot="btn" class="text-base font-thin mx-4" text="Layers" icon="layer-group"/>
                                <template slot="body">
                                    <ul class="text-base">
<!--                                        <li class="py-2">-->
<!--                                            <base-checkbox @input="(value) => { applyLayers(value, floodZone, 'flood') }">Flood Damage</base-checkbox>-->
<!--                                        </li>-->
<!--                                        <li class="py-2">-->
<!--                                            <base-checkbox @input="(value) => { applyLocation(81828, value) }">Incident Extent</base-checkbox>-->
<!--                                        </li>-->
<!--                                        <li class="py-2">-->
<!--                                            <base-checkbox @input="(value) => { applyLocation(81829, value) }">Track of Tornado</base-checkbox>-->
<!--                                        </li>-->
<!--                                        <hr>-->
                                        Standard Layers
                                        <li class="py-2">
                                            <base-dropdown :trigger="'hover'" :role="'sublist'" :align="'right'">
                                                <template slot="btn">US States</template>
                                                <template slot="body">
                                                    <ul class="h-64 overflow-auto">
                                                        <li v-for="state in usStates">
                                                            <base-checkbox @input="(value) => { applyLocation(state.id, value) }" :value="appliedLocations.has(state.id)">{{state.name}}</base-checkbox>
                                                        </li>
                                                    </ul>
                                                </template>
                                            </base-dropdown>
                                        </li>
                                        <li class="py-2">
                                            <base-dropdown :trigger="'hover'" :role="'sublist'" :align="'right'">
                                                <template slot="btn">Congressional Districts</template>
                                                <template slot="body">
                                                    <ul class="h-64 overflow-auto">
                                                        <li v-for="district in districts">
                                                            <base-checkbox @input="(value) => { applyLocation(district.id, value) }" :value="appliedLocations.has(district.id)">{{district.name}}</base-checkbox>
                                                        </li>
                                                    </ul>
                                                </template>
                                            </base-dropdown>
                                        </li>
                                    </ul>
                                </template>
                            </base-dropdown>
                            <base-button class="text-base font-thin mx-4" icon="sliders-h" alt="Filters" :action="() => { this.showingFilters = true }">
                                Filters <span class="rounded-full mx-2 px-1 bg-yellow-500 text-xs" v-if="filtersCount > 0">{{filtersCount}}</span>
                            </base-button>
                            <base-button class="text-base font-thin mx-4" text="" icon="ellipsis-h" :action="() => { this.showingFilters = true }"/>
                            <WorksiteFilters v-if="showingFilters" :current-filters="filters" @closedFilters="showingFilters = false" @updatedFilters="onUpdatedFilters" :incident="this.currentIncident"/>
                        </div>

                    </div>
                </div>
                <div class="flex-grow bg-gray-100" style="display: grid">
                    <template v-if="showingMap">
                        <WorksiteMap class="w-full h-full" @mapMoved="onMapMoved" @initMap="onInitMap"
                                     :query="currentQuery" @onSelectmarker="displayWorksite" :new-marker="newMarker"
                                     :key="JSON.stringify(currentQuery)" :current-filters="filters" ref="workstiteMap"/>
                    </template>
                    <template v-if="showingTable">
                        <div class="p-3">
                            <div class="table-operations flex justify-end items-center">
                                <div class="flex">
                                    <base-button class="ml-3 my-3 border p-1 px-4 text-gray-600 bg-white"
                                                 :action="() => {}" text="Unclaim"/>
                                    <base-button icon="sync"
                                                 class="border p-1 px-4 text-gray-600 ml-3 my-3 flex items-center bg-white"
                                                 @click="() => {}" text="Update Status"/>
                                    <base-button icon="plus" type="primary" class="ml-3 my-3 border p-1 px-4 bg-white"
                                                 :action="createNewWorksite" text="Create New Case"/>
                                </div>
                            </div>
                            <Table class="border" :data="data" :columns="columns" enable-selection enable-pagniation :pagination="pagination" @change="handleTableChange" :loading="tableLoading" @rowClick="displayWorksite">
                                <template #work_types="slotProps">
                                    <div class="flex flex-col">
                                        <div class="badge-holder flex items-center" :key="work_type.id" v-for="work_type in slotProps.item.work_types">
                                            <badge class="mx-1" :color="getColorForStatus(work_type.status, Boolean(work_type.claimed_by))"/>
                                            {{work_type.work_type | getWorkTypeName}}
                                        </div>
                                    </div>
                                </template>
                            </Table>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div class="flex flex-col h-full shadow-2xl w-1/5" style="min-width: 360px" v-if="this.currentIncident && (isEditingWorksite || isViewingWorksite || isViewingWorksiteHistory || isNewWorksite)">
            <div style="background-color: white" class="border border-r-0 border-l-0 border-gray-300 card-header flex items-center">
                <div class="w-1/2 h-full p-3 flex items-center justify-center cursor-pointer" @click="createNewWorksite" v-bind:class="{ 'tab-active': isNewWorksite }">
                    <ccu-icon alt="New Case" type="active" size="small"/>
                    <span class="px-2">New Case</span>
                </div>
                <div v-if="this.currentWorksite && this.currentWorksite.id" class="w-1/2 h-full p-3 flex items-center justify-center" v-bind:class="{ 'tab-active': isEditingWorksite || isViewingWorksite || isViewingWorksiteHistory }">
                    {{this.currentWorksite && isEditingWorksite ? `Edit ${this.currentWorksite.case_number}` : `View ${this.currentWorksite.case_number}`}}
                </div>
            </div>
            <div v-if="(isEditingWorksite || isViewingWorksite || isViewingWorksiteHistory || isNewWorksite)" class="text-gray-600 text-lg flex p-2 bg-white justify-between items-center border-b">
                <template v-if="isViewingWorksiteHistory">
                    <ccu-icon alt="Case History" size="medium" class="text-black mb-1" type="history">
                        <span class="ml-1 mt-1">{{this.currentWorksite.case_number}} History</span>
                    </ccu-icon>
                    <ccu-icon alt="Cancel" size="small" type="cancel" @click.native="backToWorksite"/>
                </template>
                <template v-else-if="isNewWorksite">
                    <div class="text-left text-black">New Case</div>
                    <ccu-icon alt="Cancel" size="small" type="cancel" @click.native="closeWorksite"/>
                </template>
                <template v-else>
                    <div class="text-left text-black">{{this.currentWorksite && this.currentWorksite.case_number}}</div>
                    <div class="flex items-center" v-if="!isNewWorksite">
                        <ccu-icon alt="Jump To Case" size="small" class="p-1 py-2" type="go-case" @click.native="jumpToCase"/>

                        <router-link :to="`/incident/${this.$route.params.incident_id}/cases/${this.$route.params.id}/history`">
                            <ccu-icon alt="Case History" size="small" class="p-1 py-2" type="history"/>
                        </router-link>
                        <ccu-icon alt="Download Worksite Data" size="small" class="p-1 py-2" type="download" @click.native="downloadWorksite"/>
                        <ccu-icon alt="Share Worksite" size="small" class="p-1 py-2" type="share"/>
                        <ccu-icon alt="Print Work Order" size="small" class="p-1 py-2" type="print" @click.native="printWorksite"/>
                        <router-link v-if="isViewingWorksite" :to="`/incident/${this.$route.params.incident_id}/cases/${this.$route.params.id}/edit`">
                            <ccu-icon alt="Edit Worksite" class="border p-2 bg-primary-light"
                                      size="small" type="edit"/>
                        </router-link>
                    </div>
                </template>
            </div>
            <router-view v-if="!spinning" :key="$route.params.id"
                         @closeWorksite="closeWorksite" @geocoded="addMarkerToMap" @savedWorksite="loadWorksite" @navigateToWorksite="(id) => { $router.push(`/incident/${this.$route.params.incident_id}/cases/${id}/edit?showOnMap=true`) }"
                         @reloadTable="reloadTable" :incident="currentIncident" @changed="loadWorksite" @reloadMap="reloadMap" @jumpToCase="jumpToCase"/>
        </div>
    </div>
</template>

<script>
    import {gmapApi} from 'vue2-google-maps'
    import Worksite from "@/models/Worksite";
    import User from "@/models/User";
    import Incident from "@/models/Incident";
    import Location from "@/models/Location";
    import { mapState } from "vuex";
    import Table from "@/components/Table";
    import WorksiteMap from "@/components/WorksiteMap";
    import WorksiteFilters from "@/components/WorksiteFilters";
    import Status from "@/models/Status";
    import Autocomplete from "@/components/Autocomplete";
    import Highlighter from 'vue-highlight-words'
    import { throttle } from 'lodash';
    import { getQueryString } from "@/utils/urls";
    import * as L from 'leaflet';
    import { getColorForStatus } from "@/filters";
    import WorksiteSearchInput from "@/components/WorksiteSearchInput";

    const columns = [
        {
            title: 'No',
            dataIndex: 'case_number',
            key: 'case_number',
            width: '0.5fr',
        },
        {
            title: 'Work type',
            dataIndex: 'work_types',
            key: 'work_types',
            scopedSlots: { customRender: 'work_types' },
            width: '1.5fr',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '1.5fr',
        },
        {
            title: 'Full Address',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
        },
        {
            title: 'County',
            dataIndex: 'county',
            key: 'county',
        }
    ];

    export default {
        components: {
            WorksiteSearchInput,
            WorksiteMap,
            WorksiteFilters,
            Table,
            Highlighter,
        },
        name: "Cases",
        data() {
            return {
                formLayout: 'inline',
                isEditing: true,
                showingMap: true,
                showingTable: false,
                showingFilters: false,
                spinning: false,
                tableLoading: false,
                searchValue: null,
                searchWorksites: [],
                totalWorksites: 0,
                searchingWorksites: false,
                data: [],
                pagination: {
                    pageSize: 100,
                    page: 1,
                    current: 1,
                },
                columns,
                currentQuery: {},
                filters: {
                    fields: {},
                    statuses: {},
                    sub_fields: {},
                },
                appliedFilters: {},
                newMarker: null,
                map: null,
                currentSearch: '',
                currentCaseView: '',
                getColorForStatus,
                appliedLocations: new Set()
            };
        },
        created() {
            // setInterval(function () {
            //     this.$log.debug('polling');
            //     this.updateUserState();
            // }.bind(this), 100000);
        },
        async mounted() {
            if (this.currentUser.states) {
                if (this.currentUser.states.showingMap) {
                    this.showingMap = true;
                    this.showingTable = false;
                }
                if (this.currentUser.states.appliedFilters) {
                    this.appliedFilters = this.currentUser.states.appliedFilters;
                }
                if (this.currentUser.states.filters) {
                    this.filters = this.currentUser.states.filters;
                }
            }
            if (this.$route.params.incident_id) {
                this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: 1,
                })
            }
            let locationParams = {
                limit: 1000,
                type__in: 'US_STATE,CONGRESSIONAL_DISTRICT,',
                fields: 'id,name,type'
            };
            await Location.api().get(`/locations?${getQueryString(locationParams)}`, {
                dataKey: 'results'
            });
            Location.api().get(`/locations?type=FLOOD&limit=10000`, {
                dataKey: 'results'
            });
        },
        watch: {
            currentIncident: function () {
                this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: 1,
                })
            }
        },
        methods: {
            handleTableChange({ pagination, filters, sorter }) {
                this.fetch({
                    pageSize: pagination.pageSize,
                    page: pagination.current,
                    sortField: sorter.field,
                    sortOrder: sorter.order,
                    ...filters
                });
            },

            updateUserState(data) {
                if (!data) {
                    data = {}
                }
                User.api().updateUserState({
                    incident: this.$route.params.incident_id,
                    appliedFilters: this.appliedFilters,
                    filters: this.filters,
                    showingMap: this.showingMap,
                    showingTable: this.showingTable,
                    ...data
                })
            },

            onUpdatedFilters(filters) {
                this.filters = filters;
                this.handleFilters();
            },

            onMapMoved(bounds) {
                this.updateUserState({
                    mapViewPort: bounds
                })
            },

            onInitMap(map) {
                this.map = map;
            },

            applyLayers(value, layerList, key) {
                if (value && this.map) {
                    for (let location of layerList) {
                        var geojsonFeature = {
                            "type": "Feature",
                            "properties": location.attr,
                            "geometry": location.poly || location.geom || location.point
                        };
                        L.geoJSON(geojsonFeature, {
                            onEachFeature: function (feature, layer) {
                                layer.key = key
                            }

                        }).addTo(this.map);
                    }
                } else {
                    this.map.eachLayer((layer) => {
                        if (layer.key &&  layer.key === key) {
                            this.map.removeLayer(layer)
                        }
                    });
                }
            },

            async applyLocation(location_id, value) {
                if (value && this.map) {
                    await Location.api().fetchById(location_id);
                    const location = Location.find(location_id);
                    var geojsonFeature = {
                        "type": "Feature",
                        "properties": location.attr,
                        "geometry": location.poly || location.geom || location.point
                    };
                    L.geoJSON(geojsonFeature, {
                        onEachFeature: function (feature, layer) {
                            layer.location_id = location_id
                        }

                    }).addTo(this.map);
                    this.appliedLocations.add(location_id)
                } else {
                    this.map.eachLayer((layer) => {
                        if (layer.location_id &&  layer.location_id === location_id) {
                            this.map.removeLayer(layer)
                        }
                    });
                    this.appliedLocations.delete(location_id)
                }
            },
            async fetch(params = {}) {
                this.tableLoading = true;
                let query = {
                    fields: 'id,name,address,case_number,work_types,city,state,county,flags,location,incident,postal_code',
                    incident: this.$route.params.incident_id,
                };
                this.currentQuery = { ...query, ...this.appliedFilters };
                let response = await this.$http
                    .get(`${process.env.VUE_APP_API_BASE_URL}/worksites`, {
                        params: {
                            ...query,
                            offset: params.pageSize * (params.page - 1),
                            limit: params.pageSize,
                            ...this.appliedFilters
                        }
                    });
                this.tableLoading = false;
                this.data = response.data.results;
                this.pagination = {
                    page: params.page,
                    current: params.page,
                    pageSize: params.pageSize,
                    total: response.data.count
                };
                this.getWorksiteCount()
            },

            async getWorksiteCount() {
                let response = await this.$http
                    .get(`${process.env.VUE_APP_API_BASE_URL}/worksites`, {
                        params: {
                            incident: this.$route.params.incident_id,
                            limit: 1,
                        }
                    });
                this.totalWorksites = response.data.count;
            },

            async reloadTable() {
                await this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: this.pagination.current,
                })
            },

            reloadMap() {
                if (this.$refs.workstiteMap) {
                    this.$refs.workstiteMap.initMap();
                    this.$refs.workstiteMap.markerLayer.clearLayers();
                }
            },

            async loadWorksite() {
                this.reloadTable();
            },

            async closeWorksite() {
                if (this.isNewWorksite) {
                    await this.$router.push(`/incident/${this.$route.params.incident_id}/cases`);
                } else {
                    await this.$router.push(`/incident/${this.$route.params.incident_id}/cases/new`);
                }
            },

            async backToWorksite() {
                await this.$router.push(`/incident/${this.$route.params.incident_id}/cases/${this.$route.params.id}`)
            },

            displayWorksite: async function (record) {
                await this.$router.replace(`/incident/${this.$route.params.incident_id}/cases/${record.id}`)
            },
            async createNewWorksite() {
                await this.$router.push(`/incident/${this.$route.params.incident_id}/cases/new`);
                this.toggleView('showingMap');
                this.spinning = false;
            },
            toggleView(view) {
                this.showingMap = false;
                this.showingTable = false;
                this[view] = true;
                this.updateUserState()
            },
            onSearch: throttle(async function(search) {
                this.currentSearch = search;
                this.searchingWorksites = true;
                let searchWorksites = await Worksite.api().searchWorksites(search, this.$route.params.incident_id);
                this.searchWorksites = searchWorksites.entities.worksites;
                this.searchingWorksites = false;
            }, 1000),

            async handleChange(value) {
                await this.$router.push(`/incident/${this.$route.params.incident_id}/cases/${value.id}?showOnMap=true`);
                this.searchValue = '';
            },
            handleFilters() {
                let appliedFilters = {
                    work_type__work_type__in: ''
                };
                const entries = Object.entries(this.filters.fields)
                for (const [work_type, values] of entries) {
                    if (values) {
                        appliedFilters.work_type__work_type__in+=`${work_type},`
                    }
                }

                if (!Object.values(this.filters.fields).some(value => Boolean(value))) {
                    delete appliedFilters.work_type__work_type__in;
                }

                if (this.filters.statuses.unclaimed) {
                    appliedFilters.work_type__claimed_by__isnull = true;
                }

                if (this.filters.statuses.claimed_by_org) {
                    appliedFilters.work_type__claimed_by = this.currentUser.organization.id;
                }

                if (this.filters.statuses.reported_by_org) {
                    appliedFilters.reported_by = this.currentUser.organization.id;
                }

                if (this.filters.statuses.open) {
                    let openStatuses = Status.query().where('primary_state', 'open').get()
                    appliedFilters.work_type__status__in = openStatuses.map(status => status.status).join(',');
                }

                if (this.filters.statuses.closed) {
                    let closedStatuses = Status.query().where('primary_state', 'closed').get()
                    appliedFilters.work_type__status__in = closedStatuses.map(status => status.status).join(',');
                }

                this.appliedFilters = appliedFilters;
                this.showingFilters = false;
                this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: this.pagination.current,
                })
                this.updateUserState()
            },
            async printWorksite() {
                this.spinning = true;
                let pdf = await Worksite.api().printWorksite(this.currentWorksite.id);
                this.forceFileDownload(pdf.response);
                this.spinning = false;
            },
            async downloadWorksite() {
                this.spinning = true;
                let csv = await Worksite.api().downloadWorksite(this.currentWorksite.id);
                this.forceFileDownload(csv.response);
                this.spinning = false;
            },
            async jumpToCase(id) {
                this.toggleView('showingMap');

                const waitForMap = () => {
                    if (this.$refs.workstiteMap && !this.$refs.workstiteMap.mapLoading) {
                        this.$refs.workstiteMap.map.setView([this.currentWorksite.latitude, this.currentWorksite.longitude], 18);
                        let popup = L.popup({className: 'pixi-popup'})
                        popup.setLatLng([this.currentWorksite.latitude, this.currentWorksite.longitude])
                            .setContent(`<b>${this.currentWorksite.name} (${this.currentWorksite.case_number}</b>)`).openOn(this.$refs.workstiteMap.map);
                        setTimeout(() => {this.$refs.workstiteMap.map.closePopup()}, 5000);

                    } else {
                        setTimeout(waitForMap, 50);
                    }
                };
                waitForMap();
            },
            forceFileDownload(response){
                const blob = new Blob([response.data], {type: response.data.type});
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const contentDisposition = response.headers['content-disposition'];
                let fileName = 'unknown';
                if (contentDisposition) {
                    const fileNameMatch = contentDisposition.match(/filename=(.+)/);
                    if (fileNameMatch.length === 2)
                        fileName = fileNameMatch[1];
                }
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            },
            workTypeIcon(work_type) {
                const work_type_dict = {
                    "trees": "tree",
                    "muck_out":"water",
                    "tarp":"campground",
                    "debris":"trash",
                    "fire":"fire",
                    "mold_remediation":"recycle",
                };
                return work_type_dict[work_type] || 'tree';
            },
            addMarkerToMap(location) {
                this.newMarker = location;
                this.toggleView('showingMap');
            }
        },
        computed: {
            currentWorksite() {
              return Worksite.find(this.$route.params.id)
            },
            usStates() {
                let states = Location.query().where('type', 'US_STATE').get();
                return states
            },
            districts() {
                let states = Location.query().where('type', 'CONGRESSIONAL_DISTRICT').get();
                return states
            },
            floodZone() {
                let states = Location.query().where('type', 'FLOOD').get();
                return states
            },
            isEditingWorksite() {
              return this.$route.name === 'IncidentCaseForm'
            },
            isViewingWorksite() {
              return this.$route.name === 'IncidentCaseView'
            },
            isViewingWorksiteHistory() {
                return this.$route.name === 'IncidentCaseHistory'
            },
            isNewWorksite() {
                return this.$route.name === 'IncidentCaseForm' && !this.$route.params.id
            },
            incidents() {
                return Incident.query().orderBy('id', 'desc').get()
            },
            currentIncident() {
                return Incident.find(this.$route.params.incident_id)
            },
            currentUser() {
                return User.find(this.$store.getters['auth/userId'])
            },
            markers () {
                if (this.data) {
                    return this.data.map((worksite) => {
                        return {
                            ...worksite,
                            position: {
                                lat: worksite.latitude,
                                lng: worksite.longitude,
                            }
                        }
                    })
                }
                return [];
            },
            filtersCount() {
                return Object.values(this.filters.statuses).filter(field => Boolean(field)).length + Object.values(this.filters.fields).filter(field => Boolean(field)).length
            },
            google: gmapApi,
            ...mapState('loading', [
                'worksitesLoading',
            ])
        },
    }
</script>

<style>
    .ant-spin-container {
        height: 100%;
    }
    .card-header {
        min-height: 60px;
    }

    .ant-table-row {
        font-size: 0.75rem;
        text-align: left;
    }

    .worksite-actions .anticon {
        font-size: 22px;
        padding-left: 0.5em;
    }

    .badge-holder .ant-badge-status-dot {
        width: 10px;
        height: 10px;
    }

    .tab-active {
        border-bottom: solid 3px theme('colors.primary.light');
    }

    .checkbox-round {
        width: 1.3em;
        height: 1.3em;
        background-color: white;
        border-radius: 50%;
        vertical-align: middle;
        border: 1px solid #ddd;
        -webkit-appearance: none;
        outline: none;
        cursor: pointer;
    }

    .checkbox-round:checked {
        background-color: gray;
    }

    .filters-modal {
        width: 750px !important;
    }
    .highlight {
        font-weight: bold;
        background-color: white;
        padding: 0;
    }

    .bp-dropdown__btn.layers-dropdown-bp__btn {
        @apply border-0
    }
</style>