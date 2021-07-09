<template>
  <div
    class="flex h-full overflow-hidden cases-container-grid"
    :class="{
      'cases-container-grid--full': $mq === 'sm',
    }"
  >
    <div v-if="isCasesOnly || $mq !== 'sm'">
      <div class="cases-grid">
        <div class="p-3 border border-gray-300 card-header bg-white">
          <div class="flex items-center flex-wrap justify-between">
            <div class="flex items-center">
              <div class="flex" style="min-width: 80px">
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
                  :placeholder="$t('actions.search')"
                  size="medium"
                  class="mx-2"
                  @selectedExisting="handleChange"
                  @search="onSearch"
                  @clear="onSearch"
                />
              </div>
              <svi-slider
                v-if="showSviSlider"
                @input="filterSvi"
                :value="sviLevel"
                :title="sviTitle"
              ></svi-slider>
            </div>
            <div class="flex worksite-actions" style="color: #4c4c4d">
              <base-dropdown class-name="borderless">
                <base-button
                  slot="btn"
                  variant="text"
                  class="text-base font-thin mx-2"
                  :text="$t('casesVue.layers')"
                  :alt="$t('casesVue.layers')"
                  ccu-icon="layers"
                  icon-size="medium"
                />
                <template slot="body">
                  <ul class="text-base">
                    {{
                      $t('casesVue.standard_layers')
                    }}
                    <li class="py-2">
                      <base-dropdown
                        :trigger="'hover'"
                        :role="'sublist'"
                        :align="'right'"
                      >
                        <template slot="btn">{{
                          $t('locationTypes.boundary_political_us_state')
                        }}</template>
                        <template slot="body">
                          <ul class="h-64 overflow-auto">
                            <li v-for="state in usStates" :key="`${state.id}`">
                              <base-checkbox
                                :value="appliedLocations.has(state.id)"
                                :ccu-event="
                                  appliedLocations.has(state.id)
                                    ? 'user_ui-turn-off_layer'
                                    : 'user_ui-turn-on_layer'
                                "
                                @input="
                                  (value) => {
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
                          $t('locationTypes.boundary_political_us_congress')
                        }}</template>
                        <template slot="body">
                          <ul class="h-64 overflow-auto">
                            <li
                              v-for="district in districts"
                              :key="district.id"
                            >
                              <base-checkbox
                                :value="appliedLocations.has(district.id)"
                                :ccu-event="
                                  appliedLocations.has(district.id)
                                    ? 'user_ui-turn-off_layer'
                                    : 'user_ui-turn-on_layer'
                                "
                                @input="
                                  (value) => {
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
                          $t('locationTypes.boundary_political_us_county')
                        }}</template>
                        <template slot="body">
                          <ul class="h-64 overflow-auto">
                            <li
                              v-for="county in counties"
                              :key="`${county.id}`"
                            >
                              <base-checkbox
                                :value="appliedLocations.has(county.id)"
                                @input="
                                  (value) => {
                                    applyLocation(county.id, value);
                                  }
                                "
                                :ccu-event="
                                  appliedLocations.has(county.id)
                                    ? 'user_ui-turn-off_layer'
                                    : 'user_ui-turn-on_layer'
                                "
                                >{{ county.name }}</base-checkbox
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
                          $t('casesVue.teams')
                        }}</template>
                        <template slot="body">
                          <ul class="h-64 overflow-auto">
                            <li v-for="team in teams" :key="`${team.id}`">
                              <base-checkbox
                                :value="appliedLocations.has(team.id)"
                                :ccu-event="
                                  appliedLocations.has(team.id)
                                    ? 'user_ui-turn-off_layer'
                                    : 'user_ui-turn-on_layer'
                                "
                                @input="
                                  (value) => {
                                    applyTeamGeoJson(team, value);
                                  }
                                "
                                >{{ team.name }}</base-checkbox
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
                                  (value) => {
                                    applyLocation(location.id, value);
                                  }
                                "
                                :ccu-event="
                                  appliedLocations.has(location.id)
                                    ? 'user_ui-turn-off_layer'
                                    : 'user_ui-turn-on_layer'
                                "
                                >{{ location.name }}</base-checkbox
                              >
                            </li>
                            <li
                              v-if="
                                currentOrganization &&
                                currentOrganization.primary_location
                              "
                            >
                              <base-checkbox
                                :value="
                                  appliedLocations.has(
                                    currentOrganization.primary_location,
                                  )
                                "
                                :ccu-event="
                                  appliedLocations.has(
                                    currentOrganization.primary_location,
                                  )
                                    ? 'user_ui-turn-off_layer'
                                    : 'user_ui-turn-on_layer'
                                "
                                @input="
                                  (value) => {
                                    applyLocation(
                                      currentOrganization.primary_location,
                                      value,
                                    );
                                  }
                                "
                                >{{
                                  $t('casesVue.primary_response_area')
                                }}</base-checkbox
                              >
                            </li>
                            <li
                              v-if="
                                currentOrganization &&
                                currentOrganization.secondary_location
                              "
                            >
                              <base-checkbox
                                :value="
                                  appliedLocations.has(
                                    currentOrganization.secondary_location,
                                  )
                                "
                                :ccu-event="
                                  appliedLocations.has(
                                    currentOrganization.secondary_location,
                                  )
                                    ? 'user_ui-turn-off_layer'
                                    : 'user_ui-turn-on_layer'
                                "
                                @input="
                                  (value) => {
                                    applyLocation(
                                      currentOrganization.secondary_location,
                                      value,
                                    );
                                  }
                                "
                                >{{
                                  $t('casesVue.secondary_response_area')
                                }}</base-checkbox
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
                          $t('casesVue.my_layers')
                        }}</template>
                        <template slot="body">
                          <ul class="h-64 overflow-auto">
                            <li
                              v-for="location in organizationLocations"
                              :key="`${location.id}`"
                            >
                              <base-checkbox
                                :value="appliedLocations.has(location.id)"
                                :ccu-event="
                                  appliedLocations.has(location.id)
                                    ? 'user_ui-turn-off_layer'
                                    : 'user_ui-turn-on_layer'
                                "
                                @input="
                                  (value) => {
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
                class="text-base font-thin mx-2"
                ccu-icon="filters"
                icon-size="medium"
                :alt="$t('casesVue.filters')"
                :action="
                  () => {
                    showingFilters = true;
                  }
                "
              >
                {{ $t('casesVue.filters') }}
                <span
                  v-if="filtersCount > 0"
                  class="rounded-full mx-2 px-1 bg-yellow-500 text-xs"
                  >{{ filtersCount }}</span
                >
              </base-button>
              <base-button
                class="text-base font-thin mx-2"
                ccu-icon="download"
                icon-size="medium"
                :alt="$t('actions.download')"
                :text="$t('actions.download')"
                :action="downloadCsv"
              />
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
                        class="text-base font-thin mx-2"
                        :text="$t('actions.download')"
                        :alt="$t('actions.download')"
                        :action="downloadCsv"
                        data-cy="worksiteview_actionBatchDownload"
                      />
                    </li>
                    <li class="py-1">
                      <base-button
                        class="text-base font-thin mx-2"
                        :text="$t('actions.print')"
                        :alt="$t('actions.print')"
                        :action="
                          (e) => {
                            printWorksite(e, selectedTableItems);
                          }
                        "
                        data-cy="worksiteview_actionBatchPrint"
                      />
                    </li>
                    <li class="py-1">
                      <base-button
                        class="text-base font-thin mx-2"
                        :text="$t('actions.share')"
                        :alt="$t('actions.share')"
                      />
                    </li>
                  </ul>
                </template>
              </base-dropdown>
              <WorksiteFilters
                ref="worksiteFilter"
                :show="showingFilters"
                :current-filters="filters"
                :incident="currentIncident"
                :locations="organizationLocations"
                @closedFilters="showingFilters = false"
                @updatedFilters="onUpdatedFilters"
              />
            </div>
          </div>
        </div>
        <div class="flex-grow bg-crisiscleanup-light-grey">
          <template v-if="showingMap">
            <WorksiteMap
              :key="JSON.stringify(currentQuery)"
              ref="worksiteMap"
              class="w-full h-full"
              :query="currentQuery"
              :new-marker="newMarker"
              :current-filters="filters"
              @mapMoved="onMapMoved"
              @onSelectmarker="displayWorksite"
              @onSviList="setSviList"
            />
          </template>
          <template v-if="showingTable">
            <div class="p-3">
              <div class="table-operations flex justify-end items-center">
                <div class="flex">
                  <base-button
                    class="ml-3 my-3 border p-1 px-4 bg-white"
                    :class="
                      selectedTableItems.size === 0
                        ? 'text-crisiscleanup-grey-700'
                        : ''
                    "
                    :disabled="selectedTableItems.size === 0"
                    :action="
                      () => {
                        showingUnclaimModal = true;
                      }
                    "
                    :text="$t('actions.unclaim')"
                    :alt="$t('actions.unclaim')"
                  >
                  </base-button>
                  <base-button
                    icon="sync"
                    class="ml-3 my-3 border p-1 px-4 bg-white"
                    :class="
                      selectedTableItems.size === 0
                        ? 'text-crisiscleanup-grey-700'
                        : ''
                    "
                    :disabled="selectedTableItems.size === 0"
                    :text="$t('actions.update_status')"
                    :alt="$t('actions.update_status')"
                    :action="
                      () => {
                        showingUpdateStatusModal = true;
                      }
                    "
                  />

                  <modal
                    v-if="showingUpdateStatusModal"
                    modal-classes="bg-white max-w-lg shadow"
                  >
                    <div slot="header" class="text-lg border-b p-3">
                      {{ $t('actions.update_status') }}
                    </div>
                    <div class="p-3 flex flex-col">
                      <StatusDropdown
                        class="block"
                        :phase="currentIncident.phase"
                        @input="
                          (value) => {
                            statusForUpdate = value;
                          }
                        "
                      />
                    </div>
                    <div
                      slot="footer"
                      class="
                        flex
                        items-center
                        justify-center
                        p-2
                        bg-white
                        border-t
                      "
                    >
                      <base-button
                        variant="solid"
                        class="
                          border
                          text-base
                          p-2
                          px-4
                          mx-2
                          text-black
                          border-primary-light
                        "
                        :action="updateStatusSelected"
                        :text="$t('actions.ok')"
                        :alt="$t('actions.ok')"
                      />
                      <base-button
                        type="bare"
                        class="
                          border border-black
                          mx-2
                          text-base
                          p-2
                          px-4
                          text-black
                        "
                        :action="
                          () => {
                            showingUpdateStatusModal = false;
                          }
                        "
                        :text="$t('actions.cancel')"
                        :alt="$t('actions.cancel')"
                      />
                    </div>
                  </modal>
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
                            length: selectedTableItems.size,
                          })
                        }}
                      </span>
                      <base-checkbox
                        class="mb-5"
                        :value="unchangedStatusOnUnclaim"
                        @input="
                          () => {
                            unchangedStatusOnUnclaim =
                              !unchangedStatusOnUnclaim;
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
                      class="
                        flex
                        items-center
                        justify-center
                        p-2
                        bg-white
                        border-t
                      "
                    >
                      <base-button
                        variant="solid"
                        class="
                          border
                          text-base
                          p-2
                          px-4
                          mx-2
                          text-black
                          border-primary-light
                        "
                        :action="unclaimSelected"
                        :text="$t('actions.ok')"
                        :alt="$t('actions.ok')"
                      />
                      <base-button
                        type="bare"
                        class="
                          border border-black
                          mx-2
                          text-base
                          p-2
                          px-4
                          text-black
                        "
                        :action="
                          () => {
                            showingUnclaimModal = false;
                          }
                        "
                        :text="$t('actions.cancel')"
                        :alt="$t('actions.cancel')"
                      />
                    </div>
                  </modal>
                </div>
              </div>
              <WorksiteTable
                :columns="columns"
                :worksites="data"
                @displayWorksite="displayWorksite"
                @handleTableChange="handleTableChange"
                :pagination="pagination"
                :sorter="sorter"
                @selectionChanged="
                  (selectedItems) => {
                    selectedTableItems = selectedItems;
                  }
                "
                :table-loading="tableLoading"
              />
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
      class="flex flex-col h-full shadow-2xl md:max-w-lg lg:max-w-lg"
      data-cy="worksiteview"
    >
      <div
        style="background-color: white"
        class="
          border border-r-0 border-l-0 border-gray-300
          card-header
          flex
          items-center
        "
      >
        <div
          class="
            w-1/2
            h-full
            p-3
            flex
            items-center
            justify-center
            cursor-pointer
          "
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
              : `View ${currentWorksite && currentWorksite.case_number}`
          }}
          <ccu-icon
            :alt="$t('actions.cancel')"
            size="xs"
            type="cancel"
            class="ml-2"
            @click.native="
              $router.push(`/incident/${currentIncidentId}/cases/new`)
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
        class="
          text-crisiscleanup-grey-700 text-lg
          flex
          p-2
          bg-white
          justify-between
          items-start
          border-b
        "
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
              >{{ currentWorksite && currentWorksite.case_number }}
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
              >{{ currentWorksite && currentWorksite.case_number }}
              {{ $t('actions.flag') }}</span
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
            @click.native="clearWorksite"
          />
        </template>
        <template v-else>
          <div>
            <div class="text-left text-black flex items-center">
              <div class="mt-1 mr-1">
                {{ currentWorksite && currentWorksite.case_number }}
              </div>
              <base-button class="mr-1">
                <div
                  v-if="currentWorksite && currentWorksite.isFavorite"
                  class="svg-container cursor-pointer"
                  v-html="favoriteSvgActive"
                  :title="$t('actions.not_member_of_my_org')"
                  @click="() => toggleFavorite(false)"
                ></div>
                <div
                  v-else
                  class="svg-container cursor-pointer"
                  v-html="favoriteSvgInactive"
                  :title="$t('actions.member_of_my_org')"
                  @click="() => toggleFavorite(true)"
                ></div>
              </base-button>
              <base-button class="mr-1">
                <div
                  v-if="currentWorksite && currentWorksite.isHighPriority"
                  class="svg-container cursor-pointer"
                  v-html="highPrioritySvgActive"
                  :title="$t('actions.unmark_high_priority')"
                  @click="() => toggleHighPriority(false)"
                ></div>
                <div
                  v-else
                  class="svg-container cursor-pointer"
                  v-html="highPrioritySvgInactive"
                  :title="$t('actions.mark_high_priority')"
                  @click="() => toggleHighPriority(true)"
                ></div>
              </base-button>
            </div>
            <div
              v-if="!isNewWorksite && currentWorksite"
              class="text-xs text-crisiscleanup-grey-700"
            >
              {{ $t('casesVue.updated') }}
              {{ currentWorksite.updated_at | moment('from', 'now') }}
            </div>
          </div>
          <div v-if="!isNewWorksite" class="flex items-center">
            <ccu-icon
              :alt="$t('actions.flag')"
              size="small"
              class="p-1 py-2"
              type="flag"
              @click.native="
                () => {
                  $router.push(
                    `/incident/${currentIncidentId}/cases/${$route.params.id}/flag`,
                  );
                }
              "
            />
            <ccu-icon
              :alt="$t('actions.jump_to_case')"
              size="small"
              class="p-1 py-2"
              type="go-case"
              @click.native="jumpToCase"
            />
            <ccu-icon
              :alt="$t('actions.history')"
              size="small"
              class="p-1 py-2"
              type="history"
              @click.native="
                () => {
                  $router.push(
                    `/incident/${currentIncidentId}/cases/${$route.params.id}/history`,
                  );
                }
              "
            />
            <ccu-icon
              :alt="$t('actions.download')"
              size="small"
              class="p-1 py-2"
              type="download"
              @click.native="downloadWorksite"
              data-cy="cases.icons.download"
            />
            <ccu-icon
              :alt="$t('actions.share')"
              size="small"
              class="p-1 py-2"
              type="share"
              data-cy="cases.icons.share"
            />
            <ccu-icon
              :alt="$t('actions.print')"
              size="small"
              class="p-1 py-2"
              type="print"
              @click.native="
                () => {
                  if (workTypesClaimedByOrganization.length > 0) {
                    printWorksite();
                  } else {
                    showingPrintWorksiteModal = true;
                  }
                }
              "
              data-cy="cases.icons.print"
            />
            <router-link
              v-if="isViewingWorksite"
              :to="`/incident/${currentIncidentId}/cases/${$route.params.id}/edit`"
            >
              <ccu-icon
                :alt="$t('actions.edit')"
                class="border p-2 bg-primary-light"
                size="small"
                type="edit"
                :linked="true"
              />
            </router-link>
          </div>
        </template>
      </div>
      <router-view
        v-if="!spinning"
        :key="$route.params.id"
        :incident-id="`${currentIncidentId}`"
        :worksite-id="$route.params.id"
        :incident="currentIncident"
        :is-editing="isEditingWorksite"
        @closeWorksite="closeWorksite"
        @clearWorksite="clearWorksite"
        @geocoded="addMarkerToMap"
        @clearMarkers="removeMarkerFromMap"
        @savedWorksite="savedWorksite"
        @switchIncident="switchIncident"
        @navigateToWorksite="
          (id) => {
            $router.push(
              `/incident/${currentIncidentId}/cases/${id}/edit?showOnMap=true`,
            );
          }
        "
        @reloadTable="reloadTable"
        @changed="loadWorksite"
        @reloadMap="reloadMap"
        @jumpToCase="jumpToCase"
      />
      <div v-else class="h-full w-full items-center justify-center">
        <div class="flex flex-col items-center">
          <spinner />
        </div>
      </div>
    </div>

    <modal
      v-if="showingPrintWorksiteModal"
      modal-classes="bg-white max-w-lg shadow"
    >
      <div slot="header" class="text-lg border-b p-3">
        {{ $t('actions.print_case') }}
      </div>
      <div class="p-3 flex flex-col">
        <span class="text-base pb-3">
          {{ $t('casesVue.please_claim_if_print') }}
        </span>
        <textarea
          v-model="noClaimReason"
          rows="4"
          class="
            text-base
            form-field
            border border-crisiscleanup-dark-100
            placeholder-crisiscleanup-dark-200
            outline-none
            resize-none
          "
        />
      </div>
      <div
        slot="footer"
        class="flex items-center justify-center p-2 bg-white border-t"
      >
        <base-button
          type="bare"
          class="border border-black mx-2 text-base p-2 px-4 text-black"
          :action="
            () => {
              showingPrintWorksiteModal = false;
            }
          "
          :text="$t('actions.cancel')"
          :alt="$t('actions.cancel')"
        />
        <base-button
          variant="solid"
          class="border text-base p-2 px-4 mx-2 text-black border-primary-light"
          :action="
            () => {
              if (!noClaimReason) {
                return $toasted.error(
                  $t('casesVue.please_explain_why_no_claim'),
                );
              }
              printWorksite(null, currentWorksite.id, noClaimReason);
              showingPrintWorksiteModal = false;
              noClaimReason = null;
            }
          "
          :text="$t('actions.print_without_claiming')"
          :alt="$t('actions.print_without_claiming')"
        />
        <base-button
          variant="solid"
          class="border text-base p-2 px-4 mx-2 text-black border-primary-light"
          :action="
            () => {
              printWorksite();
              showingPrintWorksiteModal = false;
              noClaimReason = null;
            }
          "
          :text="$t('actions.claim_and_print')"
          :alt="$t('actions.claim_and_print')"
        />
      </div>
    </modal>
  </div>
</template>

<script>
import { gmapApi } from 'vue2-google-maps';
import { mapState } from 'vuex';
import { debounce } from 'lodash';
import * as L from 'leaflet';
import Worksite from '@/models/Worksite';
import User from '@/models/User';
import Incident from '@/models/Incident';
import Organization from '@/models/Organization';
import Location from '@/models/Location';
import LocationType from '@/models/LocationType';
import WorksiteMap from '@/components/WorksiteMap';
import WorksiteFilters from '@/components/WorksiteFilters';
import { getQueryString } from '@/utils/urls';
import { getColorForStatus } from '@/filters';
import { forceFileDownload } from '@/utils/downloads';
import { getErrorMessage } from '@/utils/errors';
import Team from '@/models/Team';
import { templates } from '@/icons/icons_templates';
import SviSlider from '@/components/SviSlider';
import { EventBus } from '@/event-bus';
import { hash } from '@/utils/promise';
import WorksiteTable from './WorksiteTable';
import WorksiteSearchInput from '../components/WorksiteSearchInput';
import StatusDropdown from '../components/StatusDropdown';

export default {
  name: 'Cases',
  components: {
    SviSlider,
    StatusDropdown,
    WorksiteSearchInput,
    WorksiteTable,
    WorksiteMap,
    WorksiteFilters,
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
      sviList: [],
      showSviSlider: false,
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
      filters: {},
      appliedFilters: {},
      newMarker: null,
      map: null,
      currentSearch: '',
      sviLevel: 100,
      sviTitle: '',
      currentCaseView: '',
      getColorForStatus,
      appliedLocations: new Set(),
      showingUnclaimModal: false,
      showingPrintWorksiteModal: false,
      unchangedStatusOnUnclaim: true,
      updateStatusOnUnclaim: false,
      isMounted: false,
      showingUpdateStatusModal: false,
      statusForUpdate: null,
      noClaimReason: null,
      organizationLocations: [],
    };
  },
  computed: {
    ...mapState('incident', ['currentIncidentId']),
    highPrioritySvgInactive() {
      const template = templates.important;
      return template
        .replace('{{fillColor}}', 'grey')
        .replace('{{strokeColor}}', 'white')
        .replace('{{multiple}}', '');
    },
    highPrioritySvgActive() {
      const template = templates.important;
      const svg = template
        .replace('{{fillColor}}', 'red')
        .replace('{{strokeColor}}', 'white')
        .replace('{{multiple}}', '');
      return svg;
    },
    favoriteSvgInactive() {
      const template = templates.favorite;
      return template
        .replace('{{fillColor}}', 'grey')
        .replace('{{strokeColor}}', 'white')
        .replace('{{multiple}}', '');
    },
    favoriteSvgActive() {
      const template = templates.favorite;
      const svg = template
        .replace('{{fillColor}}', 'red')
        .replace('{{strokeColor}}', 'white')
        .replace('{{multiple}}', '');
      return svg;
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
    workTypesClaimedByOrganization() {
      if (this.currentWorksite) {
        return this.currentWorksite.work_types.filter(
          (type) => type.claimed_by === this.currentUser.organization.id,
        );
      }
      return [];
    },
    usStates() {
      const locationTypes = LocationType.query()
        .where('key', 'boundary_political_us_state')
        .get();
      if (locationTypes.length) {
        return Location.query()
          .where('type', locationTypes[0].id)
          .orderBy('name', 'asc')
          .get();
      }
      return [];
    },
    districts() {
      const locationTypes = LocationType.query()
        .where('key', 'boundary_political_us_congress')
        .get();
      if (locationTypes.length) {
        return Location.query()
          .where('type', locationTypes[0].id)
          .orderBy('name', 'asc')
          .get();
      }
      return [];
    },
    counties() {
      const locationTypes = LocationType.query()
        .where('key', 'boundary_political_us_county')
        .get();
      if (locationTypes.length) {
        return Location.query()
          .where('type', locationTypes[0].id)
          .orderBy('name', 'asc')
          .get();
      }
      return [];
    },
    teams() {
      return Team.all();
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
    isCasesOnly() {
      return this.$route.meta.id === 'cases';
    },
    incidents() {
      return Incident.query().orderBy('id', 'desc').get();
    },
    currentIncident() {
      return Incident.find(this.currentIncidentId);
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    currentOrganization() {
      if (this.currentUser) {
        return Organization.find(this.currentUser.organization.id);
      }
      return null;
    },
    markers() {
      if (this.data) {
        return this.data.map((worksite) => {
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
      if (this.isMounted && this.$refs.worksiteFilter) {
        return Object.values(this.$refs.worksiteFilter.filters).reduce(
          (total, obj) => {
            return total + obj.count;
          },
          0,
        );
      }
      return 0;
    },
    google: gmapApi,
    ...mapState('loading', ['worksitesLoading']),
  },
  watch: {
    currentIncidentId(newState, oldState) {
      if (String(newState) !== String(oldState)) {
        this.fetch({
          pageSize: this.pagination.pageSize,
          page: 1,
        });
        this.getLocations();
      }
    },
  },
  created() {
    // setInterval(function () {
    //     this.$log.debug('polling');
    //     this.updateUserState();
    // }.bind(this), 100000);
  },
  async mounted() {
    const states = this.currentUser.getStatesForIncident(
      this.currentIncidentId,
      true,
    );
    if (states) {
      if (states.showingMap) {
        this.showingMap = true;
        this.showingTable = false;
      }
      if (states.appliedFilters) {
        this.appliedFilters = states.appliedFilters;
      }
      if (states.sviLevel) {
        this.sviLevel = states.sviLevel;
      }
      if (states.filters) {
        this.filters = {
          ...states.filters,
        };
      }
    }
    if (this.$route.query.showTable) {
      this.showingMap = false;
      this.showingTable = true;
      this.appliedFilters = {};
      this.filters = {};
    }
    if (this.currentIncidentId) {
      this.fetch({
        pageSize: this.pagination.pageSize,
        page: 1,
      });
    }
    await Promise.all([
      this.getLocations(),
      this.getOrganizationLocations(),
      LocationType.api().get('/location_types', {
        dataKey: 'results',
      }),
      Team.api().get('/teams', {
        dataKey: 'results',
      }),
    ]);
    this.isMounted = JSON.stringify(this.appliedFilters);
  },
  methods: {
    async getLocations() {
      const locationParams = {
        limit: 200,
        type__key__in:
          'boundary_political_us_congress,boundary_political_us_state,boundary_political_us_county',
        fields: 'id,name,type',
        incident_area: this.currentIncidentId,
      };
      const queryString = getQueryString(locationParams);
      await Location.api().get(`/locations?${queryString}`, {
        dataKey: 'results',
      });
    },
    async getOrganizationLocations() {
      const locationParams = {
        limit: 200,
        created_by__organization: this.currentUser.organization.id,
        fields: 'id,name,type',
      };
      const queryString = getQueryString(locationParams);
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/locations?${queryString}`,
      );
      this.organizationLocations = response.data.results;
    },
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
      User.api().updateUserState(
        {
          incident: this.currentIncidentId,
        },
        {
          appliedFilters: this.appliedFilters,
          filters: this.filters,
          showingMap: this.showingMap,
          showingTable: this.showingTable,
          sviLevel: this.sviLevel,
          ...data,
        },
      );
    },

    onUpdatedFilters(filters) {
      this.handleFilters(filters);
    },

    onMapMoved(bounds) {
      this.updateUserState({
        mapViewPort: bounds,
      });
    },

    async applyLocation(locationId, value) {
      if (value && this.$refs.worksiteMap.map) {
        await Location.api().fetchById(locationId);
        const location = Location.find(locationId);
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        const polygon = L.geoJSON(geojsonFeature, {
          weight: '1',
          onEachFeature(feature, layer) {
            layer.location_id = locationId;
          },
        });
        polygon.addTo(this.$refs.worksiteMap.map);
        this.$refs.worksiteMap.map.fitBounds(polygon.getBounds());
        this.appliedLocations = new Set(this.appliedLocations.add(locationId));
      } else {
        this.$refs.worksiteMap.map.eachLayer((layer) => {
          if (layer.location_id && layer.location_id === locationId) {
            this.$refs.worksiteMap.map.removeLayer(layer);
          }
        });
        this.appliedLocations = new Set(
          this.appliedLocations.delete(locationId),
        );
      }
    },
    async applyTeamGeoJson(team, value) {
      const feature = await Team.api().getCasesArea(
        team.id,
        this.currentIncidentId,
      );
      const locationId = team.id;

      if (value && this.$refs.worksiteMap.map) {
        const geojsonFeature = {
          type: 'Feature',
          properties: {},
          geometry: feature.response.data,
        };
        const polygon = L.geoJSON(geojsonFeature, {
          weight: '1',
          onEachFeature(_, layer) {
            layer.location_id = locationId;
          },
        });
        polygon.addTo(this.$refs.worksiteMap.map);
        this.$refs.worksiteMap.map.fitBounds(polygon.getBounds());
        this.appliedLocations = new Set(this.appliedLocations.add(locationId));
      } else {
        this.$refs.worksiteMap.map.eachLayer((layer) => {
          if (layer.location_id && layer.location_id === locationId) {
            this.$refs.worksiteMap.map.removeLayer(layer);
          }
        });
        this.appliedLocations = new Set(
          this.appliedLocations.delete(locationId),
        );
      }
    },
    async fetch(params = {}) {
      this.tableLoading = true;
      const query = {
        fields:
          'id,name,address,case_number,work_types,city,state,county,flags,location,incident,postal_code',
        incident: this.currentIncidentId,
        search: this.currentSearch,
      };

      if (this.sviLevel) {
        query.svi_level = this.sviLevel;
      }

      this.currentQuery = {
        ...query,
        ...this.appliedFilters,
        ...this.$route.query,
      };
      const queryParams = {
        ...query,
        offset: params.pageSize * (params.page - 1),
        limit: params.pageSize,
        ...this.appliedFilters,
        ...this.$route.query,
      };

      if (params.sortKey) {
        queryParams.sort = `${params.sortDirection === 'desc' ? '-' : ''}${
          params.sortKey
        }`;
      }
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites`,
        {
          params: { ...queryParams, incident: this.currentIncidentId },
        },
      );
      this.tableLoading = false;

      this.data = response.data.results.map((result) => {
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
        `${process.env.VUE_APP_API_BASE_URL}/worksites/count`,
        {
          params: {
            incident: this.currentIncidentId,
            limit: 2,
            fields: 'id',
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
      if (this.$refs.worksiteMap) {
        if (worksiteId) {
          this.$refs.worksiteMap.updateMap(worksiteId);
          this.$refs.worksiteMap.markerLayer.clearLayers();
        } else {
          this.$refs.worksiteMap.$forceUpdate();
        }
      }
    },

    async loadWorksite() {
      this.reloadTable();
    },

    async closeWorksite() {
      if (this.isNewWorksite) {
        await this.$router.push(`/incident/${this.currentIncidentId}/cases`);
      } else {
        await this.$router.push(
          `/incident/${this.currentIncidentId}/cases/new`,
        );
      }
    },

    async backToWorksite() {
      await this.$router.push(
        `/incident/${this.currentIncidentId}/cases/${this.$route.params.id}`,
      );
    },

    async displayWorksite(record) {
      await this.$router.push(
        `/incident/${this.currentIncidentId}/cases/${record.id}`,
      );
    },
    async createNewWorksite() {
      await this.$router.push(`/incident/${this.currentIncidentId}/cases/new`);
      this.toggleView('showingMap');
      this.spinning = false;
    },
    toggleView(view) {
      this.showingMap = false;
      this.showingTable = false;
      this[view] = true;
      this.updateUserState();
    },
    onSearch: debounce(
      async function (search) {
        this.currentSearch = search;
        this.searchingWorksites = true;
        if (!search) {
          this.searchWorksites = [];
        }
        const searchData = await hash({
          tableSearch: this.fetch({
            pageSize: this.pagination.pageSize,
            page: this.pagination.current,
          }),
          dropdownSearch: await Worksite.api().searchWorksites(
            search,
            this.currentIncidentId,
          ),
        });
        this.searchWorksites = search
          ? searchData.dropdownSearch.entities.worksites
          : [];
        this.searchingWorksites = false;
      },
      150,
      {
        leading: false,
        trailing: true,
      },
    ),

    async handleChange(value) {
      await this.$router.push(
        `/incident/${this.currentIncidentId}/cases/${value.id}?showOnMap=true`,
      );
      this.searchValue = '';
    },
    handleFilters(filters) {
      this.appliedFilters = {};
      this.filters = filters;
      Object.values(filters).forEach((filter) => {
        this.appliedFilters = {
          ...this.appliedFilters,
          ...filter.packFunction(),
        };
      });

      this.showingFilters = false;
      this.fetch({
        pageSize: this.pagination.pageSize,
        page: this.pagination.current,
      });
      this.updateUserState();
    },
    async printWorksite(e, siteId, noClaimReason) {
      this.spinning = true;
      const siteIds =
        typeof siteId === 'object'
          ? Array.from(siteId)
          : [this.currentWorksite.id];
      try {
        let file;
        if (siteIds.length === 1) {
          file = await Worksite.api().printWorksite(siteIds[0], noClaimReason);
        } else {
          file = await Worksite.api().downloadWorksite(
            siteIds,
            'application/pdf',
          );
        }
        forceFileDownload(file.response);
        this.reloadTable();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.spinning = false;
      }
    },
    async downloadWorksite(e, siteId) {
      this.spinning = true;
      const siteIds =
        typeof siteId === 'object'
          ? Array.from(siteId)
          : [this.currentWorksite.id];
      try {
        const file = await Worksite.api().downloadWorksite(siteIds);
        forceFileDownload(file.response);
        this.reloadTable();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.spinning = false;
      }
    },
    async downloadCsv() {
      this.spinning = true;
      try {
        const params = { ...this.currentQuery };
        delete params.fields;
        const response = await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/worksites_download/download_csv`,
          {
            params,
            headers: { Accept: 'text/csv' },
            responseType: 'blob',
          },
        );
        forceFileDownload(response);
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.spinning = false;
      }
    },
    // TODO: refactor, id param is unused
    // eslint-disable-next-line no-unused-vars
    async jumpToCase(id) {
      this.toggleView('showingMap');

      const waitForMap = () => {
        if (this.$refs.worksiteMap && !this.$refs.worksiteMap.mapLoading) {
          this.$refs.worksiteMap.map.setView(
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
            .openOn(this.$refs.worksiteMap.map);
          setTimeout(() => {
            this.$refs.worksiteMap.map.closePopup();
          }, 5000);
        } else {
          setTimeout(waitForMap, 50);
        }
      };
      waitForMap();
    },
    addMarkerToMap(location) {
      let markerLocation = location;
      if (!markerLocation) {
        markerLocation = this.$refs.worksiteMap.map.getCenter();
      }

      this.$refs.worksiteMap.markerLayer.clearLayers();
      const marker = new L.marker(markerLocation, { draggable: 'true' }).addTo(
        this.$refs.worksiteMap.markerLayer,
      );
      marker.on('dragend', function (event) {
        EventBus.$emit('updatedWorksiteLocation', event.target.getLatLng());
      });
      this.$refs.worksiteMap.map.setView(
        [markerLocation.lat, markerLocation.lng],
        15,
      );
      marker
        .bindTooltip(this.$t('casesVue.drag_pin_to_correct_location'), {
          direction: 'top',
        })
        .openTooltip();
      this.toggleView('showingMap');
    },
    removeMarkerFromMap() {
      this.$refs.worksiteMap.markerLayer.clearLayers();
    },

    async unclaimSelected() {
      this.spinning = true;
      const promises = [];
      this.selectedTableItems.forEach((worksiteId) => {
        promises.push(
          Worksite.api().unclaimWorksite(
            worksiteId,
            [],
            this.updateStatusOnUnclaim ? 'open_unassigned' : null,
          ),
        );
      });
      const results = await Promise.allSettled(promises);
      results.forEach((result) => this.$log.debug(result));
      this.spinning = false;
      this.showingUnclaimModal = false;
      this.reloadTable();
    },
    async updateStatusSelected() {
      this.spinning = true;
      const promises = [];
      this.selectedTableItems.forEach((worksiteId) => {
        const worksite = this.data.find((w) => {
          return w.id === worksiteId;
        });

        worksite.work_types.forEach((workType) => {
          promises.push(
            Worksite.api().updateWorkTypeStatus(
              workType.id,
              this.statusForUpdate,
            ),
          );
        });
      });
      const results = await Promise.allSettled(promises);
      results.forEach((result) => this.$log.debug(result));
      this.spinning = false;
      this.showingUpdateStatusModal = false;
      this.statusForUpdate = null;
      this.reloadTable();
    },

    async batchAction(action) {
      this.spinning = true;
      await this.selectedTableItems.forEach((i) => action(null, i));
      this.spinning = false;
      this.reloadTable();
    },
    clearWorksite() {
      this.$router.push(`/incident/${this.currentIncidentId}/cases/new`);
      EventBus.$emit('clearWorksite');
    },
    async savedWorksite(worksite) {
      await this.$router.push(
        `/incident/${worksite.incident}/cases/${worksite.id}`,
      );
    },
    async switchIncident(data) {
      await this.$router.push(
        `/incident/${data.incident}/cases/${data.worksite.id}/edit`,
      );
    },
    async toggleHighPriority(isHighPriority) {
      if (isHighPriority) {
        await Worksite.api().addFlag(this.currentWorksite.id, {
          reason_t: 'flag.worksite_high_priority',
          is_high_priority: true,
          notes: '',
          requested_action: '',
        });
      } else {
        const highPriorityFlags = this.currentWorksite.flags.filter(
          (flag) => flag.is_high_priority,
        );
        await Promise.all(
          highPriorityFlags.map((f) =>
            Worksite.api().deleteFlag(this.currentWorksite.id, f),
          ),
        );
      }
      await Worksite.api().fetch(this.currentWorksite.id);
    },
    async toggleFavorite(toggle) {
      if (toggle) {
        await Worksite.api().favorite(this.currentWorksite.id);
      } else {
        await Worksite.api().unfavorite(
          this.currentWorksite.id,
          this.currentWorksite.favorite.id,
        );
      }
      await Worksite.api().fetch(this.currentWorksite.id);
    },
    setSviList(sviList) {
      this.showSviSlider = new Set(sviList.map((w) => w.svi)).size >= 5;
      // Sort svi values treating nulls as 1 (Most Vulnerable)
      sviList.sort((a, b) => {
        return (
          (b.svi || 1) - (a.svi || 1) ||
          this.$moment(a.svi) - this.$moment(b.svi)
        );
      });
      this.$log.debug(sviList);
      this.sviList = sviList;
      if (this.sviLevel) {
        this.filterSvi(this.sviLevel);
      }
    },
    filterSvi(value) {
      this.sviLevel = Number(value);
      const count = Math.floor((this.sviList.length * Number(value)) / 100);
      const filteredSvi = this.sviList.slice(0, count);
      const minSvi = Math.min(...filteredSvi.map((o) => o.svi), 1);
      this.sviTitle = `${minSvi.toFixed(1)}`;
      this.$refs.worksiteMap.filterSvi(new Set(filteredSvi.map((w) => w.id)));
    },
    filterSviAsync: debounce(
      async function (value) {
        this.sviLevel = value;
        await this.fetch({
          pageSize: this.pagination.pageSize,
          page: 1,
        });
      },
      150,
      {
        leading: false,
        trailing: true,
      },
    ),
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

.cases-container-grid {
  display: grid;
  grid-template-columns: 4fr minmax(360px, 1fr);
}

.cases-container-grid--full {
  display: grid;
  grid-template-columns: auto;
}
.cases-grid {
  display: grid;
  grid-auto-rows: min-content auto;
  @apply h-full;
}

.svg-container svg {
  width: 18px;
  height: 18px;
}
</style>
