<template>
  <div
    class="pewpew h-screen w-screen"
    :style="styles"
    data-testid="testPewPewDiv"
  >
    <div class="grid grid-cols-12 relative h-full w-full">
      <div class="h-full">
        <PewPewNavBar :color-mode="colorMode" />
      </div>
      <div class="col-span-11 h-full flex flex-col">
        <div class="grid grid-cols-6 h-full">
          <div class="h-full p-2 w-full col-span-1">
            <tabs
              ref="tabs"
              class="relative h-full w-full px-1 mt-10 mx-1"
              tab-classes="text-xs"
              tab-default-classes="flex items-center justify-center h-8 cursor-pointer px-2"
              tab-active-classes="bg-crisiscleanup-dark-400 rounded-t-xl"
              @tabSelected="stopSiteInfoTabCirculationTimer"
            >
              <tab
                :name="$t('pewPew.live')"
                :selected="
                  siteInfoTimerData.isTimerActive &&
                  siteInfoTimerData.activeInfoTab === 0
                "
                data-testid="testPewPewLiveTab"
                class="absolute mx-1 left-0 right-0"
                :style="{ top: '2rem', bottom: 0 }"
              >
                <div
                  class="rounded-tr-xl bg-gradient-to-b from-crisiscleanup-dark-400 via-crisiscleanup-dark-500"
                  :name="$t('reports.pp_engagement_title')"
                >
                  <div class="text-xs px-5 text-center pt-4">
                    {{ $t('reports.pp_engagement_title') }}
                  </div>
                  <div class="h-40 w-full">
                    <SiteActivityGauge
                      v-if="currentSiteStats.length > 0"
                      data-testid="testCurrentEngagementChart"
                      :key="currentEngagement"
                      class="h-full w-full"
                      :chart-data="currentEngagement"
                      :margin-all="10"
                      chart-id="site-activity-gauge"
                    />
                  </div>
                </div>
                <div class="h-3/4 w-full overflow-hidden">
                  <CardStack ref="cards" />
                </div>
              </tab>
              <tab
                :name="
                  currentSiteStats.length > 0
                    ? `${currentSiteStats[0].currency_symbol}${formatStatValue(
                        currentSiteStats[0].value,
                      )}`
                    : $t('reports.pp_site_stats_title')
                "
                :selected="
                  siteInfoTimerData.isTimerActive &&
                  siteInfoTimerData.activeInfoTab === 1
                "
                data-testid="testSiteStatsTab"
                class="absolute mx-1 left-0 right-0"
                :style="{ top: '2rem', bottom: 0 }"
              >
                <div
                  class="flex flex-col items-start justify-start p-2 w-full rounded-t-xl bg-gradient-to-b from-crisiscleanup-dark-400 via-crisiscleanup-dark-500"
                >
                  <div class="">
                    <div
                      v-for="(stat, index) in currentSiteStats"
                      :data-testid="`testSiteStats${stat.id}Div`"
                      :key="stat.id"
                      class="mb-2"
                    >
                      <template v-if="index === 0">
                        <div :key="stat.id" class="flex">
                          {{ $t(stat.name_t) }}
                          <ccu-icon
                            v-tooltip="{
                              content: $t(stat.description_t),
                              html: true,
                              triggers: ['click'],
                              popperClass: 'interactive-tooltip w-auto',
                            }"
                            :invert-color="true"
                            :data-testid="`testSiteStats${stat.id}Icon`"
                            type="help"
                            size="medium"
                          />
                        </div>
                        <div :key="stat.id" class="text-xl text-blue-600 stats">
                          {{ stat.currency_symbol
                          }}{{ formatStatValue(stat.value) }}
                        </div>
                      </template>
                      <template v-else>
                        <div :key="stat.id" class="flex">
                          {{ $t(stat.name_t) }}
                          <ccu-icon
                            v-tooltip="{
                              content: $t(stat.description_t),
                              triggers: ['click'],
                              html: true,
                              popperClass: 'interactive-tooltip w-auto',
                            }"
                            :invert-color="true"
                            :data-testid="`testSiteStats2${stat.id}Icon`"
                            type="help"
                            size="medium"
                          />
                        </div>
                        <div :key="stat.id" class="text-base stats">
                          {{ stat.currency_symbol
                          }}{{ formatStatValue(stat.value) }}
                        </div>
                      </template>
                    </div>
                    <!-- Add future statistics stub
                    <div class="underline text-blue-600">
                      {{ $t('reports.pp_site_stats_more_stats') }}
                    </div>
                    -->
                  </div>
                </div>
              </tab>
            </tabs>
          </div>
          <div class="h-full col-span-5 flex flex-col">
            <div class="h-12 grid grid-cols-10">
              <div
                class="my-2 col-span-8 flex justify-center items-center text-black font-bold ribbon-gradient"
              >
                <div v-if="incidentList.length > 0">
                  <div
                    v-for="incident in incidentList"
                    :key="incident.id"
                    :data-testid="`testIncident${incident.id}Div`"
                  >
                    {{ incident.short_name }}:
                    {{ getIncidentPhoneNumbers(incident) }}
                  </div>
                </div>
                <div v-else data-testid="testPewPewBannerDiv">
                  {{ $t('homeVue.pew_pew_banner') }}
                </div>
              </div>
              <div class="col-span-2 flex items-center justify-center">
                <Toggle v-if="false" v-model="isDarkMode" />
                <template v-if="!isLoggedIn">
                  <base-button
                    class="text-xs p-1 w-20 text-black rounded"
                    data-testid="testRegisterButton"
                    variant="solid"
                    :text="$t('actions.register')"
                    :alt="$t('actions.register')"
                    :action="() => $router.push('/register')"
                  />
                  <base-button
                    class="text-xs ml-2 p-1 w-20 rounded"
                    data-testid="testLoginButton"
                    variant="outline-dark"
                    :text="$t('actions.login')"
                    :alt="$t('actions.login')"
                    :action="() => $router.push('/login')"
                  />
                </template>
                <template v-else>
                  <UserProfileMenu
                    invert
                    data-testid="testLogoutLink"
                    @auth:logout="() => $store.dispatch('auth/logout')"
                  />
                </template>
              </div>
            </div>
            <div class="h-12 mt-3 flex text-xs" data-testid="testIncidentSelectedDiv">
              <div
                class="live-tab px-6"
                :class="incidentId ? '' : 'live-tab--selected'"
                @click="
                  $router.push({
                    name: 'nav.pew',
                  })
                "
              >
                {{ $t('pewPew.current') }}
              </div>
              <router-link
                v-for="i in incidents"
                :data-testid="`testIncident${i.id}Div`"
                :key="i.id"
                :to="{
                  name: 'nav.pew',
                  query: { incident: i.id },
                }"
                class="live-tab px-2"
                :class="
                  String(i.id) === String(incidentId)
                    ? 'live-tab--selected'
                    : ''
                "
              >
                <DisasterIcon
                  class="mx-2"
                  :data-testid="`testDisaster${i.id}Icon`"
                  :current-incident="i"
                  :alt="i.short_name"
                />
                {{ i.short_name }}
              </router-link>
            </div>
            <div class="flex-grow select-none grid grid-cols-10">
              <div class="relative h-full select-none col-span-7">
                <div
                  id="map"
                  data-testid="testMapDiv"
                  ref="map"
                  class="absolute top-0 left-0 right-0 bottom-0"
                ></div>
                <div
                  v-if="mapLoading"
                  data-testid="testMapLoadingDiv"
                  style="z-index: 1001"
                  class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
                >
                  <spinner />
                </div>
                <div
                  style="z-index: 1001"
                  class="absolute top-0 left-0 m-2 p-2 bg-opacity-25 bg-crisiscleanup-dark-400 rounded-md"
                >
                  <Slider
                    primary-color="#FECE09"
                    data-testid="testSviSliderDiv"
                    :value="100"
                    :from="$t('svi.most_vulnerable')"
                    :to="$t('svi.everyone')"
                    @input="
                      (value) => {
                        refreshSvi(value);
                      }
                    "
                  ></Slider>
                </div>
                <div
                  style="z-index: 1001"
                  class="absolute top-0 left-0 m-2 p-2 rounded-md mt-12 flex flex-col absolute"
                >
                  <div class="zoom-control flex flex-col mb-5">
                    <base-button
                      text=""
                      data-testid="testZoomInButton"
                      icon="plus"
                      icon-size="xs"
                      ccu-event="user_ui-zoom-in"
                      :title="$t('worksiteMap.zoom_in')"
                      :alt="$t('worksiteMap.zoom_in')"
                      :action="zoomIn"
                      class="w-8 h-8 border-crisiscleanup-dark-100 border-b bg-opacity-25 bg-crisiscleanup-dark-400 shadow-xl text-white text-xl rounded-t"
                    />
                    <base-button
                      text=""
                      data-testid="testZoomOutButton"
                      icon="minus"
                      icon-size="xs"
                      ccu-event="user_ui-zoom-out"
                      :title="$t('worksiteMap.zoom_out')"
                      :alt="$t('worksiteMap.zoom_out')"
                      :action="zoomOut"
                      class="w-8 h-8 bg-opacity-25 bg-crisiscleanup-dark-400 shadow-xl text-white text-xl rounded-b"
                    />
                  </div>
                </div>
                <div
                  :key="incidentId"
                  style="z-index: 1001"
                  class="absolute top-0 right-0 h-48 w-auto overflow-hidden mt-3 mr-3"
                >
                  <transition-group
                    ref="incidentScroll"
                    name="incidentScroll"
                    data-testid="testCurrentEventIncidentScrollDiv"
                    tag="div"
                  >
                    <div
                      v-for="i in liveIncidents"
                      :key="i.key"
                      class="bg-crisiscleanup-dark-400 p-1 my-2 bg-opacity-25 w-56 text-center"
                    >
                      {{ i.name }}
                    </div>
                  </transition-group>
                </div>
                <div
                  v-if="displayedWorkTypeSvgs.length > 0"
                  class="absolute bottom-0 left-0 w-1/3 h-auto bg-crisiscleanup-dark-400 p-2 ml-3 bg-opacity-25"
                  style="z-index: 1001; bottom: 25%"
                >
                  <div
                    class="flex justify-between font-bold my-1 text-white text-sm"
                  >
                    <span>
                      {{ $t('worksiteMap.legend') }}
                    </span>
                    <span
                      class="cursor-pointer"
                      @click="isLegendHidden = !isLegendHidden"
                    >
                      <font-awesome-icon
                        v-if="!isLegendHidden"
                        data-testid="testHideLegendIcon"
                        icon="minus"
                        :alt="$t('worksiteMap.hide_legend')"
                      />
                      <font-awesome-icon
                        v-else
                        data-testid="testShowLegendIcon"
                        icon="plus"
                        :alt="$t('worksiteMap.show_legend')"
                      />
                    </span>
                  </div>
                  <transition name="fade">
                    <div
                      v-if="!isLegendHidden"
                      class="grid grid-cols-2 auto-cols-max justify-between"
                    >
                      <div
                        v-for="entry in displayedWorkTypeSvgs"
                        :data-testid="`testLegendSvgs${entry.key}Div`"
                        :key="entry.key"
                        class="flex items-center mb-1 cursor-pointer p-1 hover:border-white border"
                        :class="
                          entry.selected
                            ? 'selected border-white'
                            : 'border-transparent'
                        "
                        @click="
                          () => {
                            entry.selected = !entry.selected;
                            // displayedWorkTypeSvgs = [...displayedWorkTypeSvgs]; TODO: Fix filtering for worktypes
                            refreshVisibility(entry.key);
                          }
                        "
                      >
                        <div class="map-svg-container" v-html="entry.svg"></div>
                        <span class="text-xs ml-1 text-white">{{
                          getWorkTypeName(entry.key)
                        }}</span>
                      </div>
                    </div>
                  </transition>
                </div>
                <div
                  style="z-index: 1001"
                  class="absolute left-0 bottom-0 right-0"
                >
                  <div class="relative">
                    <img
                      src="@/assets/cc-logo.svg"
                      data-testid="testCcuLogoIcon"
                      alt="crisis-cleanup-logo"
                      class="absolute p-3 h-16 right-0 bottom-0 opacity-20"
                    />
                  </div>
                  <div
                    class="mapStats grid grid-flow-col auto-cols-max items-center overflow-x-auto mb-2 px-3"
                  >
                    <div
                      v-for="item in mapStatistics"
                      :data-testid="`testMapStatItem${item['title']}Div`"
                      :key="item['title']"
                      class="p-1 px-3 border mx-1 bg-opacity-25 bg-crisiscleanup-dark-400 rounded-md"
                      :style="item['style']"
                    >
                      <div class="text-center text-white text-xs opacity-50">
                        {{ item['title'] }}
                      </div>
                      <div class="text-center text-white text-sm">
                        {{ item['count'] }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="w-auto h-auto bg-crisiscleanup-dark-400 p-3 bg-opacity-25 flex mb-8 mx-3 rounded"
                  >
                    <div class="flex justify-center items-center mr-2">
                      <base-button
                        v-if="!isPaused"
                        data-testid="testPauseGeneratePointsButton"
                        class="w-8 h-8 rounded-full focus:outline-none border p-2"
                        :action="pauseGeneratePoints"
                        icon="pause"
                        icon-size="xs"
                      >
                      </base-button>
                      <base-button
                        v-else
                        data-testid="testResumeGeneratePointsButton"
                        class="w-8 h-8 rounded-full focus:outline-none border p-2"
                        :action="resumeGeneratePoints"
                        icon="play"
                        icon-size="xs"
                      >
                      </base-button>
                    </div>
                    <Slider
                      v-if="markersLength > 0"
                      data-testid="testUpdatedSliderDiv"
                      :key="markersLength"
                      :value="markersLength - 1"
                      :min="0"
                      :max="markersLength - 1"
                      :from="queryFilter.start_date.format('MMM Do YYYY')"
                      :to="queryFilter.end_date.format('MMM Do YYYY')"
                      :alt="$t('actions.play')"
                      @input="
                        (value) => {
                          throttle(() => {
                            refreshTimeline(value);
                          }, 1000)();
                        }
                      "
                    ></Slider>
                  </div>
                </div>
              </div>
              <div class="h-full p-2 w-full col-span-3 grid grid-rows-12">
                <LiveOrganizationTable
                  :organizations="organizations"
                  :query-filter="queryFilter"
                  :styles="styles"
                  :overlay-styles="overlayStyles"
                  data-testid="testLiveOrganizationTableDiv"
                  class="row-span-7 relative"
                />
                <div class="row-span-5">
                  <tabs
                    ref="tabs"
                    data-testid="testStopChartTabCirculationTimerTab"
                    class="relative h-full m-1"
                    tab-classes="text-xs"
                    tab-default-classes="flex items-center justify-center text-center h-10 cursor-pointer px-2"
                    tab-active-classes="bg-crisiscleanup-dark-400 rounded-t-lg"
                    @tabSelected="stopChartTabCirculationTimer"
                  >
                    <LightTab
                      :name="$t('reports.pp_call_volume_title')"
                      :alt="$t('reports.pp_call_volume_description')"
                      data-testid="testPpCallVolumeTab"
                      class="chart-tab"
                      :selected="
                        chartCirculationTimerData.isTimerActive &&
                        chartCirculationTimerData.activeChartTab === 0
                      "
                    >
                      <div class="chart-container rounded-tr-xl h-72">
                        <CircularBarplot
                          v-if="circularBarplotData.length > 0"
                          data-testid="testPpCallTimesChart"
                          :key="circularBarplotData"
                          class="h-full h-full"
                          :chart-data="circularBarplotData"
                          :margin="20"
                          :is-stacked="false"
                        />
                      </div>
                    </LightTab>
                    <LightTab
                      :name="$t('reports.pp_total_cases_title')"
                      :alt="$t('reports.pp_total_cases_description')"
                      data-testid="testTotalCasesTab"
                      class="chart-tab"
                      :selected="
                        chartCirculationTimerData.isTimerActive &&
                        chartCirculationTimerData.activeChartTab === 1
                      "
                    >
                      <div class="chart-container rounded-t-xl">
                        <TotalCases
                          :key="totalCasesChartData"
                          data-testid="testTotalCasesChart"
                          class="h-full w-full"
                          :margin-all="30"
                          :chart-data="totalCasesChartData"
                        />
                      </div>
                    </LightTab>
                    <LightTab
                      :name="$t('reports.completion_rate')"
                      data-testid="testCompletionRateChart"
                      class="chart-tab"
                      :selected="
                        chartCirculationTimerData.isTimerActive &&
                        chartCirculationTimerData.activeChartTab === 2
                      "
                    >
                      <div class="chart-container rounded-t-xl h-72">
                        <D3BarChart
                          :key="barChartData"
                          class="h-full w-full"
                          chart-id="completion-rate"
                          :chart-data="barChartData"
                          :is-stacked="true"
                        />
                      </div>
                    </LightTab>
                  </tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import moment from 'moment';
import axios from 'axios';
import { useStore } from 'vuex';
import { shuffle, throttle } from 'lodash';
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { getQueryString } from '@/utils/urls';
import useLiveMap from '@/hooks/worksite/useLiveMap';
import CardStack from '@/components/live/CardStack.vue';
import Slider from '@/components/Slider.vue';
import DisasterIcon from '@/components/DisasterIcon.vue';
import UserProfileMenu from '@/components/header/UserProfileMenu.vue';
import { formatNationalNumber, getWorkTypeName } from '@/filters';
import Incident from '@/models/Incident';
import LiveOrganizationTable from '@/components/live/LiveOrganizationTable.vue';
import useSiteStatistics from '@/hooks/live/useSiteStatistics';
import SiteActivityGauge from '@/components/live/SiteActivityGauge.vue';
import CircularBarplot from '@/components/live/CircularBarplot.vue';
import D3BarChart from '@/components/live/D3BarChart.vue';
import LightTab from '@/components/tabs/LightTab.vue';
import TotalCases from '@/components/live/TotalCases.vue';
import PewPewNavBar from '@/components/navigation/PewPewNavBar.vue';
import User from '@/models/User';

export default defineComponent({
  name: 'PewPew',
  components: {
    PewPewNavBar,
    TotalCases,
    LightTab,
    D3BarChart,
    CircularBarplot,
    SiteActivityGauge,
    LiveOrganizationTable,
    UserProfileMenu,
    DisasterIcon,
    Slider,
    CardStack,
  },
  setup() {
    const store = useStore();

    const queryFilter = ref({
      start_date: moment().add(-60, 'days'),
      end_date: moment(),
    });
    const cards = ref(null);
    const incidentId = ref(null);
    const liveIncidents = ref([]);
    const incidents = ref([]);
    const mapLoading = ref(false);
    const isLegendHidden = ref(false);
    const colorMode = ref('dark');
    const lastEventTimestamp = ref(null);
    const markersLength = ref(0);
    const mapUtils = ref(null);
    const isDarkMode = computed(() => colorMode.value === 'dark');
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn']);
    const incidentList = computed(() =>
      Incident.query().where('active_phone_number', Boolean).get(),
    );
    const organizations = ref([]);

    const {
      currentSiteStats,
      currentEngagement,
      circularBarplotData,
      barChartData,
      totalCasesChartData,
      mapStatistics,
      formatStatValue,
    } = useSiteStatistics(queryFilter, organizations);

    const styles = computed(() => {
      if (colorMode.value === 'dark') {
        return {
          color: 'white',
          backgroundColor: '#232323',
        };
      }

      return {
        color: '#232323',
        backgroundColor: 'white',
      };
    });

    const overlayStyles = computed(() => {
      if (colorMode.value === 'dark') {
        return {
          color: 'white',
          backgroundColor: '#242C36',
        };
      }

      return {
        color: '#232323',
        backgroundColor: 'white',
      };
    });

    const siteInfoTimerData = reactive({
      timerId: null,
      activeInfoTab: 0,
      isTimerActive: true,
    });

    const chartCirculationTimerData = reactive({
      timerId: null,
      activeInfoTab: 0,
      isTimerActive: true,
    });

    async function getAllEvents() {
      try {
        mapLoading.value = true;
        if (queryFilter.value.incident) {
          const params = {
            limit: 60_000,
            event_key__in: Object.keys({
              user_create_worksite: true,
            }).join(','),
            sort: 'created_at',
            incident_id: queryFilter.value.incident || '',
            created_at__gte: queryFilter.value.start_date.toISOString(),
            created_at__lte: queryFilter.value.end_date.toISOString(),
          };
          const queryString = getQueryString(params);
          const response = await axios.get(
            `${
              import.meta.env.VITE_APP_API_BASE_URL
            }/all_events?${queryString}`,
          );
          return response.data.results;
        }

        const params = {
          sort: '-created_at',
        };
        const queryString = getQueryString(params);
        const response = await axios.get(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/recent_events?${queryString}`,
        );
        markersLength.value = response.data.length;
        return response.data;
      } finally {
        mapLoading.value = false;
      }
    }

    async function getLatestEvents() {
      const params = {
        limit: 100,
        sort: '-created_at',
        incident_id: queryFilter.value.incident || '',
      };

      if (lastEventTimestamp.value) {
        params.created_at__gte = lastEventTimestamp.value;
      }

      const queryString = getQueryString(params);
      lastEventTimestamp.value = moment().toISOString();
      const { data } = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/live_events?${queryString}`,
      );
      const liveEvents = [...data.results];
      liveEvents.reverse();
      return liveEvents;
    }

    function zoomIn() {
      mapUtils.value?.getMap().zoomIn();
    }

    function zoomOut() {
      mapUtils.value?.getMap().zoomOut();
    }

    function pauseGeneratePoints() {
      mapUtils.value?.pauseGeneratePoints();
    }

    function resumeGeneratePoints() {
      mapUtils.value?.resumeGeneratePoints();
    }

    function refreshTimeline(index) {
      mapUtils.value?.refreshTimeline(index);
    }

    function refreshSvi(index) {
      mapUtils.value?.refreshSvi(index);
    }

    function refreshVisibility(index) {
      mapUtils.value?.refreshVisibility(index);
    }

    async function getRecentIncidents() {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/incidents?fields=id,name,short_name,geofence,locations,incident_type,color,turn_on_release,active_phone_number&limit=8&sort=-start_at`,
      );
      const { results } = response.data;
      return results;
    }

    function getIncidentPhoneNumbers(incident) {
      if (Array.isArray(incident.active_phone_number)) {
        return incident.active_phone_number
          .map((number) => formatNationalNumber(String(number)))
          .join(', ');
      }

      return formatNationalNumber(String(incident.active_phone_number));
    }

    async function getOrganizations() {
      const { incident } = queryFilter.value;
      const params = {
        start_date: moment().add(-120, 'days').format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
      };
      if (incident) {
        params.incident = incident;
      }

      const queryString = getQueryString(params);

      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/reports_data/organization_statistics?${queryString}`,
      );
      return response.data;
    }

    function startSiteInfoTabCirculationTimer(ms) {
      const totalTabs = 2;
      siteInfoTimerData.timerId = setInterval(() => {
        siteInfoTimerData.activeInfoTab =
          (siteInfoTimerData.activeInfoTab + 1) % totalTabs;
      }, ms);
    }

    function stopSiteInfoTabCirculationTimer() {
      if (siteInfoTimerData.isTimerActive) {
        clearInterval(siteInfoTimerData.timerId);
        siteInfoTimerData.isTimerActive = false;
      }
    }

    function startTabCirculationTimer(ms) {
      const totalTabs = 3; // total tabs present inside tabs component
      chartCirculationTimerData.timerId = setInterval(() => {
        chartCirculationTimerData.activeChartTab =
          (chartCirculationTimerData.activeChartTab + 1) % totalTabs;
      }, ms);
    }

    function stopChartTabCirculationTimer() {
      if (chartCirculationTimerData.isTimerActive) {
        clearInterval(chartCirculationTimerData.timerId);
        chartCirculationTimerData.isTimerActive = false;
      }
    }

    onMounted(async () => {
      getRecentIncidents().then((results) => {
        incidents.value = results;
      });
      getOrganizations().then((o) => {
        organizations.value = shuffle(o);
      });
      mapUtils.value = useLiveMap(
        await getAllEvents(),
        () => [],
        null,
        2000,
        getLatestEvents,
        (card) => {
          cards.value?.addCardComponent(card);
          if (
            liveIncidents.value.length === 0 ||
            (liveIncidents.value[0].name !== card.event.attr.incident_name &&
              card.event.attr.incident_name)
          ) {
            liveIncidents.value.unshift({
              name: card.event.attr.incident_name,
              key: card.event.id,
            });
          }
        },
        () => {
          cards.value.clearCards();
          liveIncidents.value = [];
        },
      );
      mapUtils.value.restartLiveEvents();
      startTabCirculationTimer(10_000);
    });

    const isPaused = computed(() => mapUtils.value?.isPaused);
    const displayedWorkTypeSvgs = computed(
      () => mapUtils.value?.displayedWorkTypeSvgs || [],
    );

    const route = useRoute();

    watch(
      () => route.query.incident,
      async (value) => {
        queryFilter.value.incident = value;
        incidentId.value = value;
        queryFilter.value = { ...queryFilter.value };
        lastEventTimestamp.value = null;
        mapUtils?.value?.reloadMap(await getAllEvents(), () => []);
        mapUtils?.value?.restartLiveEvents();
      },
    );

    return {
      isLegendHidden,
      colorMode,
      queryFilter,
      cards,
      mapLoading,
      styles,
      overlayStyles,
      incidentId,
      liveIncidents,
      zoomIn,
      zoomOut,
      incidents,
      isDarkMode,
      isLoggedIn,
      getIncidentPhoneNumbers,
      incidentList,
      organizations,
      siteInfoTimerData,
      chartCirculationTimerData,
      currentSiteStats,
      formatStatValue,
      currentEngagement,
      circularBarplotData,
      barChartData,
      totalCasesChartData,
      mapStatistics,
      pauseGeneratePoints,
      resumeGeneratePoints,
      markersLength,
      isPaused,
      refreshTimeline,
      refreshSvi,
      refreshVisibility,
      throttle,
      startSiteInfoTabCirculationTimer,
      stopSiteInfoTabCirculationTimer,
      startTabCirculationTimer,
      stopChartTabCirculationTimer,
      displayedWorkTypeSvgs,
      getWorkTypeName,
    };
  },
});
</script>

<style lang="postcss">
.show-enter-active,
.show-leave-enter {
  transform: translateY(0);
  transition: all 0.3s linear;
}
.show-enter,
.show-leave-to {
  transform: translateY(-100%);
}

.incidentScroll-move {
  transition: transform 1s;
}

.mapStats > div:hover {
  @apply border-2 cursor-pointer;
}

.live-tab {
  @apply flex items-center justify-center h-12 cursor-pointer text-white no-underline;
  text-decoration: none !important;
}

.live-tab--selected {
  @apply bg-gradient-to-t from-crisiscleanup-dark-500 to-crisiscleanup-dark-400 rounded-t;
}

.leaflet-data-marker svg {
  width: 30px;
  height: 30px;
}
.table-grid .header .header-column p {
  font-size: 11px;
}

.small-font {
  font-size: 11px;
}

.map-svg-container svg {
  width: 16px;
  height: 16px;
}

.pew-pew-blue {
  color: #61d5f8;
}

.stats:hover {
  text-shadow: 1px 1px 2px lightblue, 0 0 1em lightblue, 0 0 0.2em lightblue;
}

.pewpew {
  .ribbon-gradient {
    background: linear-gradient(
      270deg,
      rgba(129, 154, 176, 0) 0.27%,
      #819ab0 25.98%,
      #819ab0 75.52%,
      rgba(129, 154, 176, 0) 100.43%
    );
  }

  /* set top to 2.5rem to place it after tab headers which has a h-10 = 2.5rem */
  .chart-tab {
    @apply absolute left-0 right-0;
    top: 2.5rem;
    bottom: 0;
  }

  .chart-container {
    @apply absolute
    top-0
    bottom-0
    left-0
    right-0
    bg-gradient-to-b
    from-crisiscleanup-dark-400
    via-crisiscleanup-dark-500;
  }

  ::-webkit-scrollbar {
    width: 20px;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #d6dee1;
    border-radius: 20px;
    border: 6px solid transparent;
    background-clip: content-box;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #a8bbbf;
  }
}
</style>
