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
            {{ allWorksiteCount }}
          </span>
        </span>
        <div class="flex justify-start w-auto">
          <WorksiteSearchInput
            :value="search"
            icon="search"
            display-property="name"
            :placeholder="$t('actions.search')"
            size="medium"
            @selectedExisting="onSelectExistingWorksite"
            @input="
              (value) => {
                search = value;
              }
            "
            skip-validation
            class="mx-2 w-full"
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
              <template #button>
                <div
                  class="w-full h-full relative flex items-center justify-center"
                >
                  <PhoneIndicator class="w-full h-full" />
                  <!-- add invisible layer over svg to allow pointer events / onClicks -->
                  <span class="absolute inset-0 bg-transparent"></span>
                </div>
              </template>
              <template #component>
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
              <template #component>
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
                    chat_last_seen: moment().toISOString(),
                  });
                  unreadChatCount = 0;
                  unreadUrgentChatCount = 0;
                }
              "
            >
              <template #button>
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
              <template #component>
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
                    news_last_seen: moment().toISOString(),
                  });
                  unreadNewsCount = 0;
                }
              "
            >
              <template #button>
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
              <template #component>
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
              <template #component>
                <!--                <CallHistory-->
                <!--                  :calls="callHistory"-->
                <!--                  @rowClick="-->
                <!--                    ({ mobile }) => {-->
                <!--                      setManualOutbound(mobile);-->
                <!--                    }-->
                <!--                  "-->
                <!--                />-->
              </template>
            </PhoneComponentButton>
            <PhoneComponentButton
              name="stats"
              class="phone-system__action"
              component-class="phone-system__action-content phone-system__action-content--stats"
            >
              <template #button>
                <div class="w-full h-full flex items-center justify-center">
                  <div class="text-xl">
                    {{ callsWaiting }}
                  </div>
                </div>
              </template>
              <template #component>
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
              <template #button>
                <div class="w-full h-full flex items-center justify-center">
                  <ccu-icon :fa="true" type="users" class="p-1" size="medium" />
                </div>
              </template>
              <template #component>
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
              <template #component>
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
                  {{ getWorkTypeName(work_type.work_type) }}
                </div>
              </div>
            </template>
          </AjaxTable>
        </div>
      </div>
    </div>
    <div class="phone-system__form h-full min-h-0">
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
      <div class="h-auto min-h-0">
        <CaseHistory
          v-if="showHistory"
          :incident-id="currentIncidentId"
          :worksite-id="worksiteId"
        ></CaseHistory>
        <WorksiteForm
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
              tabs.value.selectTab(statusTab.value.index);
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
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { useStore } from 'vuex';
import axios from 'axios';
import { useRouter } from 'vue-router';
import moment from 'moment';
import PhoneComponentButton from '../../components/phone/PhoneComponentButton.vue';
import ManualDialer from '../../components/phone/ManualDialer.vue';
import AjaxTable from '../../components/AjaxTable.vue';
import {
  formatNationalNumber,
  getColorForStatus,
  getWorkTypeName,
} from '../../filters';
import CaseHeader from '../../components/work/CaseHeader.vue';
import Worksite from '../../models/Worksite';
import CaseHistory from '../../components/work/CaseHistory.vue';
import WorksiteSearchInput from '../../components/work/WorksiteSearchInput.vue';
import { getErrorMessage } from '../../utils/errors';
import PhoneOutbound from '../../models/PhoneOutbound';
import useEmitter from '../../hooks/useEmitter';
import GeneralStats from '../../components/phone/GeneralStats.vue';
import CallHistory from '../../components/phone/CallHistory.vue';
import SimpleMap from '../../components/SimpleMap.vue';
import Leaderboard from '../../components/phone/Leaderboard.vue';
import Incident from '../../models/Incident';
import Chat from '../../components/chat/Chat.vue';
import ActiveCall from '../../components/phone/ActiveCall.vue';
import UpdateStatus from '../../components/phone/UpdateStatus.vue';
import PhoneIndicator from '../../components/phone/PhoneIndicator.vue';
import { loadCasesCached } from '../../utils/worksite';
import useWorksiteMap from '../../hooks/worksite/useWorksiteMap';
import PhoneToolBar from '../../components/phone/PhoneToolBar.vue';
import PhoneNews from '../../components/phone/PhoneNews.vue';
import useDialogs from '../../hooks/useDialogs';
import useConnectFirst from '../../hooks/useConnectFirst';
import useCurrentUser from '../../hooks/useCurrentUser';
import User from '../../models/User';
import WorksiteForm from '../../components/work/WorksiteForm.vue';
import usePhoneService from '@/hooks/phone/usePhoneService';

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
    WorksiteForm,
  },
  setup(props, context) {
    const { t } = useI18n();
    const $toasted = useToast();
    const { confirm } = useDialogs();
    const { emitter } = useEmitter();
    const router = useRouter();
    const store = useStore();
    const { currentUser } = useCurrentUser();
    const phoneService = reactive(usePhoneService());

    const imageUrl = ref('');
    const numberClicks = ref(0);
    const scale = ref(1);
    const worksiteId = ref(null);
    const isEditing = ref(false);
    const mapLoading = ref(false);
    const map = ref(null);
    const hover = ref(false);
    const showingMap = ref(true);
    const showingTable = ref(false);
    const allWorksiteCount = ref(0);
    const viewCase = ref(false);
    const showHistory = ref(false);
    const showFlags = ref(false);
    const searchWorksites = ref([]);
    const chatGroups = ref([]);
    const selectedChat = ref(null);
    const searchingWorksites = ref(false);
    const dialing = ref(false);
    const serveOutbounds = ref(true);
    const tabs = ref(null);
    const showMobileMap = ref(false);
    const remainingCallbacks = ref(0);
    const remainingCalldowns = ref(0);
    const unreadNewsCount = ref(0);
    const unreadChatCount = ref(0);
    const unreadUrgentChatCount = ref(0);
    const search = ref('');
    const mapUtils = ref(null);
    const worksiteForm = ref(null);
    const statusTab = ref(null);
    const connectFirst = useConnectFirst(context);

    const {
      isOnCall,
      caller,
      stats,
      currentIncidentId,
      call,
      clearCall,
      loadAgent,
      setWorking,
      dialNextOutbound,
      setAvailable,
      setGeneralStats,
      setCurrentIncidentId,
      dialManualOutbound,
    } = connectFirst;

    const prefillData = computed(function () {
      if (caller.value?.dnis) {
        return {
          phone1: caller.value?.dnis,
        };
      }
      return {};
    });
    const callsWaiting = computed(function () {
      return (
        Number(stats.value.inQueue || 0) +
        Number(stats.value.active || 0) +
        Number(remainingCallbacks.value || 0) +
        Number(remainingCallbacks.value || 0)
      );
    });
    const showingDetails = computed(function () {
      return showHistory.value || showFlags.value;
    });
    const tableUrl = computed(
      () => `${import.meta.env.VITE_APP_API_BASE_URL}/worksites`,
    );
    const worksiteQuery = computed(function () {
      return {
        incident: currentIncidentId.value,
      };
    });
    const columns = [
      {
        title: t('casesVue.number_abbrev'),
        dataIndex: 'case_number',
        key: 'case_number',
        sortKey: 'id',
        width: '0.5fr',
        sortable: true,
      },
      {
        title: t('casesVue.work_type'),
        dataIndex: 'work_types',
        key: 'work_types',
        scopedSlots: { customRender: 'work_types' },
        width: '1.5fr',
      },
      {
        title: t('casesVue.name'),
        dataIndex: 'name',
        key: 'name',
        width: '1.5fr',
        sortable: true,
      },
      {
        title: t('casesVue.full_address'),
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: t('casesVue.city'),
        dataIndex: 'city',
        key: 'city',
        sortable: true,
      },
      {
        title: t('casesVue.county_parish'),
        dataIndex: 'county',
        key: 'county',
        sortable: true,
      },
    ];
    const worksite = computed(function () {
      if (worksiteId.value) {
        return Worksite.find(worksiteId.value);
      }
      return null;
    });
    const incidentsWithActivePhones = computed(() =>
      Incident.query().where('active_phone_number', Boolean).get(),
    );

    function getIncidentPhoneNumbers(incident) {
      if (Array.isArray(incident.active_phone_number)) {
        return incident.active_phone_number
          .map((number) => formatNationalNumber(String(number)))
          .join(', ');
      }
      return formatNationalNumber(String(incident.active_phone_number));
    }
    async function completeCall({ status, notes }) {
      if (worksiteForm.value.dirtyFields.size > 0) {
        const result = await confirm({
          title: t('phoneDashboard.complete_call'),
          content: t('phoneDashboard.unsaved_changes_error'),
          actions: {
            no: {
              text: t('actions.do_not_save'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            yes: {
              text: t('actions.continue'),
              type: 'solid',
            },
          },
        });
        if (result === 'no' || result === 'cancel') {
          return;
        }
      }

      try {
        if (phoneService.callInfo.callType === 'OUTBOUND' && status) {
          await PhoneOutbound.api().updateStatus(call.value.id, {
            statusId: status,
            worksiteId: worksiteId.value,
            notes,
          });
        }

        if (phoneService.callInfo.callType === 'INBOUND') {
          let data = {
            status,
            notes,
          };
          if (worksiteId.value) {
            data = { ...data, cases: [worksiteId.value] };
          }
          await axios.post(
            `${import.meta.env.VITE_APP_API_BASE_URL}/phone_inbound/${
              call.value.id
            }/update_status`,
            data,
          );
        }

        await $toasted.success(t('phoneDashboard.update_success'));
        clearCall();
        clearCase();
        await loadAgent();
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    function setManualOutbound(phone) {
      emitter.emit('phone_component:open', 'dialer');
      emitter.emit('dialer:set_phone_number', formatNationalNumber(phone));
    }
    function clearCase() {
      worksiteId.value = null;
      isEditing.value = false;
    }
    function setTabs(t) {
      tabs.value = t;
    }
    function toggleView(view) {
      showingMap.value = false;
      showingTable.value = false;
      [view].value = true;
    }
    function onSelectExistingWorksite(worksite) {
      // only show worksite on map if on map view
      if (showingMap.value && !showingTable.value) {
        console.log('pushing worksite to map', worksite);
        router.push({
          query: { showOnMap: true },
        });
      } else {
        router.push({
          query: {}, // clear query params
        });
      }
      worksiteId.value = worksite.id;
      isEditing.value = true;
    }
    async function addMarkerToMap(location) {
      mapUtils.value.addMarkerToMap(location);
    }
    async function jumpToCase() {
      toggleView('showingMap');
      mapUtils.value.jumpToCase(worksite.value, true);
    }
    function onSelectMarker(marker) {
      isEditing.value = true;
      worksiteId.value = marker.id;
    }
    async function getWorksites() {
      mapLoading.value = true;
      const response = await loadCasesCached({
        incident: currentIncidentId.value,
      });
      mapLoading.value = false;
      allWorksiteCount.value = response.results.length;
      return response.results;
    }
    async function onLoggedIn() {
      if (
        serveOutbounds.value &&
        Number(stats.value.inQueue || stats.value.routing || 0) === 0
      ) {
        if (remainingCallbacks.value + remainingCalldowns.value > 0) {
          await setWorking();
        }
        await dialNextOutbound();
      } else {
        await setAvailable();
      }
    }
    function onToggleOutbounds(value) {
      serveOutbounds.value = value;
    }
    function selectCase(worksite) {
      if (worksite) {
        setCurrentIncidentId(worksite.incident);
        worksiteId.value = worksite.id;
      } else {
        worksiteId.value = null;
      }
    }
    async function getChatGroups() {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/chat_groups`,
        {
          params: {
            channel: 'phone',
          },
        },
      );
      chatGroups.value = response.data.results;
    }
    function focusNewsTab() {
      emitter.emit('phone_component:close');
      // open the active call PhoneComponentButton
      emitter.emit('phone_component:open', 'news');
    }
    async function init() {
      phoneService.apiGetQueueStats().then((response) => {
        setGeneralStats({ ...response.data });
      });
      await getChatGroups();
      const [group] = chatGroups.value;
      selectedChat.value = group;
      const markers = await getWorksites();
      mapUtils.value = useWorksiteMap(
        markers,
        markers.map((m) => m.id),
        (m) => {
          onSelectMarker(m);
        },
        () => {},
        false,
      );
    }

    watch(
      () => worksiteId.value,
      (newValue, oldValue) => {
        if (oldValue !== newValue) {
          showMobileMap.value = false;
        }
      },
    );

    watch(
      () => caller.value,
      (oldValue, newValue) => {
        if (!oldValue && newValue) {
          emitter.emit('phone_component:close');
          // open the active call PhoneComponentButton
          emitter.emit('phone_component:open', 'caller');
        }
      },
    );

    watch(
      () => call.value,
      (oldValue, newValue) => {
        if (!oldValue && newValue) {
          emitter.emit('phone_component:open', 'agent');
        }
      },
    );

    watch(
      () => isOnCall.value,
      (oldValue, newValue) => {
        if (oldValue && !newValue) {
          tabs.value.selectTab(statusTab.value.index);
        }
      },
    );

    watch(
      () => currentIncidentId.value,
      (value) => {
        if (value) {
          getWorksites().then((markers) => {
            mapUtils.value.reloadMap(
              markers,
              markers.map((m) => m.id),
            );
          });
        }
      },
    );

    onMounted(async () => {
      if (currentUser.isAdmin) {
        serveOutbounds.value = false;
      }
      await init();
    });

    return {
      imageUrl,
      numClicks: numberClicks,
      scale,
      worksiteId,
      isEditing,
      mapLoading,
      map,
      hover,
      showingMap,
      showingTable,
      allWorksiteCount,
      viewCase,
      showHistory,
      showFlags,
      searchWorksites,
      chatGroups,
      selectedChat,
      searchingWorksites,
      dialing,
      serveOutbounds,
      tabs,
      showMobileMap,
      remainingCallbacks,
      remainingCalldowns,
      unreadNewsCount,
      unreadChatCount,
      unreadUrgentChatCount,
      mapUtils,
      getColorForStatus,
      prefillData,
      callsWaiting,
      showingDetails,
      tableUrl,
      worksiteQuery,
      columns,
      worksite,
      incidentsWithActivePhones,
      worksiteForm,
      statusTab,
      ...connectFirst,
      init,
      getIncidentPhoneNumbers,
      completeCall,
      setManualOutbound,
      clearCase,
      setTabs,
      toggleView,
      onSelectExistingWorksite,
      search,
      addMarkerToMap,
      jumpToCase,
      onSelectMarker,
      getWorksites,
      onLoggedIn,
      onToggleOutbounds,
      selectCase,
      getChatGroups,
      focusNewsTab,
      getWorkTypeName,
      updateUserState: User.api().updateUserState,
      moment,
    };
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
