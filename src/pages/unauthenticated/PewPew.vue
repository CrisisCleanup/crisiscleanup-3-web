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
        <div class="pewpew__nav">
          <router-link :to="{ name: 'nav.pew' }" class="pewpew__navheader">
            <img
              v-if="colorMode === 'dark'"
              src="@/assets/cc-pew-pew-logo.gif"
              :alt="$t('nav.crisis_cleanup')"
              class="h-8"
            />
            <img
              v-else
              src="@/assets/ccu-logo-black-500w.png"
              :alt="$t('nav.crisis_cleanup')"
              class="h-16"
            />
          </router-link>

          <router-link :to="{ name: 'nav.dashboard' }" class="pewpew__navlink">
            <img src="@/assets/icons/home.svg" :alt="$t('publicNav.home')" />
            {{ $t('publicNav.home') }}
          </router-link>

          <router-link :to="{ name: 'nav.dashboard' }" class="pewpew__navlink">
            <img
              src="@/assets/icons/current-disaster.svg"
              :alt="$t('publicNav.current_disasters')"
            />
            {{ $t('publicNav.current_disasters') }}
          </router-link>

          <router-link :to="{ name: 'nav.about' }" class="pewpew__navlink">
            <img
              src="@/assets/icons/about-us.svg"
              :alt="$t('publicNav.about_us')"
            />
            {{ $t('publicNav.about_us') }}
          </router-link>

          <a
            href="https://crisiscleanup.zendesk.com/hc/en-us/requests/new"
            class="pewpew__navlink"
          >
            <img
              src="@/assets/icons/contact-us.svg"
              :alt="$t('publicNav.contact')"
            />
            {{ $t('publicNav.contact') }}
          </a>

          <router-link :to="{ name: 'nav.training' }" class="pewpew__navlink">
            <img
              src="@/assets/icons/training.svg"
              :alt="$t('publicNav.training')"
            />
            {{ $t('publicNav.training') }}
          </router-link>

          <a href="http://blog.crisiscleanup.org" class="pewpew__navlink">
            <img src="@/assets/icons/notepad.svg" :alt="$t('publicNav.blog')" />
            {{ $t('publicNav.blog') }}
          </a>

          <router-link :to="{ name: 'nav.terms' }" class="pewpew__navlink">
            <img src="@/assets/icons/terms.svg" :alt="$t('publicNav.terms')" />
            {{ $t('publicNav.terms') }}
          </router-link>

          <router-link :to="{ name: 'nav.privacy' }" class="pewpew__navlink">
            <img
              src="@/assets/icons/privacy-policy.svg"
              :alt="$t('publicNav.privacy')"
            />
            {{ $t('publicNav.privacy') }}
          </router-link>

          <router-link :to="{ name: 'nav.about' }" class="pewpew__navlink">
            <img src="@/assets/icons/faq.svg" :alt="$t('publicNav.faq')" />
            {{ $t('publicNav.faq') }}
          </router-link>
        </div>
        <div class="col-span-6 flex flex-col justify-between items-center">
          <tabs
            class="relative h-full w-full px-1 mt-10"
            ref="tabs"
            tab-classes="text-xs"
            tab-default-classes="flex items-center justify-center h-8 cursor-pointer px-2"
            tab-active-classes="bg-gradient-to-t from-crisiscleanup-dark-500 to-crisiscleanup-dark-400 rounded-t-xl"
            @tabSelected="stopSiteInfoTabCirculationTimer"
          >
            <LightTab
              :name="$t('Live')"
              :selected="
                siteInfoTimerData.isTimerActive &&
                siteInfoTimerData.activeInfoTab === 0
              "
            >
              <div :name="$t('reports.pp_engagement_title')" class="w-full">
                <div class="text-xs px-5 text-center">
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
              <div class="h-full p-2 w-full" v-if="liveEvents.length > 0">
                <CardStack ref="cards" :key="incidentId" />
              </div>
            </LightTab>
            <LightTab
              :name="$t('reports.pp_site_stats_title')"
              class="p-2"
              :selected="
                siteInfoTimerData.isTimerActive &&
                siteInfoTimerData.activeInfoTab === 1
              "
            >
              <div class="flex flex-col items-start justify-start w-full">
                <div class="">
                  <div class="mb-2">
                    <div>
                      {{ $t('reports.pp_site_stats_total_services') }}
                      <ccu-icon
                        v-tooltip="{
                          content: $t(`reports.pp_site_stats_total_services_d`),
                          trigger: 'click',
                          classes: 'interactive-tooltip w-auto',
                        }"
                        :alt="$t('actions.help_alt')"
                        type="help"
                        size="medium"
                      />
                    </div>
                    <div class="text-xl text-blue-600 stats">
                      ***$1.1 Billion
                    </div>
                  </div>
                  <div class="mb-2">
                    <div>
                      {{ $t('reports.pp_site_stats_disasters') }}
                      <ccu-icon
                        v-tooltip="{
                          content: $t(`reports.pp_site_stats_disasters_d`),
                          trigger: 'click',
                          classes: 'interactive-tooltip w-auto',
                        }"
                        :alt="$t('actions.help_alt')"
                        type="help"
                        size="medium"
                      />
                    </div>
                    <div class="text-lg stats">***170</div>
                  </div>
                  <div class="mb-2">
                    <div>
                      {{ $t('reports.pp_site_stats_est_hours') }}
                      <ccu-icon
                        v-tooltip="{
                          content: $t(`reports.pp_site_stats_est_hours_d`),
                          trigger: 'click',
                          classes: 'interactive-tooltip w-auto',
                        }"
                        :alt="$t('actions.help_alt')"
                        type="help"
                        size="medium"
                      />
                    </div>
                    <div class="text-lg stats">***7.3 Million</div>
                  </div>
                  <div class="mb-2">
                    <div>
                      {{ $t('reports.pp_site_stats_households_helped') }}
                      <ccu-icon
                        v-tooltip="{
                          content: $t(
                            `reports.pp_site_stats_households_helped_d`,
                          ),
                          trigger: 'click',
                          classes: 'interactive-tooltip w-auto',
                        }"
                        :alt="$t('actions.help_alt')"
                        type="help"
                        size="medium"
                      />
                    </div>
                    <div class="text-lg stats">***142,921</div>
                  </div>
                  <div class="mb-2">
                    <div>
                      {{ $t('reports.pp_site_stats_volunteer_value') }}
                      <ccu-icon
                        v-tooltip="{
                          content: $t(
                            `reports.pp_site_stats_volunteer_value_d`,
                          ),
                          trigger: 'click',
                          classes: 'interactive-tooltip w-auto',
                        }"
                        :alt="$t('actions.help_alt')"
                        type="help"
                        size="medium"
                      />
                    </div>
                    <div class="text-lg stats">***$849</div>
                  </div>
                  <div class="underline text-blue-600">
                    {{ $t('reports.pp_site_stats_more_stats') }}
                  </div>
                </div>
              </div>
            </LightTab>
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
          <div
            v-for="i in incidents"
            :key="i.id"
            @click="
              $router.push({
                name: 'nav.pew',
                query: { incident: i.id },
              })
            "
            class="live-tab px-2"
            :class="
              String(i.id) === String(incidentId) ? 'live-tab--selected' : ''
            "
          >
            <DisasterIcon class="mx-2" :current-incident="i" />
            {{ i.short_name }}
          </div>
        </div>
        <div class="flex-grow grid grid-cols-12">
          <div class="col-span-9 flex flex-col">
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
                  v-if="liveEvents.length > 0"
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
                  style="z-index: 1001"
                  class="absolute left-0 bottom-0 right-0"
                >
                  <div
                    v-if="displayedWorkTypeSvgs.length > 0"
                    class="
                      legend
                      w-108
                      h-auto
                      bg-crisiscleanup-dark-400
                      p-2
                      mb-5
                      ml-3
                      bg-opacity-25
                    "
                  >
                    <div class="font-bold my-1 text-white text-sm">
                      {{ $t('worksiteMap.legend') }}
                    </div>
                    <div class="flex flex-wrap justify-between">
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
                  </div>
                  <div class="relative">
                    <img
                      src="@/assets/cc-logo.svg"
                      alt="crisis-cleanup-logo"
                      class="absolute p-3 h-16 right-0 bottom-0 opacity-20"
                    />
                  </div>
                  <div class="mapStats grid grid-flow-col mb-10 ml-3 h-12">
                    <div
                      class="
                        p-1
                        border
                        mx-1
                        bg-opacity-25 bg-crisiscleanup-dark-400
                        rounded-md
                        w-auto
                      "
                      v-for="item in mapStatistics"
                      :style="item['style']"
                      :key="item['title']"
                    >
                      <div class="text-white text-xs opacity-50">
                        {{ item['title'] | upper }}
                      </div>
                      <div class="text-white text-sm">
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
                    <div
                      class="flex justify-center items-center mr-2"
                      v-if="liveEvents.length > 0"
                    >
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
          <div class="col-span-3 grid grid-rows-12">
            <div class="row-span-7 relative">
              <div class="w-full absolute top-0 right-0 flex justify-center">
                <OrganizationActivityModal
                  @close="closeModal"
                  :general-info="orgInfo.generalInfo"
                  class="x-translate right-0 top-0"
                  style="z-index: 1002"
                  :styles="overlayStyles"
                />
              </div>
              <Table
                :columns="orgTable.columns"
                :data="organizations"
                style="height: 20rem"
                :body-style="{ maxHeight: '40vh', ...styles }"
                :header-style="styles"
                :row-style="{ backgroundColor: 'unset' }"
                @rowClick="onRowClick"
                class="ml-1"
              >
                <template #name="slotProps">
                  <img
                    class="w-6 mr-2 rounded-full"
                    :src="getLogoUrl(slotProps.item.id)"
                    :alt="$t('profileOrg.organization_logo')"
                  />
                  <span class="truncate w-32">{{ slotProps.item.name }}</span>
                </template>
                <template #commercial_value="slotProps">
                  {{ nFormatter(slotProps.item.commercial_value) }}
                </template>
                <template #reported_count="slotProps">
                  <CaseDonutChart
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
                  />
                </template>
              </Table>
            </div>
            <div class="row-span-5">
              <tabs
                class="relative h-full"
                ref="tabs"
                tab-classes="text-xs"
                tab-default-classes="flex items-center justify-center text-center h-8 cursor-pointer px-2"
                tab-active-classes="bg-gradient-to-t from-crisiscleanup-dark-500 to-crisiscleanup-dark-400 rounded-t-xl"
                @tabSelected="stopChartTabCirculationTimer"
              >
                <LightTab
                  :name="$t('reports.pp_call_volume_title')"
                  :alt="$t('reports.pp_call_volume_description')"
                  class="absolute left-0 right-0"
                  style="top: 10%; bottom: 5%"
                  :selected="
                    chartCirculationTimerData.isTimerActive &&
                    chartCirculationTimerData.activeChartTab === 0
                  "
                >
                  <div class="absolute top-0 bottom-0 left-0 right-0">
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
                  class="absolute left-0 right-0"
                  style="top: 10%; bottom: 5%"
                  :selected="
                    chartCirculationTimerData.isTimerActive &&
                    chartCirculationTimerData.activeChartTab === 2
                  "
                >
                  <div class="absolute top-0 bottom-0 left-0 right-0">
                    <TotalCases
                      class="h-full w-full"
                      :margin-all="30"
                      :chart-data="{
                        open: incidentStats.unclaimed.total,
                        closed: incidentStats.closed.total,
                        inProgress:
                          incidentStats.claimed.total -
                          incidentStats.closed.total,
                      }"
                    />
                  </div>
                </LightTab>
                <LightTab
                  :name="$t('~~Completion Rate')"
                  class="absolute bottom-0 left-0 right-0"
                  style="top: 10%; bottom: 5%"
                  :selected="
                    chartCirculationTimerData.isTimerActive &&
                    chartCirculationTimerData.activeChartTab === 1
                  "
                >
                  <div class="absolute top-0 bottom-0 left-0 right-0">
                    <D3BarChart
                      class="h-full w-full"
                      chart-id="completion-rate"
                      :chart-data="barChartData"
                      :is-stacked="true"
                    />
                  </div>
                </LightTab>
                <LightTab
                  :name="$t('~~Weeks To Completion')"
                  class="absolute bottom-0 left-0 right-0"
                  style="top: 10%; bottom: 5%"
                  :selected="
                    chartCirculationTimerData.isTimerActive &&
                    chartCirculationTimerData.activeChartTab === 3
                  "
                >
                  <div class="absolute top-0 bottom-0 left-0 right-0">
                    <WeeksToCompletion
                      :margin-all="30"
                      class="h-full w-full"
                      :chart-data="[
                        { date: new Date('2021-04-22'), velocity: 19 },
                        { date: new Date('2021-04-23'), velocity: 30 },
                        { date: new Date('2021-04-24'), velocity: 40 },
                        { date: new Date('2021-04-25'), velocity: 20 },
                        { date: new Date('2021-04-26'), velocity: 15 },
                        { date: new Date('2021-04-27'), velocity: 5 },
                        { date: new Date('2021-04-28'), velocity: 12 },
                        { date: new Date('2021-04-29'), velocity: 10 },
                      ]"
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
import { orderBy, throttle } from 'lodash';
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
import { hash } from '@/utils/promise';
import CaseDonutChart from '@/components/charts/CaseDonutChart';
import Organization from '@/models/Organization';
import Toggle from '@/components/Toggle';
import TotalCases from '@/components/charts/TotalCases';
import WeeksToCompletion from '@/components/charts/WeeksToCompletion';

export default {
  name: 'PewPew',
  components: {
    WeeksToCompletion,
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
      orgInfo: {
        generalInfo: {},
        incidents: [],
        capability: [],
      },
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
      markerSpeed: 2000,
      incident: null,
      incidentStats: {},
      mapStatistics: [],
      displayedWorkTypes: [],
      displayedWorkTypeSvgs: [],
      orbTexture: null,
      eventsInterval: null,
      textureMap: {},
      queryFilter: {
        start_date: null,
        end_date: null,
        incident: null,
      },
      currentEngagement: 0,
      throttle,
    };
  },
  async mounted() {
    await this.loadPageData();
    // rotate through site info tabs after every 15 seconds
    this.startSiteInfoTabCirculationTimer(15000);
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

      this.getIncidentStats().then(() => {});
      this.getCompletionRateData().then(() => {});
      this.fetchEngagementData().then(() => {});
      this.fetchCircularBarplotData(this.$moment(), 30).then(() => {});

      const pageData = await hash({
        incidents: await this.getRecentIncidents(),
        organizations: await this.getOrganizations(),
      });
      this.loadMap().then(() => {});
      this.incidents = pageData.incidents;
      this.organizations = pageData.organizations;

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
    async fetchCircularBarplotData(date, interval) {
      this.circularBarplotData = [];
      this.circularBarplotData = this.circularBarplotData.slice();
      const d = date.format('YYYY-MM-DD');

      const url = `${process.env.VUE_APP_API_BASE_URL}/reports_data/daily_calls?&date=${d}&interval=${interval}`;
      const response = await this.$http.get(url);
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
      const totalTabs = 4; // total tabs present inside tabs component
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
    async getRecentIncidents() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/incidents?fields=id,name,short_name,geofence,locations,incident_type,color,turn_on_release&limit=8&sort=-start_at`,
      );
      const { results } = response.data;
      return results;
    },
    async getOrganizations() {
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
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/organization_statistics?${queryString}`,
      );
      await Organization.api().get(
        `/organizations?id__in=${response.data.map((o) => o.id).join(',')}`,
        {
          dataKey: 'results',
        },
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
    async loadMap() {
      this.mapLoading = true;
      await this.renderMap();
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
      const queryString = getQueryString(params);
      const { data } = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/live_events?${queryString}`,
      );
      this.liveEvents = data.results;
    },

    async renderMap() {
      if (!this.map) {
        this.map = L.map('map', {
          zoomControl: false,
        }).fitBounds([
          [17.644022027872726, -122.78314470293876],
          [50.792047064406866, -69.87298845293874],
        ]);
      }
      const { map } = this;

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

      this.events = {
        user_create_worksite: true,
      };

      const [markers] = await Promise.all([
        this.getAllEvents(),
        this.getLatestEvents(),
      ]);

      this.lastEventTimestamp = this.$moment().toISOString();
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
    async restartLiveEvents() {
      this.currentEventIndex = 0;
      await this.getLatestEvents();
      this.removeLayer('live_layer');
      const liveLayer = getLiveLayer();
      liveLayer.addTo(this.map);
      this.$refs.cards.clearCards();
    },
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
            let color = '#d0021b';
            let strokeColor = '#e30001';
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
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/worksite_statistics?${queryString}`,
      );
      this.incidentStats = response.data;
      this.mapStatistics = [
        {
          count: this.incidentStats.all.total,
          style: `border-color: white`,
          title: this.$t('pewPew.all_cases'),
        },
        {
          count: this.incidentStats.unclaimed.total,
          style: `border-color: #d0021b`,
          title: this.$t('pewPew.unclaimed'),
        },
        {
          count: this.incidentStats.claimed.total,
          style: `border-color: #fab92e`,
          title: this.$t('pewPew.claimed'),
        },
        {
          count: this.incidentStats.assigned.total,
          style: `border-color: #f0f032`,
          title: this.$t('pewPew.in_progress'),
        },
        {
          count: this.incidentStats.partial.total,
          style: `border-color: #0054bb`,
          title: this.$t('pewPew.partly_done'),
        },
        {
          count: this.incidentStats.closed.total,
          style: `border-color: #0FA355`,
          title: this.$t('pewPew.closed'),
        },
        {
          count: this.incidentStats.overdue.total,
          style: `border: none`,
          title: this.$t('pewPew.overdue'),
        },
        {
          count: this.organizations.length,
          style: `border: none`,
          title: this.$t('pewPew.total_orgs'),
        },
        {
          count: 0,
          style: `border: none`,
          title: this.$t('pewPew.counties_parishes'),
        },
        {
          count: 0,
          style: `border: none`,
          title: this.$t('pewPew.volunteers'),
        },
        {
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
      const organization = await this.getOrganization(item.id);
      this.orgInfo.generalInfo = item;
      this.orgInfo.generalInfo.avatar = this.getLogoUrl(item.id);
      this.orgInfo.generalInfo.organization = organization;
      this.orgInfo.generalInfo.capabilities =
        await this.getOrganizationCapabilities(item.id);
      this.orgInfo.generalInfo.statistics =
        await this.getOrganizationStatisticsByIncident(item.id);
      const modal = document.querySelector('div.x-translate');
      if (modal) {
        modal.classList.remove('x-translate');
        modal.classList.add('x-settle');
      }
    },
    closeModal() {
      const modal = document.querySelector('div.x-settle');
      if (modal) {
        modal.classList.add('x-translate');
        modal.classList.remove('x-settle');
      }
    },
    getLogoUrl(organization_id) {
      const organization = Organization.find(organization_id);
      return organization ? organization.logo_url : '';
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
        ['name', '30%'],
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
  },
  watch: {
    '$route.query.incident': {
      handler(value) {
        this.incident = null;
        this.incidentId = value;
        this.liveIncidents = [];
        this.clearMap();
        this.loadPageData();
      },
      deep: true,
      immediate: true,
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

.x-translate {
  transform: translateX(1000px);
  transition: all 600ms ease;
}

.x-settle {
  transform: translateX(0px);
  transition: all 600ms ease;
}

.stats:hover {
  text-shadow: 1px 1px 2px lightblue, 0 0 1em lightblue, 0 0 0.2em lightblue;
}

.y-translated {
  transform: translate(0px, -1000px);
}

.settle {
  box-shadow: 0 -1rem 3rem #000;
  transition: all 400ms ease;
  transform: translate(0px, 0px);
}

.card-group {
  box-shadow: 0 -1rem 3rem #000;
  transition: all 400ms ease;
  transform: translate(0px, 0px);
}

.group-top {
  box-shadow: 0 -1rem 3rem #000;
  transform: translate(0px, -140px);
}

.card-group:hover {
  z-index: 10;
  box-shadow: 0 1rem 3rem #000;
}
.group-top:hover {
  z-index: 10;
  box-shadow: 0 1rem 3rem #000;
}
.settle:hover {
  z-index: 10;
  box-shadow: 0 1rem 3rem #000;
}

.sticky-settle {
  box-shadow: 0 -1rem 2rem #000;
  transform: translate(0px, 10px);
}

.move-down {
  transition: all 600ms ease;
  transform: translate(0px, 1000px);
}

.site-container {
  height: 440px;
  overflow: hidden;
}

.site-item {
  height: 150px;
}

.pewpew {
  &__nav {
    @apply col-span-2 flex flex-col text-xs text-center break-words;
    background: #242c36;
  }

  &__navheader {
    @apply flex justify-center items-center m-2;

    img {
      @apply h-10;
    }
  }

  &__navlink {
    @apply flex flex-col justify-center items-center m-1 p-2 rounded-lg;
    font-size: 0.55rem;
    transition: background-color 300ms;

    img {
      @apply w-4 h-4;
    }

    &:focus,
    &:hover {
      @apply bg-white bg-opacity-25;
    }
  }

  .ribbon-gradient {
    background: linear-gradient(
      270deg,
      rgba(129, 154, 176, 0) 0.27%,
      #819ab0 25.98%,
      #819ab0 75.52%,
      rgba(129, 154, 176, 0) 100.43%
    );
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
