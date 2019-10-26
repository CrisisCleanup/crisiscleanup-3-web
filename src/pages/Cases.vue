<template>
    <div class="flex h-full">
        <div class="flex-grow">
            <div class="flex flex-col h-full">
                <div style="background-color: white" class="p-3 border border-gray-300 card-header">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <font-awesome-icon size="lg" class="mr-4" :style="showingMap ? { color: '#FECE09' } : { color: '#718096' }" icon="map" @click="toggleView('showingMap')" />
                            <font-awesome-icon size="lg" class="mr-4" :style="showingTable ? { color: '#FECE09' } : { color: '#718096' }" icon="columns" @click="toggleView('showingTable')" />
                            <div class="flex justify-start w-auto">
                                <a-select
                                        showSearch
                                        :value="searchValue"
                                        placeholder="input search text"
                                        style="width: 200px"
                                        :defaultActiveFirstOption="false"
                                        :filterOption="false"
                                        @search="onSearch"
                                        @change="handleChange"
                                        :notFoundContent="null"
                                        class="mr-3"
                                >
                                    <template slot="suffixIcon">
                                        <a-icon v-if="searchingWorksites" type="loading" />
                                        <a-icon v-else type="search" />
                                    </template>
                                    <a-select-option v-for="item in searchWorksites" :key="item.id">{{item.case_number}}</a-select-option>
                                </a-select>

                                <a-button icon="filter" class="mr-3 flex items-center" @click="showingFilters = true">Filters</a-button>
                                <a-modal title="Filters" v-model="showingFilters" @ok="handleFilters">
                                    <p>Filters</p>
                                </a-modal>
                            </div>
                        </div>
                        <div class="flex worksite-actions text-gray-600">
                            <a-icon type="download" />
                            <a-icon type="printer" />
                            <a-icon type="share-alt" />
                        </div>

                    </div>
                </div>
                <div class="flex-grow">
                    <template v-if="showingMap">
                        <GmapMap
                                :center="{lat:31.340964, lng:-89.2661959}"
                                :zoom="6"
                                style="width: 100%; height: 100%"
                        >
                            <GmapCustomMarker :key="m.id" v-for="m in markers" :marker="m.position">
                                <font-awesome-icon size="3x" icon="tree" :style="{ color: 'red' }"/>
                            </GmapCustomMarker>
                        </GmapMap>
                    </template>
                    <template v-if="showingTable">
                        <div class="p-3">
                            <div class="table-operations flex justify-end">
                                <a-button class="ml-3 my-3 text-gray-600" @click="() => {}">Unclaim</a-button>
                                <a-button icon="sync" class="text-gray-600 ml-3 my-3 flex items-center" @click="() => {}">Update Status</a-button>
                                <a-button class="ml-3 my-3 text-gray-600" @click="() => {}">Display All</a-button>
                            </div>
                            <a-table size="small" :loading="tableLoading" class="bg-white" :columns="columns" :dataSource="tableData" :customRow="customRow" :rowSelection="rowSelection" >

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
        <div style="width: 375px " class="flex flex-col h-full shadow-2xl">
            <div style="background-color: white" class="border border-r-0 border-l-0 border-gray-300 card-header flex items-center">
                <div class="w-1/2 h-full p-3 flex items-center justify-center" @click="createNewWorksite" v-bind:class="{ 'tab-active': isNewWorksite }">
                    <a-icon type="plus-circle"></a-icon>
                    <span class="px-2">New Case</span>
                </div>
                <div v-if="this.currentWorksite && this.currentWorksite.id" class="w-1/2 h-full p-3 flex items-center justify-center" v-bind:class="{ 'tab-active': isEditingWorksite || isViewingWorksite }">
                    {{this.currentWorksite && `View ${this.currentWorksite.case_number}`}}
                </div>
            </div>
            <a-spin class="flex-grow h-full" :spinning="spinning">
                <div class="text-gray-600 text-lg flex p-2 bg-white justify-between items-start">
                    <div class="text-left text-black">{{this.currentWorksite && this.currentWorksite.case_number}}</div>
                    <div>
                        <a-icon class="px-1" type="download" />
                        <a-icon class="px-1" type="printer" @click="printWorksite" />
                        <a-icon class="px-1" type="share-alt" />
                        <a-icon class="px-1" type="edit" />
                    </div>
                </div>
                <div class="" v-if="isEditingWorksite || isNewWorksite">
                    <CaseForm :key="caseFormKey" :fields="this.groupedFormData" :worksite="this.currentWorksite"/>
                </div>
                <div class="bg-white p-3" v-if="isViewingWorksite">
                    <label>Notes</label>
                    <div class="bg-gray-200 flex justify-center">
                        <span>1 day ago: Neighbour will help with cleaning</span>
                    </div>
                    <a href="" class="block">+ Add Note</a>

                    <label class="pt-2">Full Address</label>
                    <div>{{worksiteAddress}}</div>

                    <label>Work Type (check if completed)</label>
                    <template v-for="work_type in this.currentWorksite.work_types">
                        <div :key="work_type.id">
                            <StatusDropDown class="block" :default-value="work_type.status" :on-select="(value) => {alert(value)}"></StatusDropDown>
                            <a-checkbox :defaultValue="true">{{work_type.work_type_name_t}}</a-checkbox>
                            <div v-for="type in getFieldsForType(work_type.work_type)">
                                {{type.label_t}}
                            </div>
                        </div>
                    </template>
                </div>
            </a-spin>
        </div>
    </div>
</template>

<script>
    import { gmapApi } from 'vue2-google-maps'
    import GmapCustomMarker from 'vue2-gmap-custom-marker';
    import CaseForm from "@/components/CaseForm";
    import Worksite from "@/models/Worksite";
    import Incident from "@/models/Incident";
    import { mapState, mapGetters } from "vuex";
    import StatusDropDown from "@/components/StatusDropDown";

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
            StatusDropDown,
            CaseForm,
            GmapCustomMarker
        },
        name: "Cases",
        data() {
            return {
                formLayout: 'inline',
                isEditing: true,
                showingMap: false,
                showingTable: true,
                rowSelection,
                columns,
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
        };
        },
        methods: {
            customRow(record, index) {
                return {
                    on: {
                        click: async () => {
                            this.spinning = true;
                            let worksite = await Worksite.api().fetchById(record.id);
                            this.currentWorksiteId = worksite.entities.worksites[0].id;
                            this.currentWorksite = worksite.entities.worksites[0];
                            this.spinning = false;
                            this.isViewingWorksite = true;
                            this.isNewWorksite = false;
                            this.caseFormKey = !this.caseFormKey;
                        }
                    }
                }
            },
            getFieldsForType(work_type) {
              if (this.currentIncident) {
                  let available_fields = this.currentWorksite.form_data.map(data => data.field_key);
                  return this.currentIncident.form_fields.filter((field)=> {
                      let parent = this.currentIncident.form_fields.find((element) => {
                          return element.field_key === field.field_parent_key;
                      });

                      let if_selected_then_work_type = field.if_selected_then_work_type;
                      if (parent) {
                          if_selected_then_work_type = parent.if_selected_then_work_type
                      }

                      return if_selected_then_work_type === work_type && available_fields.includes(field.field_key)
                  })
              }
              return [];
            },
            createNewWorksite() {
                this.isViewingWorksite = false;
                this.isEditingWorksite = false;
                this.isNewWorksite = true;
                this.currentWorksite = new Worksite({form_data: []});
                this.caseFormKey = !this.caseFormKey;
            },
            toggleView(view) {
                this.showingMap = false;
                this.showingTable = false;
                this[view] = true;
            },
            async onSearch(search) {
                this.searchingWorksites = true;
                let searchWorksites = await Worksite.api().searchWorksites(search);
                this.searchWorksites = searchWorksites.entities.worksites;
                this.searchingWorksites = false;
            },
            async handleChange(value) {
                this.spinning = true;
                this.searchValue = value;
                let worksite = await Worksite.api().fetchById(value);
                let incident = await Incident.api().fetchById(worksite.entities.worksites[0].incident);
                this.currentIncidentId = incident.entities.incidents[0].id;
                this.currentWorksiteId = worksite.entities.worksites[0].id;
                this.currentWorksite = worksite.entities.worksites[0];
                this.spinning = false;
                this.isNewWorksite = false;
                this.isViewingWorksite = true;
                this.caseFormKey = !this.caseFormKey;
            },
            handleFilters() {

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
        },
        async mounted() {
            this.tableLoading = true;

            if (this.currentIncidentId) {
                await Worksite.api().get(`/worksites?fields=id,name,address,case_number,work_types,city,state,county,flags,blurred_location,incident,postal_code&incident=${this.currentIncidentId}`, {
                    dataKey: 'results'
                });
            }
            this.tableLoading = false;
        },
        computed: {
            worksites() {
                return Worksite.query()
                    .where('incident', this.currentIncidentId).get()
            },
            incidents() {
                return Incident.all()
            },
            currentIncident() {
                return Incident.find(this.currentIncidentId)
            },
            currentUser() {
                return User.query().first()
            },
            worksiteAddress() {
              if (this.currentWorksite) {
                  let { address, city, state, postal_code} = this.currentWorksite;
                  return `${address}, ${city}, ${state} ${postal_code}`
              }
              return ''
            },
            tableData() {
                if (this.worksites) {
                    return this.worksites.map((worksite) => {
                        return {
                            rowKey: worksite.id,
                            key: worksite.id,
                            ...worksite
                        }
                    })
                }
                return [];
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
                if (this.worksites) {
                    return this.worksites.map((worksite) => {
                        return {
                            id: worksite.id,
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
            ...mapGetters({ worksitesLoading: 'entities/worksites/loading' }),
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
</style>