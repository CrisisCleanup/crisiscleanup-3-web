<template>
    <div class="flex h-full overflow-hidden">
        <div class="flex-grow">
            <div class="flex flex-col h-full">
                <div style="background-color: white" class="p-3 border border-gray-300 card-header">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <font-awesome-icon size="lg" class="mr-4 cursor-pointer" :style="showingMap ? { color: '#FECE09' } : { color: '#718096' }" icon="map" @click="toggleView('showingMap')" />
                            <font-awesome-icon size="lg" class="mr-4 cursor-pointer" :style="showingTable ? { color: '#FECE09' } : { color: '#718096' }" icon="columns" @click="toggleView('showingTable')" />
                            <div class="flex justify-start w-auto">
                                <a-auto-complete
                                        @select="handleChange"
                                        @search="onSearch"
                                        style="width: 300px"
                                        placeholder="Search worksites"
                                        :disabled="!this.currentIncident"
                                        class="mr-3"
                                >
                                    <template slot="dataSource">
                                        <a-select-option v-for="item in searchWorksites" :key="item.id">
                                            {{item.case_number}}
                                            <br>
                                            {{item.name}}
                                            <br>
                                            {{item.address}}, {{item.city}}, {{item.state}} {{item.postal_code}}
                                        </a-select-option>
                                    </template>
                                    <a-input>
                                        <ccu-icon slot="suffix" type="search" size="small"></ccu-icon>
                                    </a-input>
                                </a-auto-complete>

                                <div class="mr-3 flex items-center bg-white border p-1 px-4 cursor-pointer" @click="() => { this.showingFilters = true }">
                                    Filters <font-awesome-icon icon="sort" class="ml-20"></font-awesome-icon>
                                </div>
                                <a-modal :closable="false" v-model="showingFilters" @ok="handleFilters" class="filters-modal">
                                    <WorksiteFilters @updatedFilters="onUpdatedFilters" :incident="this.currentIncident" />
                                </a-modal>
                            </div>
                        </div>
                        <div class="flex worksite-actions text-gray-600">
                            <ccu-icon size="medium" class="mx-2" type="download" />
                            <ccu-icon size="medium" class="mx-2" type="share" />
                            <ccu-icon size="medium" class="mx-2" type="print" />
                        </div>

                    </div>
                </div>
                <div class="flex-grow">
                    <template v-if="showingMap">
                        <RealtimeMapFull style="width: 100%; height: 100%" :query="currentQuery" :onSelectmarker="displayWorksite" :key="this.currentIncidentId"></RealtimeMapFull>
                    </template>
                    <template v-if="showingTable">
                        <div class="p-3">
                            <div class="table-operations flex justify-end">
                                <BaseButton class="ml-3 my-3 border p-1 px-4 text-gray-600 bg-white" :action="() => {}" title="Unclaim"></BaseButton>
                                <BaseButton icon="sync" class="border p-1 px-4 text-gray-600 ml-3 my-3 flex items-center bg-white" @click="() => {}" title="Update Status"></BaseButton>
                                <BaseButton class="ml-3 my-3 text-gray-600 border p-1 px-4 bg-white" @click="() => {}" title="Display All"></BaseButton>
                            </div>
                            <a-table
                                    :scroll="{ y: 500 }"
                                    size="small"
                                    :loading="tableLoading"
                                    class="bg-white"
                                    :columns="columns"
                                    :dataSource="data"
                                    :customRow="customRow"
                                    :pagination="pagination"
                                    :rowSelection="rowSelection"
                                    @change="handleTableChange"
                            >
                            <span slot="work_types_status" slot-scope="work_types">
                                <div class="badge-holder" :key="work_type.id" v-for="work_type in work_types">
                                    <a-badge :status="getStatusBadge(work_type.status)" :title="work_type.status" />
                                </div>
                            </span>
                                <span slot="work_types" slot-scope="work_types">
                                <div  class="mt-1" :key="work_type.id" v-for="work_type in work_types">
                                    {{work_type.work_type_name_t}}
                                </div>
                            </span>
                            </a-table>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div style="width: 375px" class="flex flex-col h-full shadow-2xl" v-if="this.currentIncident">
            <div style="background-color: white" class="border border-r-0 border-l-0 border-gray-300 card-header flex items-center">
            <div class="w-1/2 h-full p-3 flex items-center justify-center cursor-pointer" @click="createNewWorksite" v-bind:class="{ 'tab-active': isNewWorksite }">
                <ccu-icon type="active" size="small"></ccu-icon>
                <span class="px-2">New Case</span>
            </div>
            <div v-if="this.currentWorksite && this.currentWorksite.id" class="w-1/2 h-full p-3 flex items-center justify-center" v-bind:class="{ 'tab-active': isEditingWorksite || isViewingWorksite }">
                {{this.currentWorksite && `View ${this.currentWorksite.case_number}`}}
            </div>
        </div>
            <div v-if="this.currentWorksite" class="text-gray-600 text-lg flex p-2 bg-white justify-between items-start">
                <div class="text-left text-black">{{this.currentWorksite && this.currentWorksite.case_number}}</div>
                <div class="flex items-center">
                    <ccu-icon size="small" class="m-1" type="download" />
                    <ccu-icon size="small" class="m-1" type="share" />
                    <ccu-icon size="small" class="m-1" type="print" @click.native="printWorksite"/>
                    <ccu-icon v-if="isViewingWorksite" class="m-1" size="small" type="edit" @click.native="editWorksite" />
                </div>
            </div>
            <a-skeleton class="bg-white h-full p-3 flex-grow" active v-if="spinning"></a-skeleton>
            <div class="h-full" v-if="!spinning && (isEditingWorksite || isNewWorksite)">
                <CaseForm :key="caseFormKey" :fields="this.groupedFormData" :worksite="currentWorksite" :reloadTable="reloadTable" :incident="this.currentIncident"/>
            </div>
            <div class="h-full" v-if="!spinning && isViewingWorksite">
                <CaseView :worksite="currentWorksite" :incident="currentIncident"/>
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
    import {mapState} from "vuex";
    import CaseView from "@/pages/CaseView";
    import RealtimeMap from "@/components/RealtimeMap";
    import RealtimeMapFull from "@/components/RealtimeMapFull";
    import WorksiteFilters from "@/components/WorksiteFilters";
    import BaseButton from "@/components/BaseButton";

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        onSelect: (record, selected, selectedRows) => {
            // console.log(record, selected, selectedRows);
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
            // console.log(selected, selectedRows, changeRows);
        },
    };

    const columns = [
        {
            title: 'No',
            dataIndex: 'case_number',
            key: 'case_number',
            width: '5%',
        },
        {
            title: 'Status',
            dataIndex: 'work_types',
            key: 'work_types_status',
            scopedSlots: { customRender: 'work_types_status' },
            width: '5%',
        },
        {
            title: 'Work type',
            dataIndex: 'work_types',
            key: 'work_types',
            scopedSlots: { customRender: 'work_types' },
            width: '15%',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
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
            BaseButton,
            CaseView,
            CaseForm,
            RealtimeMap,
            RealtimeMapFull,
            WorksiteFilters,
        },
        name: "Cases",
        data() {
            return {
                formLayout: 'inline',
                isEditing: true,
                showingMap: false,
                showingTable: true,
                isEditingWorksite: false,
                isViewingWorksite: false,
                isNewWorksite: false,
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
                },
                rowSelection,
                columns,
                currentQuery: {},
                filters: {},
                appliedFilters: {},
            };
        },
        watch: {
            currentIncident: function () {
                this.currentWorksite = null;
                this.isEditingWorksite = false;
                this.isViewingWorksite = false;
                this.isNewWorksite = false;
                this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: 1,
                })
            }
        },
        methods: {
            handleTableChange(pagination, filters, sorter) {
                this.pagination = {
                    ...this.pagination,
                    current: pagination.current
                };

                this.fetch({
                    pageSize: pagination.pageSize,
                    page: pagination.current,
                    sortField: sorter.field,
                    sortOrder: sorter.order,
                    ...filters
                });
            },

            onUpdatedFilters(filters) {
                this.filters = filters
            },

            async fetch(params = {}) {
                this.tableLoading = true;
                let query = {
                    fields: 'id,name,address,case_number,work_types,city,state,county,flags,blurred_location,incident,postal_code',
                    incident: this.currentIncidentId,
                };
                this.currentQuery = query;
                let response = await this.$http
                    .get("http://api.staging.crisiscleanup.io/worksites", {
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
                    ...this.pagination,
                    total: response.data.count
                };
            },

            async reloadTable() {
                await this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: this.pagination.current,
                })
                // this.caseFormKey = !this.caseFormKey;
            },

            displayWorksite: async function (record) {
                this.spinning = true;
                let worksite = await Worksite.api().fetchById(record.id);
                this.currentWorksiteId = worksite.entities.worksites[0].id;
                this.currentWorksite = worksite.entities.worksites[0];
                this.spinning = false;
                this.isViewingWorksite = !this.isEditingWorksite;
                this.isNewWorksite = false;
                this.caseFormKey = !this.caseFormKey;
            },
            customRow(record, index) {
                return {
                    on: {
                        click: async () => {
                            await this.displayWorksite(record);
                        }
                    }
                }
            },
            createNewWorksite() {
                this.isViewingWorksite = false;
                this.isEditingWorksite = false;
                this.isNewWorksite = true;
                this.currentWorksite = new Worksite({incident: this.currentIncidentId, form_data: []});
                this.caseFormKey = !this.caseFormKey;
            },
            toggleView(view) {
                this.showingMap = false;
                this.showingTable = false;
                this[view] = true;
            },
            async onSearch(search) {
                this.searchingWorksites = true;
                let searchWorksites = await Worksite.api().searchWorksites(search, this.currentIncidentId);
                this.searchWorksites = searchWorksites.entities.worksites;
                this.searchingWorksites = false;
            },
            async handleChange(value) {
                this.spinning = true;
                let worksite = await Worksite.api().fetchById(value);
                this.currentWorksiteId = worksite.entities.worksites[0].id;
                this.currentWorksite = worksite.entities.worksites[0];
                this.spinning = false;
                this.isNewWorksite = false;
                this.isViewingWorksite = true;
                this.caseFormKey = !this.caseFormKey;
                this.searchValue = '';
            },
            handleFilters() {
                let appliedFilters = {
                    work_type__work_type__in: ''
                };
                const entries = Object.entries(this.filters)
                for (const [work_type, values] of entries) {
                    if (values) {
                        appliedFilters.work_type__work_type__in+=`${work_type},`
                    }
                }
                this.appliedFilters = appliedFilters;
                this.showingFilters = false;
                this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: this.pagination.current,
                })
            },
            editWorksite() {
                this.isViewingWorksite = false;
                this.isNewWorksite = false;
                this.isEditingWorksite = true;
            },
            async printWorksite() {
                this.spinning = true;
                let pdf = await Worksite.api().printWorksite(this.currentWorksite.id);
                this.forceFileDownload(pdf.response);
                this.spinning = false;
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
            getStatusBadge(status) {
                const status_dict = {
                    "open_unassigned": "error",
                    "open_assigned":"processing",
                    "open_partially-completed":"processing",
                    "open_needs-follow-up":"processing",
                    "open_unresponsive":"default",
                    "closed_completed":"success",
                    "closed_partially-completed":"success",
                    "closed_incomplete":"default",
                    "closed_out-of-scope":"default",
                    "closed_done-by-others":"success",
                    "closed_no-help-wanted":"default",
                    "closed_rejected":"default",
                    "closed_duplicate":"default",
                    "closed_marked-for-deletion":"default"
                };
                return status_dict[status];
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
        },
        async mounted() {
            if (this.currentIncidentId) {
                this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: 1,
                })
            }
        },
        computed: {
            incidents() {
                return Incident.query().orderBy('id', 'desc').get()
            },
            currentIncident() {
                return Incident.find(this.currentIncidentId)
            },
            currentUser() {
                return User.query().first()
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
                                lat: worksite.blurred_location ? worksite.blurred_location.coordinates[1]: 10,
                                lng: worksite.blurred_location ? worksite.blurred_location.coordinates[0]: 10,
                            }
                        }
                    })
                }
                return [];
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
</style>