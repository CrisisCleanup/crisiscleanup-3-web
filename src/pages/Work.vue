<template>
  <template v-if="mq.mdMinus">
    <div v-if="!isViewing && !isEditing">
      <SimpleMap
        v-if="showingMap"
        :map-loading="mapLoading"
        data-testid="testSimpleMapdiv"
        show-zoom-buttons
        :available-work-types="availableWorkTypes"
        class="mb-16"
        zoom-buttons-class="mt-20"
        @onZoomIn="zoomIn"
        @onZoomOut="zoomOut"
        @onZoomIncidentCenter="goToIncidentCenter"
        @onZoomInteractive="goToInteractive"
      />
      <div v-else-if="showingTable" class="mt-20 p-2 border">
        <div class="text-base p-2 mb-1 text-center w-full">
          Cases for {{ incidentName }}
        </div>
        <WorksiteTable
          :worksite-query="worksiteQuery"
          @rowClick="loadCase"
          @selectionChanged="onSelectionChanged"
        />
      </div>
      <span
        v-if="allWorksiteCount"
        class="font-thin w-screen absolute flex items-center justify-center mt-4 mr-6"
        style="z-index: 1002"
      >
        <span class="bg-black rounded p-2 text-white">
          <span
            v-if="allWorksiteCount === filteredWorksiteCount"
            data-testid="testCaseCountContent"
          >
            {{ numeral(allWorksiteCount) }}
            {{ $t('casesVue.cases') }}
          </span>
          <span v-else data-testid="testCaseCountFilteredContent">
            {{ numeral(filteredWorksiteCount) }} of
            {{ numeral(allWorksiteCount) }}
            {{ $t('casesVue.cases') }}
          </span>
        </span>
      </span>
      <div
        style="z-index: 1002"
        class="absolute top-4 right-4 flex items-center"
      >
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
          @selectedExisting="handleSelectedExisting"
          @toggleSearch="showingSearchModal = !showingSearchModal"
        />
      </div>
      <div style="z-index: 1002" class="absolute top-20 left-12 mt-2">
        <WorksiteSearchInput
          v-if="showingSearchModal"
          :value="mobileSearch"
          data-testid="testWorksiteSearch"
          size="large"
          display-property="name"
          :placeholder="$t('actions.search')"
          skip-validation
          class="mx-4 py-1 inset-1"
          @selectedExisting="handleSelectedExisting"
          @input="
                  (value: string) => {
                    mobileSearch = value;
                  }
                "
        />
      </div>
      <div
        style="z-index: 1002"
        class="absolute bottom-20 gap-2 right-4 flex flex-col"
      >
        <base-button
          data-testid="testAddCaseButton"
          icon="plus"
          icon-size="sm"
          :title="$t('actions.add_case')"
          :alt="$t('actions.add_case')"
          :action="
            () => {
              isEditing = true;
            }
          "
          class="w-12 h-12 border-crisiscleanup-dark-100 border-t border-l border-r bg-white shadow-xl text-xl text-crisiscleanup-dark-400"
        />
        <base-button
          v-if="showingMap"
          data-testid="testShowTableButton"
          ccu-icon="table"
          icon-size="sm"
          :title="$t('actions.table_view_alt')"
          :alt="$t('actions.table_view_alt')"
          :action="showTable"
          class="w-12 h-12 border-crisiscleanup-dark-100 border-t border-l border-r bg-white shadow-xl text-xl text-crisiscleanup-dark-400"
        />
        <base-button
          v-if="showingTable"
          data-testid="testShowMapButton"
          ccu-icon="map"
          icon-size="sm"
          :title="$t('casesVue.map_view')"
          :alt="$t('casesVue.map_view')"
          :action="showMap"
          class="w-12 h-12 border-crisiscleanup-dark-100 border-t border-l border-r bg-white shadow-xl text-xl text-crisiscleanup-dark-400"
        />
      </div>
    </div>
    <div
      v-else
      class=""
      :style="{
        height: worksite ? 'calc(100vh - 10rem)' : 'calc(100vh - 8rem)',
      }"
    >
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
          <ccu-icon
            :alt="$t('casesVue.new_case')"
            type="active"
            size="small"
            data-testid="testNewCaseIcon"
          />
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
            data-testid="testCancelButton"
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
      </div>
      <div v-if="showingDetails" class="work-page__form-toggler">
        <base-button
          icon="arrow-left"
          data-testid="testHistoryButton"
          icon-size="medium"
          :action="
            () => {
              showHistory = false;
              showFlags = false;
            }
          "
          :alt="$t('actions.history')"
        />
        <span v-if="showHistory" class="text-base">{{
          $t('actions.history')
        }}</span>
        <span v-if="showFlags" class="text-base">{{ $t('actions.flag') }}</span>
        <div></div>
      </div>
      <div class="h-full min-h-0">
        <CaseHistory
          v-if="showHistory"
          data-testid="testShowHistoryDiv"
          :incident-id="Number(currentIncidentId)"
          :worksite-id="worksiteId"
        ></CaseHistory>
        <CaseFlag
          v-else-if="showFlags"
          data-testid="testShowFlagsDiv"
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
          data-testid="testWorksiteFormDiv"
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
          @savedWorksite="handleWorksiteSave"
          @closeWorksite="clearCase"
          @navigateToWorksite="handleWorksiteNavigation"
          @geocoded="addMarkerToMap"
        />
      </div>
    </div>
  </template>
  <template v-else>
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
                data-testid="testMapViewIcon"
                size="medium"
                class="mr-4 cursor-pointer"
                :class="showingMap ? 'filter-yellow' : 'filter-gray'"
                type="map"
                ccu-event="user_ui-view-map"
                @click="() => showMap(true)"
              />
              <ccu-icon
                :alt="$t('casesVue.table_view')"
                data-testid="testTableViewIcon"
                size="medium"
                class="mr-4 cursor-pointer"
                :class="showingTable ? 'filter-yellow' : 'filter-gray'"
                type="table"
                ccu-event="user_ui-view-table"
                @click="showTable"
              />
              <span v-if="allWorksiteCount" class="font-thin">
                <span
                  v-if="allWorksiteCount === filteredWorksiteCount"
                  data-testid="testCaseCountContent"
                >
                  {{ $t('casesVue.cases') }}
                  {{ numeral(allWorksiteCount) }}
                </span>
                <span v-else data-testid="testCaseCountFilteredContent">
                  {{ $t('casesVue.cases') }}
                  {{ numeral(filteredWorksiteCount) }} of
                  {{ numeral(allWorksiteCount) }}
                </span>
              </span>
              <WorksiteSearchInput
                :value="currentSearch"
                data-testid="testWorksiteSearch"
                icon="search"
                display-property="name"
                :placeholder="$t('actions.search')"
                size="medium"
                skip-validation
                class="mx-4 py-1"
                @selectedExisting="handleSelectedExisting"
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
                :alt="
                  collapsedUtilityBar
                    ? $t('actions.show_options')
                    : $t('actions.hide_options')
                "
                data-testid="testCollapseUtilityBarIcon"
                class="rounded-full border p-1 mx-1 mb-1 cursor-pointer justify-end"
                size="xl"
                @click="collapsedUtilityBar = !collapsedUtilityBar"
              />
            </div>
          </div>
          <tag
            v-if="overDueFilterLabel"
            data-testid="testOverDueFilterLabelDiv"
            closeable
            class="m-1 p-1 w-max"
            @closed="clearQuery"
            >{{ overDueFilterLabel }}</tag
          >
          <div
            v-if="!collapsedUtilityBar && !showingTable"
            class="flex justify-center items-center"
          >
            <Slider
              primary-color="#dadada"
              data-testid="testSviSliderInput"
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
              track-size="8px"
              data-testid="testUpdatedSliderInput"
              handle-size="12px"
              primary-color="#dadada"
              secondary-color="white"
              class="pt-1 ml-4"
              slider-class="w-84"
              :title="$t('casesVue.updated')"
              :value="dateSliderValue"
              :min="0"
              :max="100"
              :from="dateSliderFrom"
              :to="dateSliderTo"
              @input="filterDates"
            ></Slider>
          </div>
        </div>
        <div class="work-page__main-content">
          <div v-if="showingMap" class="work-page__main-content--map">
            <SimpleMap
              :map-loading="mapLoading"
              data-testid="testSimpleMapdiv"
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
                  :alt="
                    collapsedForm
                      ? $t('actions.show_options')
                      : $t('actions.hide_options')
                  "
                  data-testid="testCollapsedFormIcon"
                  class="px-0.5 py-2 ml-1.5"
                  size="large"
                  @click="collapsedForm = !collapsedForm"
                />
              </div>
              <PhoneComponentButton
                name="chat"
                data-testid="testPhoneComponentChatButton"
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
                    <div
                      v-if="unreadChatCount"
                      class="absolute top-0 left-0 m-1"
                      data-testid="testUnreadChatCountDiv"
                    >
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
                    <ccu-icon
                      type="chat"
                      class="p-1 ml-1.5"
                      size="large"
                      :alt="$t('chat.chat')"
                    />
                  </div>
                </template>
                <template #component>
                  <Chat
                    v-if="selectedChat"
                    data-testid="testChatDiv"
                    :chat="selectedChat"
                    :state-key="`chat_${selectedChat.id}_last_seen`"
                    @unreadCount="unreadChatCount = $event"
                    @unreadUrgentCount="unreadUrgentChatCount = $event"
                    @onNewMessage="unreadChatCount += 1"
                    @onNewUrgentMessage="unreadUrgentChatCount += 1"
                    @focusNewsTab="focusNewsTab"
                  />
                </template>
              </PhoneComponentButton>
              <PhoneComponentButton
                name="news"
                data-testid="testPhoneComponentNewsDiv"
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
                    <div
                      v-if="unreadNewsCount"
                      class="absolute top-0 left-0 m-1"
                      data-testid="testUnreadNewsCountDiv"
                    >
                      <span
                        class="inline-flex items-center justify-center px-1 py-0.5 mr-2 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
                        >{{ unreadNewsCount }}</span
                      >
                    </div>
                    <ccu-icon
                      type="news"
                      class="p-1 ml-1.5"
                      size="large"
                      :alt="$t('phoneDashboard.news')"
                    />
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
            <div class="items-center justify-end hidden md:flex">
              <base-button
                class="ml-3 my-3 border p-1 px-4 bg-white"
                data-testid="testPrintClaimedButton"
                :class="
                  selectedTableItems && selectedTableItems.size === 0
                    ? 'text-crisiscleanup-grey-700'
                    : ''
                "
                :disabled="selectedTableItems && selectedTableItems.size === 0"
                :text="$t('actions.print_claimed')"
                :alt="$t('actions.print_claimed')"
                :action="printSelectedWorksites"
              />
              <base-button
                class="ml-3 my-3 border p-1 px-4 bg-white"
                data-testid="testDownloadButton"
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
              />
              <base-button
                class="ml-3 my-3 border p-1 px-4 bg-white"
                data-testid="testUnclaimButton"
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
                data-testid="testUpdateStatusButton"
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
            <ccu-icon
              :alt="$t('casesVue.new_case')"
              type="active"
              size="small"
              data-testid="testNewCaseIcon"
            />
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
              data-testid="testCancelButton"
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
            data-testid="testShowMapButton"
            type="bare"
            icon="map"
            class="text-gray-700 pt-2"
            :action="
              () => {
                showMobileMap = true;
              }
            "
            :text="$t('casesVue.show_map')"
            :alt="$t('casesVue.show_map')"
          />
        </div>
        <div v-if="showingDetails" class="work-page__form-toggler">
          <base-button
            icon="arrow-left"
            data-testid="testHistoryButton"
            icon-size="medium"
            :action="
              () => {
                showHistory = false;
                showFlags = false;
              }
            "
            :alt="$t('actions.history')"
          />
          <span v-if="showHistory" class="text-base">{{
            $t('actions.history')
          }}</span>
          <span v-if="showFlags" class="text-base">{{
            $t('actions.flag')
          }}</span>
          <div></div>
        </div>
        <div class="h-auto min-h-0">
          <CaseHistory
            v-if="showHistory"
            data-testid="testShowHistoryDiv"
            :incident-id="Number(currentIncidentId)"
            :worksite-id="worksiteId"
          ></CaseHistory>
          <CaseFlag
            v-else-if="showFlags"
            data-testid="testShowFlagsDiv"
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
            data-testid="testWorksiteFormDiv"
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
            @savedWorksite="handleWorksiteSave"
            @closeWorksite="clearCase"
            @navigateToWorksite="handleWorksiteNavigation"
            @geocoded="addMarkerToMap"
          />
        </div>
      </div>
    </div>
  </template>
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
import { useMq } from 'vue3-mq';
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
import { numeral } from '@/utils/helpers';
import type Location from '@/models/Location';
import UpdateCaseStatus from '@/components/UpdateCaseStatus.vue';
import useWorksiteTableActions from '@/hooks/worksite/useWorksiteTableActions';
import ShareWorksite from '@/components/modals/ShareWorksite.vue';
import useEmitter from '@/hooks/useEmitter';
import Organization from '@/models/Organization';

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
    const { emitter } = useEmitter();
    const mq = useMq();

    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );

    const incidentName = computed(() => {
      const { name } = Incident.find(currentIncidentId.value) as Incident;
      return name;
    });

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
    const mobileSearch = ref<string>('');
    const worksiteId = ref<any>(null);
    const selectedChat = ref<any>({ id: 2 });
    const filterQuery = ref<any>({});
    const filters = ref<any>({});
    const mostRecentlySavedWorksite = ref<any>(null);
    const selectedTableItems = ref<Set<number>>(new Set());
    const availableWorkTypes = ref({});
    const sviSliderValue = ref(100);
    const dateSliderValue = ref(100);
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
    const showingSearchModal = ref(false);

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
        showingMap: showingMap.value,
        showingTable: showingTable.value,
        sviLevel: sviSliderValue.value,
        dateLevel: dateSliderValue.value,
        ...data,
      };
      User.api().updateUserState(
        {
          incident: currentIncidentId.value,
        },
        newStates,
      );
    }

    const hasOverdueFilter = computed(() => {
      return (
        'work_type__claimed_by' in route.query &&
        'work_type__status__in' in route.query &&
        'created_at__lte' in route.query
      );
    });

    const overDueFilterLabel = computed(() => {
      if (hasOverdueFilter.value) {
        return `${getOrganizationName(
          route.query.work_type__claimed_by as string,
        )} ${t('casesVue.overdue_cases')}`;
      }

      return '';
    });

    const worksiteQuery = computed<Record<any, any>>(() => {
      const query = {
        incident: currentIncidentId.value,
        ...filterQuery.value,
        ...route.query,
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
          updatedStatus(payload: string) {
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
            title: t('casesVue.cannot_share_cases'),
            content: t('casesVue.bulk_status_update_for_claimed_only'),
          });
        }

        for (const worksite of worksitesChangeStatus) {
          if (hasClaimedWorkType(worksite)) {
            for (const workType of worksite.work_types) {
              promises.push(
                Worksite.api().updateWorkTypeStatus(workType.id, status),
              );
            }
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

    const getSviList = useMemoize((_) => {
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
    });

    function filterSvi(value: number) {
      if (value === 0) return;
      sviSliderValue.value = Number(value);
      const layer = mapUtils?.getCurrentMarkerLayer();
      const container = layer?._pixiContainer;
      const sviList = getSviList(container?.children?.length);
      if (sviList && container) {
        const count = Math.floor((sviList.length * Number(value)) / 100);
        const filteredSvi = sviList.slice(0, count);
        const minSvi = filteredSvi[filteredSvi.length - 1]?.svi || 0;
        for (const markerSprite of container.children) {
          markerSprite.visible = markerSprite.svi > minSvi;
        }

        layer._renderer.render(container);
        layer.redraw();
      }

      updateUserState({});
    }

    const getDatesList = useMemoize((_) => {
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
    });

    const dateSliderFrom = ref<string>('');
    const dateSliderTo = ref<string>('');

    const getDateSliderFrom = useMemoize((_) => {
      const layer = mapUtils?.getCurrentMarkerLayer();
      const container = layer?._pixiContainer;
      const list = getDatesList(container?.children?.length);
      if (list) {
        return `${moment({ hours: 0 }).diff(
          list[0]?.updated_at,
          'days',
        )} days ago`;
      }

      return '';
    });

    const getDateSliderTo = useMemoize((_) => {
      const layer = mapUtils?.getCurrentMarkerLayer();
      const container = layer?._pixiContainer;
      const list = getDatesList(container?.children?.length);
      if (list) {
        return `${moment({ hours: 0 }).diff(
          list[list.length - 1].updated_at,
          'days',
        )} days ago`;
      }

      return '';
    });

    function filterDates(value: number) {
      if (sviSliderValue.value !== 100) {
        filterSvi(100);
      }

      const layer = mapUtils?.getCurrentMarkerLayer();
      const container = layer?._pixiContainer;
      const dl = getDatesList(container?.children?.length);
      dateSliderFrom.value = getDateSliderFrom(container?.children?.length);
      dateSliderTo.value = getDateSliderTo(container?.children?.length);
      if (value === 0) return;
      dateSliderValue.value = Number(value);

      if (dl) {
        const count = Math.floor((dl.length * Number(value)) / 100);
        const filteredDates = dl.slice(0, count);
        const minDate = filteredDates[filteredDates.length - 1]?.updated_at;
        for (const markerSprite of container?.children || []) {
          markerSprite.visible = markerSprite.updated_at_moment > minDate;
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
      const worksiteToShare = await Worksite.find(id);
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
          }

          noClaimText = result.response;
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
          phoneNumbersUpdated(value: string[]) {
            phoneNumbers = value.map((number) =>
              String(number).replace(/\D/g, ''),
            );
          },
          emailsUpdated(value: string[]) {
            emails = value;
          },
          shareMessageUpdated(value: string) {
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
      $toasted.success(t('casesVue.sucessfully_shared_case'));
    }

    async function printWorksite(id: number) {
      loading.value = true;
      let file;
      const worksiteToPrint = await Worksite.find(id);
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
          if (result.response) {
            file = await Worksite.api().printWorksite(id, result.response);
          } else {
            $toasted.error(t('casesVue.please_explain_why_no_claim'));
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
      if (mq.mdMinus) {
        showMap(true);
      }
    }

    async function addMarkerToMap(location: LatLng) {
      mapUtils?.addMarkerToMap(location);
      showMap();
    }

    function loadCase(data: Sprite & Worksite) {
      isViewing.value = true;
      worksiteId.value = data.id;
      showHistory.value = false;
      showFlags.value = false;
      router.push(`/incident/${currentIncidentId.value}/work/${data.id}`);
    }

    function onUpdateQuery(query: any) {
      filterQuery.value = query;
      updateUserState({
        appliedFilters: filterQuery.value,
        filters: filters.value,
      });
    }

    function onUpdateFilters(f: any) {
      filters.value = f;
      updateUserState({
        appliedFilters: filterQuery.value,
        filters: filters.value,
      });
    }

    watch(
      () => worksiteQuery.value,
      (value, previousValue) => {
        if (JSON.stringify(value) !== JSON.stringify(previousValue)) {
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
      const [allWorksites, markers] = await Promise.all([
        getAllWorksites(),
        getWorksites(),
      ]);

      if (route.query.work_type__claimed_by) {
        Organization.api().get(
          `/organizations/${route.query.work_type__claimed_by}`,
        );
      }

      const states = currentUser?.value?.getStatesForIncident(
        currentIncidentId.value,
        true,
      );
      let bounds;
      if (states.mapViewPort) {
        const { _northEast, _southWest } = states.mapViewPort;
        bounds = [
          [_northEast.lat, _northEast.lng],
          [_southWest.lat, _southWest.lng],
        ];
      }

      try {
        mapUtils = useWorksiteMap(
          allWorksites,
          markers.map((m: { id: any }) => m.id),
          (m) => {
            loadCase(m);
          },
          ({ workTypes }) => {
            availableWorkTypes.value = workTypes;

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

            filterSvi(sviSliderValue.value);
            nextTick(() => {
              // Used to trigger calculation of labels ofr updated slider
              filterDates(0);
            });
            updateUserState({ mapViewPort: states.mapViewPort });
            loadStatesForUser();
          },
          false,
          bounds,
        );
      } catch {}

      nextTick(() => {
        mapUtils?.getMap().on(
          'moveend',
          L.Util.throttle(
            () => {
              updateUserState({ mapViewPort: mapUtils?.getMap().getBounds() });
            },
            1000,
            {},
          ),
        );
      });
    }

    function handleSelectedExisting(w: Worksite) {
      worksiteId.value = w.id;
      isViewing.value = true;
      if (showingMap.value) {
        router.push({
          path: `/incident/${currentIncidentId.value}/work/${worksiteId.value}`,
          query: { showOnMap: true },
        });
      }
    }

    function handleWorksiteSave(w: Worksite) {
      if (isEditing.value) {
        isEditing.value = true;
        router.push(
          `/incident/${currentIncidentId.value}/work/${worksite.value?.id}/edit`,
        );
      } else {
        worksiteId.value = w.id;
        mostRecentlySavedWorksite.value = w;
        nextTick(() => {
          clearCase();
        });
      }

      reloadMap();
    }

    function handleWorksiteNavigation(w: Worksite) {
      worksiteId.value = w.id;
      isEditing.value = true;
      router.push({
        path: `/incident/${currentIncidentId.value}/work/${w.id}/edit`,
        query: { showOnMap: true },
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
      if (route.query.showTable) {
        showingTable.value = true;
        showingMap.value = false;
      }

      await init();
    });
    function focusNewsTab() {
      emitter.emit('phone_component:close');
      // open the active call PhoneComponentButton
      emitter.emit('phone_component:open', 'news');
    }

    function getOrganizationName(id: string | number | (string | number)[]) {
      const organization = Organization.find(id);
      if (organization) {
        return organization.name;
      }

      return '';
    }

    function clearQuery() {
      router.replace({ query: undefined });
    }

    return {
      addMarkerToMap,
      clearCase,
      currentIncidentId,
      incidentName,
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
      mobileSearch,
      numeral,
      moment,
      dateSliderFrom,
      dateSliderTo,
      focusNewsTab,
      handleSelectedExisting,
      handleWorksiteSave,
      handleWorksiteNavigation,
      overDueFilterLabel,
      getOrganizationName,
      clearQuery,
      mq,
      showingSearchModal,
    };
  },
});
</script>

<script setup></script>

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
      @apply h-1/2;
    }

    &__form {
      @apply h-1/2;

      &-header {
        @apply h-16 border flex items-center justify-start;
      }
    }
  }
}
</style>
