<template>
  <div class="work-page h-full" :class="{ collapsedForm }">
    <div :key="currentIncidentId" class="work-page__main">
      <div class="relative">
        <div class="flex items-center">
          <div
            v-if="!collapsedUtilityBar"
            :key="currentIncidentId"
            class="flex items-center flex-wrap w-full p-3"
          >
            <ccu-icon
              :alt="$t('casesVue.map_view')"
              size="medium"
              class="mr-4 cursor-pointer"
              :class="showingMap ? 'filter-yellow' : 'filter-gray'"
              type="map"
              ccu-event="user_ui-view-map"
              data-cy="cases.mapButton"
              @click="() => showMap(true)"
            />
            <ccu-icon
              :alt="$t('casesVue.table_view')"
              size="medium"
              class="mr-4 cursor-pointer"
              :class="showingTable ? 'filter-yellow' : 'filter-gray'"
              type="table"
              ccu-event="user_ui-view-table"
              data-cy="cases.tableButton"
              @click="showTable"
            />
            <span v-if="allWorksiteCount" class="font-thin">
              <span v-if="allWorksiteCount === filteredWorksiteCount">
                {{ $t('casesVue.cases') }}
                {{ numeral(allWorksiteCount) }}
              </span>
              <span v-else>
                {{ $t('casesVue.cases') }}
                {{ numeral(filteredWorksiteCount) }} of
                {{ numeral(allWorksiteCount) }}
              </span>
            </span>
            <WorksiteSearchInput
              :value="currentSearch"
              icon="search"
              display-property="name"
              :placeholder="$t('actions.search')"
              size="medium"
              skip-validation
              class="mx-4 py-1"
              @selectedExisting="
                  (w: { id: string; }) => {
                    worksiteId = w.id;
                    isViewing = true;
                    if (showingMap) {
                        router.push(
                          `/incident/${currentIncidentId}/work/${w.id}`, {
                        query: { showOnMap: true },
                      });
                    }
                  }
                "
              @input="
                  (value: string) => {
                    currentSearch = value;
                  }
                "
            />
            <WorksiteActions
              v-if="currentIncidentId"
              :key="currentIncidentId"
              class="py-1"
              :current-incident-id="String(currentIncidentId)"
              :inital-filters="filters"
              @updatedQuery="onUpdateQuery"
              @updatedFilters="onUpdateFilters"
              @applyLocation="applyLocation"
              @applyTeamGeoJson="applyTeamGeoJson"
              @downloadCsv="downloadWorksites"
              @toggleHeatMap="toggleHeatMap"
            />
          </div>
          <div
            :class="collapsedUtilityBar ? 'w-full' : ''"
            class="flex justify-end items-center justify-self-end"
          >
            <font-awesome-icon
              :icon="collapsedUtilityBar ? 'chevron-down' : 'chevron-up'"
              class="rounded-full border p-1 mx-1 mb-1 cursor-pointer justify-end"
              size="xl"
              @click="collapsedUtilityBar = !collapsedUtilityBar"
            />
          </div>
        </div>
        <div
          v-if="!collapsedUtilityBar && !showingTable"
          class="flex justify-center items-center"
        >
          <Slider
            primary-color="#dadada"
            secondary-color="white"
            :value="sviSliderValue"
            :from="$t('svi.most_vulnerable')"
            :to="$t('svi.everyone')"
            :from-tooltip="$t(`svi.svi_more_info_link`)"
            handle-size="12px"
            track-size="8px"
            class="pt-1 ml-4"
            slider-class="w-64"
            @input="filterSvi"
          />
          <Slider
            v-if="datesList && datesList.length > 1000"
            track-size="8px"
            handle-size="12px"
            primary-color="#dadada"
            secondary-color="white"
            class="pt-1 ml-4"
            slider-class="w-84"
            :title="$t('casesVue.updated')"
            :value="dateSliderValue"
            :min="0"
            :max="1000"
            :from="dateSliderFrom()"
            :to="dateSliderTo()"
            @input="filterDates"
          ></Slider>
        </div>
      </div>
      <div class="work-page__main-content">
        <div v-if="showingMap" class="work-page__main-content--map">
          <SimpleMap
            :map-loading="mapLoading"
            show-zoom-buttons
            :available-work-types="availableWorkTypes"
            @onZoomIn="zoomIn"
            @onZoomOut="zoomOut"
            @onZoomIncidentCenter="goToIncidentCenter"
            @onZoomInteractive="goToInteractive"
          />
          <div ref="phoneButtons" class="work-page__actions">
            <div
              class="w-full h-full flex items-center justify-center relative p-0.5 mt-1 bg-white cursor-pointer"
            >
              <font-awesome-icon
                :icon="collapsedForm ? 'chevron-left' : 'chevron-right'"
                class="px-0.5 py-2 ml-1.5"
                size="large"
                @click="collapsedForm = !collapsedForm"
              />
            </div>
            <PhoneComponentButton
              name="chat"
              class="work-page__action"
              component-class="work-page__action-content work-page__action-content--chat"
              @open="
                () => {
                  updateUserState({
                    [`chat_${selectedChat.id}_last_seen`]:
                      moment().toISOString(),
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
                  :chat="selectedChat"
                  :state-key="`chat_${selectedChat.id}_last_seen`"
                  @unreadCount="unreadChatCount = $event"
                  @unreadUrgentCount="unreadUrgentChatCount = $event"
                  @onNewMessage="unreadChatCount += 1"
                  @onNewUrgentMessage="unreadUrgentChatCount += 1"
                />
              </template>
            </PhoneComponentButton>
            <PhoneComponentButton
              name="news"
              class="work-page__action"
              component-class="work-page__action-content work-page__action-content--news"
              @open="
                () => {
                  updateUserState({
                    work_news_last_seen: moment().toISOString(),
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
                <PhoneNews
                  :cms-tag="'work-news'"
                  state-key="work_news_last_seen"
                  @unreadCount="unreadNewsCount = $event"
                />
              </template>
            </PhoneComponentButton>
          </div>
        </div>
        <div v-if="showingTable" class="work-page__main-content--table">
          <div class="flex items-center justify-end">
            <base-button
              class="ml-3 my-3 border p-1 px-4 bg-white"
              :class="
                selectedTableItems && selectedTableItems.size === 0
                  ? 'text-crisiscleanup-grey-700'
                  : ''
              "
              :disabled="selectedTableItems && selectedTableItems.size === 0"
              :text="$t('actions.print_claimed')"
              :alt="$t('actions.print_claimed')"
              :action="printSelectedWorksites"
              data-cy="worksiteview_actionBatchPrint"
            />
            <base-button
              class="ml-3 my-3 border p-1 px-4 bg-white"
              :class="
                selectedTableItems && selectedTableItems.size === 0
                  ? 'text-crisiscleanup-grey-700'
                  : ''
              "
              :disabled="selectedTableItems && selectedTableItems.size === 0"
              :text="$t('actions.download')"
              :alt="$t('actions.download')"
              :action="
                () => {
                  downloadWorksites(Array.from(selectedTableItems));
                }
              "
              data-cy="worksiteview_actionBatchDownload"
            />
            <base-button
              class="ml-3 my-3 border p-1 px-4 bg-white"
              :class="
                selectedTableItems && selectedTableItems.size === 0
                  ? 'text-crisiscleanup-grey-700'
                  : ''
              "
              :disabled="selectedTableItems && selectedTableItems.size === 0"
              :action="showUnclaimModal"
              :text="$t('actions.unclaim')"
              :alt="$t('actions.unclaim')"
            >
            </base-button>
            <base-button
              icon="sync"
              class="ml-3 my-3 border p-1 px-4 bg-white"
              :class="
                selectedTableItems && selectedTableItems.size === 0
                  ? 'text-crisiscleanup-grey-700'
                  : ''
              "
              :disabled="selectedTableItems && selectedTableItems.size === 0"
              :text="$t('actions.update_status')"
              :alt="$t('actions.update_status')"
              :action="showUpdateStatusModal"
            />
          </div>
          <WorksiteTable
            :worksite-query="worksiteQuery"
            @rowClick="loadCase"
            @selectionChanged="onSelectionChanged"
          />
        </div>
      </div>
    </div>
    <div class="work-page__form h-full min-h-0">
      <CaseHeader
        v-if="worksite"
        :worksite="worksite"
        class="border-l border-r"
        can-edit
        show-case-tabs
        :is-viewing-worksite="isViewing"
        @closeWorksite="clearCase"
        @onJumpToCase="jumpToCase"
        @reloadMap="reloadMap"
        @onShareWorksite="() => shareWorksite(worksite?.id)"
        @onDownloadWorksite="
          () => {
            downloadWorksites([worksite?.id]);
          }
        "
        @onPrintWorksite="() => printWorksite(worksite?.id)"
        @onFlagCase="
          () => {
            showFlags = true;
            showHistory = false;
          }
        "
        @onEditCase="
          () => {
            isViewing = false;
            isEditing = true;
            router.push(
              `/incident/${currentIncidentId}/work/${worksite?.id}/edit`,
            );
          }
        "
        @onShowHistory="
          () => {
            showFlags = false;
            showHistory = true;
          }
        "
      />
      <div v-else class="work-page__form-header">
        <div
          class="flex h-full items-center cursor-pointer border-b-2 border-primary-light p-3"
          @click="() => clearCase()"
        >
          <ccu-icon :alt="$t('casesVue.new_case')" type="active" size="small" />
          <span class="px-1 mt-0.5">{{ $t('casesVue.new_case') }}</span>
        </div>
        <div
          v-if="mostRecentlySavedWorksite && mostRecentlySavedWorksite.id"
          class="h-full p-3 flex items-center justify-center"
          @click="() => loadCase(mostRecentlySavedWorksite)"
        >
          Case
          {{
            mostRecentlySavedWorksite && mostRecentlySavedWorksite.case_number
          }}
          <ccu-icon
            :alt="$t('actions.cancel')"
            size="xs"
            type="cancel"
            class="ml-2"
            :action="
              () => {
                mostRecentlySavedWorksite = null;
              }
            "
          />
        </div>
        <base-button
          v-if="$mq === 'sm'"
          type="bare"
          icon="map"
          class="text-gray-700 pt-2"
          :action="
            () => {
              showMobileMap = true;
            }
          "
          :text="$t('casesVue.show_map')"
        />
      </div>
      <div v-if="showingDetails" class="work-page__form-toggler">
        <base-button
          icon="arrow-left"
          icon-size="medium"
          :action="
            () => {
              showHistory = false;
              showFlags = false;
            }
          "
        />
        <span v-if="showHistory" class="text-base">{{
          $t('actions.history')
        }}</span>
        <span v-if="showFlags" class="text-base">{{ $t('actions.flag') }}</span>
        <div></div>
      </div>
      <div class="h-auto min-h-0">
        <CaseHistory
          v-if="showHistory"
          :incident-id="Number(currentIncidentId)"
          :worksite-id="worksiteId"
        ></CaseHistory>
        <CaseFlag
          v-else-if="showFlags"
          :incident-id="String(currentIncidentId)"
          :worksite-id="worksiteId"
          @reloadCase="
            () => {
              reloadCase();
              showFlags = false;
            }
          "
          @reloadMap="
            () => {
              reloadMap();
              showFlags = false;
            }
          "
          @clearCase="clearCase"
        ></CaseFlag>
        <WorksiteView
          v-else-if="isViewing"
          :key="worksiteId"
          :worksite-id="worksiteId"
          :incident-id="String(currentIncidentId)"
          :top-height="300"
          @reloadCase="reloadMap"
          @closeWorksite="clearCase"
          @onResetForm="clearCase"
          @caseLoaded="
            () => {
              if (route && route.query.showOnMap) {
                jumpToCase();
              }
            }
          "
        />
        <WorksiteForm
          v-else
          ref="worksiteForm"
          :key="worksiteId"
          :incident-id="String(currentIncidentId)"
          :worksite-id="worksiteId"
          :is-editing="isEditing"
          class="border shadow"
          @jumpToCase="jumpToCase"
          @savedWorksite="
            (w: { id: any; }) => {
              if (!isEditing) {
                worksiteId = w.id;
                mostRecentlySavedWorksite = worksite;
                $nextTick(() => {
                  clearCase();
                });
              } else {
                isEditing = true;
                router.push(
                  `/incident/${currentIncidentId}/work/${worksite?.id}/edit`,
                );
              }
              reloadMap();
            }
          "
          @closeWorksite="clearCase"
          @navigateToWorksite="
            (id: any) => {
              worksiteId = id;
              isEditing = true;
              router.push(
                `/incident/${currentIncidentId}/work/${worksite?.id}/edit`,
              );
            }
          "
          @geocoded="addMarkerToMap"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
  nextTick,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import axios from 'axios';
import type { Sprite } from 'pixi.js';
import moment from 'moment';
import type { LatLng } from 'leaflet';
import * as L from 'leaflet';
import WorksiteSearchInput from '../components/work/WorksiteSearchInput.vue';
import PhoneComponentButton from '../components/phone/PhoneComponentButton.vue';
import SimpleMap from '../components/SimpleMap.vue';
import Chat from '../components/chat/Chat.vue';
import WorksiteTable from '../components/work/WorksiteTable.vue';
import CaseHeader from '../components/work/CaseHeader.vue';
import Worksite from '../models/Worksite';
import CaseHistory from '../components/work/CaseHistory.vue';
import { loadCasesCached } from '../utils/worksite';
import { averageGeolocation } from '../utils/map';
import WorksiteActions from '../components/work/WorksiteActions.vue';
import User from '../models/User';
import { forceFileDownload } from '../utils/downloads';
import { getErrorMessage } from '../utils/errors';
import Incident from '../models/Incident';
import CaseFlag from '../components/work/CaseFlag.vue';
import PhoneNews from '../components/phone/PhoneNews.vue';
import Slider from '../components/Slider.vue';
import WorksiteForm from '../components/work/WorksiteForm.vue';
import WorksiteView from '../components/work/WorksiteView.vue';
import useDialogs from '../hooks/useDialogs';
import type { MapUtils } from '../hooks/worksite/useWorksiteMap';
import useWorksiteMap from '../hooks/worksite/useWorksiteMap';
import UnclaimCases from '@/components/UnclaimCases.vue';
import { numeral } from '@/utils/helpers';
import type Location from '@/models/Location';
import UpdateCaseStatus from '@/components/UpdateCaseStatus.vue';
import useWorksiteTableActions from '@/hooks/worksite/useWorksiteTableActions';
import JsonWrapper from '@/components/JsonWrapper.vue';
import ShareWorksite from '@/components/modals/ShareWorksite.vue';

const INTERACTIVE_ZOOM_LEVEL = 12;

export default defineComponent({
  name: 'Work',
  components: {
    WorksiteView,
    WorksiteForm,
    Slider,
    PhoneNews,
    CaseFlag,
    WorksiteActions,
    CaseHistory,
    CaseHeader,
    WorksiteTable,
    Chat,
    SimpleMap,
    PhoneComponentButton,
    WorksiteSearchInput,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const $toasted = useToast();
    const { prompt, component, confirm } = useDialogs();
    const { t } = useI18n();
    const store = useStore();

    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );

    const currentUser = computed(() =>
      User.find(User.store().getters['auth/userId']),
    );

    const showingMap = ref<boolean>(true);
    const showingTable = ref<boolean>(false);
    const showHistory = ref<boolean>(false);
    const showFlags = ref<boolean>(false);
    const showMobileMap = ref<boolean>(false);
    const isEditing = ref<boolean>(false);
    const isViewing = ref<boolean>(false);
    const searchingWorksites = ref<boolean>(false);
    const mapLoading = ref<boolean>(false);
    const collapsedForm = ref<boolean>(false);
    const collapsedUtilityBar = ref<boolean>(false);
    const loading = ref<boolean>(false);
    const allWorksiteCount = ref<number>(0);
    const filteredWorksiteCount = ref<number>(0);
    const searchWorksites = ref<any[]>([]);
    const currentSearch = ref<string>('');
    const worksiteId = ref<any>(null);
    const selectedChat = ref<any>({ id: 2 });
    const filterQuery = ref<any>({});
    const filters = ref<any>({});
    const mostRecentlySavedWorksite = ref<any>(null);
    const selectedTableItems = ref<Set<number>>(new Set());
    const availableWorkTypes = ref({});
    const sviSliderValue = ref(100);
    const dateSliderValue = ref(1000);
    let mapUtils: MapUtils | null;
    const unreadChatCount = ref(0);
    const unreadUrgentChatCount = ref(0);
    const unreadNewsCount = ref(0);

    const { showUnclaimModal } = useWorksiteTableActions(
      selectedTableItems,
      () => {
        loading.value = false;
        reloadTable();
      },
    );

    function loadStatesForUser() {
      const states = currentUser?.value?.getStatesForIncident(
        currentIncidentId.value,
        true,
      );
      if (states) {
        if (states.showingMap) {
          showingMap.value = true;
          showingTable.value = false;
        }
        if (states.showingTable) {
          showingTable.value = true;
          showingMap.value = false;
        }
        if (states.appliedFilters) {
          filterQuery.value = states.appliedFilters;
        }
        if (states.sviLevel) {
          sviSliderValue.value = states.sviLevel;
        }
        if (states.dateLevel) {
          dateSliderValue.value = states.dateLevel;
        }
        if (states.filters) {
          filters.value = {
            ...states.filters,
          };
        }
      }
    }

    function updateUserState(incomingData: Record<string, any>) {
      let data = incomingData;
      if (!data) {
        data = {};
      }
      const newStates = {
        appliedFilters: filterQuery.value,
        filters: filters.value,
        showingMap: showingMap.value,
        showingTable: showingTable.value,
        sviLevel: sviSliderValue.value,
        dateLevel: dateSliderValue.value,
        mapViewPort: mapUtils?.getMap().getBounds(),
        ...data,
      };
      User.api().updateUserState(
        {
          incident: currentIncidentId.value,
        },
        newStates,
      );
    }

    const worksiteQuery = computed<Record<any, any>>(() => {
      const query = {
        incident: currentIncidentId.value,
        ...filterQuery.value,
      };
      if (currentSearch.value) {
        query.search = currentSearch.value;
      }
      return query;
    });

    async function getWorksites() {
      mapLoading.value = true;
      const response = await loadCasesCached({
        ...worksiteQuery.value,
      });
      mapLoading.value = false;
      filteredWorksiteCount.value = response.results.length;
      return response.results;
    }

    async function getAllWorksites() {
      mapLoading.value = true;
      const response = await loadCasesCached({
        incident: currentIncidentId.value,
      });
      mapLoading.value = false;
      allWorksiteCount.value = response.results.length;
      return response.results;
    }

    async function reloadMap() {
      if (mapUtils) {
        mapUtils?.removeLayer('temp_markers');
      }
      const allWorksites = await getAllWorksites();
      const markers = await getWorksites();
      mapUtils?.reloadMap(
        allWorksites,
        markers.map((m: Worksite) => m.id),
      );
    }

    const showTable = () => {
      showingTable.value = true;
      showingMap.value = false;
      updateUserState({});
    };

    const showMap = (reload = false) => {
      showingTable.value = false;
      showingMap.value = true;
      if (reload) {
        reloadMap().then(() => {
          updateUserState({});
        });
      }
      nextTick(() => {
        init();
      });
      updateUserState({});
    };

    const showingDetails = computed<boolean>(() => {
      return showHistory.value || showFlags.value;
    });

    const worksite = computed<Worksite | null>(() => {
      if (worksiteId.value) {
        return Worksite.find(worksiteId.value);
      }
      return null;
    });

    const workTypesClaimedByOrganization = computed<any>(() => {
      if (worksite.value) {
        return worksite.value.work_types.filter((type) =>
          currentUser?.value?.organization.affiliates.includes(type.claimed_by),
        );
      }
      return [];
    });

    const jumpToCase = async (showPopup = true) => {
      showMap();
      mapUtils?.jumpToCase(worksite.value, showPopup);
    };

    function reloadTable() {
      filterQuery.value = { ...filterQuery.value };
      updateUserState({});
    }

    async function showUpdateStatusModal() {
      let status;
      const response = await component({
        title: t('actions.update_status'),
        component: UpdateCaseStatus,
        classes: 'w-full h-24 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        listeners: {
          updatedStatus: (payload: string) => {
            status = payload;
          },
        },
      });

      if (response === 'ok' && status) {
        loading.value = true;
        const promises = [] as any;
        const ids = [...selectedTableItems.value];

        const hasClaimedWorkType = (w: Worksite) => {
          return w.work_types.some((type) =>
            currentUser?.value?.organization.affiliates.includes(
              type.claimed_by,
            ),
          );
        };

        await Worksite.api().get(`/worksites?id__in=${ids.join(',')}`, {
          dataKey: 'results',
        });

        const worksitesChangeStatus = Worksite.query()
          .whereIdIn(ids.map(String))
          .get();

        if (!worksitesChangeStatus.every((w) => hasClaimedWorkType(w))) {
          await confirm({
            title: t('info.cannot_claim_cases'),
            content: t('info.cannot_claim_cases_d'),
          });
        }

        for (const worksite of worksitesChangeStatus) {
          for (const workType of worksite.work_types) {
            promises.push(
              Worksite.api().updateWorkTypeStatus(workType.id, status),
            );
          }
        }
        await Promise.allSettled(promises);
      }
      loading.value = false;
      reloadTable();
    }

    function toggleHeatMap(points: LatLng[]) {
      if (points) {
        mapUtils?.addHeatMap(points);
      } else {
        mapUtils?.removeHeatMap();
      }
    }

    const getSviList = () => {
      const layer = mapUtils?.getCurrentMarkerLayer();
      const container = layer?._pixiContainer;
      const list = container?.children.map((marker: any) => {
        return {
          id: marker.id,
          svi: marker.svi,
        };
      });
      if (list && container) {
        list.sort((a, b) => {
          return (b.svi || 1) - (a.svi || 1);
        });
      }
      return list;
    };

    function filterSvi(value: number) {
      if (value === 0) return;
      sviSliderValue.value = Number(value);
      const layer = mapUtils?.getCurrentMarkerLayer();
      const container = layer?._pixiContainer;
      if (sviList.value && container) {
        const count = Math.floor((sviList.value.length * Number(value)) / 100);
        const filteredSvi = sviList.value.slice(0, count);
        const minSvi = filteredSvi[filteredSvi.length - 1].svi;
        for (const markerSprite of container.children) {
          markerSprite.visible = markerSprite.svi > minSvi;
        }

        layer._renderer.render(container);
        layer.redraw();
      }

      updateUserState({});
    }

    const datesList = ref([]);
    const sviList = ref([]);

    function getDatesList() {
      const layer = mapUtils?.getCurrentMarkerLayer();
      const container = layer?._pixiContainer;
      const list = container?.children.map((marker: any) => {
        return {
          id: marker.id,
          updated_at: marker.updated_at_moment,
        };
      });
      if (list && container) {
        list.sort((a, b) => {
          return b.updated_at - a.updated_at;
        });
      }
      return list;
    }

    const dateSliderFrom = () => {
      const list = datesList.value;
      if (list) {
        return `${moment({ hours: 0 }).diff(
          list[0].updated_at,
          'days',
        )} days ago`;
      }
      return '';
    };

    const dateSliderTo = () => {
      const list = datesList.value;
      if (list) {
        return `${moment({ hours: 0 }).diff(
          list[list.length - 1].updated_at,
          'days',
        )} days ago`;
      }
      return '';
    };

    function filterDates(value: number) {
      if (sviSliderValue.value !== 100) {
        filterSvi(100);
      }
      if (value === 0) return;
      dateSliderValue.value = Number(value);
      const layer = mapUtils?.getCurrentMarkerLayer();
      const container = layer?._pixiContainer;

      if (datesList.value) {
        const count = Math.floor(
          (datesList.value.length * Number(value)) / 1000,
        );
        const filteredSvi = datesList.value.slice(0, count);
        const minSvi = filteredSvi[filteredSvi.length - 1].updated_at;
        for (const markerSprite of container?.children || []) {
          markerSprite.visible = markerSprite.updated_at_moment > minSvi;
        }

        layer?._renderer.render(container);
        layer?.redraw();
      }

      updateUserState({});
    }

    function zoomIn() {
      mapUtils?.getMap().zoomIn();
    }

    function zoomOut() {
      mapUtils?.getMap().zoomOut();
    }

    function applyTeamGeoJson(data: {
      teamId: string;
      value: boolean;
      geom: any;
    }) {
      mapUtils?.applyTeamGeoJson(data.teamId, data.value, data.geom);
    }

    function applyLocation(data: { locationId: string; value: boolean }) {
      mapUtils?.applyLocation(data.locationId, data.value);
    }

    async function reloadCase() {
      return Worksite.api().fetch(
        worksite?.value?.id,
        currentIncidentId.value.id,
      );
    }

    function fitLocation(location: Location) {
      mapUtils?.fitLocation(location);
    }

    function goToIncidentCenter() {
      const { locationModels } = Incident.find(
        currentIncidentId.value,
      ) as Incident;
      if (locationModels.length > 0) {
        for (const location of locationModels) {
          fitLocation(location);
        }
      } else {
        const center = averageGeolocation(
          mapUtils
            ?.getPixiContainer()
            ?.children.map((marker) => [marker.x, marker.y]),
        );
        if (center.latitude && center.longitude) {
          mapUtils?.getMap().setView([center.latitude, center.longitude], 6);
        }
      }
    }

    function goToInteractive() {
      const { locationModels } = Incident.find(
        currentIncidentId.value,
      ) as Incident;

      if (locationModels.length > 0) {
        mapUtils?.getMap().setZoom(INTERACTIVE_ZOOM_LEVEL);
        goToIncidentCenter();
      } else {
        const center = averageGeolocation(
          mapUtils
            ?.getPixiContainer()
            ?.children.map((marker) => [marker.x, marker.y]),
        );
        if (center.latitude && center.longitude) {
          mapUtils
            ?.getMap()
            .setView(
              [center.latitude, center.longitude],
              INTERACTIVE_ZOOM_LEVEL,
            );
        }
      }
    }

    function onSelectionChanged(selectedItems: Set<number>) {
      selectedTableItems.value = selectedItems;
    }

    async function shareWorksite(id: number) {
      loading.value = true;
      let noClaimText = '';
      let worksiteToShare = await Worksite.find(id);
      const hasClaimedWorkType = worksiteToShare?.work_types.some((type) =>
        currentUser?.value?.organization.affiliates.includes(type.claimed_by),
      );
      if (hasClaimedWorkType) {
        noClaimText = '';
      } else {
        const result = await prompt({
          title: t('casesVue.share_case'),
          content: t('casesVue.please_claim_if_share'),
          actions: {
            cancel: {
              text: t('actions.cancel'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            shareNoClaim: {
              text: t('actions.share_no_claim'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            claimAndShare: {
              text: t('actions.claim_and_share'),
              type: 'solid',
              buttonClass:
                'border text-base p-2 px-4 mx-2 text-black border-primary-light',
            },
          },
        });

        if (result.key === 'cancel' || !result) {
          return;
        }

        if (result.key === 'claimAndShare') {
          noClaimText = '';
        }
        if (result.key === 'shareNoClaim') {
          if (!result.response) {
            $toasted.error(t('casesVue.please_explain_why_no_claim'));
            return shareWorksite(id);
          } else {
            noClaimText = result.response;
          }
        }
      }

      let emails: string[] = [];
      let phoneNumbers: string[] = [];
      let shareMessage = '';

      const result = await component({
        title: t('actions.share'),
        component: ShareWorksite,
        classes: 'w-full h-144',
        actionText: t('actions.share'),
        props: {
          worksite: id,
        },
        listeners: {
          phoneNumbersUpdated: (value: string[]) => {
            phoneNumbers = value.map((number) =>
              String(number).replace(/\D/g, ''),
            );
          },
          emailsUpdated: (value: string[]) => {
            emails = value;
          },
          shareMessageUpdated: (value: string) => {
            shareMessage = value;
          },
        },
      });
      if (result === 'no' || result === 'cancel') {
        return;
      }

      await Worksite.api().shareWorksite(
        id,
        emails,
        phoneNumbers,
        shareMessage,
        noClaimText,
      );
      await reloadCase();
      $toasted.success(t('~~Successfully shared case'));
    }

    async function printWorksite(id: number) {
      loading.value = true;
      let file;
      let worksiteToPrint = await Worksite.find(id);
      const hasClaimedWorkType = worksiteToPrint?.work_types.some((type) =>
        currentUser?.value?.organization.affiliates.includes(type.claimed_by),
      );
      if (hasClaimedWorkType) {
        file = await Worksite.api().printWorksite(id, '');
      } else {
        const result = await prompt({
          title: t('actions.print_case'),
          content: t('casesVue.please_claim_if_print'),
          actions: {
            cancel: {
              text: t('actions.cancel'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            printNoClaim: {
              text: t('actions.print_without_claiming'),
              type: 'solid',
              buttonClass:
                'border text-base p-2 px-4 mx-2 text-black border-primary-light',
            },
            claimAndPrint: {
              text: t('actions.claim_and_print'),
              type: 'solid',
              buttonClass:
                'border text-base p-2 px-4 mx-2 text-black border-primary-light',
            },
          },
        });

        if (result.key === 'claimAndPrint') {
          file = await Worksite.api().printWorksite(id, '');
        }
        if (result.key === 'printNoClaim') {
          if (!result.response) {
            $toasted.error(t('casesVue.please_explain_why_no_claim'));
          } else {
            file = await Worksite.api().printWorksite(id, result.response);
          }
        }
      }
      if (file) {
        forceFileDownload(file.response);
      }
      loading.value = false;
      await reloadCase();
    }

    async function printSelectedWorksites() {
      const ids = [...selectedTableItems.value];
      if (ids.length === 1) {
        return printWorksite(ids[0]);
      }

      const hasClaimedWorkType = (w: Worksite) => {
        return w.work_types.some((type) =>
          currentUser?.value?.organization.affiliates.includes(type.claimed_by),
        );
      };

      await Worksite.api().get(`/worksites?id__in=${ids.join(',')}`, {
        dataKey: 'results',
      });

      const worksitesToPrint = Worksite.query()
        .whereIdIn(ids.map(String))
        .get();

      if (!worksitesToPrint.every((w) => hasClaimedWorkType(w))) {
        await confirm({
          title: t('info.cannot_claim_cases'),
          content: t('info.cannot_claim_cases_d'),
        });
      }

      const ids_to_print = worksitesToPrint
        .filter((w) => hasClaimedWorkType(w))
        .map((w) => w.id);

      if (ids_to_print.length > 0) {
        const file = await Worksite.api().downloadWorksite(
          ids_to_print,
          'application/pdf',
        );
        forceFileDownload(file.response);
      }
    }

    async function downloadWorksites(ids: any[]) {
      loading.value = true;
      try {
        let params;

        if (ids) {
          params = {
            id__in: ids.join(','),
          };
        } else {
          params = {
            ...worksiteQuery.value,
          };
        }

        const response = await axios.get(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/worksites_download/download_csv`,
          {
            params,
            headers: { Accept: 'text/csv' },
            responseType: 'blob',
          },
        );
        if (response.status === 202) {
          await confirm({
            title: t('info.processing_download'),
            content: t('info.processing_download_d'),
          });
        } else {
          forceFileDownload(response);
        }
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        loading.value = false;
      }
    }

    function selectCase(c: { incident: any; id: any }) {
      if (c) {
        store.commit('incident/setCurrentIncidentId', c.incident);
        worksiteId.value = c.id;
      } else {
        worksiteId.value = null;
      }
    }

    function clearCase() {
      worksiteId.value = null;
      isEditing.value = false;
      isViewing.value = false;
      showHistory.value = false;
      showFlags.value = false;
      router.push(`/incident/${currentIncidentId.value}/work`);
    }

    async function addMarkerToMap(location: LatLng) {
      mapUtils?.addMarkerToMap(location);
      showMap();
    }

    function loadCase(data: Sprite & Worksite) {
      isViewing.value = true;
      worksiteId.value = data.id;
      router.push(`/incident/${currentIncidentId.value}/work/${data.id}`);
    }

    function onUpdateQuery(query: any) {
      filterQuery.value = query;
      updateUserState({});
    }

    function onUpdateFilters(f: any) {
      filters.value = f;
      updateUserState({});
    }

    watch(
      () => worksiteQuery.value,
      (value) => {
        if (value) {
          reloadMap();
        }
      },
    );

    watch(
      () => currentIncidentId.value,
      (value) => {
        if (value) {
          worksiteId.value = null;
          isEditing.value = false;
          isViewing.value = false;
          router.push(`/incident/${currentIncidentId.value}/work`);
          init();
        }
      },
    );

    async function init() {
      const allWorksites = await getAllWorksites();
      const markers = await getWorksites();

      mapUtils = useWorksiteMap(
        allWorksites,
        markers.map((m: { id: any }) => m.id),
        (m) => {
          loadCase(m);
        },
        ({ workTypes }) => {
          availableWorkTypes.value = workTypes;
          getDatesList();

          const states = currentUser?.value?.getStatesForIncident(
            currentIncidentId.value,
            true,
          );
          if (states.mapViewPort) {
            const { _northEast, _southWest } = states.mapViewPort;
            mapUtils?.getMap().fitBounds([
              [_northEast.lat, _northEast.lng],
              [_southWest.lat, _southWest.lng],
            ]);
          }
          sviList.value = getSviList();
          datesList.value = getDatesList();
          filterSvi(sviSliderValue.value);
        },
      );

      nextTick(() => {
        mapUtils?.getMap().on(
          'moveend',
          L.Util.throttle(
            () => {
              updateUserState({});
            },
            1000,
            {},
          ),
        );
      });
    }

    onMounted(async () => {
      if (route.params.incident_id) {
        store.commit('incident/setCurrentIncidentId', route.params.incident_id);
      }
      if (route.params.id) {
        worksiteId.value = route.params.id;
        if (route?.meta?.id === 'work_case_edit') {
          isEditing.value = true;
        } else {
          isViewing.value = true;
        }
      }
      loadStatesForUser();
      await init();
    });

    return {
      addMarkerToMap,
      clearCase,
      currentIncidentId,
      allWorksiteCount,
      filteredWorksiteCount,
      isEditing,
      isViewing,
      searchWorksites,
      showingTable,
      selectedChat,
      showingMap,
      mapLoading,
      showMap,
      showTable,
      route,
      router,
      worksite,
      worksiteId,
      worksiteQuery,
      jumpToCase,
      showHistory,
      showFlags,
      selectCase,
      showingDetails,
      showMobileMap,
      onUpdateQuery,
      onUpdateFilters,
      loadCase,
      workTypesClaimedByOrganization,
      printWorksite,
      shareWorksite,
      printSelectedWorksites,
      downloadWorksites,
      onSelectionChanged,
      selectedTableItems,
      loading,
      collapsedForm,
      collapsedUtilityBar,
      goToIncidentCenter,
      goToInteractive,
      reloadCase,
      availableWorkTypes,
      applyLocation,
      applyTeamGeoJson,
      zoomIn,
      zoomOut,
      filterSvi,
      filterDates,
      sviSliderValue,
      dateSliderValue,
      toggleHeatMap,
      showUpdateStatusModal,
      showUnclaimModal,
      reloadTable,
      filters,
      filterQuery,
      mostRecentlySavedWorksite,
      reloadMap,
      updateUserState,
      unreadChatCount,
      unreadUrgentChatCount,
      unreadNewsCount,
      currentSearch,
      numeral,
      moment,
      datesList,
      dateSliderFrom,
      dateSliderTo,
    };
  },
});
</script>

<style lang="postcss">
.work-page {
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
  .work-page {
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
.collapsedForm.work-page {
  grid-template-columns: minmax(0, auto);
}

.collapsedForm.work-page .work-page__form {
  display: none;
}
.work-page {
  @apply grid flex-grow h-full;
  grid-template-columns: minmax(0, auto) minmax(auto, 400px);

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
      @apply h-12 border flex items-center justify-start;
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
  .work-page {
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
