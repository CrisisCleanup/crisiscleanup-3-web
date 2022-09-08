<template>
  <div
    class="flex-grow h-full"
    :class="$mq === 'sm' ? 'page-grid-mobile' : 'page-grid'"
  >
    <div v-if="$mq !== 'sm'" class="flex flex-col">
      <div class="flex items-center">
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
            {{ $t('casesVue.cases') }}
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
        <div
          v-for="incident in incidentsWithActivePhones"
          :key="incident.id"
          class="ml-2"
        >
          {{ incident.short_name }}:
          {{ getIncidentPhoneNumbers(incident) }}
        </div>
      </div>
      <PhoneToolBar
        :complete-call="completeCall"
        :on-logged-in="onLoggedIn"
        :on-toggle-outbounds="onToggleOutbounds"
        :select-case="selectCase"
        :worksite-id="worksiteId"
      />
      <div class="flex-grow">
        <div v-show="showingMap" class="relative h-full select-none">
          <PhoneMap :map-loading="mapLoading" />
        </div>
        <div v-show="showingTable" class="p-2 h-full shadow">
          <AjaxTable
            :columns="columns"
            :url="tableUrl"
            :body-style="{ height: '100%' }"
            ref="table"
            class="mt-6 shadow-lg"
            :query="worksiteQuery"
            @rowClick="
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
    <PhoneToolBar
      v-else
      :complete-call="completeCall"
      :on-logged-in="onLoggedIn"
      :on-toggle-outbounds="onToggleOutbounds"
      :select-case="selectCase"
      :worksite-id="worksiteId"
    />
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
      <div v-else class="h-12 px-2 border flex items-center justify-between">
        <div class="flex items-center cursor-pointer">
          <ccu-icon
            :alt="$t('casesVue.new_case')"
            type="active"
            size="small"
            :action="() => selectCase(null)"
          />
          <span class="px-1 mt-0.5">{{ $t('casesVue.new_case') }}</span>
        </div>
        <base-button
          v-if="$mq === 'sm'"
          type="bare"
          icon="map"
          class="text-gray-700 pt-2"
          :action="
            () => {
              showMobileMap = true;
              $nextTick(() => {
                map.invalidateSize();
              });
            }
          "
          :text="$t('casesVue.show_map')"
        />
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

        <span class="text-base">{{ $t('actions.history') }}</span>
        <div></div>
      </div>
      <div class="flex flex-col md:flex-row">
        <tabs
          :details="false"
          v-if="caller && $mq === 'sm'"
          style="z-index: 1003"
          ref="tabs"
          @mounted="setTabs"
        >
          <tab :name="$t('phoneDashboard.active_call')">
            <ActiveCall :case-id="worksiteId" @setCase="selectCase" />
          </tab>
          <tab :name="$t('phoneDashboard.call_status')" ref="statusTab">
            <UpdateStatus
              class="p-2 pr-8 sm:pr-0 w-11/12 sm:w-full"
              @onCompleteCall="completeCall"
            />
          </tab>
        </tabs>
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
              tabs.selectTab(this.$refs.statusTab);
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
            class="absolute"
            :class="$mq === 'sm' ? 'right-0' : ''"
            style="z-index: 1004"
          >
            <tabs
              :details="false"
              v-if="caller && $mq !== 'sm'"
              class="bg-white tabs mt-1"
              style="z-index: 1003"
              ref="tabs"
              @mounted="setTabs"
            >
              <tab :name="$t('phoneDashboard.active_call')">
                <ActiveCall :case-id="worksiteId" @setCase="selectCase" />
              </tab>
              <tab :name="$t('phoneDashboard.call_status')" ref="statusTab">
                <UpdateStatus class="p-2" @onCompleteCall="completeCall" />
              </tab>
            </tabs>
            <div
              class="flex flex-col sm:mt-12"
              :class="$mq === 'sm' ? 'right-0' : '-ml-12'"
              style="z-index: 1003"
              ref="phoneButtons"
            >
              <PhoneComponentButton
                name="dialer"
                class="phone-button"
                icon="dialer"
                icon-size="small"
                icon-class="bg-black p-1"
              >
                <template v-slot:component>
                  <ManualDialer
                    class="p-2"
                    style="z-index: 1002"
                    @onDial="dialManualOutbound"
                    :dialing="dialing"
                  ></ManualDialer>
                </template>
              </PhoneComponentButton>
              <PhoneComponentButton
                name="chat"
                class="phone-button"
                component-width="MD"
                @open="
                  () => {
                    updateUserState({
                      chat_last_seen: $moment().toISOString(),
                    });
                    unreadChatCount = 0;
                    unreadUrgentChatCount = 0;
                  }
                "
              >
                <template v-slot:button>
                  <div
                    class="
                      w-full
                      h-full
                      flex
                      items-center
                      justify-center
                      relative
                    "
                  >
                    <div
                      v-if="unreadChatCount"
                      class="absolute top-0 left-0 m-1"
                    >
                      <span
                        class="
                          inline-flex
                          items-center
                          justify-center
                          px-1
                          py-0.5
                          mr-2
                          text-xs
                          font-bold
                          leading-none
                          text-black
                          bg-primary-light
                          rounded-full
                        "
                        >{{ unreadChatCount }}</span
                      >
                    </div>
                    <div
                      v-if="unreadUrgentChatCount"
                      class="absolute top-0 right-0 my-1 -mx-1"
                    >
                      <span
                        class="
                          inline-flex
                          items-center
                          justify-center
                          px-1
                          py-0.5
                          mr-2
                          text-xs
                          font-bold
                          leading-none
                          text-red-100
                          bg-red-600
                          rounded-full
                        "
                        >{{ unreadUrgentChatCount }}</span
                      >
                    </div>
                    <ccu-icon type="chat" class="p-1 ml-1.5" size="large" />
                  </div>
                </template>
                <template v-slot:component>
                  <Chat
                    v-if="selectedChat"
                    @unreadCount="unreadChatCount = $event"
                    @unreadUrgentCount="unreadUrgentChatCount = $event"
                    class="h-full"
                    @onNewMessage="unreadChatCount += 1"
                    @onNewUrgentMessage="unreadUrgentChatCount += 1"
                    :chat="selectedChat"
                  />
                </template>
              </PhoneComponentButton>
              <PhoneComponentButton
                component-width="LG"
                name="news"
                class="phone-button"
                @open="
                  () => {
                    updateUserState({
                      news_last_seen: $moment().toISOString(),
                    });
                    unreadNewsCount = 0;
                  }
                "
              >
                <template v-slot:button>
                  <div
                    class="
                      w-full
                      h-full
                      flex
                      items-center
                      justify-center
                      relative
                    "
                  >
                    <div
                      v-if="unreadNewsCount"
                      class="absolute top-0 left-0 m-1"
                    >
                      <span
                        class="
                          inline-flex
                          items-center
                          justify-center
                          px-1
                          py-0.5
                          mr-2
                          text-xs
                          font-bold
                          leading-none
                          text-red-100
                          bg-red-600
                          rounded-full
                        "
                        >{{ unreadNewsCount }}</span
                      >
                    </div>
                    <ccu-icon type="news" class="p-1 ml-1.5" size="large" />
                  </div>
                </template>
                <template v-slot:component>
                  <PhoneNews @unreadCount="unreadNewsCount = $event" />
                </template>
              </PhoneComponentButton>
              <PhoneComponentButton
                name="history"
                class="phone-button"
                icon="phone-history"
                icon-size="large"
                icon-class="p-1"
                component-width="LG"
                v-if="callHistory"
              >
                <template v-slot:component>
                  <CallHistory
                    :calls="callHistory"
                    @rowClick="
                      ({ mobile }) => {
                        setManualOutbound(mobile);
                      }
                    "
                  />
                </template>
              </PhoneComponentButton>
              <PhoneComponentButton name="stats" class="phone-button">
                <template v-slot:button>
                  <div class="w-full h-full flex items-center justify-center">
                    <div class="text-xl">
                      {{ callsWaiting }}
                    </div>
                  </div>
                </template>
                <template v-slot:component>
                  <GeneralStats
                    @onRemainingCallbacks="remainingCallbacks = $event"
                    @onRemainingCalldowns="remainingCalldowns = $event"
                  />
                </template>
              </PhoneComponentButton>
              <PhoneComponentButton
                component-width="LG"
                name="leaderboard"
                class="phone-button"
              >
                <template v-slot:button>
                  <div class="w-full h-full flex items-center justify-center">
                    <ccu-icon
                      :fa="true"
                      type="users"
                      class="p-1"
                      size="medium"
                    />
                  </div>
                </template>
                <template v-slot:component>
                  <Leaderboard class="h-full" />
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
                  <div class="flex items-center justify-center p-3">
                    <base-button
                      size="medium"
                      :text="$t('phoneDashboard.reset_phone_system')"
                      :action="resetPhoneSystem"
                      class="text-white bg-crisiscleanup-red-200"
                    ></base-button>
                  </div>
                </template>
              </PhoneComponentButton>
            </div>
          </div>
        </transition>
      </div>
      <div
        v-show="$mq === 'sm' && showMobileMap"
        class="absolute right-0 top-0 left-0 bottom-0"
      >
        <PhoneMap></PhoneMap>
        <div class="absolute w-full flex items-center justify-center bottom-0">
          <base-button
            class="mb-12"
            variant="solid"
            size="lg"
            style="z-index: 1002"
            :text="$t('phoneDashboard.close_map')"
            :action="
              () => {
                showMobileMap = false;
              }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as L from 'leaflet';
import { debounce } from 'lodash';
import CaseForm from '@/pages/CaseForm';
import { getWorksiteLayer } from '@/utils/map';
import PhoneComponentButton from '@/components/phone/PhoneComponentButton';
import ManualDialer from '@/components/phone/ManualDialer';
import { ConnectFirstMixin, DialogsMixin, UserMixin } from '@/mixins';
import AjaxTable from '@/components/AjaxTable';
import { formatNationalNumber, getColorForStatus } from '@/filters';
import CaseHeader from '@/components/CaseHeader';
import Worksite from '@/models/Worksite';
import CaseHistory from '@/pages/CaseHistory';
import WorksiteSearchInput from '@/components/WorksiteSearchInput';
import { getErrorMessage } from '@/utils/errors';
import PhoneOutbound from '@/models/PhoneOutbound';
import { EventBus } from '@/event-bus';
import GeneralStats from '@/components/phone/GeneralStats';
import CallHistory from '@/components/phone/Widgets/CallHistory';
import PhoneMap from '@/pages/phone/PhoneMap';
import Leaderboard from '@/components/phone/Leaderboard';
import Incident from '@/models/Incident';
import Chat from '@/components/chat/Chat';
import PhoneNews from '@/components/phone/PhoneNews';
import PhoneToolBar from '@/pages/phone/PhoneToolBar';
import ActiveCall from '@/components/phone/ActiveCall';
import UpdateStatus from '@/components/phone/UpdateStatus';

export default {
  name: 'PhoneSysyem',
  components: {
    UpdateStatus,
    ActiveCall,
    PhoneToolBar,
    PhoneNews,
    Chat,
    Leaderboard,
    PhoneMap,
    CallHistory,
    GeneralStats,
    WorksiteSearchInput,
    CaseHistory,
    CaseHeader,
    AjaxTable,
    ManualDialer,
    PhoneComponentButton,
    CaseForm,
  },
  mixins: [ConnectFirstMixin, DialogsMixin, UserMixin],
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
      chatGroups: [],
      selectedChat: null,
      searchingWorksites: false,
      dialing: false,
      serveOutbounds: true,
      tabs: null,
      showMobileMap: false,
      remainingCallbacks: 0,
      remainingCalldowns: 0,
      unreadNewsCount: 0,
      unreadChatCount: 0,
      unreadUrgentChatCount: 0,
    };
  },
  async mounted() {
    if (this.currentUser.isAdmin) {
      this.serveOutbounds = false;
    }
    await this.init();
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
    callsWaiting() {
      return (
        Number(this.stats.inQueue || 0) +
        Number(this.stats.active || 0) +
        Number(this.remainingCallbacks || 0) +
        Number(this.remainingCalldowns || 0)
      );
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
    incidentsWithActivePhones() {
      return Incident.query()
        .where('active_phone_number', (number) => Boolean(number))
        .get();
    },
  },
  methods: {
    async init() {
      this.$phoneService.apiGetQueueStats().then((response) => {
        this.setGeneralStats({ ...response.data });
      });
      await this.getChatGroups();
      const { chatGroups } = this;
      const [group] = chatGroups;
      this.selectedChat = group;
      const markers = await this.getWorksites();
      this.loadMap(markers);
    },
    getIncidentPhoneNumbers(incident) {
      if (Array.isArray(incident.active_phone_number)) {
        return incident.active_phone_number
          .map((number) => formatNationalNumber(String(number)))
          .join(', ');
      }
      return formatNationalNumber(String(incident.active_phone_number));
    },
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
        if (this.$phoneService.callInfo.callType === 'OUTBOUND' && status) {
          await PhoneOutbound.api().updateStatus(this.call.id, {
            statusId: status,
            worksiteId: this.worksiteId,
            notes,
          });
        }

        if (this.$phoneService.callInfo.callType === 'INBOUND') {
          let data = {
            status,
            notes,
          };
          if (this.worksiteId) {
            data = { ...data, cases: [this.worksiteId] };
          }
          await this.$http.post(
            `${process.env.VUE_APP_API_BASE_URL}/phone_inbound/${this.call.id}/update_status`,
            data,
          );
        }

        await this.$toasted.success(this.$t('phoneDashboard.update_success'));
        this.clearCall();
        this.clearCase();
        await this.loadAgent();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    setManualOutbound(phone) {
      EventBus.$emit('phone_component:open', 'dialer');
      EventBus.$emit('dialer:set_phone_number', formatNationalNumber(phone));
    },
    clearCase() {
      this.worksiteId = null;
      this.isEditing = false;
    },
    setTabs(tabs) {
      this.tabs = tabs;
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

        L.gridLayer.googleMutant({ type: 'roadmap' }).addTo(this.map);
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
      if (
        this.serveOutbounds &&
        Number(this.stats.inQueue || this.stats.routing || 0) === 0
      ) {
        await this.dialNextOutbound();
      }
    },
    onToggleOutbounds(value) {
      this.serveOutbounds = value;
    },
    selectCase(worksite) {
      if (worksite) {
        this.setCurrentIncidentId(worksite.incident);
        this.worksiteId = worksite.id;
      } else {
        this.worksiteId = null;
      }
    },
    async getChatGroups() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/chat_groups`,
        {
          params: {
            channel: 'phone',
          },
        },
      );
      this.chatGroups = response.data.results;
    },
  },
  watch: {
    worksiteId(newValue, oldValue) {
      if (oldValue !== newValue) {
        this.showMobileMap = false;
      }
    },
    caller(newValue, oldValue) {
      if (!oldValue && newValue) {
        EventBus.$emit('phone_component:close');
      }
    },
    call(newValue, oldValue) {
      if (!oldValue && newValue) {
        EventBus.$emit('phone_component:open', 'agent');
      }
    },
    isOnCall(newValue, oldValue) {
      if (oldValue && !newValue) {
        this.tabs.selectTab(this.$refs.statusTab);
      }
    },
    currentIncidentId(value) {
      if (value) {
        if (this.map) {
          this.map.eachLayer((layer) => {
            if (layer.key === 'worksite_layer') {
              this.map.removeLayer(layer);
            }
          });
          this.getWorksites().then((markers) => {
            this.loadMap(markers);
          });
        }
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

.page-grid-mobile {
  grid-template-columns: auto;
}

.phone-button {
  @apply shadow w-20 h-20 sm:w-12 sm:h-12 my-2 sm:my-1 bg-white cursor-pointer z-50;
}
.tabs {
  width: 29rem;
  margin-left: -29rem;
}
.status {
  @apply bg-white sm:w-96 sm:-ml-96 mt-1 h-84;
}
@media only screen and (max-device-width: 1223px) and (orientation: landscape) {
  .tabs {
    width: 38rem;
    margin-left: -38rem;
    margin-top: -3rem;
    height: 350px;
    @apply overflow-auto;
  }
}
</style>
