<template>
  <div class="flex-grow page-grid h-full">
    <div class="flex flex-col">
      <div class="flex items-center justify-between">
        <div class="flex py-3 px-2" style="min-width: 80px">
          <ccu-icon
            :alt="$t('casesVue.map_view')"
            size="medium"
            class="mr-4 cursor-pointer"
            :class="showingMap ? 'filter-yellow' : 'filter-gray'"
            type="map"
            ccu-event="user_ui-view-map"
            @click.native="toggleView('showingMap')"
            data-cy="cases.mapButton"
          />
          <ccu-icon
            :alt="$t('casesVue.table_view')"
            size="medium"
            class="mr-4 cursor-pointer"
            :class="showingTable ? 'filter-yellow' : 'filter-gray'"
            type="table"
            ccu-event="user_ui-view-table"
            @click.native="toggleView('showingTable')"
            data-cy="cases.tableButton"
          />
        </div>
        <span v-if="allWorksiteCount" class="font-thin">
          <span>
            {{ $t('~~Number of Cases:') }}
            {{ allWorksiteCount | numeral('0,0') }}
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
            :placeholder="$t('actions.search')"
            size="medium"
            class="mx-2"
            @selectedExisting="
              (w) => {
                $router.push({ query: { showOnMap: true } });
                worksiteId = w.id;
                isEditing = true;
              }
            "
            @search="onSearch"
            @clear="onSearch"
          />
        </div>
      </div>
      <div class="flex-grow">
        <div v-show="showingMap" class="relative h-full select-none">
          <div
            id="map"
            ref="map"
            class="absolute top-0 left-0 right-0 bottom-0"
          ></div>
          <div
            v-if="mapLoading"
            style="z-index: 1001"
            class="
              absolute
              top-0
              left-0
              right-0
              bottom-0
              flex
              items-center
              justify-center
            "
          >
            <spinner />
          </div>
        </div>
        <div v-show="showingTable" class="p-2 h-full shadow">
          <AjaxTable
            :columns="columns"
            :url="tableUrl"
            :body-style="{ height: '100%' }"
            ref="table"
            class="mt-6 shadow-lg"
            :query="worksiteQuery"
            @row:click="
              (worksite) => {
                worksiteId = worksite.id;
                isEditing = true;
              }
            "
          >
            <template #work_types="slotProps">
              <div class="flex flex-col">
                <div
                  v-for="work_type in slotProps.item.work_types"
                  :key="`${work_type.id}`"
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
          </AjaxTable>
        </div>
      </div>
    </div>
    <div>
      <CaseHeader
        v-if="worksite"
        :worksite="worksite"
        class="p-2 border-l border-r"
        can-edit
        :is-viewing-worksite="false"
        @onJumpToCase="jumpToCase"
        @onDownloadWorksite="() => {}"
        @onPrintWorksite="() => {}"
        @onShowHistory="showHistory = true"
      />
      <div v-else class="h-12 flex items-center cursor-pointer px-2 border">
        <ccu-icon :alt="$t('casesVue.new_case')" type="active" size="small" />
        <span class="px-1 mt-0.5">{{ $t('casesVue.new_case') }}</span>
      </div>
      <div v-if="showingDetails" class="flex items-center justify-between px-2">
        <base-button
          icon="arrow-left"
          :icon-size="medium"
          :action="
            () => {
              showHistory = false;
              showFlags = false;
            }
          "
        />

        <span class="text-base">{{ $t('~~History') }}</span>
        <div></div>
      </div>
      <div class="flex">
        <CaseHistory
          v-if="showHistory"
          :incident-id="currentIncidentId"
          :worksite-id="worksiteId"
        ></CaseHistory>
        <case-form
          v-else
          ref="worksiteForm"
          :incident-id="String(currentIncidentId)"
          :worksite-id="worksiteId"
          :key="worksiteId"
          @jumpToCase="jumpToCase"
          disable-claim-and-save
          :data-prefill="prefillData"
          :is-editing="isEditing"
          @savedWorksite="
            (worksite) => {
              worksiteId = worksite.id;
              isEditing = true;
            }
          "
          @closeWorksite="clearCase"
          class="border shadow"
          @navigateToWorksite="
            (id) => {
              worksiteId = id;
              isEditing = true;
            }
          "
          @geocoded="addMarkerToMap"
        />
        <transition name="slide-fade">
          <div
            class="absolute flex flex-col -ml-12 mt-12"
            style="z-index: 1002"
          >
            <PhoneComponentButton class="phone-button" name="agent">
              <template v-slot:button>
                <div class="w-full h-full flex items-center justify-center">
                  <div
                    class="
                      bg-primary-light
                      h-7
                      w-7
                      rounded
                      flex
                      items-center
                      justify-center
                      relative
                    "
                  >
                    {{ $t('~~GO') }}
                    <span class="absolute inset-0 top-0 left-0">
                      <div
                        :class="{
                          'bg-green-500': isTakingCalls,
                          'bg-red-500': isNotTakingCalls,
                        }"
                        class="
                          flex
                          items-center
                          justify-center
                          border border-white
                          rounded-full
                          w-3
                          h-3
                          -mt-1.5
                          -ml-1.5
                          p-1.5
                          leading-4
                        "
                      ></div>
                    </span>
                  </div>
                </div>
              </template>
              <template v-slot:component>
                <div>
                  <Agent @onLoggedIn="onLoggedIn" />
                  <tabs
                    :details="false"
                    v-if="caller"
                    class="w-full"
                    ref="tabs"
                  >
                    <tab :name="$t('~~Active Call')">
                      <ActiveCall
                        :case-id="worksiteId"
                        @setCase="worksiteId = $event"
                      />
                    </tab>
                    <tab :name="$t('~~Call Status')">
                      <UpdateStatus
                        class="p-2"
                        @onCompleteCall="completeCall"
                      />
                    </tab>
                  </tabs>
                </div>
              </template>
            </PhoneComponentButton>
            <PhoneComponentButton
              name="dialer"
              class="phone-button"
              icon="dialer"
              icon-size="small"
              icon-class="bg-black p-1"
            >
              <template v-slot:component>
                <ManualDialer
                  class="bg-white w-84 p-2"
                  style="z-index: 1002"
                  @onDial="dialManualOutbound"
                  :dialing="dialing"
                ></ManualDialer>
              </template>
            </PhoneComponentButton>
            <PhoneComponentButton
              v-if="stats.inQueue"
              name="stats"
              class="phone-button"
            >
              <template v-slot:button>
                <div class="w-full h-full flex items-center justify-center">
                  <div class="text-xl">
                    {{ stats.inQueue || 0 }}
                  </div>
                </div>
              </template>
              <template v-slot:component>
                <GeneralStats class="w-84" />
              </template>
            </PhoneComponentButton>
            <PhoneComponentButton
              name="my-stats"
              class="phone-button"
              icon="phone-user"
              icon-size="small"
              icon-class="p-1"
              v-if="agentStats.agentId"
            >
              <template v-slot:component>
                <AgentStats class="w-84" />
              </template>
            </PhoneComponentButton>
            <PhoneComponentButton
              name="reset"
              class="phone-button"
              icon="logout"
              icon-size="small"
              icon-class="p-1"
            >
              <template v-slot:component>
                <div class="w-84 flex items-center justify-center p-3">
                  <base-button
                    size="medium"
                    :text="$t('~~Reset Phone System')"
                    :action="resetPhoneSystem"
                    class="text-white bg-crisiscleanup-red-200"
                  ></base-button>
                </div>
              </template>
            </PhoneComponentButton>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import * as L from 'leaflet';
import { debounce } from 'lodash';
import CaseForm from '@/pages/CaseForm';
import { getWorksiteLayer, mapAttribution, mapTileLayer } from '@/utils/map';
import PhoneComponentButton from '@/components/phone/PhoneComponentButton';
import ManualDialer from '@/components/phone/ManualDialer';
import { ConnectFirstMixin, DialogsMixin } from '@/mixins';
import Agent from '@/components/phone/Agent';
import AjaxTable from '@/components/AjaxTable';
import { getColorForStatus } from '@/filters';
import CaseHeader from '@/components/CaseHeader';
import Worksite from '@/models/Worksite';
import CaseHistory from '@/pages/CaseHistory';
import WorksiteSearchInput from '@/components/WorksiteSearchInput';
import ActiveCall from '@/components/phone/ActiveCall';
import { getErrorMessage } from '@/utils/errors';
import UpdateStatus from '@/components/phone/UpdateStatus';
import PhoneOutbound from '@/models/PhoneOutbound';
import { EventBus } from '@/event-bus';
import GeneralStats from '@/components/phone/GeneralStats';
import AgentStats from '@/components/phone/AgentStats';

export default {
  name: 'PhoneNew',
  components: {
    AgentStats,
    GeneralStats,
    UpdateStatus,
    ActiveCall,
    WorksiteSearchInput,
    CaseHistory,
    CaseHeader,
    AjaxTable,
    Agent,
    ManualDialer,
    PhoneComponentButton,
    CaseForm,
  },
  mixins: [ConnectFirstMixin, DialogsMixin],
  data() {
    return {
      worksiteId: null,
      isEditing: false,
      mapLoading: false,
      map: null,
      hover: false,
      showingMap: true,
      showingTable: false,
      allWorksiteCount: 0,
      getColorForStatus,
      viewCase: false,
      showHistory: false,
      showFlags: false,
      searchWorksites: [],
      searchingWorksites: false,
      dialing: false,
    };
  },
  async mounted() {
    const markers = await this.getWorksites();
    this.loadMap(markers);
  },
  computed: {
    prefillData() {
      if (this.caller?.dnis) {
        return {
          phone1: this.caller?.dnis,
        };
      }
      return {};
    },
    showingDetails() {
      return this.showHistory || this.showFlags;
    },
    tableUrl() {
      return `${process.env.VUE_APP_API_BASE_URL}/worksites`;
    },
    worksiteQuery() {
      return {
        incident: this.currentIncidentId,
      };
    },
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
    worksite() {
      if (this.worksiteId) {
        return Worksite.find(this.worksiteId);
      }
      return null;
    },
  },
  methods: {
    async completeCall({ status, notes }) {
      if (this.$refs.worksiteForm.dirtyFields.size) {
        const result = await this.$confirm({
          title: this.$t('phoneDashboard.complete_call'),
          content: this.$t('phoneDashboard.unsaved_changes_error'),
          actions: {
            no: {
              text: this.$t('actions.do_not_save'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            yes: {
              text: this.$t('actions.continue'),
              type: 'solid',
            },
          },
        });
        if (result === 'no' || result === 'cancel') {
          return;
        }
      }

      try {
        if (this.$phoneService.callInfo.callType === 'OUTBOUND') {
          await PhoneOutbound.api().updateStatus(this.call.id, {
            statusId: status,
            worksiteId: this.worksiteId,
            notes,
          });
        }

        if (this.$phoneService.callInfo.callType === 'INBOUND') {
          await this.$http.post(
            `${process.env.VUE_APP_API_BASE_URL}/phone_inbound/${this.call.id}/update_status`,
            {
              status,
              notes,
            },
          );
        }

        await this.$toasted.success(this.$t('~~Successfully Updated'));
        this.clearCall();
        this.clearCase();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    clearCase() {
      this.caseId = null;
      this.isEditing = false;
    },
    toggleView(view) {
      this.showingMap = false;
      this.showingTable = false;
      this[view] = true;
    },
    onSearch: debounce(
      async function (search) {
        this.searchingWorksites = true;
        if (!search) {
          this.searchWorksites = [];
        }
        const searchData = await this.search(search, this.currentIncidentId);
        this.searchWorksites = search ? searchData.data.results : [];
        this.searchingWorksites = false;
      },
      250,
      {
        leading: false,
        trailing: true,
      },
    ),
    search(search, incident) {
      return this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites?fields=id,name,address,case_number,postal_code,city,state,incident,work_types&limit=5&search=${search}&incident=${incident}`,
      );
    },
    async addMarkerToMap(location) {
      let markerLocation = location;
      if (!markerLocation) {
        markerLocation = this.map.getCenter();
      }

      const marker = new L.marker(markerLocation, { draggable: 'true' }).addTo(
        this.map,
      );
      marker.on('dragend', function (event) {
        EventBus.$emit('updatedWorksiteLocation', event.target.getLatLng());
      });
      this.map.setView([markerLocation.lat, markerLocation.lng], 15);
      marker
        .bindTooltip(this.$t('casesVue.drag_pin_to_correct_location'), {
          direction: 'top',
        })
        .openTooltip();
      this.toggleView('showingMap');
    },
    async jumpToCase() {
      this.toggleView('showingMap');

      if (this.map) {
        this.map.setView([this.worksite.latitude, this.worksite.longitude], 18);
        const popup = L.popup({ className: 'pixi-popup' });
        popup
          .setLatLng([this.worksite.latitude, this.worksite.longitude])
          .setContent(
            `<b>${this.worksite.name} (${this.worksite.case_number}</b>)`,
          )
          .openOn(this.map);
        setTimeout(() => {
          this.map.closePopup();
        }, 5000);
      }
    },

    onSelectMarker(marker) {
      this.isEditing = true;
      this.worksiteId = marker.id;
    },
    loadMap(markers) {
      if (!this.map) {
        this.map = L.map('map', {
          zoomControl: false,
        }).fitBounds([
          [17.644022027872726, -122.78314470293876],
          [50.792047064406866, -69.87298845293874],
        ]);

        L.tileLayer(mapTileLayer, {
          // tileSize: 512,
          // zoomOffset: -1,
          attribution: mapAttribution,
          detectRetina: false,
          maxZoom: 18,
          noWrap: false,
        }).addTo(this.map);
      }
      const worksiteLayer = getWorksiteLayer(markers, this.map, this, true);
      worksiteLayer.addTo(this.map);
      this.$nextTick(() => {
        // Add this slight pan to re-render map
        this.map.panBy([1, 0]);
      });
    },
    async getWorksites() {
      this.mapLoading = true;
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites_all`,
        {
          params: {
            incident: this.currentIncidentId,
          },
        },
      );
      this.mapLoading = false;
      this.allWorksiteCount = response.data.results.length;
      return response.data.results;
    },
    async onLoggedIn() {
      if (Number(this.stats.inQueue || this.stats.routing || 0) === 0) {
        await this.dialNextOutbound();
      }
    },
  },
  watch: {
    caller(newValue, oldValue) {
      if (!oldValue && newValue) {
        EventBus.$emit('phone_component:open', 'agent');
      }
    },
  },
};
</script>

<style scoped>
.page-grid {
  display: grid;
  grid-template-columns: auto 350px;
}
.phone-button {
  @apply shadow w-12 h-12 my-1 bg-white cursor-pointer;
}
</style>
