<template>
  <template v-if="mq.mdMinus">
    <div v-if="!isEditing && !isNew">
      <div class="h-20 absolute top-0 w-24 mt-20" style="z-index: 1002">
        <PhoneToolBar
          :complete-call="completeCall"
          :on-logged-in="onLoggedIn"
          :on-toggle-outbounds="onToggleOutbounds"
          :select-case="selectCase"
          :worksite-id="worksiteId"
        />
      </div>
      <SimpleMap
        :key="showingMap"
        :map-loading="mapLoading"
        class="mb-16"
        zoom-buttons-class="mt-20"
      />
      <WorksiteTable
        v-if="showingTable"
        class="mt-28"
        :worksite-query="worksiteQuery"
        @selectionChanged="onSelectionChanged"
        @rowClick="
          (worksite) => {
            worksiteId = worksite.id;
            isEditing = true;
          }
        "
      />
      <div
        ref="phoneButtons"
        class="phone-system__actions"
        data-testid="testPhoneButtonsDiv"
      >
        <PhoneComponentButton
          name="caller"
          data-testid="testPhoneComponentCallerButton"
          :alt="$t('phoneDashboard.availability_indicator')"
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
            <div
              v-if="potentialFailedCall"
              data-testid="testPotentialFailedCallDiv"
              class="bg-red-500 mt-6 text-white p-1.5"
            >
              {{ $t('phoneDashboard.ended_early') }}
              <base-button
                :action="retryFailedCall"
                data-testid="testRetryFailedCallButton"
                variant="solid"
                class="px-2 text-black mt-1"
                :text="$t('phoneDashboard.try_again')"
                :alt="$t('phoneDashboard.try_again')"
              />
            </div>
            <tabs ref="tabs" :details="false" @mounted="setTabs">
              <tab ref="callTab" :name="$t('phoneDashboard.active_call')">
                <ActiveCall
                  :case-id="worksiteId"
                  data-testid="testActiveCallDiv"
                  @setCase="selectCase"
                />
              </tab>
              <tab ref="statusTab" :name="$t('phoneDashboard.call_status')">
                <UpdateStatus
                  class="p-2"
                  data-testid="testUpdateStatusCompleteCallDiv"
                  @onCompleteCall="completeCall"
                />
              </tab>
            </tabs>
          </template>
        </PhoneComponentButton>
        <PhoneComponentButton
          name="dialer"
          data-testid="testPhoneComponentDialerButton"
          class="phone-system__action"
          component-class="phone-system__action-content phone-system__action-content--dialer"
          :alt="$t('phoneDashboard.manual_dialer')"
          icon="dialer"
          icon-size="small"
          icon-class="bg-black p-1"
        >
          <template #component>
            <ManualDialer
              class="p-2"
              data-testid="testManualDialerDiv"
              style="z-index: 1002"
              :dialing="dialing"
              @onDial="dialManualOutbound"
            ></ManualDialer>
          </template>
        </PhoneComponentButton>
        <PhoneComponentButton
          name="chat"
          data-testid="testPhoneComponentChatButton"
          :alt="$t('chat.chat')"
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
                data-testid="testUnreadUrgentChatCountDiv"
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
              :chat="selectedChat"
              @unreadCount="unreadChatCount = $event"
              @unreadUrgentCount="unreadUrgentChatCount = $event"
              @onNewMessage="unreadChatCount += 1"
              @onNewUrgentMessage="unreadUrgentChatCount += 1"
              @focusNewsTab="focusNewsTab"
            />
          </template>
        </PhoneComponentButton>
        <PhoneComponentButton
          v-if="callHistory"
          data-testid="testPhoneComponentHistoryButton"
          :alt="$t('phoneDashboard.call_history')"
          name="history"
          class="phone-system__action"
          component-class="phone-system__action-content phone-system__action-content--history"
          icon="phone-history"
          icon-size="large"
          icon-class="p-1"
        >
          <template #component>
            <CallHistory
              :calls="callHistory"
              data-testid="testCallHistoryDiv"
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
          data-testid="testPhoneComponentStatsButton"
          :alt="$t('phoneDashboard.stats')"
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
          data-testid="testPhoneComponentLeaderboardButton"
          :alt="$t('phoneDashboard.leaderboard')"
          class="phone-system__action"
          component-class="phone-system__action-content phone-system__action-content--leaderboard"
          icon="leaderboard"
          icon-size="medium"
          icon-class="p-1"
        >
          <template #button>
            <div class="w-full h-full flex items-center justify-center">
              <ccu-icon
                :fa="true"
                type="users"
                class="p-1"
                size="medium"
                :alt="$t('phoneDashboard.leaderboard')"
              />
            </div>
          </template>
          <template #component>
            <Leaderboard class="h-full" />
          </template>
        </PhoneComponentButton>
      </div>
      <span
        v-if="allWorksiteCount"
        class="font-thin w-screen absolute flex items-center justify-center mt-4 mr-6"
        style="z-index: 1002"
      >
        <span class="bg-black rounded p-2 text-white">
          <span data-testid="testCaseCountContent">
            {{ allWorksiteCount }}
            {{ $t('casesVue.cases') }}
          </span>
        </span>
      </span>
      <div style="z-index: 1002" class="absolute top-4 right-4 flex">
        <base-button
          text=""
          data-testid="testSearchButton"
          icon="search"
          icon-size="sm"
          :title="$t('actions.search')"
          :alt="$t('actions.search')"
          :action="
            () => {
              showingSearchModal = !showingSearchModal;
            }
          "
          class="w-10 h-10 border-crisiscleanup-dark-100 border-t border-l border-r bg-white shadow-xl text-xl text-crisiscleanup-dark-400"
        />
      </div>
      <div style="z-index: 1002" class="absolute top-28 left-12 mt-2">
        <WorksiteSearchInput
          v-if="showingSearchModal"
          :value="mobileSearch"
          data-testid="testWorksiteSearch"
          size="large"
          display-property="name"
          :placeholder="$t('actions.search')"
          skip-validation
          class="mx-4 py-1 inset-1"
          @selectedExisting="onSelectExistingWorksite"
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
              isNew = true;
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
          :action="() => toggleView('showingTable')"
          class="w-12 h-12 border-crisiscleanup-dark-100 border-t border-l border-r bg-white shadow-xl text-xl text-crisiscleanup-dark-400"
        />
        <base-button
          v-if="showingTable"
          data-testid="testShowMapButton"
          ccu-icon="map"
          icon-size="sm"
          :title="$t('casesVue.map_view')"
          :alt="$t('casesVue.map_view')"
          :action="() => toggleView('showingMap')"
          class="w-12 h-12 border-crisiscleanup-dark-100 border-t border-l border-r bg-white shadow-xl text-xl text-crisiscleanup-dark-400"
        />
      </div>
    </div>
    <div
      v-else
      :style="{
        height: worksite ? 'calc(100vh - 10rem)' : 'calc(100vh - 8rem)',
      }"
    >
      <CaseHeader
        v-if="worksite"
        data-testid="testCaseHeaderDiv"
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
            data-testid="testNewCaseIcon"
            type="active"
            size="small"
            :action="() => selectCase(null)"
          />
          <span class="px-1 mt-0.5">{{ $t('casesVue.new_case') }}</span>
        </div>
        <base-button
          v-if="$mq === 'sm'"
          data-testid="testShowMapIcon"
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
          :alt="$t('casesVue.show_map')"
        />
      </div>
      <div v-if="showingDetails" class="phone-system__form-toggler">
        <base-button
          icon="arrow-left"
          data-testid="testShowHistoryButton"
          :icon-size="medium"
          :alt="$t('actions.history')"
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
      <div class="h-full min-h-0">
        <CaseHistory
          v-if="showHistory"
          data-testid="testHistoryDiv"
          :incident-id="currentIncidentId"
          :worksite-id="worksiteId"
        ></CaseHistory>
        <WorksiteForm
          v-else
          ref="worksiteForm"
          :key="worksiteId"
          data-testid="testWorksiteFormDiv"
          :incident-id="String(currentIncidentId)"
          :worksite-id="worksiteId"
          disable-claim-and-save
          :data-prefill="prefillData"
          :is-editing="isEditing"
          class="border shadow"
          @jumpToCase="jumpToCase"
          @savedWorksite="
            (worksite) => {
              onSaveCase(worksite);
              init();
            }
          "
          @closeWorksite="
            () => {
              clearCase();
              isNew = false;
              isEditing = false;
              init();
            }
          "
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
  </template>
  <template v-else>
    <div class="phone-system">
      <div class="phone-system__main">
        <div class="phone-system__main-header">
          <div class="flex py-3 px-2" style="min-width: 80px">
            <ccu-icon
              :alt="$t('casesVue.map_view')"
              data-testid="testPhoneMapViewIcon"
              size="medium"
              class="mr-4 cursor-pointer"
              :class="showingMap ? 'filter-yellow' : 'filter-gray'"
              type="map"
              ccu-event="user_ui-view-map"
              @click="toggleView('showingMap')"
            />
            <ccu-icon
              :alt="$t('casesVue.table_view')"
              data-testid="testPhoneTableViewIcon"
              size="medium"
              class="mr-4 cursor-pointer"
              :class="showingTable ? 'filter-yellow' : 'filter-gray'"
              type="table"
              ccu-event="user_ui-view-table"
              @click="toggleView('showingTable')"
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
              data-testid="testWorksiteSearch"
              icon="search"
              display-property="name"
              :placeholder="$t('actions.search')"
              size="medium"
              skip-validation
              class="mx-2 w-full"
              @selectedExisting="onSelectExistingWorksite"
              @input="
                (value) => {
                  search = value;
                  worksiteQuery = { ...worksiteQuery, search: value };
                }
              "
            />
          </div>
          <template v-if="incidentsWithActivePhones.length > 0">
            <div
              v-for="incident in incidentsWithActivePhones"
              :key="incident.id"
              :data-testid="`testIncidentWithActiveAni${incident.id}Div`"
              class="ml-2"
            >
              {{ incident.short_name }}:
              {{ getIncidentPhoneNumbers(incident) }}
            </div>
          </template>
          <div v-else class="flex-grow bg-red-500">
            {{ $t('homeVue.phone_or_website') }}
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
            <SimpleMap :key="showingMap" :map-loading="mapLoading" />
            <div
              ref="phoneButtons"
              class="phone-system__actions"
              data-testid="testPhoneButtonsDiv"
            >
              <PhoneComponentButton
                name="caller"
                data-testid="testPhoneComponentCallerButton"
                :alt="$t('phoneDashboard.availability_indicator')"
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
                  <div
                    v-if="potentialFailedCall"
                    data-testid="testPotentialFailedCallDiv"
                    class="bg-red-500 mt-6 text-white p-1.5"
                  >
                    {{ $t('phoneDashboard.ended_early') }}
                    <base-button
                      :action="retryFailedCall"
                      data-testid="testRetryFailedCallButton"
                      variant="solid"
                      class="px-2 text-black mt-1"
                      :text="$t('phoneDashboard.try_again')"
                      :alt="$t('phoneDashboard.try_again')"
                    />
                  </div>
                  <tabs ref="tabs" :details="false" @mounted="setTabs">
                    <tab ref="callTab" :name="$t('phoneDashboard.active_call')">
                      <ActiveCall
                        :case-id="worksiteId"
                        data-testid="testActiveCallDiv"
                        @setCase="selectCase"
                      />
                    </tab>
                    <tab
                      ref="statusTab"
                      :name="$t('phoneDashboard.call_status')"
                    >
                      <UpdateStatus
                        class="p-2"
                        data-testid="testUpdateStatusCompleteCallDiv"
                        @onCompleteCall="completeCall"
                      />
                    </tab>
                  </tabs>
                </template>
              </PhoneComponentButton>
              <PhoneComponentButton
                name="dialer"
                data-testid="testPhoneComponentDialerButton"
                class="phone-system__action"
                component-class="phone-system__action-content phone-system__action-content--dialer"
                :alt="$t('phoneDashboard.manual_dialer')"
                icon="dialer"
                icon-size="small"
                icon-class="bg-black p-1"
              >
                <template #component>
                  <ManualDialer
                    class="p-2"
                    data-testid="testManualDialerDiv"
                    style="z-index: 1002"
                    :dialing="dialing"
                    @onDial="dialManualOutbound"
                  ></ManualDialer>
                </template>
              </PhoneComponentButton>
              <PhoneComponentButton
                name="chat"
                data-testid="testPhoneComponentChatButton"
                :alt="$t('chat.chat')"
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
                      data-testid="testUnreadUrgentChatCountDiv"
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
                    :chat="selectedChat"
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
                data-testid="testPhoneComponentNewsButton"
                :alt="$t('phoneDashboard.news')"
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
                    <ccu-icon type="news" class="p-1 ml-1.5" size="large" />
                  </div>
                </template>
                <template #component>
                  <PhoneNews @unreadCount="unreadNewsCount = $event" />
                </template>
              </PhoneComponentButton>
              <PhoneComponentButton
                v-if="callHistory"
                data-testid="testPhoneComponentHistoryButton"
                :alt="$t('phoneDashboard.call_history')"
                name="history"
                class="phone-system__action"
                component-class="phone-system__action-content phone-system__action-content--history"
                icon="phone-history"
                icon-size="large"
                icon-class="p-1"
              >
                <template #component>
                  <CallHistory
                    :calls="callHistory"
                    data-testid="testCallHistoryDiv"
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
                data-testid="testPhoneComponentStatsButton"
                :alt="$t('phoneDashboard.stats')"
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
                data-testid="testPhoneComponentLeaderboardButton"
                :alt="$t('phoneDashboard.leaderboard')"
                class="phone-system__action"
                component-class="phone-system__action-content phone-system__action-content--leaderboard"
                icon="leaderboard"
                icon-size="medium"
                icon-class="p-1"
              >
                <template #button>
                  <div class="w-full h-full flex items-center justify-center">
                    <ccu-icon
                      :fa="true"
                      type="users"
                      class="p-1"
                      size="medium"
                      :alt="$t('phoneDashboard.leaderboard')"
                    />
                  </div>
                </template>
                <template #component>
                  <Leaderboard class="h-full" />
                </template>
              </PhoneComponentButton>
              <PhoneComponentButton
                name="reset"
                data-testid="testPhoneComponentResetButton"
                :alt="$t('phoneDashboard.reset_phone_system')"
                class="phone-system__action"
                component-class="phone-system__action-content phone-system__action-content--reset"
              >
                <template #button>
                  <div class="w-full h-full flex items-center justify-center">
                    <ccu-icon :fa="true" type="bug" class="p-1" size="medium" />
                  </div>
                </template>
                <template #component>
                  <div class="flex items-center justify-center p-3 gap-2">
                    <base-button
                      size="medium"
                      data-testid="testResetPhoneSystemButton"
                      :text="$t('phoneDashboard.reset_phone_system')"
                      :alt="$t('phoneDashboard.reset_phone_system')"
                      :action="resetPhoneSystem"
                      class="text-white bg-crisiscleanup-red-200"
                    ></base-button>
                    <base-button
                      size="medium"
                      data-testid="testReportBugButton"
                      :text="$t('phoneDashboard.report_bug')"
                      :alt="$t('phoneDashboard.report_bug')"
                      :action="reportBug"
                      class="text-white bg-crisiscleanup-red-200"
                    ></base-button>
                  </div>
                </template>
              </PhoneComponentButton>
            </div>
          </div>
          <div v-show="showingTable" class="phone-system__main-content--table">
            <div class="justify-end items-center hidden md:flex">
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
            </div>
            <WorksiteTable
              :worksite-query="worksiteQuery"
              @selectionChanged="onSelectionChanged"
              @rowClick="
                (worksite) => {
                  worksiteId = worksite.id;
                  isEditing = true;
                }
              "
            />
          </div>
        </div>
      </div>
      <div class="phone-system__form h-full min-h-0">
        <CaseHeader
          v-if="worksite"
          data-testid="testCaseHeaderDiv"
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
              data-testid="testNewCaseIcon"
              type="active"
              size="small"
              :action="() => selectCase(null)"
            />
            <span class="px-1 mt-0.5">{{ $t('casesVue.new_case') }}</span>
          </div>
          <base-button
            v-if="$mq === 'sm'"
            data-testid="testShowMapIcon"
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
            :alt="$t('casesVue.show_map')"
          />
        </div>
        <div v-if="showingDetails" class="phone-system__form-toggler">
          <base-button
            icon="arrow-left"
            data-testid="testShowHistoryButton"
            :icon-size="medium"
            :alt="$t('actions.history')"
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
            data-testid="testHistoryDiv"
            :incident-id="currentIncidentId"
            :worksite-id="worksiteId"
          ></CaseHistory>
          <WorksiteForm
            v-else
            ref="worksiteForm"
            :key="worksiteId"
            data-testid="testWorksiteFormDiv"
            :incident-id="String(currentIncidentId)"
            :worksite-id="worksiteId"
            disable-claim-and-save
            :data-prefill="prefillData"
            :is-editing="isEditing"
            class="border shadow"
            @jumpToCase="jumpToCase"
            @savedWorksite="
              (worksite) => {
                onSaveCase(worksite);
              }
            "
            @closeWorksite="clearCase"
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
</template>

<script lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { useStore } from 'vuex';
import axios from 'axios';
import { useRouter } from 'vue-router';
import moment from 'moment';
import { useMq } from 'vue3-mq';
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
import useWorksiteMap from '../../hooks/worksite/useWorksiteMap';
import PhoneToolBar from '../../components/phone/PhoneToolBar.vue';
import PhoneNews from '../../components/phone/PhoneNews.vue';
import useDialogs from '../../hooks/useDialogs';
import useConnectFirst from '../../hooks/useConnectFirst';
import useCurrentUser from '../../hooks/useCurrentUser';
import User from '../../models/User';
import WorksiteForm from '../../components/work/WorksiteForm.vue';
import { loadCasesCached } from '@/utils/worksite';
import { getErrorMessage } from '@/utils/errors';
import usePhoneService from '@/hooks/phone/usePhoneService';
import WorksiteTable from '@/components/work/WorksiteTable.vue';
import useWorksiteTableActions from '@/hooks/worksite/useWorksiteTableActions';
import AdminEventStream from '@/components/admin/AdminEventStream.vue';
import BugReport from '@/components/BugReport.vue';

export default defineComponent({
  name: 'PhoneSystem',
  components: {
    WorksiteTable,
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
    const { confirm, component } = useDialogs();
    const { emitter } = useEmitter();
    const router = useRouter();
    const store = useStore();
    const { currentUser } = useCurrentUser();
    const phoneService = reactive(usePhoneService());
    const mq = useMq();

    const imageUrl = ref('');
    const numberClicks = ref(0);
    const scale = ref(1);
    const worksiteId = ref(null);
    const isEditing = ref(false);
    const isNew = ref(false);
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
    const callTab = ref(null);
    const selectedTableItems = ref(new Set());
    const connectFirst = useConnectFirst(context);
    const showingSearchModal = ref(false);
    const mobileSearch = ref('');

    const { showUnclaimModal } = useWorksiteTableActions(
      selectedTableItems,
      () => {},
    );

    const {
      isOnCall,
      caller,
      stats,
      currentIncidentId,
      call,
      clearCall,
      potentialFailedCall,
      setPotentialFailedCall,
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
    const worksiteQuery = ref({
      incident: currentIncidentId.value,
    });
    const worksite = computed(function () {
      if (worksiteId.value) {
        return Worksite.find(worksiteId.value);
      }

      return null;
    });
    const incidentsWithActivePhones = computed(() =>
      Incident.query().where('active_phone_number', Boolean).get(),
    );

    function onSelectionChanged(selectedItems) {
      selectedTableItems.value = selectedItems;
    }

    function reloadTable() {
      worksiteQuery.value = { ...worksiteQuery.value };
    }

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
        setPotentialFailedCall(null);
        await loadAgent();
        emitter.emit('phone_component:close');
        emitter.emit('phone:clear_call');
        switchToCallTab();
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
      if (view === 'showingMap') {
        showingMap.value = true;
        nextTick(() => {
          init();
        });
      }

      if (view === 'showingTable') {
        showingTable.value = true;
      }
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

    async function reloadMap() {
      getWorksites().then((markers) => {
        mapUtils.value.reloadMap(
          markers,
          markers.map((m) => m.id),
        );
      });
    }

    async function onSaveCase(worksite) {
      worksiteId.value = worksite.id;
      isEditing.value = true;
      switchToStatusTab();
      if (showingTable.value) {
        reloadTable();
      }

      if (showingMap.value) {
        getWorksites().then((markers) => {
          mapUtils.value.reloadMap(
            markers,
            markers.map((m) => m.id),
          );
        });
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

    const switchToStatusTab = () => {
      tabs.value.selectTab(statusTab.value.index);
    };

    const switchToCallTab = () => {
      tabs.value.selectTab(callTab.value.index);
    };

    async function retryFailedCall() {
      if (potentialFailedCall.value) {
        const { phone_number } = potentialFailedCall.value;
        if (call.value) {
          await completeCall({ status: 23, notes: '' });
        }

        await phoneService.changeState('WORKING');
        await dialManualOutbound(phone_number);
      }
    }

    async function reportBug() {
      await component({
        id: 'phone_bug_modal',
        title: t(`phoneDashboard.report_bug`),
        component: BugReport,
        classes: 'w-full h-96 overflow-auto',
        modalClasses: 'bg-white max-w-3xl shadow p-3',
        hideFooter: true,
        props: {
          // eslint-disable-next-line vue/require-prop-type-constructor, vue/require-default-prop
          reportType: 'phone',
        },
      });
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
        true,
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
      () => isOnCall.value,
      (newValue, oldValue) => {
        if (oldValue && !newValue) {
          switchToStatusTab();
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
      switchToStatusTab,
      imageUrl,
      numClicks: numberClicks,
      scale,
      worksiteId,
      isEditing,
      isNew,
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
      worksiteQuery,
      worksite,
      incidentsWithActivePhones,
      worksiteForm,
      statusTab,
      callTab,
      ...connectFirst,
      init,
      getIncidentPhoneNumbers,
      completeCall,
      potentialFailedCall,
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
      retryFailedCall,
      onSelectionChanged,
      selectedTableItems,
      showUnclaimModal,
      reloadTable,
      onSaveCase,
      reportBug,
      reloadMap,
      mq,
      showingSearchModal,
      mobileSearch,
    };
  },
});
</script>

<style lang="postcss">
.phone-system {
  &__action {
    &-content {
      @apply right-20 sm:right-12 h-auto;
      width: 35vw;

      &--caller {
        width: 50vw;
        height: max-content;
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

    &__actions {
      @apply mt-40;
    }

    &__action {
      @apply shadow
      w-12
      h-12
      my-1
      bg-white
      cursor-pointer
      z-50;
    }

    &__main {
      @apply h-1/2;
    }

    &__form {
      @apply h-1/2;
    }
  }
}
</style>
