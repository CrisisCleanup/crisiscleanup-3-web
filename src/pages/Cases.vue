<template>
    <div class="flex h-full overflow-hidden">
        <div :class="{'w-4/5': currentIncident && currentWorksite, 'w-full': !currentWorksite}">
            <div class="flex flex-col h-full">
                <div style="background-color: white" class="p-3 border border-gray-300 card-header">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <ccu-icon size="medium" class="mr-4 cursor-pointer" :class="showingMap ? 'filter-yellow' : 'filter-gray'" type="map" @click.native="toggleView('showingMap')" />
                            <ccu-icon size="medium" class="mr-4 cursor-pointer" :class="showingTable ? 'filter-yellow' : 'filter-gray'" type="table" @click.native="toggleView('showingTable')" />
                            <span class="font-thin">Number of Cases: {{pagination.total}}</span>
                            <div class="flex justify-start w-auto">
                                <autocomplete
                                        @selected="handleChange"
                                        @search="onSearch"
                                        icon="search"
                                        :suggestions="searchWorksites"
                                        display-property="case_number"
                                        placeholder="Search"
                                        full="true"
                                        class="mx-2"
                                        :loading="searchingWorksites"
                                        :disabled="!this.currentIncident">
                                    <template #result="slotProps">
                                        <div class="flex flex-col text-sm p-2 cursor-pointer hover:bg-gray-100 border-b">
                                            <Highlighter
                                                         highlightClassName="highlight"
                                                         :searchWords="[currentSearch]"
                                                         :autoEscape="true"
                                                         :textToHighlight="slotProps.suggestion.item.name"/>
                                            <Highlighter
                                                    highlightClassName="highlight"
                                                    :searchWords="[currentSearch]"
                                                    :autoEscape="true"
                                                    :textToHighlight="slotProps.suggestion.item.case_number"/>
                                            <Highlighter
                                                         highlightClassName="highlight"
                                                         :searchWords="[currentSearch]"
                                                         :autoEscape="true"
                                                         :textToHighlight="`${slotProps.suggestion.item.address}, ${slotProps.suggestion.item.city}, ${slotProps.suggestion.item.state} ${slotProps.suggestion.item.postal_code}`"/>
                                        </div>
                                    </template>
                                </autocomplete>
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
                            <base-button class="text-base font-thin mx-4" icon="sliders-h" :action="() => { this.showingFilters = true }">
                                Filters <span class="rounded-full mx-2 px-1 bg-yellow-500 text-xs" v-if="filtersCount > 0">{{filtersCount}}</span>
                            </base-button>
                            <ccu-icon type="search" size="small" class="text-base font-thin mx-4 mt-1"/>
                            <base-button class="text-base font-thin mx-4" text="" icon="ellipsis-h" :action="() => { this.showingFilters = true }"/>
                            <WorksiteFilters v-if="showingFilters" :current-filters="filters" @closedFilters="showingFilters = false" @updatedFilters="onUpdatedFilters" :incident="this.currentIncident"/>
                        </div>

                    </div>
                </div>
                <div class="flex-grow bg-gray-100" style="display: grid">
                    <template v-if="showingMap">
                        <WorksiteMap class="w-full h-full" @mapMoved="onMapMoved" @initMap="onInitMap"
                                     :query="currentQuery" :onSelectmarker="displayWorksite" :new-marker="newMarker"
                                     :key="JSON.stringify(currentQuery)" ref="workstiteMap"/>
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
                                            <badge class="mx-1" :color="getColorForStatus(work_type.status)"/>
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
        <div class="flex flex-col h-full shadow-2xl w-1/5" style="min-width: 360px" v-if="this.currentIncident && this.currentWorksite">
            <div style="background-color: white" class="border border-r-0 border-l-0 border-gray-300 card-header flex items-center">
                <div class="w-1/2 h-full p-3 flex items-center justify-center cursor-pointer" @click="createNewWorksite" v-bind:class="{ 'tab-active': isNewWorksite }">
                    <ccu-icon type="active" size="small"/>
                    <span class="px-2">New Case</span>
                </div>
                <div v-if="this.currentWorksite && this.currentWorksite.id" class="w-1/2 h-full p-3 flex items-center justify-center" v-bind:class="{ 'tab-active': isEditingWorksite || isViewingWorksite || isViewingWorksiteHistory }">
                    {{this.currentWorksite && `View ${this.currentWorksite.case_number}`}}
                </div>
            </div>
            <div v-if="this.currentWorksite" class="text-gray-600 text-lg flex p-2 bg-white justify-between items-center border-b">
                <template v-if="isViewingWorksiteHistory">
                    <ccu-icon size="medium" class="text-black mb-1" type="history">
                        <span class="ml-1 mt-1">{{this.currentWorksite.case_number}} History</span>
                    </ccu-icon>
                    <ccu-icon size="small" type="cancel" @click.native="closeHistory"/>
                </template>
                <template v-else>
                    <div class="text-left text-black">{{this.currentWorksite && this.currentWorksite.case_number}}</div>
                    <div class="flex items-center" v-if="!isNewWorksite">
                        <ccu-icon size="small" class="p-1 py-2" type="go-case" @click.native="jumpToCase"/>
                        <ccu-icon size="small" class="p-1 py-2" type="history" @click.native="currentCaseView = 'history'"/>
                        <ccu-icon size="small" class="p-1 py-2" type="download" @click.native="downloadWorksite"/>
                        <ccu-icon size="small" class="p-1 py-2" type="share"/>
                        <ccu-icon size="small" class="p-1 py-2" type="print" @click.native="printWorksite"/>
                        <ccu-icon v-if="isViewingWorksite" style="background-color: #fece09" class="border p-2"
                                  size="small" type="edit" @click.native="editWorksite"/>
                    </div>
                </template>
            </div>
            <a-skeleton class="bg-white h-full p-3 flex-grow" active v-if="spinning"/>
            <div class="h-full" v-if="!spinning && (isEditingWorksite || isNewWorksite)">
                <CaseForm :key="caseFormKey" :fields="this.groupedFormData" :worksite-id="currentWorksiteId" @geocoded="addMarkerToMap" @savedWorksite="loadWorksite" :reloadTable="reloadTable" :incident="this.currentIncident"/>
            </div>
            <div class="h-full" v-if="!spinning && isViewingWorksite">
                <CaseView :worksite="currentWorksite" :incident="currentIncident" @changed="loadWorksite" @closeWorksite="closeWorksite"/>
            </div>
            <div class="h-full" v-if="!spinning && isViewingWorksiteHistory">
                <CaseHistory :worksite="currentWorksite"/>
            </div>
        </div>
    </div>
</template>

<script>
    import {gmapApi} from 'vue2-google-maps'
    import CaseForm from "@/components/CaseForm";
    import Worksite from "@/models/Worksite";
    import User from "@/models/User";
    import Incident from "@/models/Incident";
    import Location from "@/models/Location";
    import {mapMutations, mapState} from "vuex";
    import CaseView from "@/pages/CaseView";
    import Table from "@/components/Table";
    import WorksiteMap from "@/components/WorksiteMap";
    import WorksiteFilters from "@/components/WorksiteFilters";
    import Status from "@/models/Status";
    import {getStatusBadge} from '@/filters';
    import Autocomplete from "@/components/Autocomplete";
    import Highlighter from 'vue-highlight-words'
    import {throttle} from 'lodash';
    import CaseHistory from "@/components/CaseHistory";
    import {getQueryString} from "@/utils/urls";
    import * as L from 'leaflet';
    import { getColorForStatus } from "@/filters";

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
    const groupBy = key => array =>
        array.reduce((objectsByKeyValue, obj) => {
            const value = obj[key];
            objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
            return objectsByKeyValue;
        }, {});

    const buildForm = (key, dict, array) => {
        for (let item of dict[key]) {
            if (item.label_t) {
                array.push(item)
            }
            if (item['field_key'] in dict) {
                buildForm(item['field_key'], dict, array)
            }
        }
    };

    export default {
        components: {
            CaseHistory,
            Autocomplete,
            CaseView,
            CaseForm,
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
                showingMap: false,
                showingTable: true,
                showingFilters: false,
                spinning: false,
                tableLoading: false,
                searchValue: null,
                currentWorksiteId: null,
                currentWorksite: null,
                searchWorksites: [],
                searchingWorksites: false,
                caseFormKey: true,
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
                getStatusBadge,
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
            if (this.currentIncidentId) {
                this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: 1,
                })
            }
            //TODO: Better way to do this
            if (this.$route.query.worksite) {
                await this.loadWorksite(this.$route.query.worksite);
                if (this.currentIncident.id !== this.currentWorksite.incident) {
                    this.setCurrentIncidentId(this.currentWorksite.incident);
                    await Incident.api().fetchById(this.currentWorksite.incident);
                    await this.loadWorksite(this.$route.query.worksite);
                }
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
                this.currentWorksite = null;
                this.currentCaseView = '';
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
                    incident: this.currentIncidentId,
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
                    incident: this.currentIncidentId,
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
            },

            async reloadTable() {
                await this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: this.pagination.current,
                })
            },

            async loadWorksite(worksiteId) {
                if (worksiteId) {
                    this.currentWorksiteId = worksiteId;
                }
                await Worksite.api().fetchById(this.currentWorksiteId);
                this.currentWorksite = Worksite.find(this.currentWorksiteId);
                this.currentCaseView = 'view';
                this.caseFormKey = !this.caseFormKey;
                this.reloadTable();
            },

            async closeWorksite() {
                this.currentWorksiteId = null;
                this.currentWorksite = null;
            },

            async closeHistory() {
                this.currentCaseView = 'view';
            },

            displayWorksite: async function (record) {
                this.currentCaseView = 'view';
                this.spinning = true;
                this.currentWorksiteId = record.id;
                await Worksite.api().fetchById(record.id);
                this.currentWorksite = Worksite.find(record.id);
                this.spinning = false;
                this.caseFormKey = !this.caseFormKey;
            },
            createNewWorksite() {
                this.currentCaseView = 'new';
                this.currentWorksiteId = null;
                this.currentWorksite = new Worksite({incident: this.currentIncidentId, form_data: []});
                this.caseFormKey = !this.caseFormKey;
                this.toggleView('showingMap');
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
                let searchWorksites = await Worksite.api().searchWorksites(search, this.currentIncidentId);
                this.searchWorksites = searchWorksites.entities.worksites;
                this.searchingWorksites = false;
            }, 1000),
            async handleChange(value) {
                this.spinning = true;
                await Worksite.api().fetchById(value.id);
                let worksite = Worksite.find(value.id);
                this.currentWorksiteId = worksite.id;
                this.currentWorksite = worksite;
                this.currentCaseView = 'view';
                this.caseFormKey = !this.caseFormKey;
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
            editWorksite() {
                this.currentCaseView = 'edit';
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
            async jumpToCase() {
                this.toggleView('showingMap');

                const waitForMap = () => {
                    if (this.$refs.workstiteMap && !this.$refs.workstiteMap.mapLoading) {
                        this.$refs.workstiteMap.map.setView([this.currentWorksite.latitude, this.currentWorksite.longitude], 18);
                        let popup = L.popup({className: 'pixi-popup'})
                        popup.setLatLng([this.currentWorksite.latitude, this.currentWorksite.longitude])
                            .setContent(`<b>${this.currentWorksite.case_number}</b>`).openOn(this.$refs.workstiteMap.map);

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
            },
            ...mapMutations('incident', [
                'setCurrentIncidentId',
            ]),
        },
        computed: {
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
              return this.currentCaseView === 'edit';
            },
            isViewingWorksite() {
              return this.currentCaseView === 'view';
            },
            isViewingWorksiteHistory() {
              return this.currentCaseView === 'history';
            },
            isNewWorksite() {
                return this.currentCaseView === 'new';
            },
            incidents() {
                return Incident.query().orderBy('id', 'desc').get()
            },
            currentIncident() {
                return Incident.find(this.currentIncidentId)
            },
            currentUser() {
                return User.find(this.$store.getters['auth/userId'])
            },
            groupedFormData() {
                if (this.currentIncident && this.currentIncident.form_fields) {
                    let formFields = this.currentIncident.form_fields;
                    let returnArray = [];
                    buildForm(null, groupBy('field_parent_key')(formFields), returnArray);
                    return returnArray
                }
                return [];
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
            ...mapState('incident', [
                'currentIncidentId',
            ]),
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
        border-bottom: solid 3px #FECE09;
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