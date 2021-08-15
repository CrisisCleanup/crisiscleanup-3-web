<template>
  <div class="pewpew absolute top-0 right-0 left-0 bottom-0" :style="styles">
    <div class="grid grid-cols-10 relative">
      <div class="absolute right-0 px-1 w-full sm:w-1/3" style="top: 10%;">
        <OrganizationActivityModal
          @close="closeModal"
          :general-info="orgInfo.generalInfo"
          class="x-translate"
          style="z-index: 1002;"
          :styles="styles"
        />
      </div>
      <div
        class="grid grid-cols-8 col-span-2 shadow-lg h-screen flex flex-col pr-1"
        style="z-index: 1000;"
      >
        <div class="pewpew__nav">
          <router-link :to="{ name: 'nav.pew' }" class="pewpew__navheader">
            <img
              v-if="colorMode === 'Dark Mode'"
              src="@/assets/crisiscleanup_logo.png"
              alt="Crisis Cleanup"
              class="h-8"
            />
            <img
              v-else
              src="@/assets/ccu-logo-black-500w.png"
              alt="Crisis Cleanup"
              class="h-16"
            />
          </router-link>

          <router-link :to="{ name: 'nav.dashboard' }" class="pewpew__navlink">
            <img src="@/assets/icons/home.svg" alt="home-icon" />
            {{ $t('Home') }}
          </router-link>

          <router-link :to="{ name: 'nav.dashboard' }" class="pewpew__navlink">
            <img
              src="@/assets/icons/current-disaster.svg"
              alt="current-disaster-icon"
            />
            {{ $t('Current Disasters') }}
          </router-link>

          <router-link :to="{ name: 'nav.about' }" class="pewpew__navlink">
            <img src="@/assets/icons/about-us.svg" alt="about-us-icon" />
            {{ $t('About us') }}
          </router-link>

          <a
            href="https://crisiscleanup.zendesk.com/hc/en-us/requests/new"
            class="pewpew__navlink"
          >
            <img src="@/assets/icons/contact-us.svg" alt="contact-us-icon" />
            {{ $t('Contact') }}
          </a>

          <router-link :to="{ name: 'nav.training' }" class="pewpew__navlink">
            <img src="@/assets/icons/training.svg" alt="training-icon" />
            {{ $t('Training') }}
          </router-link>

          <a href="http://blog.crisiscleanup.org" class="pewpew__navlink">
            <img src="@/assets/icons/notepad.svg" alt="blogs-icon" />
            {{ $t('Blogs') }}
          </a>

          <router-link :to="{ name: 'nav.terms' }" class="pewpew__navlink">
            <img src="@/assets/icons/terms.svg" alt="terms-icon" />
            {{ $t('Terms') }}
          </router-link>

          <router-link :to="{ name: 'nav.privacy' }" class="pewpew__navlink">
            <img
              src="@/assets/icons/privacy-policy.svg"
              alt="privacy-policy-icon"
            />
            {{ $t('Privacy Policy') }}
          </router-link>

          <router-link :to="{ name: 'nav.about' }" class="pewpew__navlink">
            <img src="@/assets/icons/faq.svg" alt="faq-icon" />
            {{ $t('FAQ') }}
          </router-link>
        </div>
        <div class="col-span-6 flex flex-col justify-between items-center">
          <tabs
            class="relative h-full w-full px-1 mt-10"
            ref="tabs"
            tab-classes="text-xs"
            tab-default-classes="flex items-center justify-center h-8 cursor-pointer px-2"
            tab-active-classes="bg-gradient-to-t from-crisiscleanup-dark-500 to-crisiscleanup-dark-400 rounded-t"
          >
            <tab :name="$t('Live')" selected>
              <div :name="$t('Site Activity')" class="w-full">
                <div class="text-xs px-5 text-center">
                  {{ $t('~~SITE ACTIVITY') }}
                </div>
                <div class="h-40 w-full">
                  <SiteActivityGauge
                    class="h-full w-full"
                    :chart-data="65"
                    :margin-all="10"
                    chart-id="site-activity-gauge"
                  />
                </div>
              </div>
              <div class="h-full p-2 w-full">
                <CardStack ref="cards" />
                <transition name="show">
                  <EventCard
                    v-if="currentEvent"
                    :key="currentEvent.event.id"
                    :current-event="currentEvent.event"
                    :class="`bg-${getNearestColor(currentEvent.color).name}`"
                    :style="{
                      borderColor: currentEvent.strokeColor,
                    }"
                    class="stacked-card bg-opacity-25 border w-full h-auto rounded my-2 p-3 bg-red-200"
                  ></EventCard>
                </transition>
              </div>
            </tab>
            <tab :name="$t('Statistics')" class="p-2">
              <div class="flex flex-col items-start justify-start w-full">
                <div class="">
                  <div class="mb-2">
                    <div>{{ $t('Total Big Number') }}</div>
                    <div class="text-xl text-blue-600 stats">
                      $1.1 Billion
                    </div>
                  </div>
                  <div class="mb-2">
                    <div>{{ $t('Volunteer Hours') }}</div>
                    <div class="text-lg stats">2348020</div>
                  </div>
                  <div class="mb-2">
                    <div>{{ $t('Value per Volunteer') }}</div>
                    <div class="text-lg stats">$237</div>
                  </div>
                  <div class="mb-2">
                    <div>{{ $t('Volunteer Hours Dollars') }}</div>
                    <div class="text-lg stats">$467</div>
                  </div>
                  <div class="mb-2">
                    <div>{{ $t('Total Market Value') }}</div>
                    <div class="text-lg stats">$41283437</div>
                  </div>
                  <div class="underline text-blue-600">
                    {{ $t('More Statistics') }}
                  </div>
                </div>
              </div>
            </tab>
          </tabs>
        </div>
      </div>
      <div class="col-span-8 h-screen flex flex-col">
        <div class="h-12 grid grid-cols-10">
          <div
            class="my-2 col-span-8 flex justify-center items-center text-black font-bold ribbon-gradient"
          >
            {{
              $t(
                '~~For Help, Call: 800-451-1954 (COVID), 844-965-1386 (Tornadoes)',
              )
            }}
          </div>
          <div class="col-span-2 flex items-center justify-center">
            <Toggle v-model="isDarkMode" v-if="false" />
            <base-button
              class="text-xs p-1 w-20 text-black rounded"
              variant="solid"
              :text="$t('Register')"
              :action="() => $router.push('/register')"
            />
            <base-button
              class="text-xs ml-2 p-1 w-20 rounded"
              variant="outline-dark"
              :text="$t('Login')"
              :action="() => $router.push('/login')"
            />
          </div>
        </div>
        <div class="h-12 mt-3 flex text-xs">
          <div
            class="live-tab px-6"
            :class="incident ? '' : 'live-tab--selected'"
          >
            {{ $t('~~Live') }}
          </div>
          <div
            v-for="incident in incidents"
            :key="incident.id"
            class="live-tab px-2"
            :class="
              String(incident.id) === String(incidentId)
                ? 'live-tab--selected'
                : ''
            "
          >
            <DisasterIcon class="mx-2" :current-incident="incident" />
            {{ incident.short_name }}
          </div>
        </div>
        <div class="flex-grow grid grid-cols-10">
          <div class="col-span-7 flex flex-col">
            <div class="flex-grow">
              <div class="relative h-full">
                <div
                  id="map"
                  ref="map"
                  class="absolute top-0 left-0 right-0 bottom-0"
                ></div>
                <div
                  style="z-index: 1001;"
                  class="absolute top-0 left-0 m-2 p-2 bg-opacity-25 bg-crisiscleanup-dark-400 rounded-md"
                >
                  <Slider
                    primary-color="#FECE09"
                    :value="100"
                    @input="
                      (value) => {
                        refreshSvi(value);
                      }
                    "
                    :from="$t('~~Most vulnerable')"
                    :to="$t('~~Everyone')"
                  ></Slider>
                </div>
                <div
                  style="z-index: 1001;"
                  class="absolute top-0 right-0 h-32 w-auto overflow-hidden mt-3 mr-3"
                  ref="incidentScroll"
                >
                  <div
                    v-for="incident in liveIncidents"
                    :key="incident"
                    class="bg-crisiscleanup-dark-400 p-1 my-2 bg-opacity-25"
                  >
                    {{ incident }}
                  </div>
                </div>
                <div
                  style="z-index: 1001;"
                  class="absolute left-0 bottom-0 right-0"
                >
                  <div
                    v-if="displayedWorkTypeSvgs.length > 0"
                    class="legend w-108 h-auto bg-crisiscleanup-dark-400 p-2 mb-5 ml-3 bg-opacity-25"
                  >
                    <div class="font-bold my-1 text-white text-sm">
                      {{ $t('Legend') }}
                    </div>
                    <div class="flex flex-wrap justify-between">
                      <div
                        v-for="entry in displayedWorkTypeSvgs"
                        :key="entry.key"
                        class="flex items-center w-1/2 mb-1 cursor-pointer hover:border-2"
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
                  <div class="stats grid grid-flow-col mb-10 ml-3">
                    <div
                      class="p-1 border mx-1 bg-opacity-25 bg-crisiscleanup-dark-400 rounded-md w-auto"
                      v-for="item in mapStatistics"
                      :style="item['style']"
                      :key="item['title']"
                    >
                      <div class="text-white text-xs opacity-50">
                        {{ item['title'] | capitalize }}
                      </div>
                      <div class="text-white text-sm">
                        {{ item['count'] }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="w-auto h-auto bg-crisiscleanup-dark-400 p-3 bg-opacity-25 flex mb-8 mx-3 rounded"
                  >
                    <div class="flex justify-center items-center mr-2">
                      <base-button
                        v-if="eventsInterval"
                        class="w-8 h-8 rounded-full focus:outline-none border p-2"
                        :action="pauseGeneratePoints"
                        icon="pause"
                        icon-size="xs"
                      >
                      </base-button>
                      <base-button
                        v-else
                        class="w-8 h-8 rounded-full focus:outline-none border p-2"
                        :action="generatePoints"
                        icon="play"
                        icon-size="xs"
                      >
                      </base-button>
                    </div>
                    <Slider
                      v-if="markers.length"
                      @input="
                        (value) => {
                          throttle(() => {
                            refreshTimeline(value);
                          }, 1000)();
                        }
                      "
                      :value="markers.length - 1"
                      :min="0"
                      :max="markers.length - 1"
                      :from="queryFilter.start_date.format('MMM Do YYYY')"
                      :to="queryFilter.end_date.format('MMM Do YYYY')"
                    ></Slider>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-3 grid grid-rows-12">
            <div class="row-span-7">
              <Table
                :columns="orgTable.columns"
                :data="organizations"
                style="height: 20rem;"
                :body-style="{ maxHeight: '40vh', ...styles }"
                :header-style="styles"
                :row-style="{ backgroundColor: 'unset' }"
                @rowClick="onRowClick"
              >
                <template #name="slotProps">
                  <img
                    class="w-4 mr-2"
                    :src="getLogoUrl(slotProps.item.id)"
                    :alt="$t('profileOrg.organization_logo')"
                  />
                  {{ slotProps.item.name }}
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
                      claimedCases: slotProps.item.claimed_count || 0,
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
                tab-default-classes="flex items-center justify-center h-8 cursor-pointer px-2"
                tab-active-classes="bg-gradient-to-t from-crisiscleanup-dark-500 to-crisiscleanup-dark-400 rounded-t"
              >
                <LightTab
                  :name="$t('Call Volume')"
                  class="absolute left-0 right-0"
                  style="top: 10%; bottom: 5%;"
                  selected
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
                  :name="$t('Velocity')"
                  class="absolute left-0 right-0"
                  style="top: 10%; bottom: 5%;"
                >
                  <div class="absolute top-0 bottom-0 left-0 right-0">
                    <GaugeChart
                      class="h-full w-full"
                      :gauges="gaugeChartData"
                    />
                  </div>
                </LightTab>
                <LightTab
                  :name="$t('Total cases')"
                  class="absolute bottom-0 left-0 right-0"
                  style="top: 10%; bottom: 5%;"
                >
                  <div class="absolute top-0 bottom-0 left-0 right-0">
                    <D3BarChart
                      class="h-full w-full"
                      chart-id="completion-rate"
                      :chart-data="barChartData"
                      :is-stacked="false"
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
import { Sprite, Texture, Graphics, utils as pixiUtils } from 'pixi.js';
import Incident from '@/models/Incident';
import { orderBy, throttle } from 'lodash';
import Slider from '@/components/Slider';
import DisasterIcon from '@/components/DisasterIcon';
import OrganizationActivityModal from '@/components/OrganizationActivityModal.vue';
import LightTab from '@/components/tabs/LightTab';
import SiteActivityGauge from '@/components/charts/SiteActivityGauge';
import CircularBarplot from '@/components/charts/CircularBarplot';
import GaugeChart from '@/components/charts/GaugeChart';
import D3BarChart from '@/components/charts/D3BarChart';
import CardStack from '@/components/CardStack';
import EventCard from '@/components/EventCard';
import { getNearestColor } from '@/utils/colors';
import { hash } from '@/utils/promise';
import CaseDonutChart from '@/components/charts/CaseDonutChart';
import Organization from '@/models/Organization';
import Toggle from '@/components/Toggle';

export default {
  name: 'PewPew',
  components: {
    Toggle,
    CaseDonutChart,
    EventCard,
    CardStack,
    LightTab,
    D3BarChart,
    GaugeChart,
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
      loading: false,
      orgInfo: {
        generalInfo: {},
        incidents: [],
        capability: [],
      },
      markers: [],
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
      gaugeChartData: [
        {
          radius: 30,
          fillPercent: 50,
          leftLabel: 'Low 1',
          rightLabel: 'High 1',
        },
        {
          radius: 60,
          fillPercent: 70,
          leftLabel: 'Low 2',
          rightLabel: 'High 2',
        },
        {
          radius: 100,
          fillPercent: 0,
          leftLabel: 'Low 3',
          rightLabel: 'High 3',
        },
      ],
      barChartData: [
        { group: 0, newCases: 28, closedCases: 30 },
        { group: 1, newCases: 43, closedCases: 38 },
        { group: 2, newCases: 81, closedCases: 30 },
        { group: 3, newCases: 19, closedCases: 80 },
        { group: 4, newCases: 52, closedCases: 30 },
        { group: 5, newCases: 24, closedCases: 35 },
        { group: 6, newCases: 87, closedCases: 70 },
        { group: 7, newCases: 17, closedCases: 30 },
        { group: 8, newCases: 68, closedCases: 47 },
        { group: 9, newCases: 49, closedCases: 32 },
        { group: 10, newCases: 69, closedCases: 42 },
      ],
      incidentId: null,
      markerSpeed: 2000,
      incident: null,
      incidentStats: {},
      mapStatistics: [],
      displayedWorkTypeSvgs: [],
      orbTexture: null,
      eventsInterval: null,
      textureMap: {},
      queryFilter: {
        start_date: null,
        end_date: null,
        incident: null,
      },
      throttle,
    };
  },
  async mounted() {
    this.incidentId = this.$route.query.incident;

    this.queryFilter.start_date = this.$moment().add(-60, 'days');
    this.queryFilter.end_date = this.$moment();

    if (this.incidentId) {
      await Incident.api().fetchById(this.incidentId);
      this.incident = Incident.find(this.incidentId);
      this.queryFilter.start_date = this.incident.start_at_moment;
      this.queryFilter.end_date = this.incident.start_at_moment.add(60, 'days');
      this.setLegend();
    }

    this.loading = true;
    const pageData = await hash({
      incidents: await this.getRecentIncidents(),
      organizations: await this.getOrganizations(),
      incidentStats: await this.getIncidentStats(),
      completion: await this.getCompletionRateData(),
    });
    await this.loadMap();
    this.fetchCircularBarplotData(new Date(), 30);
    this.loading = false;
    this.incidents = pageData.incidents;
    this.organizations = pageData.organizations;

    const svg = templates.orb
      .replace('{{fillColor}}', '#61D5F8')
      .replace('{{strokeColor}}', 'black');
    this.orbTexture = Texture.from(svg);
  },
  methods: {
    setLegend() {
      this.displayedWorkTypeSvgs = this.incident.created_work_types.map(
        (workType) => {
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
        },
      );
    },
    async fetchCircularBarplotData(date, interval) {
      console.log('fetching...');
      this.circularBarplotData = [];
      this.circularBarplotData = this.circularBarplotData.slice();
      const d = [
        date.getFullYear(),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0'),
      ].join('-');

      const url = `https://api.crisiscleanup.org/reports_data/daily_completion?&date=${d}&interval=${interval}`;
      const response = await this.$http.get(url);
      this.circularBarplotData = response.data;
      this.circularBarplotData = this.circularBarplotData.slice();
      console.log('response: ', this.circularBarplotData);
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
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/recent_events`,
      );
      this.markers = response.data;
      // [this.currentEvent] = this.markers;

      // let next;
      // next = response.data.next;
      // while (next) {
      //   // eslint-disable-next-line no-await-in-loop
      //   const chunk = await this.$http.get(next);
      //   this.markers.push(...chunk.data.results);
      //   next = chunk.data.next;
      // }
      // this.pollNewEvents();
    },
    async getLatestEvents() {
      const params = {
        limit: 100,
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

      await Promise.all([this.getAllEvents(), this.getLatestEvents()]);

      this.lastEventTimestamp = this.$moment().toISOString();
      const worksiteLayer = getMarkerLayer([], map, this);
      worksiteLayer.addTo(map);

      // Initial Draw
      for (let i = 0; i < this.markers.length; i++) {
        try {
          this.addMarker(this.markers[i], i);
        } catch (e) {
          this.$log.error(
            `Could not add marker for ${JSON.stringify(this.markers[i])}`,
          );
          this.$log.error(e);
        }
      }

      worksiteLayer._renderer.render(worksiteLayer._pixiContainer);
      worksiteLayer.redraw();

      // Last 2 hours
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
    generateMarker() {
      this.map.eachLayer((layer) => {
        if (layer.key === 'live_layer') {
          const marker = this.liveEvents[this.currentEventIndex];
          this.currentEventIndex++;
          if (!marker) {
            layer._renderer.render(layer._pixiContainer);
            layer.redraw();
            return;
          }
          const card = {
            classes: 'border w-full h-32 rounded my-2',
            event: marker,
          };
          this.liveIncidents.push(marker.attr.incident_name);
          this.$refs.incidentScroll.scrollTop = this.$refs.incidentScroll.scrollHeight;
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
          if (this.currentEventIndex % 5 === 0) {
            this.currentEvent = card;
          }

          layer._renderer.render(layer._pixiContainer);
          layer.redraw();

          if (actorMarkerSprite && patientMarkerSprite) {
            const linksGraphics = this.createCurve(
              actorMarkerSprite,
              patientMarkerSprite,
            );
            linksGraphics.live = true;
            actorMarkerSprite.workTypeKey = patientMarkerSprite.workTypeKey;
            actorMarkerSprite.visible = this.getMarkerVisibility(
              actorMarkerSprite,
            );
            patientMarkerSprite.visible = this.getMarkerVisibility(
              patientMarkerSprite,
            );
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
          title: this.$t('~~All Cases'),
        },
        {
          count: this.incidentStats.unclaimed.total,
          style: `border-color: #d0021b`,
          title: this.$t('~~Unclaimed'),
        },
        {
          count: this.incidentStats.claimed.total,
          style: `border-color: #fab92e`,
          title: this.$t('~~Claimed'),
        },
        {
          count: this.incidentStats.assigned.total,
          style: `border-color: #f0f032`,
          title: this.$t('~~Assinged'),
        },
        {
          count: this.incidentStats.partial.total,
          style: `border-color: #0054bb`,
          title: this.$t('~~Partly Done'),
        },
        {
          count: this.incidentStats.closed.total,
          style: `border-color: #0FA355`,
          title: this.$t('~~Closed'),
        },
        {
          count: this.incidentStats.overdue.total,
          style: `border: none`,
          title: this.$t('~~Overdue'),
        },
        {
          count: this.organizations.length,
          style: `border: none`,
          title: this.$t('~~Total Orgs'),
        },
        {
          count: 0,
          style: `border: none`,
          title: this.$t('~~Counties'),
        },
        {
          count: 0,
          style: `border: none`,
          title: this.$t('~~Volunteers'),
        },
        {
          count: 0,
          style: `border: none`,
          title: this.$t('~~Households'),
        },
      ];
    },
    pollNewEvents() {
      setInterval(() => {
        const params = {
          limit: 500,
          event_key__in: Object.keys(this.events).join(','),
          sort: 'created_at',
          incident: this.incidentId,
          created_at__gt: this.lastEventTimestamp,
        };
        const queryString = getQueryString(params);
        this.$http
          .get(
            `${process.env.VUE_APP_API_BASE_URL}/event_stream?${queryString}`,
          )
          .then(({ data }) => {
            this.markers.push(...data.results);
            this.lastEventTimestamp = this.$moment().toISOString();
          });
      }, 50000);
    },
    setLayer() {
      if (this.colorMode === 'Dark Mode') {
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
      this.orgInfo.generalInfo.organization = organization;
      this.orgInfo.generalInfo.capabilites = await this.getOrganizationCapabilities(
        item.id,
      );
      this.orgInfo.generalInfo.statistics = await this.getOrganizationStatisticsByIncident(
        item.id,
      );
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
      return Organization.find(organization_id).logo_url;
    },
  },
  computed: {
    colorMode() {
      return this.isDarkMode ? 'Dark Mode' : 'Light Mode';
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
      if (this.colorMode === 'Dark Mode') {
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
    orgTable() {
      const columns = makeTableColumns([
        ['name', '50%'],
        ['reported_count', '25%', 'Cases'],
        // ['claimed_count', '0.5fr', 'Claimed'],
        // ['calls', '0.5fr'],
        ['commercial_value', '25%', 'Value'],
      ]);
      columns.forEach((column) => {
        column.titleClass = 'small-font';
        column.class = 'small-font';
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
      @apply h-6;
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
