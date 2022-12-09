<template>
  <div class="phone-system">
    <div class="phone-system__main">
      <div class="phone-system__main-header">
        <div class="flex py-3 px-2" style="min-width: 80px">
          <ccu-icon
            :alt="$t('casesVue.map_view')"
            size="medium"
            class="mr-4 cursor-pointer"
            :class="showingMap ? 'filter-yellow' : 'filter-gray'"
            type="map"
            ccu-event="user_ui-view-map"
            @click="toggleView('showingMap')"
            data-cy="cases.mapButton"
          />
          <ccu-icon
            :alt="$t('casesVue.table_view')"
            size="medium"
            class="mr-4 cursor-pointer"
            :class="showingTable ? 'filter-yellow' : 'filter-gray'"
            type="table"
            ccu-event="user_ui-view-table"
            @click="toggleView('showingTable')"
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
            class="mx-2 w-full"
            @selectedExisting="onSelectExistingWorksite"
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
      <div class="phone-system__main-content">
        <div v-show="showingMap" class="phone-system__main-content--map">
          <SimpleMap :map-loading="mapLoading" />
          <div class="phone-system__actions" ref="phoneButtons">
            <PhoneComponentButton
              name="caller"
              class="phone-system__action"
              component-class="phone-system__action-content phone-system__action-content--caller"
            >
              <template v-slot:button>
                <div class="w-full h-full relative">
                  <PhoneIndicator class="w-full h-full" />
                  <!-- add invisible layer over svg to allow pointer events / onClicks -->
                  <span class="absolute inset-0 bg-transparent"></span>
                </div>
              </template>
              <template v-slot:component>
                <tabs :details="false" ref="tabs" @mounted="setTabs">
                  <tab :name="$t('phoneDashboard.active_call')">
                    <ActiveCall :case-id="worksiteId" @setCase="selectCase" />
                  </tab>
                  <tab :name="$t('phoneDashboard.call_status')" ref="statusTab">
                    <UpdateStatus class="p-2" @onCompleteCall="completeCall" />
                  </tab>
                </tabs>
              </template>
            </PhoneComponentButton>
            <PhoneComponentButton
              name="dialer"
              class="phone-system__action"
              component-class="phone-system__action-content phone-system__action-content--dialer"
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
              class="phone-system__action"
              component-class="phone-system__action-content phone-system__action-content--chat"
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
                  class="w-full h-full flex items-center justify-center relative"
                >
                  <div v-if="unreadChatCount" class="absolute top-0 left-0 m-1">
                    <span
                      class="inline-flex items-center justify-center px-1 py-0.5 mr-2 text-xs font-bold leading-none text-black bg-primary-light rounded-full"
                      >{{ unreadChatCount }}</span
                    >
                  </div>
                  <div
                    v-if="unreadUrgentChatCount"
                    class="absolute top-0 right-0 my-1 -mx-1"
                  >
                    <span
                      class="inline-flex items-center justify-center px-1 py-0.5 mr-2 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
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
                  @onNewMessage="unreadChatCount += 1"
                  @onNewUrgentMessage="unreadUrgentChatCount += 1"
                  @focusNewsTab="focusNewsTab"
                  :chat="selectedChat"
                />
              </template>
            </PhoneComponentButton>
            <PhoneComponentButton
              name="news"
              class="phone-system__action"
              component-class="phone-system__action-content phone-system__action-content--news"
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
                  class="w-full h-full flex items-center justify-center relative"
                >
                  <div v-if="unreadNewsCount" class="absolute top-0 left-0 m-1">
                    <span
                      class="inline-flex items-center justify-center px-1 py-0.5 mr-2 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
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
              v-if="callHistory"
              name="history"
              class="phone-system__action"
              component-class="phone-system__action-content phone-system__action-content--history"
              icon="phone-history"
              icon-size="large"
              icon-class="p-1"
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
            <PhoneComponentButton
              name="stats"
              class="phone-system__action"
              component-class="phone-system__action-content phone-system__action-content--stats"
            >
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
              name="leaderboard"
              class="phone-system__action"
              component-class="phone-system__action-content phone-system__action-content--leaderboard"
              icon="leaderboard"
              icon-size="medium"
              icon-class="p-1"
            >
              <template v-slot:button>
                <div class="w-full h-full flex items-center justify-center">
                  <ccu-icon :fa="true" type="users" class="p-1" size="medium" />
                </div>
              </template>
              <template v-slot:component>
                <Leaderboard class="h-full" />
              </template>
            </PhoneComponentButton>
            <PhoneComponentButton
              name="reset"
              class="phone-system__action"
              component-class="phone-system__action-content phone-system__action-content--reset"
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
        <div v-show="showingTable" class="phone-system__main-content--table">
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
    <div class="phone-system__form">
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
      <div v-else class="phone-system__form-header">
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
      <div v-if="showingDetails" class="phone-system__form-toggler">
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
      <div class="phone-system__form-body">
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
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash';
import CaseForm from '@/pages/CaseForm';
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
import SimpleMap from '@/components/SimpleMap';
import Leaderboard from '@/components/phone/Leaderboard';
import Incident from '@/models/Incident';
import Chat from '@/components/chat/Chat';
import PhoneNews from '@/../../../../../../experiments/crisiscleanup-4-web/src/components/phone/PhoneNews';
import PhoneToolBar from '@/pages/phone/PhoneToolBar';
import ActiveCall from '@/components/phone/ActiveCall';
import UpdateStatus from '@/components/phone/UpdateStatus';
import PhoneIndicator from '@/components/phone/PhoneIndicator';
import { loadCasesCached } from '@/utils/worksite';
import useWorksiteMap from '@/use/worksites/useWorksiteMap';

export default {
  name: 'PhoneSystem',
  components: {
    PhoneIndicator,
    UpdateStatus,
    ActiveCall,
    PhoneToolBar,
    PhoneNews,
    Chat,
    Leaderboard,
    SimpleMap,
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
      imageUrl: '',
      numClicks: 0,
      scale: 1,
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
      mapUtils: null,
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
      this.mapUtils = useWorksiteMap(
        markers,
        markers.map((m) => m.id),
        (m) => {
          this.onSelectMarker(m);
        },
        () => {},
        true,
      );
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
    onSelectExistingWorksite(worksite) {
      // only show worksite on map if on map view
      if (this.showingMap && !this.showingTable) {
        console.log('pushing worksite to map', worksite);
        this.$router.push({
          query: { showOnMap: true },
        });
      } else {
        this.$router.push({
          query: {}, // clear query params
        });
      }
      this.worksiteId = worksite.id;
      this.isEditing = true;
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
      this.mapUtils.addMarkerToMap(location);
    },
    async jumpToCase() {
      this.toggleView('showingMap');
      this.mapUtils.jumpToCase(this.worksite, true);
    },
    onSelectMarker(marker) {
      this.isEditing = true;
      this.worksiteId = marker.id;
    },
    async getWorksites() {
      this.mapLoading = true;
      const response = await loadCasesCached({
        incident: this.currentIncidentId,
      });
      this.mapLoading = false;
      this.allWorksiteCount = response.results.length;
      return response.results;
    },
    async onLoggedIn() {
      if (
        this.serveOutbounds &&
        Number(this.stats.inQueue || this.stats.routing || 0) === 0
      ) {
        if (this.remainingCallbacks + this.remainingCalldowns > 0) {
          await this.setWorking();
        }
        await this.dialNextOutbound();
      } else {
        await this.setAvailable();
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
    focusNewsTab() {
      EventBus.$emit('phone_component:close');
      // open the active call PhoneComponentButton
      EventBus.$emit('phone_component:open', 'news');
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
        // open the active call PhoneComponentButton
        EventBus.$emit('phone_component:open', 'caller');
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
        this.getWorksites().then((markers) => {
          this.mapUtils.reloadMap(
            markers,
            markers.map((m) => m.id),
          );
        });
      }
    },
  },
};
</script>

<style lang="postcss">
.phone-system {
  &__action {
    &-content {
      @apply right-20 sm:right-12 h-auto;
      width: 35vw;

      &--caller {
        @apply h-full;
      }
      &--dialer {
        @apply h-full;
      }
      &--chat {
      }
      &--news {
        height: 60vh;
        width: 50vw;
      }
      &--history {
        @apply h-full;
        width: 50vw;
      }
      &--stats {
      }
      &--leaderboard {
        height: 60vh;
        width: 50vw;
      }
      &--reset {
        @apply h-full;
      }
    }
  }
}

@media screen and (max-width: theme('screens.sm')) {
  .phone-system {
    &__action {
      &-content {
        width: 80vw;

        &--caller {
        }
        &--dialer {
        }
        &--chat {
        }
        &--news {
        }
        &--history {
        }
        &--stats {
        }
        &--leaderboard {
        }
        &--reset {
        }
      }
    }
  }
}
</style>

<style lang="postcss" scoped>
.phone-system {
  @apply grid flex-grow h-full;
  grid-template-columns: auto 350px;

  &__actions {
    @apply absolute top-0 right-0 flex flex-col select-text;
    z-index: 1004;
  }

  &__action {
    @apply shadow
      w-20
      h-20
      sm:w-12
      sm:h-12
      my-2
      sm:my-1
      bg-white
      cursor-pointer
      z-50;
  }

  /* Container for map */
  &__main {
    @apply flex flex-col;

    &-header {
      @apply flex items-center;
    }

    &-content {
      @apply flex-grow;

      &--map {
        @apply relative h-full select-none;
      }

      &--table {
        @apply p-2 h-full shadow;
      }
    }
  }

  /* Container for case form */
  &__form {
    @apply flex flex-col;

    &-header {
      @apply h-12 px-2 border flex items-center justify-between;
    }

    &-toggler {
      @apply flex items-center justify-between px-2;
    }

    &-body {
      @apply flex-grow relative h-full flex flex-col md:flex-row;
    }
  }
}

/* Mobile styles */
@media screen and (max-width: theme('screens.sm')) {
  .phone-system {
    @apply flex flex-col;

    &__main {
      @apply h-1/3;
    }

    &__form {
      @apply h-2/3;
    }
  }
}
</style>
