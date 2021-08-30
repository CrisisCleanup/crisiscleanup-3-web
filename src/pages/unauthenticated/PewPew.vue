<template>
  <div class="pewpew absolute top-0 right-0 left-0 bottom-0" :style="styles">
    <div class="grid grid-cols-10 relative">
      <div
        class="
          grid grid-cols-8
          col-span-2
          shadow-lg
          h-screen
          flex flex-col
          pr-1
        "
        style="z-index: 1000"
      >
        <PewPewNavBar :color-mode="colorMode" />
        <div class="col-span-6 flex flex-col justify-between items-center">
          <tabs
            class="relative h-full w-full px-1 mt-10 mx-1"
            ref="tabs"
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
              class="absolute mx-1 left-0 right-0"
              :style="{ top: '2rem', bottom: 0 }"
            >
              <div
                class="
                  rounded-tr-xl
                  bg-gradient-to-b
                  from-crisiscleanup-dark-400
                  via-crisiscleanup-dark-500
                "
                :name="$t('reports.pp_engagement_title')"
              >
                <div class="text-xs px-5 text-center pt-4">
                  {{ $t('reports.pp_engagement_title') }}
                </div>
                <div class="h-40 w-full">
                  <SiteActivityGauge
                    class="h-full w-full"
                    :chart-data="currentEngagement"
                    :margin-all="10"
                    chart-id="site-activity-gauge"
                  />
                </div>
              </div>
              <div class="h-full p-2 w-full">
                <CardStack ref="cards" :key="incidentId" />
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
              class="absolute mx-1 left-0 right-0"
              :style="{ top: '2rem', bottom: 0 }"
            >
              <div
                class="
                  flex flex-col
                  items-start
                  justify-start
                  p-2
                  w-full
                  rounded-t-xl
                  bg-gradient-to-b
                  from-crisiscleanup-dark-400
                  via-crisiscleanup-dark-500
                "
              >
                <div class="">
                  <div
                    class="mb-2"
                    v-for="(stat, index) in currentSiteStats"
                    :key="stat.id"
                  >
                    <template v-if="index === 0">
                      <div :key="stat.id" class="flex">
                        {{ $t(stat.name_t) }}
                        <ccu-icon
                          v-tooltip="{
                            content: $t(stat.description_t),
                            trigger: 'click',
                            classes: 'interactive-tooltip w-auto',
                          }"
                          :invert-color="true"
                          :alt="$t('actions.help_alt')"
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
                            trigger: 'click',
                            classes: 'interactive-tooltip w-auto',
                          }"
                          :invert-color="true"
                          :alt="$t('actions.help_alt')"
                          type="help"
                          size="medium"
                        />
                      </div>
                      <div class="text-base stats" :key="stat.id">
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
      </div>
      <div class="col-span-8 h-screen flex flex-col">
        <div class="h-12 grid grid-cols-10">
          <div
            class="
              my-2
              col-span-8
              flex
              justify-center
              items-center
              text-black
              font-bold
              ribbon-gradient
            "
          >
            {{ $t('homeVue.pew_pew_banner') }}
          </div>
          <div class="col-span-2 flex items-center justify-center">
            <Toggle v-model="isDarkMode" v-if="false" />
            <template v-if="!isLoggedIn">
              <base-button
                class="text-xs p-1 w-20 text-black rounded"
                variant="solid"
                :text="$t('actions.register')"
                :action="() => $router.push('/register')"
              />
              <base-button
                class="text-xs ml-2 p-1 w-20 rounded"
                variant="outline-dark"
                :text="$t('actions.login')"
                :action="() => $router.push('/login')"
              />
            </template>
            <template v-else>
              <UserProfileMenu
                @auth:logout="() => $store.dispatch('auth/logout')"
                invert
              />
            </template>
          </div>
        </div>
        <div class="h-12 mt-3 flex text-xs">
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
            :key="i.id"
            :to="{
              name: 'nav.pew',
              query: { incident: i.id },
            }"
            class="live-tab px-2"
            :class="
              String(i.id) === String(incidentId) ? 'live-tab--selected' : ''
            "
          >
            <DisasterIcon class="mx-2" :current-incident="i" />
            {{ i.short_name }}
          </router-link>
        </div>
        <div class="flex-grow grid grid-cols-12">
          <div class="col-span-8 flex flex-col">
            <div class="flex-grow">
              <div class="relative h-full">
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
                  <spinner :color="styles.color" />
                </div>
                <div
                  style="z-index: 1001"
                  class="
                    absolute
                    top-0
                    left-0
                    m-2
                    p-2
                    bg-opacity-25 bg-crisiscleanup-dark-400
                    rounded-md
                  "
                >
                  <Slider
                    primary-color="#FECE09"
                    :value="100"
                    @input="
                      (value) => {
                        refreshSvi(value);
                      }
                    "
                    :from="$t('svi.most_vulnerable')"
                    :to="$t('svi.everyone')"
                  ></Slider>
                </div>
                <div
                  style="z-index: 1001"
                  class="
                    absolute
                    top-0
                    left-0
                    m-2
                    p-2
                    rounded-md
                    mt-12
                    flex flex-col
                    absolute
                  "
                >
                  <div class="zoom-control flex flex-col mb-5">
                    <base-button
                      text=""
                      icon="plus"
                      icon-size="xs"
                      ccu-event="user_ui-zoom-in"
                      :title="$t('worksiteMap.zoom_in')"
                      :alt="$t('worksiteMap.zoom_in')"
                      :action="
                        () => {
                          map.zoomIn();
                        }
                      "
                      class="
                        w-8
                        h-8
                        border-crisiscleanup-dark-100 border-b
                        bg-opacity-25 bg-crisiscleanup-dark-400
                        shadow-xl
                        text-white text-xl
                        rounded-t
                      "
                    />
                    <base-button
                      text=""
                      icon="minus"
                      icon-size="xs"
                      ccu-event="user_ui-zoom-out"
                      :title="$t('worksiteMap.zoom_out')"
                      :alt="$t('worksiteMap.zoom_out')"
                      :action="
                        () => {
                          map.zoomOut();
                        }
                      "
                      class="
                        w-8
                        h-8
                        bg-opacity-25 bg-crisiscleanup-dark-400
                        shadow-xl
                        text-white text-xl
                        rounded-b
                      "
                    />
                  </div>
                </div>
                <div
                  style="z-index: 1001"
                  class="
                    absolute
                    top-0
                    right-0
                    h-48
                    w-auto
                    overflow-hidden
                    mt-3
                    mr-3
                  "
                  :key="incidentId"
                >
                  <transition-group
                    name="incidentScroll"
                    tag="div"
                    ref="incidentScroll"
                  >
                    <div
                      v-for="i in liveIncidents"
                      :key="i.key"
                      class="
                        bg-crisiscleanup-dark-400
                        p-1
                        my-2
                        bg-opacity-25
                        w-56
                        text-center
                      "
                    >
                      {{ i.name }}
                    </div>
                  </transition-group>
                </div>
                <div
                  v-if="displayedWorkTypeSvgs.length > 0"
                  class="
                    absolute
                    bottom-0
                    left-0
                    w-1/3
                    h-auto
                    bg-crisiscleanup-dark-400
                    p-2
                    ml-3
                    bg-opacity-25
                  "
                  style="z-index: 1001; bottom: 25%"
                >
                  <div
                    class="
                      flex
                      justify-between
                      font-bold
                      my-1
                      text-white text-sm
                    "
                  >
                    <span>
                      {{ $t('worksiteMap.legend') }}
                    </span>
                    <span
                      class="cursor-pointer"
                      @click="isLegendHidden = !isLegendHidden"
                    >
                      <font-awesome-icon v-if="!isLegendHidden" icon="minus" />
                      <font-awesome-icon v-else icon="plus" />
                    </span>
                  </div>
                  <transition name="fade">
                    <div
                      class="flex flex-wrap justify-between"
                      v-if="!isLegendHidden"
                    >
                      <div
                        v-for="entry in displayedWorkTypeSvgs"
                        :key="entry.key"
                        class="
                          flex
                          items-center
                          w-1/2
                          mb-1
                          cursor-pointer
                          hover:border-2
                        "
                        :class="entry.selected ? 'selected border-2' : 'my-1'"
                        @click="
                          () => {
                            entry.selected = !entry.selected;
                            displayedWorkTypeSvgs = [...displayedWorkTypeSvgs];
                            refresh();
                          }
                        "
                      >
                        <div class="map-svg-container" v-html="entry.svg"></div>
                        <span class="text-xs ml-1 text-white">{{
                          entry.key | getWorkTypeName
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
                      alt="crisis-cleanup-logo"
                      class="absolute p-3 h-16 right-0 bottom-0 opacity-20"
                    />
                  </div>
                  <div
                    class="
                      mapStats
                      flex flex-nowrap
                      items-center
                      overflow-x-auto
                      mb-2
                      px-3
                    "
                  >
                    <div
                      class="
                        w-auto
                        p-1
                        px-3
                        border
                        mx-1
                        bg-opacity-25 bg-crisiscleanup-dark-400
                        rounded-md
                      "
                      v-for="item in mapStatistics"
                      :style="item['style']"
                      :key="item['title']"
                    >
                      <div class="text-center text-white text-xs opacity-50">
                        {{ item['title'] | upper }}
                      </div>
                      <div class="text-center text-white text-sm">
                        {{ item['count'] }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="
                      w-auto
                      h-auto
                      bg-crisiscleanup-dark-400
                      p-3
                      bg-opacity-25
                      flex
                      mb-8
                      mx-3
                      rounded
                    "
                  >
                    <div class="flex justify-center items-center mr-2">
                      <base-button
                        v-if="eventsInterval"
                        class="
                          w-8
                          h-8
                          rounded-full
                          focus:outline-none
                          border
                          p-2
                        "
                        :action="pauseGeneratePoints"
                        icon="pause"
                        icon-size="xs"
                      >
                      </base-button>
                      <base-button
                        v-else
                        class="
                          w-8
                          h-8
                          rounded-full
                          focus:outline-none
                          border
                          p-2
                        "
                        :action="generatePoints"
                        icon="play"
                        icon-size="xs"
                      >
                      </base-button>
                    </div>
                    <Slider
                      v-if="markersLength > 0"
                      @input="
                        (value) => {
                          throttle(() => {
                            refreshTimeline(value);
                          }, 1000)();
                        }
                      "
                      :value="markersLength - 1"
                      :min="0"
                      :max="markersLength - 1"
                      :from="queryFilter.start_date.format('MMM Do YYYY')"
                      :to="queryFilter.end_date.format('MMM Do YYYY')"
                      :alt="$t('actions.play')"
                    ></Slider>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-4 grid grid-rows-12">
            <div class="row-span-7 relative">
              <div
                :class="
                  isOrgActivityModalHidden
                    ? 'translate-x-full'
                    : 'translate-x-0'
                "
                class="
                  w-full
                  absolute
                  top-0
                  right-0
                  flex
                  justify-center
                  transform
                  transition
                  duration-500
                "
                style="z-index: 1002"
              >
                <OrganizationActivityModal
                  :is-loading="isOrgActivityModalLoading"
                  @close="isOrgActivityModalHidden = true"
                  :general-info="orgInfo.generalInfo"
                  :styles="overlayStyles"
                />
              </div>
              <Table
                :loading="orgsLoading"
                :columns="orgTable.columns"
                :data="organizations"
                :body-style="{ maxHeight: '40vh', ...styles }"
                :header-style="styles"
                :row-style="{ backgroundColor: 'unset' }"
                @rowClick="onRowClick"
                class="ml-1"
              >
                <template #name="slotProps">
                  <img
                    class="w-6 mr-2 rounded-full"
                    :src="getLogoUrl(slotProps.item)"
                    :alt="$t('profileOrg.organization_logo')"
                  />
                  <span class="truncate w-32">{{ slotProps.item.name }}</span>
                </template>
                <template #incident_count="slotProps">
                  <span class="w-full flex justify-end">
                    {{ nFormatter(slotProps.item.incident_count)
                    }}<span class="pew-pew-blue">*</span>
                  </span>
                </template>
                <template #commercial_value="slotProps">
                  <span class="w-full flex justify-end">
                    ${{ nFormatter(slotProps.item.commercial_value)
                    }}<span class="pew-pew-blue">*</span>
                  </span>
                </template>
                <template #calls_count="slotProps">
                  <span class="w-full flex justify-end">
                    {{ nFormatter(slotProps.item.calls_count) }}
                  </span>
                </template>
                <template #reported_count="slotProps">
                  <div class="w-full flex justify-end">
                    <CaseDonutChart
                      v-if="!isCaseDonutChartDataEmpty(slotProps.item)"
                      class="w-8 h-8"
                      :chart-id="`case-donut-chart-${slotProps.item.id}`"
                      :chart-data="{
                        reportedCases: slotProps.item.reported_count || 0,
                        claimedCases:
                          (slotProps.item.claimed_count || 0) -
                          (slotProps.item.closed_count || 0),
                        completedCases: slotProps.item.closed_count || 0,
                      }"
                      :bg-color="styles.backgroundColor"
                      :margin-all="5"
                    />
                    <span
                      v-else
                      class="w-8 h-8 flex items-center justify-center"
                    >
                      0<span class="pew-pew-blue">*</span>
                    </span>
                  </div>
                </template>
              </Table>
              <small
                class="
                  py-1
                  px-8
                  small-font
                  italic
                  leading-3
                  text-center text-black
                  absolute
                  bottom-0
                  ribbon-gradient
                "
              >
                {{ $t('pewPew.org_disclaimer') }}
              </small>
            </div>
            <div class="row-span-5">
              <tabs
                class="relative h-full m-1"
                ref="tabs"
                tab-classes="text-xs"
                tab-default-classes="flex items-center justify-center text-center h-10 cursor-pointer px-2"
                tab-active-classes="bg-crisiscleanup-dark-400 rounded-t-xl"
                @tabSelected="stopChartTabCirculationTimer"
              >
                <LightTab
                  :name="$t('reports.pp_call_volume_title')"
                  :alt="$t('reports.pp_call_volume_description')"
                  class="chart-tab"
                  :selected="
                    chartCirculationTimerData.isTimerActive &&
                    chartCirculationTimerData.activeChartTab === 0
                  "
                >
                  <div class="chart-container rounded-tr-xl">
                    <CircularBarplot
                      v-if="circularBarplotData.length !== 0"
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
                  class="chart-tab"
                  :selected="
                    chartCirculationTimerData.isTimerActive &&
                    chartCirculationTimerData.activeChartTab === 1
                  "
                >
                  <div class="chart-container rounded-t-xl">
                    <TotalCases
                      class="h-full w-full"
                      :margin-all="30"
                      :chart-data="totalCasesChartData"
                    />
                  </div>
                </LightTab>
                <LightTab
                  :name="$t('reports.completion_rate')"
                  class="chart-tab"
                  :selected="
                    chartCirculationTimerData.isTimerActive &&
                    chartCirculationTimerData.activeChartTab === 2
                  "
                >
                  <div class="chart-container rounded-t-xl">
                    <D3BarChart
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
</template>

<script>
import * as L from 'leaflet';
import { Sprite, Texture, Graphics, utils as pixiUtils } from 'pixi.js';
import { orderBy, throttle, shuffle } from 'lodash';
import { colors, templates } from '@/icons/icons_templates';
import { makeTableColumns } from '@/utils/table';
import { nFormatter } from '@/utils/helpers';

import {
  calcWaypoints,
  degreesToRadians,
  findBezierPoints,
  getMarkerLayer,
  getLiveLayer,
  mapAttribution,
  mapTileLayerDark,
  mapTileLayer,
  randomIntFromInterval,
} from '@/utils/map';
import { HomeNavigation } from '@/components/home/SideNav';
import Table from '@/components/Table';
import { getQueryString } from '@/utils/urls';
import Incident from '@/models/Incident';
import Slider from '@/components/Slider';
import DisasterIcon from '@/components/DisasterIcon';
import OrganizationActivityModal from '@/components/OrganizationActivityModal.vue';
import LightTab from '@/components/tabs/LightTab';
import SiteActivityGauge from '@/components/charts/SiteActivityGauge';
import CircularBarplot from '@/components/charts/CircularBarplot';
import D3BarChart from '@/components/charts/D3BarChart';
import CardStack from '@/components/CardStack';
import { getNearestColor } from '@/utils/colors';
import CaseDonutChart from '@/components/charts/CaseDonutChart';
import Toggle from '@/components/Toggle';
import TotalCases from '@/components/charts/TotalCases';
import PewPewNavBar from '@/components/navigation/PewPewNavBar';
import { UserMixin } from '@/mixins';
import UserProfileMenu from '@/components/header/UserProfileMenu';

export default {
  name: 'PewPew',
  mixins: [UserMixin],
  components: {
    UserProfileMenu,
    PewPewNavBar,
    TotalCases,
    Toggle,
    CaseDonutChart,
    CardStack,
    LightTab,
    D3BarChart,
    CircularBarplot,
    SiteActivityGauge,
    Slider,
    DisasterIcon,
    Table,
    OrganizationActivityModal,
  },
  data() {
    return {
      getNearestColor,
      nFormatter,
      eventStreamData: [],
      currentPost: null,
      startTime: new Date(),
      mapLoading: false,
      orgsLoading: false,
      orgInfo: {
        generalInfo: {},
        incidents: [],
        capability: [],
      },
      isOrgActivityModalLoading: false,
      isOrgActivityModalHidden: true,
      markersLength: 0,
      liveEvents: [],
      liveIncidents: [],
      events: {},
      incidents: [],
      organizations: [],
      templates,
      colors,
      map: null,
      isDarkMode: true,
      lastEventTimestamp: null,
      routes: HomeNavigation,
      currentEvent: null,
      currentEventIndex: 0,
      charts: {
        completion: {
          options: null,
          data: null,
        },
      },
      circularBarplotData: [],
      barChartData: [],
      siteInfoTimerData: {
        timerId: null,
        activeInfoTab: 0,
        isTimerActive: true,
      },
      chartCirculationTimerData: {
        timerId: null,
        activeChartTab: 0,
        isTimerActive: true,
      },
      incidentId: null,
      cadence: 2000,
      markerSpeed: 2000,
      incident: null,
      incidentStats: {},
      mapStatistics: [],
      displayedWorkTypes: [],
      displayedWorkTypeSvgs: [],
      orbTexture: null,
      eventsInterval: null,
      statsInterval: null,
      textureMap: {},
      isLegendHidden: false,
      queryFilter: {
        start_date: null,
        end_date: null,
        incident: null,
      },
      currentEngagement: 0,
      currentSiteStats: [],
      throttle,
    };
  },
  created() {
    if (window.screen.width <= 760) {
      this.$router.push('/login');
    }
  },
  async mounted() {
    await this.loadPageData();
    // rotate through d3 chart tabs after every 10 seconds
    this.startTabCirculationTimer(10000);
  },
  methods: {
    async loadPageData() {
      this.incidentId = this.$route.query.incident;

      this.queryFilter.start_date = this.$moment().add(-60, 'days');
      this.queryFilter.end_date = this.$moment();
      this.queryFilter.incident = null;

      if (this.incidentId) {
        await Incident.api().fetchById(this.incidentId);
        this.incident = Incident.find(this.incidentId);
        this.queryFilter.start_date = this.incident.start_at_moment;
        this.queryFilter.incident = this.incidentId;
        this.queryFilter.end_date = this.incident.start_at_moment.add(
          60,
          'days',
        );
        this.setLegend();
      }
      this.orgsLoading = true;

      this.getIncidentStats().then(() => {});
      this.getCompletionRateData().then(() => {});
      this.fetchEngagementData().then(() => {});
      this.fetchSiteStatistics().then(() => {});
      this.getLatestEvents().then(() => {});
      this.fetchCircularBarplotData(this.$moment(), 30).then(() => {});
      this.getRecentIncidents().then((incidents) => {
        this.incidents = incidents;
      });
      this.getOrganizations().then((organizations) => {
        this.organizations = shuffle(organizations);
        this.orgsLoading = false;
      });
      this.getAllEvents().then((markers) => {
        this.loadMap(markers).then(() => {
          this.generatePoints();
        });
      });
      const svg = templates.orb
        .replace('{{fillColor}}', '#61D5F8')
        .replace('{{strokeColor}}', 'black');
      this.orbTexture = Texture.from(svg);
    },
    async clearMap() {
      this.map.eachLayer((layer) => {
        if (layer.key === 'marker_layer' || layer.key === 'live_layer') {
          this.map.removeLayer(layer);
        }
      });
    },
    removeLayer(key) {
      this.map.eachLayer((layer) => {
        if (layer.key === key) {
          this.map.removeLayer(layer);
        }
      });
    },
    setLegend(createdWorkTypes) {
      const workTypes = createdWorkTypes || this.incident.created_work_types;
      this.displayedWorkTypeSvgs = workTypes.map((workType) => {
        const template = templates[workType] || templates.unknown;
        const svg = template
          .replace('{{fillColor}}', '#61D5F8')
          .replace('{{strokeColor}}', 'black')
          .replace('{{multiple}}', '');
        return {
          svg,
          key: workType,
          selected: false,
        };
      });
    },
    async fetchEngagementData() {
      const { start_date, end_date, incident } = this.queryFilter;
      const params = {
        start_date: start_date.format('YYYY-MM-DD'),
        end_date: end_date.format('YYYY-MM-DD'),
      };
      if (incident) {
        params.incident = incident;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/pp_engagement?${queryString}`,
      );
      if (response.data.length) {
        this.currentEngagement = response.data[0].three_day_velocity * 100;
      }
    },
    formatStatValue(value) {
      return Number(value).toFixed(0);
    },
    countUpStats() {
      this.currentSiteStats.forEach((stat) => {
        stat.value += stat.change_per_second;
      });
    },
    async fetchSiteStatistics() {
      clearInterval(this.statsInterval);
      this.statsInterval = null;

      const { incident } = this.queryFilter;
      const params = {};
      if (incident) {
        params.incident = incident;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/pp_site_stats?${queryString}`,
      );
      if (response.data.length) {
        this.currentSiteStats = response.data;
        this.statsInterval = setInterval(this.countUpStats, 1000);
      }
    },
    async fetchCircularBarplotData(date, interval) {
      const { incident } = this.queryFilter;
      this.circularBarplotData = [];
      this.circularBarplotData = this.circularBarplotData.slice();
      const d = date.format('YYYY-MM-DD');

      const params = {
        date: d,
        interval,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      if (incident) {
        params.incident = incident;
      }
      const queryString = getQueryString(params);
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/daily_calls?${queryString}`,
      );
      this.circularBarplotData = response.data;
      this.circularBarplotData = this.circularBarplotData.slice();
    },
    // timer handler functions for circulating through site info tabs
    startSiteInfoTabCirculationTimer(ms) {
      const totalTabs = 2;
      this.siteInfoTimerData.timerId = setInterval(() => {
        this.siteInfoTimerData.activeInfoTab =
          (this.siteInfoTimerData.activeInfoTab + 1) % totalTabs;
      }, ms);
    },
    stopSiteInfoTabCirculationTimer() {
      if (this.siteInfoTimerData.isTimerActive) {
        clearInterval(this.siteInfoTimerData.timerId);
        this.siteInfoTimerData.isTimerActive = false;
      }
    },
    // timer handler functions for circulating through d3 charts
    startTabCirculationTimer(ms) {
      const totalTabs = 3; // total tabs present inside tabs component
      this.chartCirculationTimerData.timerId = setInterval(() => {
        this.chartCirculationTimerData.activeChartTab =
          (this.chartCirculationTimerData.activeChartTab + 1) % totalTabs;
      }, ms);
    },
    stopChartTabCirculationTimer() {
      if (this.chartCirculationTimerData.isTimerActive) {
        clearInterval(this.chartCirculationTimerData.timerId);
        this.chartCirculationTimerData.isTimerActive = false;
      }
    },
    isCaseDonutChartDataEmpty(data) {
      // check if chart data is 0 for all sections
      return (
        (data.reported_count || 0) <= 0 &&
        (data.claimed_count || 0) - (data.closed_count || 0) <= 0 &&
        (data.closed_count || 0) <= 0
      );
    },
    async getRecentIncidents() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/incidents?fields=id,name,short_name,geofence,locations,incident_type,color,turn_on_release&limit=8&sort=-start_at`,
      );
      const { results } = response.data;
      return results;
    },
    async getOrganizations() {
      const { incident } = this.queryFilter;
      const params = {
        start_date: this.$moment().add(-120, 'days').format('YYYY-MM-DD'),
        end_date: this.$moment().format('YYYY-MM-DD'),
      };
      if (incident) {
        params.incident = incident;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/organization_statistics?${queryString}`,
      );
      return response.data;
    },

    async getOrganization(organization_id) {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/organizations/${organization_id}`,
        {
          headers: {
            Authorization: null,
          },
        },
      );
      return response.data;
    },
    async getOrganizationCapabilities(organization_id) {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/organization_organizations_capabilities?organization=${organization_id}&limit=200`,
      );
      return response.data.results;
    },
    async getOrganizationStatisticsByIncident(organization_id) {
      const { start_date, end_date } = this.queryFilter;
      const params = {
        start_date: start_date.format('YYYY-MM-DD'),
        end_date: end_date.format('YYYY-MM-DD'),
        organization: organization_id,
      };
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/organization_incident_statistics?${queryString}`,
      );
      return response.data;
    },
    async loadMap(markers) {
      if (!this.map) {
        this.map = L.map('map', {
          zoomControl: false,
        }).fitBounds([
          [17.644022027872726, -122.78314470293876],
          [50.792047064406866, -69.87298845293874],
        ]);
      }

      this.darkTileLayer = L.tileLayer(mapTileLayerDark, {
        // tileSize: 512,
        // zoomOffset: -1,
        attribution: mapAttribution,
        detectRetina: false,
        maxZoom: 18,
        noWrap: false,
      });

      this.lightTileLayer = L.tileLayer(mapTileLayer, {
        // tileSize: 512,
        // zoomOffset: -1,
        attribution: mapAttribution,
        detectRetina: false,
        maxZoom: 18,
        noWrap: false,
      });
      this.setLayer();

      this.mapLoading = true;
      await this.renderMap(markers);
      this.$nextTick(() => {
        this.map.panBy([0, 0]);
      });

      this.mapLoading = false;
    },
    async getAllEvents() {
      if (this.queryFilter.incident) {
        const params = {
          limit: 60000,
          event_key__in: Object.keys(this.events).join(','),
          sort: 'created_at',
          incident_id: this.queryFilter.incident || '',
          created_at__gte: this.queryFilter.start_date.toISOString(),
          created_at__lte: this.queryFilter.end_date.toISOString(),
        };
        const queryString = getQueryString(params);
        const response = await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/all_events?${queryString}`,
        );
        return response.data.results;
      }
      const params = {
        sort: '-created_at',
      };
      const queryString = getQueryString(params);
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/recent_events?${queryString}`,
      );
      return response.data;
    },
    async getLatestEvents() {
      const params = {
        limit: 100,
        sort: '-created_at',
        incident_id: this.queryFilter.incident || '',
      };

      if (this.lastEventTimestamp) {
        params.created_at__gte = this.lastEventTimestamp;
      }

      const queryString = getQueryString(params);
      this.lastEventTimestamp = this.$moment().toISOString();
      const { data } = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/live_events?${queryString}`,
      );
      const liveEvents = [...data.results];
      liveEvents.reverse();
      this.liveEvents = liveEvents;
    },

    async renderMap(markers) {
      const { map } = this;
      this.events = {
        user_create_worksite: true,
      };

      this.markersLength = markers.length;
      this.removeLayer('worksite_layer');
      const worksiteLayer = getMarkerLayer([], map, this);
      worksiteLayer.addTo(map);

      // Initial Draw
      for (let i = 0; i < markers.length; i++) {
        try {
          this.addMarker(markers[i], i);
        } catch (e) {
          this.$log.error(
            `Could not add marker for ${JSON.stringify(markers[i])}`,
          );
          this.$log.error(e);
        }
      }

      const displayedWorkTypes = new Set(this.displayedWorkTypes);
      this.setLegend(Array.from(displayedWorkTypes));

      worksiteLayer._renderer.render(worksiteLayer._pixiContainer);
      worksiteLayer.redraw();

      // Last 2 hours
      this.removeLayer('live_layer');
      const liveLayer = getLiveLayer();
      liveLayer.addTo(map);

      map.attributionControl.setPosition('bottomright');
    },
    createCurve(actorMarkerSprite, patientMarkerSprite) {
      const x1 = actorMarkerSprite.x; // in pixels
      const y1 = actorMarkerSprite.y;
      const x2 = patientMarkerSprite.x;
      const y2 = patientMarkerSprite.y;
      const ang1 = degreesToRadians(randomIntFromInterval(30, 45)); // in radians
      const ang2 = degreesToRadians(randomIntFromInterval(45, 60));

      const len = Math.hypot(x2 - x1, y2 - y1);
      const ax1 = Math.cos(ang1) * len * (1 / randomIntFromInterval(2, 5));
      const ay1 = Math.sin(ang1) * len * (1 / randomIntFromInterval(2, 5));

      const ax2 = Math.cos(ang2) * len * (1 / randomIntFromInterval(2, 5));
      const ay2 = Math.sin(ang2) * len * (1 / randomIntFromInterval(2, 5));
      const linksGraphics = new Graphics();
      linksGraphics.x1 = x1;
      linksGraphics.y1 = y1;
      linksGraphics.bezierParams = [
        x1 + ax1,
        y1 + ay1,
        x2 - ax2,
        y2 - ay2,
        x2,
        y2,
      ];
      linksGraphics.type = 'line';
      linksGraphics.lineStyle(
        15,
        pixiUtils.string2hex(patientMarkerSprite.color),
      );
      linksGraphics.color = patientMarkerSprite.color;
      linksGraphics.workTypeKey = patientMarkerSprite.workTypeKey;
      linksGraphics.visible = this.getMarkerVisibility(linksGraphics);
      linksGraphics.moveTo(x1, y1);
      linksGraphics.bezierCurveTo(...linksGraphics.bezierParams);
      linksGraphics.wayPoints = findBezierPoints([
        { x: actorMarkerSprite.x, y: actorMarkerSprite.y },
        { x: x1 + ax1, y: y1 + ay1 },
        { x: x1 + ax1, y: y1 + ay1 },
        { x: patientMarkerSprite.x, y: patientMarkerSprite.y },
      ]);
      linksGraphics.currentPoint = 0;
      return linksGraphics;
    },
    createLine(actorMarkerSprite, patientMarkerSprite) {
      const linksGraphics = new Graphics();
      const midX = (actorMarkerSprite.x + patientMarkerSprite.x) / 2;
      const midY = (actorMarkerSprite.y + patientMarkerSprite.y) / 2;
      linksGraphics.moveTo(actorMarkerSprite.x, actorMarkerSprite.y);
      linksGraphics.lineTo(patientMarkerSprite.x, patientMarkerSprite.y);
      linksGraphics.from = [actorMarkerSprite.x, actorMarkerSprite.y];
      linksGraphics.to = [patientMarkerSprite.x, patientMarkerSprite.y];
      linksGraphics.mid = [midX, midY];
      linksGraphics.type = 'line';
      linksGraphics.wayPoints = calcWaypoints([
        actorMarkerSprite,
        patientMarkerSprite,
      ]);
      linksGraphics.color = patientMarkerSprite.color;
      linksGraphics.workTypeKey = patientMarkerSprite.workTypeKey;
      linksGraphics.currentPoint = 0;
      return linksGraphics;
    },
    getMarkerVisibility(sprite) {
      let visible = true;
      if (!this.visibleWorkTypes) {
        return true;
      }
      if (
        this.visibleWorkTypes &&
        this.visibleWorkTypes.indexOf(sprite.workTypeKey) !== -1
      ) {
        visible = true;
      } else {
        visible = false;
      }
      return visible;
    },
    refresh() {
      this.map.eachLayer((layer) => {
        if (layer.key === 'marker_layer' || layer.key === 'live_layer') {
          const container = layer._pixiContainer;
          container.children.forEach((markerSprite) => {
            markerSprite.visible = this.getMarkerVisibility(markerSprite);
          });

          layer._renderer.render(container);
          layer.redraw();
        }
      });
    },
    refreshTimeline(index) {
      this.map.eachLayer((layer) => {
        if (layer.key === 'marker_layer' || layer.key === 'live_layer') {
          const container = layer._pixiContainer;
          container.children.forEach((markerSprite) => {
            markerSprite.visible = markerSprite.index <= index;
          });

          layer._renderer.render(container);
          layer.redraw();
        }
      });
    },
    refreshSvi(value) {
      this.map.eachLayer((layer) => {
        if (layer.key === 'marker_layer' || layer.key === 'live_layer') {
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
          const count = Math.floor((sviList.length * Number(value)) / 100);
          const filteredSvi = sviList.slice(0, count);
          const minSvi = filteredSvi[filteredSvi.length - 1].svi;
          container.children.forEach((markerSprite) => {
            markerSprite.visible = markerSprite.svi > minSvi;
          });

          layer._renderer.render(container);
          layer.redraw();
        }
      });
    },
    addMarker(marker, index) {
      this.map.eachLayer((layer) => {
        if (layer.key === 'marker_layer') {
          const markerTemplate = templates.circle;
          let patientMarkerSprite = null;
          if (
            marker.recipient_blurred_location ||
            marker.patient_blurred_location
          ) {
            const location =
              marker[`${marker.map_destination}_blurred_location`];
            const patientCoords = layer.utils.latLngToLayerPoint([
              location.coordinates[1],
              location.coordinates[0],
            ]);

            const address =
              marker.attr[`${marker.map_destination}_redacted_address`];

            const wwtsp = marker.attr[`${marker.map_destination}_wwtsp`];
            let color = '#d0021b';
            let strokeColor = '#e30001';
            let workTypeKey = null;
            if (wwtsp && wwtsp.length > 0) {
              const workType = orderBy(
                wwtsp,
                ['commercial_value'],
                ['desc'],
              )[0];
              workTypeKey = workType.work_type_key;
              const colorsKey = `${workType.status}_${
                workType.claimed_by ? 'claimed' : 'unclaimed'
              }`;
              // const worksiteTemplate = templates.circle;
              const spriteColors = colors[colorsKey];
              color = spriteColors.fillColor;
              strokeColor = spriteColors.strokeColor;
              this.displayedWorkTypes.push(workTypeKey);
            } else if (
              marker.attr.recipient_status ||
              marker.attr.patient_status
            ) {
              const statusProp =
                marker.attr[`${marker.map_destination}_status`];
              const claimed = marker.attr[
                `${marker.map_destination}_claimed_by`
              ]
                ? 'claimed'
                : 'unclaimed';
              const colorsKey = `${statusProp}_${claimed}`;
              const spriteColors = colors[colorsKey];
              color = spriteColors.fillColor;
              strokeColor = spriteColors.strokeColor;
              workTypeKey =
                marker.attr[`${marker.map_destination}_work_type_key`];
              this.displayedWorkTypes.push(workTypeKey);
            }

            patientMarkerSprite = new Sprite();
            patientMarkerSprite.index = index;
            patientMarkerSprite.id = marker.id;
            patientMarkerSprite.x = patientCoords.x;
            patientMarkerSprite.y = patientCoords.y;
            patientMarkerSprite.x0 = patientCoords.x;
            patientMarkerSprite.y0 = patientCoords.y;
            patientMarkerSprite.interactive = false;
            patientMarkerSprite.anchor.set(0.5, 0.5);
            const svg = markerTemplate
              .replace('{{fillColor}}', color)
              .replace('{{strokeColor}}', 'black');
            let texture = this.textureMap[color];
            if (!texture) {
              this.textureMap[color] = Texture.from(svg);
              texture = this.textureMap[color];
            }
            patientMarkerSprite.texture = texture;
            patientMarkerSprite.visible = true;
            patientMarkerSprite.color = color;
            patientMarkerSprite.strokeColor = strokeColor;
            patientMarkerSprite.workTypeKey = workTypeKey;
            patientMarkerSprite.type = 'patient';
            if (address) {
              patientMarkerSprite.svi = Number(address.svi);
            }

            const detailedTemplate =
              templates[workTypeKey] || templates.unknown;
            const typeSvg = detailedTemplate
              .replace('{{fillColor}}', color)
              .replace('{{strokeColor}}', 'black');

            patientMarkerSprite.basicTexture = texture;
            patientMarkerSprite.detailedTexture = Texture.from(typeSvg);

            layer._pixiContainer.addChild(patientMarkerSprite);
          }
        }
      });
    },
    restartLiveEvents: throttle(
      async function () {
        this.$log.debug('restarting live events');
        if (this.liveEvents.length === 0) {
          return this.restartLiveEvents();
        }
        this.currentEventIndex = 0;
        await this.getLatestEvents();
        this.removeLayer('live_layer');
        const liveLayer = getLiveLayer();
        liveLayer.addTo(this.map);
        // this.$refs.cards.clearCards();
        this.markerSpeed =
          Number(100 / this.liveEvents.length).toFixed(0) * this.cadence;
        this.generatePoints();
        return undefined;
      },
      5000,
      { trailing: false },
    ),
    async generateMarker() {
      this.map.eachLayer(async (layer) => {
        if (layer.key === 'live_layer') {
          this.currentEventIndex++;
          const marker = this.liveEvents[this.currentEventIndex];

          if (this.currentEventIndex > this.liveEvents.length) {
            await this.restartLiveEvents();
            return;
          }

          if (!marker) {
            layer._renderer.render(layer._pixiContainer);
            layer.redraw();
            return;
          }
          const card = {
            classes: 'border w-full h-32 rounded my-2',
            event: marker,
          };
          if (
            this.liveIncidents.length === 0 ||
            (this.liveIncidents[0].name !== marker.attr.incident_name &&
              marker.attr.incident_name)
          ) {
            this.liveIncidents.unshift({
              name: marker.attr.incident_name,
              key: marker.id,
            });
          }
          const markerTemplate = templates.circle;
          let actorMarkerSprite = null;
          let patientMarkerSprite = null;
          if (marker.actor_blurred_location) {
            const actorCoords = layer.utils.latLngToLayerPoint([
              marker.actor_blurred_location.coordinates[1],
              marker.actor_blurred_location.coordinates[0],
            ]);

            const isOrg = (element) =>
              element.name === marker.attr.actor_organization_name;

            const index = this.organizations.findIndex(isOrg);
            if (index !== -1) {
              this.organizations.unshift(
                this.organizations.splice(index, 1)[0],
              );
            }

            actorMarkerSprite = new Sprite();
            actorMarkerSprite.x = actorCoords.x;
            actorMarkerSprite.y = actorCoords.y;
            actorMarkerSprite.x0 = actorCoords.x;
            actorMarkerSprite.y0 = actorCoords.y;
            actorMarkerSprite.interactive = false;
            actorMarkerSprite.anchor.set(0.5, 0.5);
            actorMarkerSprite.type = 'actor';
            actorMarkerSprite.live = true;
            actorMarkerSprite.texture = this.orbTexture;
            actorMarkerSprite.visible = true;
            card.color = '#61D5F8';
            card.strokeColor = '#61D5F8';
            layer._pixiContainer.addChild(actorMarkerSprite);
          }

          if (
            marker.recipient_blurred_location ||
            marker.patient_blurred_location
          ) {
            const location =
              marker[`${marker.map_destination}_blurred_location`];
            const patientCoords = layer.utils.latLngToLayerPoint([
              location.coordinates[1],
              location.coordinates[0],
            ]);

            const wwtsp = marker.attr[`${marker.map_destination}_wwtsp`];
            let color = '#61D5F8';
            let strokeColor = '#61D5F8';
            let workTypeKey = null;
            card.color = color;
            card.strokeColor = strokeColor;

            if (wwtsp && wwtsp.length > 0) {
              const workType = orderBy(
                wwtsp,
                ['commercial_value'],
                ['desc'],
              )[0];
              workTypeKey = workType.work_type_key;
              const colorsKey = `${workType.status}_${
                workType.claimed_by ? 'claimed' : 'unclaimed'
              }`;
              // const worksiteTemplate = templates.circle;
              const spriteColors = colors[colorsKey];
              color = spriteColors.fillColor;
              strokeColor = spriteColors.strokeColor;
              card.color = color;
              card.strokeColor = strokeColor;
            } else if (
              marker.attr.recipient_status ||
              marker.attr.patient_status
            ) {
              const statusProp =
                marker.attr[`${marker.map_destination}_status`];
              const claimed = marker.attr[
                `${marker.map_destination}_claimed_by`
              ]
                ? 'claimed'
                : 'unclaimed';
              const colorsKey = `${statusProp}_${claimed}`;
              const spriteColors = colors[colorsKey];
              color = spriteColors.fillColor;
              strokeColor = spriteColors.strokeColor;
              workTypeKey =
                marker.attr[`${marker.map_destination}_work_type_key`];
              card.color = color;
              card.strokeColor = strokeColor;
            }

            patientMarkerSprite = new Sprite();
            patientMarkerSprite.x = patientCoords.x;
            patientMarkerSprite.y = patientCoords.y;
            patientMarkerSprite.x0 = patientCoords.x;
            patientMarkerSprite.y0 = patientCoords.y;
            patientMarkerSprite.interactive = false;
            patientMarkerSprite.anchor.set(0.5, 0.5);
            patientMarkerSprite.live = true;
            const svg = markerTemplate
              .replace('{{fillColor}}', color)
              .replace('{{strokeColor}}', 'black');
            let texture = this.textureMap[color];
            if (!texture) {
              this.textureMap[color] = Texture.from(svg);
              texture = this.textureMap[color];
            }
            patientMarkerSprite.texture = texture;
            patientMarkerSprite.visible = true;
            patientMarkerSprite.color = color;
            patientMarkerSprite.strokeColor = strokeColor;
            patientMarkerSprite.workTypeKey = workTypeKey;
            patientMarkerSprite.type = 'patient';

            const detailedTemplate =
              templates[workTypeKey] || templates.unknown;
            const typeSvg = detailedTemplate
              .replace('{{fillColor}}', color)
              .replace('{{strokeColor}}', 'black');

            patientMarkerSprite.basicTexture = texture;
            patientMarkerSprite.detailedTexture = Texture.from(typeSvg);

            layer._pixiContainer.addChild(patientMarkerSprite);
          }
          this.$refs.cards.addCardComponent(card);

          layer._renderer.render(layer._pixiContainer);
          layer.redraw();

          if (actorMarkerSprite && patientMarkerSprite) {
            const linksGraphics = this.createCurve(
              actorMarkerSprite,
              patientMarkerSprite,
            );
            linksGraphics.live = true;
            actorMarkerSprite.workTypeKey = patientMarkerSprite.workTypeKey;
            actorMarkerSprite.visible =
              this.getMarkerVisibility(actorMarkerSprite);
            patientMarkerSprite.visible =
              this.getMarkerVisibility(patientMarkerSprite);
            setTimeout(() => {
              layer._pixiContainer.addChild(linksGraphics);
              layer._renderer.render(layer._pixiContainer);
              layer.redraw();
            }, 50);
          }
        }
      });
    },
    generatePoints() {
      clearInterval(this.eventsInterval);
      this.eventsInterval = setInterval(this.generateMarker, this.markerSpeed);
    },
    pauseGeneratePoints() {
      clearInterval(this.eventsInterval);
      this.eventsInterval = null;
    },
    async getCompletionRateData() {
      const { start_date, end_date, incident } = this.queryFilter;
      const params = {
        start_date: start_date.format('YYYY-MM-DD'),
        end_date: end_date.format('YYYY-MM-DD'),
      };
      if (incident) {
        params.incident = incident;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/completion_rate?${queryString}`,
      );
      const chart = response.data;

      const options = {
        tooltips: {
          displayColors: true,
          callbacks: {
            mode: 'x',
          },
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              offset: true,
              distribution: 'series',
              bounds: 'data',
              time: {
                unit: 'day',
                stepSize: 1,
                tooltipFormat: 'YYYY-MM-DD',
                displayFormats: {
                  day: 'D',
                },
              },
              ticks: {
                source: 'data',
              },
              stacked: true,
              gridLines: {
                display: false,
              },
              categoryPercentage: 1.0,
              barPercentage: 1.0,
            },
          ],
          yAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
              },
              type: 'linear',
            },
          ],
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: 'bottom' },
      };
      const data = {
        labels: chart.labels,
        datasets: [
          {
            ...chart.datasets[0],
            backgroundColor: 'green',
            borderColor: '#dadada',
            borderWidth: 0.25,
            barPercentage: 0.3,
          },
          {
            ...chart.datasets[1],
            backgroundColor: 'red',
            borderWidth: 0.25,
            borderColor: '#dadada',
            barPercentage: 0.3,
          },
        ],
      };
      // return { options, data };
      this.charts.completion.options = options;
      this.charts.completion.data = data;

      this.barChartData = chart.labels.map((item, index) => {
        return {
          group: item,
          newCases: chart.datasets[0].data[index],
          closedCases: chart.datasets[1].data[index],
        };
      });
    },
    async getIncidentStats() {
      const { start_date, incident } = this.queryFilter;
      const params = {
        start_date: start_date.format('YYYY-MM-DD'),
        end_date: this.$moment().format('YYYY-MM-DD'),
      };
      if (incident) {
        params.incident = incident;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/worksite_statistics?${queryString}`,
      );
      this.incidentStats = response.data;
      const mapStatisticsColors = [
        '#ffffff',
        '#d0021b',
        '#fab92e',
        '#f0f032',
        '#0054bb',
        '#0fa355',
        '#d3d3d3',
      ];
      this.mapStatistics = [
        {
          name: 'All Cases',
          color: mapStatisticsColors[0],
          count: this.incidentStats.all.total,
          style: `border-color: ${mapStatisticsColors[0]}`,
          title: this.$t('pewPew.all_cases'),
        },
        {
          name: 'Unclaimed',
          color: mapStatisticsColors[1],
          count: this.incidentStats.unclaimed.total,
          style: `border-color: ${mapStatisticsColors[1]}`,
          title: this.$t('pewPew.unclaimed'),
        },
        {
          name: 'Claimed',
          color: mapStatisticsColors[2],
          count: this.incidentStats.claimed.total,
          style: `border-color: ${mapStatisticsColors[2]}`,
          title: this.$t('pewPew.claimed'),
        },
        {
          name: 'In Progress',
          color: mapStatisticsColors[3],
          count: this.incidentStats.assigned.total,
          style: `border-color: ${mapStatisticsColors[3]}`,
          title: this.$t('pewPew.in_progress'),
        },
        {
          name: 'Partly Done',
          color: mapStatisticsColors[4],
          count: this.incidentStats.partial.total,
          style: `border-color: ${mapStatisticsColors[4]}`,
          title: this.$t('pewPew.partly_done'),
        },
        {
          name: 'Closed',
          color: mapStatisticsColors[5],
          count: this.incidentStats.closed.total,
          style: `border-color: ${mapStatisticsColors[5]}`,
          title: this.$t('pewPew.closed'),
        },
        {
          name: 'Overdue',
          color: mapStatisticsColors[6],
          count: this.incidentStats.overdue.total,
          style: `border: none`,
          title: this.$t('pewPew.overdue'),
        },
        {
          name: 'Total Orgs',
          color: mapStatisticsColors[6],
          count: this.organizations.length,
          style: `border: none`,
          title: this.$t('pewPew.total_orgs'),
        },
        {
          name: 'Counties Parishes',
          color: mapStatisticsColors[6],
          count: 0,
          style: `border: none`,
          title: this.$t('pewPew.counties_parishes'),
        },
        {
          name: 'Volunteers',
          color: mapStatisticsColors[6],
          count: 0,
          style: `border: none`,
          title: this.$t('pewPew.volunteers'),
        },
        {
          name: 'Households',
          color: mapStatisticsColors[6],
          count: 0,
          style: `border: none`,
          title: this.$t('pewPew.households'),
        },
      ];
    },
    setLayer() {
      if (this.colorMode === 'dark') {
        this.map.addLayer(this.darkTileLayer);
        this.map.removeLayer(this.lightTileLayer);
      } else {
        this.map.addLayer(this.lightTileLayer);
        this.map.removeLayer(this.darkTileLayer);
      }
    },
    async onRowClick(item) {
      this.isOrgActivityModalLoading = true;
      const organization = await this.getOrganization(item.id);
      this.orgInfo.generalInfo = item;
      this.orgInfo.generalInfo.avatar = this.getLogoUrl(item);
      this.orgInfo.generalInfo.organization = organization;
      this.isOrgActivityModalHidden = false;

      // fetch statistics object and convert it into array
      this.orgInfo.generalInfo.capabilities = Object.values(
        await this.getOrganizationCapabilities(item.id),
      );

      // fetch capabilities object and convert it into array
      this.orgInfo.generalInfo.statistics = Object.values(
        await this.getOrganizationStatisticsByIncident(item.id),
      );
      this.isOrgActivityModalLoading = false;
    },
    getLogoUrl(organization) {
      if (organization.files.length) {
        const logos = organization.files.filter(
          (file) => file.file_type_t === 'fileTypes.logo',
        );
        if (logos.length) {
          return logos[0].small_thumbnail_url;
        }
      }
      return require('@/assets/icons/earth-globe.svg');
    },
  },
  computed: {
    colorMode() {
      return this.isDarkMode ? 'dark' : 'light';
    },
    colorModeText() {
      return this.isDarkMode
        ? this.$t('pewPew.dark_mode')
        : this.$t('pewPew.light_mode');
    },
    visibleWorkTypes() {
      const selectedWorkTypes = this.displayedWorkTypeSvgs
        .filter((s) => s.selected)
        .map((s) => s.key);
      if (selectedWorkTypes.length > 0) {
        return selectedWorkTypes;
      }
      return null;
    },
    styles() {
      if (this.colorMode === 'dark') {
        return {
          color: 'white',
          backgroundColor: '#232323',
        };
      }
      return {
        color: '#232323',
        backgroundColor: 'white',
      };
    },
    overlayStyles() {
      if (this.colorMode === 'dark') {
        return {
          color: 'white',
          backgroundColor: '#242C36',
        };
      }
      return {
        color: '#232323',
        backgroundColor: 'white',
      };
    },
    orgTable() {
      const columns = makeTableColumns([
        ['name', '30%', 'Organization'],
        ['incident_count', '15%', 'Incidents'],
        ['reported_count', '15%', 'Cases'],
        ['calls_count', '15%', 'Calls'],
        ['commercial_value', '15%', 'Value'],
      ]);
      columns.forEach((column) => {
        // overwrite default column title from `Name` to `Organization`
        if (column.key === 'name') {
          column.title = 'Organization';
        }
        column.titleClass = 'small-font';
        column.class = 'small-font text-center';
        column.style = {
          border: 0,
        };
        column.headerStyle = {
          border: 0,
        };
      });
      return {
        columns,
      };
    },
    totalCasesChartData() {
      return this.mapStatistics.filter((stat) => stat.name !== 'All Cases');
    },
  },
  watch: {
    '$route.query.incident': {
      handler(value) {
        this.incident = null;
        this.incidentId = value;
        this.liveIncidents = [];
        this.lastEventTimestamp = null;
        this.clearMap();
        this.loadPageData();
      },
      deep: true,
      immediate: false,
    },
  },
};
</script>

<style lang="postcss">
@import '~leaflet/dist/leaflet.css';

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
  @apply flex items-center justify-center h-12 cursor-pointer;
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
