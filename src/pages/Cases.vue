<template>
  <div class="flex h-full overflow-hidden">
    <div
      :class="{
        'w-4/5': currentIncident && currentWorksite,
        'w-full': !currentWorksite,
      }"
    >
      <div class="flex flex-col h-full">
        <div
          style="background-color: white"
          class="p-3 border border-gray-300 card-header"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex" style="min-width: 80px">
                <ccu-icon
                  :alt="$t('casesVue.map_view')"
                  size="medium"
                  class="mr-4 cursor-pointer"
                  :class="showingMap ? 'filter-yellow' : 'filter-gray'"
                  type="map"
                  @click.native="toggleView('showingMap')"
                />
                <ccu-icon
                  :alt="$t('casesVue.table_view')"
                  size="medium"
                  class="mr-4 cursor-pointer"
                  :class="showingTable ? 'filter-yellow' : 'filter-gray'"
                  type="table"
                  @click.native="toggleView('showingTable')"
                />
              </div>
              <span v-if="totalWorksites" class="font-thin">
                <span v-if="pagination.total === totalWorksites">
                  Cases: {{ pagination.total | numeral('0,0') }}
                </span>
                <span v-else>
                  Cases: {{ pagination.total | numeral('0,0') }} of
                  {{ totalWorksites | numeral('0,0') }}
                </span>
              </span>
              <div class="flex justify-start w-auto">
                <WorksiteSearchInput
                  width="300px"
                  icon="search"
                  :suggestions="[
                    {
                      name: 'worksites',
                      data: searchWorksites || [],
                      key: 'name',
                    },
                  ]"
                  display-property="name"
                  placeholder="Search"
                  size="medium"
                  class="mx-2"
                  @selectedExisting="handleChange"
                  @search="onSearch"
                />
              </div>
            </div>
            <div class="flex worksite-actions" style="color: #4c4c4d">
              <base-dropdown class-name="borderless">
                <base-button
                  slot="btn"
                  class="text-base font-thin mx-4"
                  :text="$t('casesVue.layers')"
                  icon="layer-group"
                />
                <template slot="body">
                  <ul class="text-base">
                    Standard Layers
                    <li class="py-2">
                      <base-dropdown
                        :trigger="'hover'"
                        :role="'sublist'"
                        :align="'right'"
                      >
                        <template slot="btn">{{
                          $t('casesVue.us_states')
                        }}</template>
                        <template slot="body">
                          <ul class="h-64 overflow-auto">
                            <li v-for="state in usStates" :key="state.id">
                              <base-checkbox
                                :value="appliedLocations.has(state.id)"
                                @input="
                                  value => {
                                    applyLocation(state.id, value);
                                  }
                                "
                                >{{ state.name }}</base-checkbox
                              >
                            </li>
                          </ul>
                        </template>
                      </base-dropdown>
                    </li>
                    <li class="py-2">
                      <base-dropdown
                        :trigger="'hover'"
                        :role="'sublist'"
                        :align="'right'"
                      >
                        <template slot="btn">{{
                          $t('casesVue.congressional_districts')
                        }}</template>
                        <template slot="body">
                          <ul class="h-64 overflow-auto">
                            <li
                              v-for="district in districts"
                              :key="district.id"
                            >
                              <base-checkbox
                                :value="appliedLocations.has(district.id)"
                                @input="
                                  value => {
                                    applyLocation(district.id, value);
                                  }
                                "
                                >{{ district.name }}</base-checkbox
                              >
                            </li>
                          </ul>
                        </template>
                      </base-dropdown>
                    </li>
                    <li class="py-2">
                      <base-dropdown
                        :trigger="'hover'"
                        :role="'sublist'"
                        :align="'right'"
                      >
                        <template slot="btn">{{
                          $t('casesVue.incident')
                        }}</template>
                        <template slot="body">
                          <ul class="h-64 overflow-auto">
                            <li
                              v-for="location in currentIncident.locationModels"
                              :key="location.id"
                            >
                              <base-checkbox
                                :value="appliedLocations.has(location.id)"
                                @input="
                                  value => {
                                    applyLocation(location.id, value);
                                  }
                                "
                                >{{ location.name }}</base-checkbox
                              >
                            </li>
                          </ul>
                        </template>
                      </base-dropdown>
                    </li>
                  </ul>
                </template>
              </base-dropdown>
              <base-button
                class="text-base font-thin mx-4"
                icon="sliders-h"
                alt="Filters"
                :action="
                  () => {
                    showingFilters = true;
                  }
                "
              >
                Filters
                <span
                  v-if="filtersCount > 0"
                  class="rounded-full mx-2 px-1 bg-yellow-500 text-xs"
                  >{{ filtersCount }}</span
                >
              </base-button>
              <base-dropdown
                v-if="showingTable"
                class-name="borderless"
                class="flex justify-center"
              >
                <template slot="icon">
                  <base-button
                    slot="btn"
                    class="text-base font-thin mx-2"
                    icon="ellipsis-h"
                    data-cy="worksiteview_actionContext"
                  />
                </template>
                <template slot="body">
                  <ul class="text-base">
                    <li class="py-1">
                      <base-button
                        class="text-base font-thin mx-4"
                        :text="$t('actions.download')"
                        :action="() => batchAction(downloadWorksite)"
                        data-cy="worksiteview_actionBatchDownload"
                      />
                    </li>
                    <li class="py-1">
                      <base-button
                        class="text-base font-thin mx-4"
                        :text="$t('actions.print')"
                        :action="() => batchAction(printWorksite)"
                        data-cy="worksiteview_actionBatchPrint"
                      />
                    </li>
                    <li class="py-1">
                      <base-button
                        class="text-base font-thin mx-4"
                        :text="$t('actions.share')"
                      />
                    </li>
                  </ul>
                </template>
              </base-dropdown>
              <WorksiteFilters
                v-if="showingFilters"
                :current-filters="filters"
                :incident="currentIncident"
                @closedFilters="showingFilters = false"
                @updatedFilters="onUpdatedFilters"
              />
            </div>
          </div>
        </div>
        <div
          class="flex-grow bg-crisiscleanup-light-grey"
          style="display: grid"
        >
          <template v-if="showingMap">
            <WorksiteMap
              :key="JSON.stringify(currentQuery)"
              ref="workstiteMap"
              class="w-full h-full"
              :query="currentQuery"
              :new-marker="newMarker"
              :current-filters="filters"
              @mapMoved="onMapMoved"
              @onSelectmarker="displayWorksite"
            />
          </template>
          <template v-if="showingTable">
            <div class="p-3">
              <div class="table-operations flex justify-end items-center">
                <div class="flex">
                  <base-button
                    class="ml-3 my-3 border p-1 px-4 text-crisiscleanup-grey-700 bg-white"
                    :disabled="selectedTableItems.length === 0"
                    :action="
                      () => {
                        showingUnclaimModal = true;
                      }
                    "
                    :text="$t('actions.unclaim')"
                  >
                  </base-button>
                  <base-button
                    icon="sync"
                    class="border p-1 px-4 text-crisiscleanup-grey-700 ml-3 my-3 flex items-center bg-white"
                    :text="$t('actions.update_status')"
                    @click="() => {}"
                  />
                  <modal
                    v-if="showingUnclaimModal"
                    modal-classes="bg-white max-w-lg shadow"
                  >
                    <div slot="header" class="text-lg border-b p-3">
                      {{ $t('actions.unclaim_cases') }}
                    </div>
                    <div class="p-3 flex flex-col">
                      <span class="text-base pb-3">
                        {{
                          $t('casesVue.bulk_unclaim_reassign_status', {
                            length: selectedTableItems.length,
                          })
                        }}
                      </span>
                      <base-checkbox
                        class="mb-5"
                        :value="unchangedStatusOnUnclaim"
                        @input="
                          () => {
                            unchangedStatusOnUnclaim = !unchangedStatusOnUnclaim;
                            updateStatusOnUnclaim = !unchangedStatusOnUnclaim;
                          }
                        "
                        >{{ $t('casesVue.no_change') }}</base-checkbox
                      >
                      <base-checkbox
                        class="mb-5"
                        :value="updateStatusOnUnclaim"
                        @input="
                          () => {
                            updateStatusOnUnclaim = !updateStatusOnUnclaim;
                            unchangedStatusOnUnclaim = !updateStatusOnUnclaim;
                          }
                        "
                        >{{ $t('status.open_unassigned') }}</base-checkbox
                      >
                    </div>
                    <div
                      slot="footer"
                      class="flex items-center justify-center p-2 bg-white border-t"
                    >
                      <base-button
                        type="primary"
                        class="border text-base p-2 px-4 mx-2 text-black border-primary-light"
                        :action="unclaimSelected"
                        :text="$t('actions.ok')"
                      />
                      <base-button
                        type="bare"
                        class="border border-black mx-2 text-base p-2 px-4 text-black"
                        :action="
                          () => {
                            showingUnclaimModal = false;
                          }
                        "
                        :text="$t('actions.cancel')"
                      />
                    </div>
                  </modal>
                </div>
              </div>
              <Table
                class="border"
                :data="data"
                :columns="columns"
                enable-selection
                enable-pagniation
                :pagination="pagination"
                :sorter="sorter"
                :loading="tableLoading"
                :body-style="{ height: '60vh' }"
                @change="handleTableChange"
                @rowClick="displayWorksite"
                @selectionChanged="
                  selectedItems => {
                    selectedTableItems = selectedItems;
                  }
                "
              >
                <template #flags="slotProps">
                  <div class="case-flag w-8">
                    <router-link
                      v-if="slotProps.item.flags.length > 0"
                      :to="
                        `/incident/${$route.params.incident_id}/cases/${slotProps.item.id}/flag`
                      "
                    >
                      <ccu-icon
                        :alt="$t('actions.flag')"
                        size="medium"
                        class="p-1 py-2"
                        type="flag-filled"
                      />
                    </router-link>
                  </div>
                </template>
                <template #work_types="slotProps">
                  <div class="flex flex-col">
                    <div
                      v-for="work_type in slotProps.item.work_types"
                      :key="work_type.id"
                      class="badge-holder flex items-center"
                    >
                      <badge
                        class="mx-1"
                        :color="
                          getColorForStatus(
                            work_type.status,
                            Boolean(work_type.claimed_by),
                          )
                        "
                      />
                      {{ work_type.work_type | getWorkTypeName }}
                    </div>
                  </div>
                </template>
              </Table>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div
      v-if="
        currentIncident &&
          (isEditingWorksite ||
            isViewingWorksite ||
            isViewingWorksiteHistory ||
            isViewingWorksiteFlag ||
            isNewWorksite)
      "
      class="flex flex-col h-full shadow-2xl w-1/5"
      style="min-width: 360px"
      data-cy="worksiteview"
    >
      <div
        style="background-color: white"
        class="border border-r-0 border-l-0 border-gray-300 card-header flex items-center"
      >
        <div
          class="w-1/2 h-full p-3 flex items-center justify-center cursor-pointer"
          :class="{ 'tab-active': isNewWorksite }"
          @click="createNewWorksite"
        >
          <ccu-icon :alt="$t('casesVue.new_case')" type="active" size="small" />
          <span class="px-2">{{ $t('casesVue.new_case') }}</span>
        </div>
        <div
          v-if="currentWorksite && currentWorksite.id"
          class="w-1/2 h-full p-3 flex items-center justify-center"
          :class="{
            'tab-active':
              isEditingWorksite ||
              isViewingWorksite ||
              isViewingWorksiteFlag ||
              isViewingWorksiteHistory,
          }"
        >
          {{
            currentWorksite && isEditingWorksite
              ? `Edit ${currentWorksite.case_number}`
              : `View ${currentWorksite.case_number}`
          }}
          <ccu-icon
            :alt="$t('actions.cancel')"
            size="xs"
            type="cancel"
            class="ml-2"
            @click.native="
              $router.push(`/incident/${$route.params.incident_id}/cases/new`)
            "
          />
        </div>
      </div>
      <div
        v-if="
          isEditingWorksite ||
            isViewingWorksite ||
            isViewingWorksiteHistory ||
            isViewingWorksiteFlag ||
            isNewWorksite
        "
        class="text-crisiscleanup-grey-700 text-lg flex p-2 bg-white justify-between items-center border-b"
        data-cy="worksiteview_actions"
      >
        <template v-if="isViewingWorksiteHistory">
          <ccu-icon
            :alt="$t('actions.history')"
            size="medium"
            class="text-black mb-1"
            type="history"
          >
            <span class="ml-1 mt-1"
              >{{ currentWorksite.case_number }}
              {{ $t('actions.history') }}</span
            >
          </ccu-icon>
          <ccu-icon
            :alt="$t('actions.cancel')"
            size="xs"
            type="cancel"
            @click.native="backToWorksite"
          />
        </template>
        <template v-else-if="isViewingWorksiteFlag">
          <ccu-icon
            :alt="$t('actions.flag')"
            size="medium"
            class="text-black mb-1"
            type="flag"
          >
            <span v-if="currentWorksite" class="ml-1 mt-1"
              >{{ currentWorksite.case_number }} {{ $t('actions.flag') }}</span
            >
          </ccu-icon>
          <ccu-icon
            :alt="$t('actions.cancel')"
            size="xs"
            type="cancel"
            @click.native="backToWorksite"
          />
        </template>
        <template v-else-if="isNewWorksite">
          <div class="text-left text-black">{{ $t('casesVue.new_case') }}</div>
          <ccu-icon
            :alt="$t('actions.cancel')"
            size="xs"
            type="cancel"
            @click.native="closeWorksite"
          />
        </template>
        <template v-else>
          <div class="text-left text-black flex items-center">
            {{ currentWorksite && currentWorksite.case_number }}
          </div>
          <div v-if="!isNewWorksite" class="flex items-center">
            <router-link
              :to="
                `/incident/${this.$route.params.incident_id}/cases/${this.$route.params.id}/flag`
              "
            >
              <ccu-icon
                :alt="$t('actions.flag')"
                size="small"
                class="p-1 py-2"
                type="flag"
              />
            </router-link>
            <ccu-icon
              :alt="$t('actions.jump_to_case')"
              size="small"
              class="p-1 py-2"
              type="go-case"
              @click.native="jumpToCase"
            />
            <router-link
              :to="
                `/incident/${this.$route.params.incident_id}/cases/${this.$route.params.id}/history`
              "
            >
              <ccu-icon
                :alt="$t('actions.history')"
                size="small"
                class="p-1 py-2"
                type="history"
              />
            </router-link>
            <ccu-icon
              :alt="$t('actions.download')"
              size="small"
              class="p-1 py-2"
              type="download"
              @click.native="downloadWorksite"
            />
            <ccu-icon
              :alt="$t('actions.share')"
              size="small"
              class="p-1 py-2"
              type="share"
            />
            <ccu-icon
              :alt="$t('actions.print')"
              size="small"
              class="p-1 py-2"
              type="print"
              @click.native="printWorksite"
            />
            <router-link
              v-if="isViewingWorksite"
              :to="
                `/incident/${this.$route.params.incident_id}/cases/${this.$route.params.id}/edit`
              "
            >
              <ccu-icon
                :alt="$t('actions.edit')"
                class="border p-2 bg-primary-light"
                size="small"
                type="edit"
              />
            </router-link>
          </div>
        </template>
      </div>
      <router-view
        v-if="!spinning"
        :key="$route.params.id"
        :incident="currentIncident"
        @closeWorksite="closeWorksite"
        @geocoded="addMarkerToMap"
        @savedWorksite="loadWorksite"
        @navigateToWorksite="
          id => {
            $router.push(
              `/incident/${this.$route.params.incident_id}/cases/${id}/edit?showOnMap=true`,
            );
          }
        "
        @reloadTable="reloadTable"
        @changed="loadWorksite"
        @reloadMap="reloadMap"
        @jumpToCase="jumpToCase"
      />
    </div>
  </div>
</template>

<script>
import { gmapApi } from 'vue2-google-maps';
import { mapState } from 'vuex';
import { throttle } from 'lodash';
import * as L from 'leaflet';
import Worksite from '@/models/Worksite';
import User from '@/models/User';
import Incident from '@/models/Incident';
import Location from '@/models/Location';
import Table from '@/components/Table';
import WorksiteMap from '@/components/WorksiteMap';
import WorksiteFilters from '@/components/WorksiteFilters';
import Status from '@/models/Status';
import { getQueryString } from '@/utils/urls';
import { getColorForStatus } from '@/filters';
import WorksiteSearchInput from '@/components/WorksiteSearchInput';
import { forceFileDownload } from '@/utils/downloads';

export default {
  name: 'Cases',
  components: {
    WorksiteSearchInput,
    WorksiteMap,
    WorksiteFilters,
    Table,
  },
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
      selectedTableItems: [],
      totalWorksites: 0,
      searchingWorksites: false,
      data: [],
      pagination: {
        pageSize: 100,
        page: 1,
        current: 1,
      },
      sorter: {
        key: null,
        direction: null,
      },
      currentQuery: {},
      filters: {
        fields: {},
        statusGroups: {},
        flags: {},
        statuses: {},
        sub_fields: {},
      },
      appliedFilters: {},
      newMarker: null,
      map: null,
      currentSearch: '',
      currentCaseView: '',
      getColorForStatus,
      appliedLocations: new Set(),
      showingUnclaimModal: false,
      unchangedStatusOnUnclaim: true,
      updateStatusOnUnclaim: false,
    };
  },
  computed: {
    columns() {
      return [
        {
          title: this.$t('casesVue.number_abbrev'),
          dataIndex: 'case_number',
          key: 'case_number',
          sortKey: 'id',
          width: '0.5fr',
          sortable: true,
        },
        {
          title: '',
          dataIndex: 'flags',
          key: 'flags',
          width: '0.25fr',
        },
        {
          title: this.$t('casesVue.work_type'),
          dataIndex: 'work_types',
          key: 'work_types',
          scopedSlots: { customRender: 'work_types' },
          width: '1.5fr',
        },
        {
          title: this.$t('casesVue.name'),
          dataIndex: 'name',
          key: 'name',
          width: '1.5fr',
          sortable: true,
        },
        {
          title: this.$t('casesVue.full_address'),
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: this.$t('casesVue.city'),
          dataIndex: 'city',
          key: 'city',
          sortable: true,
        },
        {
          title: this.$t('casesVue.county_parish'),
          dataIndex: 'county',
          key: 'county',
          sortable: true,
        },
      ];
    },
    currentWorksite() {
      return Worksite.find(this.$route.params.id);
    },
    usStates() {
      return Location.query()
        .where('type', 'boundary_political_us_state')
        .get();
    },
    districts() {
      return Location.query()
        .where('type', 'boundary_political_us_congress')
        .get();
    },
    isEditingWorksite() {
      return this.$route.meta.id === 'case_edit';
    },
    isViewingWorksite() {
      return this.$route.meta.id === 'case_view';
    },
    isViewingWorksiteHistory() {
      return this.$route.meta.id === 'case_history';
    },
    isViewingWorksiteFlag() {
      return this.$route.meta.id === 'case_flag';
    },
    isNewWorksite() {
      return this.$route.meta.id === 'case_new';
    },
    incidents() {
      return Incident.query()
        .orderBy('id', 'desc')
        .get();
    },
    currentIncident() {
      return Incident.find(this.$route.params.incident_id);
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    markers() {
      if (this.data) {
        return this.data.map(worksite => {
          return {
            ...worksite,
            position: {
              lat: worksite.latitude,
              lng: worksite.longitude,
            },
          };
        });
      }
      return [];
    },
    filtersCount() {
      return (
        Object.values(this.filters.statusGroups).filter(field => Boolean(field))
          .length +
        Object.values(this.filters.flags).filter(field => Boolean(field))
          .length +
        Object.values(this.filters.fields).filter(field => Boolean(field))
          .length +
        Object.values(this.filters.statuses).filter(field => Boolean(field))
          .length
      );
    },
    google: gmapApi,
    ...mapState('loading', ['worksitesLoading']),
  },
  watch: {
    currentIncident() {
      this.fetch({
        pageSize: this.pagination.pageSize,
        page: 1,
      });
    },
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
        this.filters = {
          ...this.filters,
          ...this.currentUser.states.filters,
        };
      }
    }
    if (this.$route.params.incident_id) {
      this.fetch({
        pageSize: this.pagination.pageSize,
        page: 1,
      });
    }
    const locationParams = {
      limit: 1000,
      type__in: 'boundary_political_us_congress,boundary_political_us_state,',
      fields: 'id,name,type',
    };
    await Location.api().get(`/locations?${getQueryString(locationParams)}`, {
      dataKey: 'results',
    });
  },
  methods: {
    handleTableChange({ pagination, filters, sorter }) {
      this.fetch({
        pageSize: pagination.pageSize,
        page: pagination.current,
        sortKey: sorter.key,
        sortDirection: sorter.direction,
        ...filters,
      });
    },

    updateUserState(incomingData) {
      let data = incomingData;
      if (!data) {
        data = {};
      }
      User.api().updateUserState({
        incident: this.$route.params.incident_id,
        appliedFilters: this.appliedFilters,
        filters: this.filters,
        showingMap: this.showingMap,
        showingTable: this.showingTable,
        ...data,
      });
    },

    onUpdatedFilters(filters) {
      this.filters = filters;
      this.handleFilters();
    },

    onMapMoved(bounds) {
      this.updateUserState({
        mapViewPort: bounds,
      });
    },

    async applyLocation(locationId, value) {
      if (value && this.$refs.workstiteMap.map) {
        await Location.api().fetchById(locationId);
        const location = Location.find(locationId);
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        L.geoJSON(geojsonFeature, {
          weight: '1',
          onEachFeature(feature, layer) {
            layer.location_id = locationId;
          },
        }).addTo(this.$refs.workstiteMap.map);
        this.appliedLocations.add(locationId);
      } else {
        this.$refs.workstiteMap.map.eachLayer(layer => {
          if (layer.location_id && layer.location_id === locationId) {
            this.$refs.workstiteMap.map.removeLayer(layer);
          }
        });
        this.appliedLocations.delete(locationId);
      }
    },
    async fetch(params = {}) {
      this.tableLoading = true;
      const query = {
        fields:
          'id,name,address,case_number,work_types,city,state,county,flags,location,incident,postal_code',
        incident: this.$route.params.incident_id,
      };
      this.currentQuery = { ...query, ...this.appliedFilters };
      const queryParams = {
        ...query,
        offset: params.pageSize * (params.page - 1),
        limit: params.pageSize,
        ...this.appliedFilters,
      };
      if (params.sortKey) {
        queryParams.sort = `${params.sortDirection === 'desc' ? '-' : ''}${
          params.sortKey
        }`;
      }
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites`,
        {
          params: queryParams,
        },
      );
      this.tableLoading = false;

      this.data = response.data.results.map(result => {
        // eslint-disable-next-line camelcase
        let { form_data } = result;
        if (!form_data) {
          form_data = [];
        }

        result.items = form_data.reduce((obj, item) => {
          return {
            ...obj,
            [item.field_key]: item.field_value,
          };
        }, {});
        // Proxy allows us to treat dynamic form data fields as static properties
        return new Proxy(result, {
          get(target, name, receiver) {
            const rv = Reflect.get(target, name, receiver);
            if (!rv) {
              return target.items[name];
            }
            return rv;
          },
        });
      });
      this.pagination = {
        page: params.page,
        current: params.page,
        pageSize: params.pageSize,
        total: response.data.count,
      };
      if (params.sortKey) {
        this.sorter = {
          key: params.sortKey,
          direction: params.sortDirection,
        };
      }
      this.getWorksiteCount();
    },

    async getWorksiteCount() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites`,
        {
          params: {
            incident: this.$route.params.incident_id,
            limit: 1,
          },
        },
      );
      this.totalWorksites = response.data.count;
    },

    async reloadTable() {
      await this.fetch({
        pageSize: this.pagination.pageSize,
        page: this.pagination.current,
        sortKey: this.sorter.key,
        sortDirection: this.sorter.direction,
      });
    },

    reloadMap(worksiteId) {
      if (this.$refs.workstiteMap) {
        if (worksiteId) {
          this.$refs.workstiteMap.updateMap(worksiteId);
          this.$refs.workstiteMap.markerLayer.clearLayers();
        } else {
          this.$refs.workstiteMap.$forceUpdate();
        }
      }
    },

    async loadWorksite() {
      this.reloadTable();
    },

    async closeWorksite() {
      if (this.isNewWorksite) {
        await this.$router.push(
          `/incident/${this.$route.params.incident_id}/cases`,
        );
      } else {
        await this.$router.push(
          `/incident/${this.$route.params.incident_id}/cases/new`,
        );
      }
    },

    async backToWorksite() {
      await this.$router.push(
        `/incident/${this.$route.params.incident_id}/cases/${this.$route.params.id}`,
      );
    },

    async displayWorksite(record) {
      await this.$router.replace(
        `/incident/${this.$route.params.incident_id}/cases/${record.id}`,
      );
    },
    async createNewWorksite() {
      await this.$router.push(
        `/incident/${this.$route.params.incident_id}/cases/new`,
      );
      this.toggleView('showingMap');
      this.spinning = false;
    },
    toggleView(view) {
      this.showingMap = false;
      this.showingTable = false;
      this[view] = true;
      this.updateUserState();
    },
    onSearch: throttle(async function(search) {
      this.currentSearch = search;
      this.searchingWorksites = true;
      const searchWorksites = await Worksite.api().searchWorksites(
        search,
        this.$route.params.incident_id,
      );
      this.searchWorksites = searchWorksites.entities.worksites;
      this.searchingWorksites = false;
    }, 1000),

    async handleChange(value) {
      await this.$router.push(
        `/incident/${this.$route.params.incident_id}/cases/${value.id}?showOnMap=true`,
      );
      this.searchValue = '';
    },
    handleFilters() {
      const appliedFilters = {
        work_type__work_type__in: '',
        flags: '',
      };
      const workTypeEntries = Object.entries(this.filters.fields);
      workTypeEntries.forEach(([workType, values]) => {
        if (values) {
          appliedFilters.work_type__work_type__in += `${workType},`;
        }
      });
      const flagEntries = Object.entries(this.filters.flags);
      flagEntries.forEach(([flag, value]) => {
        if (value) {
          appliedFilters.flags += `${flag},`;
        }
      });
      if (!Object.values(this.filters.fields).some(value => Boolean(value))) {
        delete appliedFilters.work_type__work_type__in;
      }

      if (this.filters.statusGroups.unclaimed) {
        appliedFilters.work_type__claimed_by__isnull = true;
      }

      if (this.filters.statusGroups.claimed_by_org) {
        appliedFilters.work_type__claimed_by = this.currentUser.organization.id;
      }

      if (this.filters.statusGroups.reported_by_org) {
        appliedFilters.reported_by = this.currentUser.organization.id;
      }

      if (this.filters.statusGroups.open) {
        const openStatuses = Status.query()
          .where('primary_state', 'open')
          .get();
        appliedFilters.work_type__status__in = openStatuses
          .map(status => status.status)
          .join(',');
      }

      if (this.filters.statusGroups.closed) {
        const closedStatuses = Status.query()
          .where('primary_state', 'closed')
          .get();
        appliedFilters.work_type__status__in = closedStatuses
          .map(status => status.status)
          .join(',');
      }

      const filteredStatuses = Object.entries(
        this.filters.statuses,
      ).filter(item => Boolean(item[1]));

      if (filteredStatuses.length) {
        const workTypeStatusIn = filteredStatuses
          .map(item => item[0])
          .join(',');

        if (!appliedFilters.work_type__status__in) {
          appliedFilters.work_type__status__in = workTypeStatusIn;
        } else {
          appliedFilters.work_type__status__in = `${appliedFilters.work_type__status__in},${workTypeStatusIn}`;
        }
      }

      this.appliedFilters = appliedFilters;
      this.showingFilters = false;
      this.fetch({
        pageSize: this.pagination.pageSize,
        page: this.pagination.current,
      });
      this.updateUserState();
    },
    async printWorksite(e, siteId) {
      this.spinning = true;
      const pdf = await Worksite.api().printWorksite(
        siteId || this.currentWorksite.id,
      );
      forceFileDownload(pdf.response);
      this.spinning = false;
    },
    async downloadWorksite(e, siteId) {
      this.spinning = true;
      const csv = await Worksite.api().downloadWorksite(
        siteId || this.currentWorksite.id,
      );
      forceFileDownload(csv.response);
      this.spinning = false;
    },
    // TODO: refactor, id param is unused
    // eslint-disable-next-line no-unused-vars
    async jumpToCase(id) {
      this.toggleView('showingMap');

      const waitForMap = () => {
        if (this.$refs.workstiteMap && !this.$refs.workstiteMap.mapLoading) {
          this.$refs.workstiteMap.map.setView(
            [this.currentWorksite.latitude, this.currentWorksite.longitude],
            18,
          );
          const popup = L.popup({ className: 'pixi-popup' });
          popup
            .setLatLng([
              this.currentWorksite.latitude,
              this.currentWorksite.longitude,
            ])
            .setContent(
              `<b>${this.currentWorksite.name} (${this.currentWorksite.case_number}</b>)`,
            )
            .openOn(this.$refs.workstiteMap.map);
          setTimeout(() => {
            this.$refs.workstiteMap.map.closePopup();
          }, 5000);
        } else {
          setTimeout(waitForMap, 50);
        }
      };
      waitForMap();
    },
    addMarkerToMap(location) {
      this.$refs.workstiteMap.markerLayer.clearLayers();
      new L.marker(location).addTo(this.$refs.workstiteMap.markerLayer);
      this.$refs.workstiteMap.map.setView([location.lat, location.lng], 15);
      this.toggleView('showingMap');
    },
    async unclaimSelected() {
      this.spinning = true;
      const promises = [];
      this.selectedTableItems.forEach(worksiteId => {
        promises.push(
          Worksite.api().unclaimWorksite(
            worksiteId,
            [],
            this.updateStatusOnUnclaim ? 'open_unassigned' : null,
          ),
        );
      });
      const results = await Promise.allSettled(promises);
      results.forEach(result => this.$log.debug(result));
      this.spinning = false;
      this.showingUnclaimModal = false;
      this.reloadTable();
    },
    async batchAction(action) {
      this.spinning = true;
      await this.selectedTableItems.forEach(i => action(null, i));
      this.spinning = false;
      this.reloadTable();
    },
  },
};
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

.borderless-bp__btn {
  @apply border-0;
}
</style>
