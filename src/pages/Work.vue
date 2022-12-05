<template>
  <div class="work-page h-full" :class="{ collapsedForm }">
    <!-- TODO: Move this (doesn't belong here) -->
    <div class="work-page__main">
      <div class="relative">
        <div class="flex items-center justify-between">
          <div v-if="!collapsedUtilityBar" class="flex items-center h-16">
            <div class="flex py-3 px-2" style="min-width: 80px">
              <ccu-icon
                :alt="$t('casesVue.map_view')"
                size="medium"
                class="mr-4 cursor-pointer"
                :class="showingMap ? 'filter-yellow' : 'filter-gray'"
                type="map"
                ccu-event="user_ui-view-map"
                @click.native="() => showMap(true)"
                data-cy="cases.mapButton"
              />
              <ccu-icon
                :alt="$t('casesVue.table_view')"
                size="medium"
                class="mr-4 cursor-pointer"
                :class="showingTable ? 'filter-yellow' : 'filter-gray'"
                type="table"
                ccu-event="user_ui-view-table"
                @click.native="showTable"
                data-cy="cases.tableButton"
              />
            </div>
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
            <div class="flex justify-start w-auto">
              <WorksiteSearchInput
                :value="currentSearch"
                icon="search"
                display-property="name"
                :placeholder="$t('actions.search')"
                size="medium"
                @selectedExisting="
                  (w) => {
                    worksiteId = w.id;
                    isViewing = true;
                    if (showingMap) {
                      router.push({
                        query: { showOnMap: true },
                      });
                    }
                  }
                "
                @input='(value) => {
                  currentSearch = value;
                }'
                skip-validation
                class="mx-4"
              />
              <WorksiteActions
                v-if="currentIncidentId"
                :current-incident-id="String(currentIncidentId)"
                :inital-filters="filters"
                :key="currentIncidentId"
                @updatedQuery="onUpdateQuery"
                @updatedFilters="onUpdateFilters"
                @applyLocation="applyLocation"
                @applyTeamGeoJson="applyTeamGeoJson"
                @downloadCsv="downloadWorksites"
                @toggleHeatMap="toggleHeatMap"
              />
            </div>
            <div v-if="loading || mapLoading" class="flex h-full items-center justify-center">
              <font-awesome-icon size="xl" icon="spinner" spin/>
            </div>
          </div>
          <div class="flex justify-end items-center w-full">
            <font-awesome-icon
              @click="collapsedUtilityBar = !collapsedUtilityBar"
              :icon="collapsedUtilityBar ? 'chevron-down' : 'chevron-up'"
              class="
                rounded-full
                border
                p-1
                mx-1
                mb-1
                cursor-pointer
                justify-end
              "
              size="xl"
            />
          </div>
        </div>
        <div
          v-if="!collapsedUtilityBar"
          class="flex justify-center items-center"
        >
          <Slider
            primary-color="#dadada"
            secondary-color="white"
            :value="sviSliderValue"
            @input="filterSvi"
            :from="$t('svi.most_vulnerable')"
            :to="$t('svi.everyone')"
            :from-tooltip="$t(`svi.svi_more_info_link`)"
            handle-size="12px"
            track-size="8px"
            slider-class="w-64"
          />
        </div>
      </div>
      <div class="work-page__main-content">
        <div v-show="showingMap" class="work-page__main-content--map">
          <SimpleMap
            :map-loading="mapLoading"
            show-zoom-buttons
            @onZoomIn="zoomIn"
            @onZoomOut="zoomOut"
            @onZoomIncidentCenter="goToIncidentCenter"
            @onZoomInteractive="goToInteractive"
            :available-work-types="availableWorkTypes"
          />
          <div class="work-page__actions" ref="phoneButtons">
            <div
              class="
                w-full
                h-full
                flex
                items-center
                justify-center
                relative
                p-0.5
                mt-1
                bg-white
                cursor-pointer
              "
            >
              <font-awesome-icon
                @click="collapsedForm = !collapsedForm"
                :icon="collapsedForm ? 'chevron-left' : 'chevron-right'"
                class="px-0.5 py-2 ml-1.5"
                size="large"
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
                  <div v-if="unreadChatCount" class="absolute top-0 left-0 m-1">
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
                  :chat="selectedChat"
                  @unreadCount="unreadChatCount = $event"
                  @unreadUrgentCount="unreadUrgentChatCount = $event"
                  @onNewMessage="unreadChatCount += 1"
                  @onNewUrgentMessage="unreadUrgentChatCount += 1"
                  :state-key="`chat_${selectedChat.id}_last_seen`"
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
                  <div v-if="unreadNewsCount" class="absolute top-0 left-0 m-1">
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
                <PhoneNews
                  @unreadCount="unreadNewsCount = $event"
                  :cms-tag="'work-news'"
                  state-key="work_news_last_seen"
                />
              </template>
            </PhoneComponentButton>
          </div>
        </div>
        <div v-show="showingTable" class="work-page__main-content--table">
          <div class="flex items-center justify-end">
            <base-button
              class="ml-3 my-3 border p-1 px-4 bg-white"
              :class="
                selectedTableItems && selectedTableItems.size === 0
                  ? 'text-crisiscleanup-grey-700'
                  : ''
              "
              :disabled="selectedTableItems && selectedTableItems.size === 0"
              :text="$t('actions.print')"
              :alt="$t('actions.print')"
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
        @onDownloadWorksite="
          () => {
            downloadWorksites([worksite.id]);
          }
        "
        @onPrintWorksite="printWorksite"
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
              `/incident/${currentIncidentId}/work/${worksite.id}/edit`,
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
          @click.native="() => clearCase()"
          class="
            flex
            h-full
            items-center
            cursor-pointer
            border-b-2 border-primary-light
            p-3
          "
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
        <span class="text-base" v-if="showHistory">{{
          $t('actions.history')
        }}</span>
        <span class="text-base" v-if="showFlags">{{ $t('actions.flag') }}</span>
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
          @clearCase="clearCase"
        ></CaseFlag>
        <WorksiteView
          v-else-if="isViewing"
          :worksite-id="worksiteId"
          :incident-id="String(currentIncidentId)"
          :key="worksiteId"
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
          :incident-id="String(currentIncidentId)"
          :worksite-id="worksiteId"
          :key="worksiteId"
          @jumpToCase="jumpToCase"
          :is-editing="isEditing"
          @savedWorksite="
            (w) => {
              if (!isEditing) {
                worksiteId = w.id;
                mostRecentlySavedWorksite = worksite;
                $nextTick(() => {
                  clearCase();
                });
              } else {
                isEditing = true;
                router.push(
                  `/incident/${currentIncidentId}/work/${worksite.id}/edit`,
                );
              }
              reloadMap();
            }
          "
          @closeWorksite="clearCase"
          class="border shadow"
          @navigateToWorksite="
            (id) => {
              worksiteId = id;
              isEditing = true;
              router.push(
                `/incident/${currentIncidentId}/work/${worksite.id}/edit`,
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
import { debounce } from 'lodash';
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
import {useRoute, useRouter} from "vue-router";
import {useToast} from "vue-toastification";
import useDialogs from "../hooks/useDialogs";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import useWorksiteMap, {MapUtils} from "../hooks/worksite/useWorksiteMap";
import axios from "axios";
import {Sprite} from "pixi.js";
import moment from 'moment';

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
    const { prompt, component } = useDialogs();
    const { t } = useI18n();
    const store = useStore();

    const currentIncidentId = computed(
        () => store.getters['incident/currentIncidentId'],
    );

    const currentUser = computed(() =>
        User.find(User.store().getters['auth/userId']),
    );

    const showingMap = ref<Boolean>(true);
    const showingTable = ref<Boolean>(false);
    const showHistory = ref<Boolean>(false);
    const showFlags = ref<Boolean>(false);
    const showMobileMap = ref<Boolean>(false);
    const isEditing = ref<Boolean>(false);
    const isViewing = ref<Boolean>(false);
    const searchingWorksites = ref<Boolean>(false);
    const mapLoading = ref<Boolean>(false);
    const collapsedForm = ref<Boolean>(false);
    const collapsedUtilityBar = ref<Boolean>(false);
    const loading = ref<Boolean>(false);
    const allWorksiteCount = ref<Number>(0);
    const filteredWorksiteCount = ref<Number>(0);
    const searchWorksites = ref<any[]>([]);
    const currentSearch = ref<string>('');
    const worksiteId = ref<any>(null);
    const selectedChat = ref<any>({ id: 2 });
    const filterQuery = ref<any>({});
    const filters = ref<any>({});
    const mostRecentlySavedWorksite = ref<any>(null);
    const selectedTableItems = ref([]);
    const availableWorkTypes = ref({});
    const sviSliderValue = ref(100);
    let mapUtils: MapUtils | null;
    const unreadChatCount = ref(0);
    const unreadUrgentChatCount = ref(0);
    const unreadNewsCount = ref(0);

    function loadStatesForUser() {
      const states = currentUser?.value?.getStatesForIncident(
        currentIncidentId.value,
        true,
      );
      if (states) {
        // if (states.showingMap) {
        //   showingMap.value = true;
        //   showingTable.value = false;
        // }
        // if (states.showingTable) {
        //   showingTable.value = true;
        //   showingMap.value = false;
        // }
        if (states.appliedFilters) {
          filterQuery.value = states.appliedFilters;
        }
        if (states.sviLevel) {
          sviSliderValue.value = states.sviLevel;
        }
        if (states.filters) {
          filters.value = {
            ...states.filters,
          };
        }
      }
    }

    function updateUserState(incomingData) {
      let data = incomingData;
      if (!data) {
        data = {};
      }
      User.api().updateUserState(
        {
          incident: currentIncidentId.value,
        },
        {
          appliedFilters: filterQuery.value,
          filters: filters.value,
          showingMap: showingMap.value,
          showingTable: showingTable.value,
          sviLevel: sviSliderValue.value,
          ...data,
        },
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
        markers.map((m) => m.id),
      );
      updateUserState({});
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
      updateUserState({});
    };

    const showingDetails = computed<Boolean>(() => {
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
        component: 'UpdateCaseStatus',
        classes: 'w-full h-48 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        listeners: {
          updatedStatus: (payload) => {
            status = payload;
          },
        },
      });

      if (response === 'ok' && status) {
        loading.value = true;
        const promises = [] as any;
        const layer = mapUtils?.getCurrentMarkerLayer();
        const container = layer._pixiContainer;

        selectedTableItems.value.forEach((id) => {
          const sprite = container.children.find((w) => {
            return Number(w.id) === Number(id);
          });

          sprite.work_types.forEach((workType) => {
            promises.push(
              Worksite.api().updateWorkTypeStatus(workType.id, status),
            );
          });
        });
        await Promise.allSettled(promises);
      }
      loading.value = false;
      reloadTable();
    }

    async function showUnclaimModal() {
      let options;
      const response = await component({
        title: t('actions.unclaim_cases'),
        component: 'UnclaimCases',
        classes: 'w-full h-48 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          selectedTableItems,
        },
        listeners: {
          onUnclaimSelect: (payload) => {
            options = payload;
          },
        },
      });

      if (response === 'ok' && options) {
        const promises = [] as any;
        selectedTableItems.value.forEach((id) => {
          promises.push(
            Worksite.api().unclaimWorksite(
              id,
              [],
              options?.updateStatusOnUnclaim ? 'open_unassigned' : null,
            ),
          );
        });
        await Promise.allSettled(promises);
      }
      loading.value = false;
      reloadTable();
    }

    function toggleHeatMap(points) {
      if (points) {
        mapUtils?.addHeatMap(points);
      } else {
        mapUtils?.removeHeatMap();
      }
    }

    function filterSvi(e) {
      sviSliderValue.value = e.target.value;
      const layer = mapUtils?.getCurrentMarkerLayer();
      const container = layer._pixiContainer;
      const sviList = container.children.map((marker) => {
        return {
          id: marker.id,
          svi: marker.svi,
        };
      });
      sviList.sort((a, b) => {
        return (b.svi || 1) - (a.svi || 1);
      });
      const count = Math.floor((sviList.length * Number(e.target.value)) / 100);
      const filteredSvi = sviList.slice(0, count);
      const minSvi = filteredSvi[filteredSvi.length - 1].svi;
      container.children.forEach((markerSprite: Sprite) => {
        markerSprite.visible = markerSprite.svi > minSvi;
      });

      layer._renderer.render(container);
      layer.redraw();

      updateUserState({});
    }

    function zoomIn() {
      mapUtils?.getMap().zoomIn();
    }

    function zoomOut() {
      mapUtils?.getMap().zoomOut();
    }

    function applyTeamGeoJson(data) {
      mapUtils?.applyTeamGeoJson(data.teamId, data.value, data.geom);
    }

    function applyLocation(data) {
      mapUtils?.applyLocation(data.locationId, data.value);
    }

    async function reloadCase() {
      return Worksite.api().fetch(
        worksite?.value?.id,
        currentIncidentId.value.id,
      );
    }

    function fitLocation(location) {
      mapUtils?.fitLocation(location);
    }

    function goToIncidentCenter() {
      const { locationModels } = Incident.find(
        currentIncidentId.value,
      ) as Incident;
      if (locationModels.length) {
        locationModels.forEach((location) => {
          fitLocation(location);
        });
      } else {
        const center = averageGeolocation(
          mapUtils?.getPixiContainer()?.children.map((marker) => [marker.x, marker.y]),
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

      if (locationModels.length) {
        goToIncidentCenter();
        mapUtils?.getMap().setZoom(INTERACTIVE_ZOOM_LEVEL);
      } else {
        const center = averageGeolocation(
          mapUtils?.getPixiContainer()
            ?.children.map((marker) => [marker.x, marker.y]),
        );
        if (center.latitude && center.longitude) {
          mapUtils?.getMap()
            .setView(
              [center.latitude, center.longitude],
              INTERACTIVE_ZOOM_LEVEL,
            );
        }
      }
    }

    function onSelectionChanged(selectedItems) {
      selectedTableItems.value = selectedItems;
    }

    async function printWorksite() {
      loading.value = true;
      let file;
      if (workTypesClaimedByOrganization.value.length > 0) {
        file = await Worksite.api().printWorksite(worksite?.value?.id, '');
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
          file = await Worksite.api().printWorksite(worksite?.value?.id, '');
        }
        if (result.key === 'printNoClaim') {
          if (!result.response) {
            $toasted.error(t('casesVue.please_explain_why_no_claim'));
          } else {
            file = await Worksite.api().printWorksite(
              worksite?.value?.id,
              result.response,
            );
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
      const file = await Worksite.api().downloadWorksite(
        Array.from(selectedTableItems.value),
        'application/pdf',
      );
      forceFileDownload(file.response);
    }

    async function downloadWorksites(ids) {
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
          `${import.meta.env.VITE_APP_API_BASE_URL}/worksites_download/download_csv`,
          {
            params,
            headers: { Accept: 'text/csv' },
            responseType: 'blob',
          },
        );
        forceFileDownload(response);
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        loading.value = false;
      }
    }

    function selectCase(c) {
      if (c) {
        store.commit('incident/setCurrentIncidentId', c.incident)
        worksiteId.value = c.id;
      } else {
        worksiteId.value = null;
      }
    }

    function clearCase() {
      worksiteId.value = null;
      isEditing.value = false;
      isViewing.value = false;
      router.push(`/incident/${currentIncidentId.value}/work`);
    }

    async function addMarkerToMap(location) {
      mapUtils?.addMarkerToMap(location);
      showMap();
    }

    function loadCase(data) {
      isViewing.value = true;
      worksiteId.value = data.id;
      router.push(`/incident/${currentIncidentId.value}/work/${data.id}`);
    }

    function onUpdateQuery(query) {
      filterQuery.value = query;
      updateUserState({});
    }

    function onUpdateFilters(f) {
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
        }
      },
    );

    onMounted(async () => {
      if (route.params.incident_id) {
        store.commit('incident/setCurrentIncidentId', route.params.incident_id)
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
      const allWorksites = await getAllWorksites();
      const markers = await getWorksites();

      mapUtils = useWorksiteMap(
        allWorksites,
        markers.map((m) => m.id),
        (m) => {
          loadCase(m);
        },
        ({ workTypes }) => {
          availableWorkTypes.value = workTypes;
          // nextTick(() => {
          //   filterSvi(sviSliderValue.value);
          // });
        },
      );
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
      sviSliderValue,
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
      numeral: (v) => v,
      moment,
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
