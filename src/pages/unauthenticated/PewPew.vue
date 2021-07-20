<template>
  <div class="h-screen" :style="styles">
    <div class="grid grid-cols-6">
      <div
        class="col-span-1 shadow-lg h-screen flex flex-col px-1"
        style="z-index: 1000;"
      >
        <div class="h-32 px-4 py-2">
          <img
            v-if="colorMode === 'Dark Mode'"
            src="@/assets/crisiscleanup_logo.png"
            alt="Crisis Cleanup"
            class="h-16"
          />
          <img
            v-else
            src="@/assets/ccu-logo-black-500w.png"
            alt="Crisis Cleanup"
            class="h-16"
          />
          <base-button text="press me" :action="makeNewPost" />
          <div class="mt-2 font-semibold">
            {{ $t('~~We help volunteers to help more people after disasters') }}
          </div>
        </div>
        <div class="text-lg">Site Activity</div>
        <!-- <transition-group tag="div" name="slide"> -->
          <div class="h-1/3 overflow-y-scroll">
            <div v-for="(post, index) in newsposts" :key="index">
              <newspost
                class="text-white my-2"
                :is-user-post="post.userInfo !== undefined"
                :user-info="post.userInfo"
                :avatar-icon="post.avatarIcon"
                :image="post.image"
              >
                <template #header>{{ post.title }}</template>
                <template #corner>{{
                  getDateDifference(post.timeStamp)
                }}</template>
                <template #content>{{ post.content }}</template>
              </newspost>
            </div>
        <!-- </transition-group> -->
          </div>
        <div class="flex-grow">
          <div class="flex flex-col">
            <div class="p-3">
              <div class="mb-2">
                <div>Total Big Number</div>
                <div class="text-xl text-blue-600">$1.1 Billion</div>
              </div>
              <div class="mb-2">
                <div>Volunteer Hours</div>
                <div class="text-lg">2348020</div>
              </div>
              <div class="mb-2">
                <div>Value per Volunteer</div>
                <div class="text-lg">$237</div>
              </div>
              <div class="mb-2">
                <div>Volunteer Hours Dollars</div>
                <div class="text-lg">$467</div>
              </div>
              <div class="mb-2">
                <div>Total Market Value</div>
                <div class="text-lg">$41283437</div>
              </div>
              <div class="underline text-blue-600">
                {{ $t('More Statistics') }}
              </div>
            </div>
          </div>
        </div>
        <div class="h-32">
          <div v-if="currentEvent">
            <div class="flex items-center mb-1">
              <div class="flex-1 ml-2 font-medium text-xs">
                {{ currentEvent.id }}: {{ currentEvent.attr.patient_status }},
                {{ currentEvent.attr.recipient_status }}
                <span
                  >{{ currentEvent.attr.actor_first_name }} from
                  {{ currentEvent.attr.actor_organization_name }}
                </span>
                {{ $t(currentEvent.past_tense_t, currentEvent.attr) }} ({{
                  currentEvent.actor_location_name
                }}
                {{ currentEvent.patient_location_name }}
                {{ currentEvent.recipient_location_name }})
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-5 h-screen flex flex-col">
        <div class="h-12 grid grid-cols-10">
          <div class="col-span-2 flex items-center">
            <form-select
              :value="colorMode"
              indicator-icon="caret-down"
              :options="['Dark Mode', 'Light Mode']"
              :clearable="false"
              class="text-white"
              select-classes="w-40 ml-2 text-xs"
              @input="
                (value) => {
                  colorMode = value;
                  setLayer();
                }
              "
            />
          </div>
          <div class="col-span-6 flex items-center justify-evenly">
            <span v-for="item in routes" :key="item.key">
              <a
                v-if="item.external"
                :href="item.route"
                class=""
                target="_blank"
              >
                {{ item.key }}
              </a>
              <router-link
                v-if="!item.external"
                :to="item.route || '#'"
                class=""
              >
                {{ item.key }}
              </router-link>
            </span>
          </div>
          <div class="col-span-2 flex items-center justify-end">
            <base-button
              class="text-xs p-2 w-20"
              variant="solid"
              :text="$t('Register')"
            />
            <base-button
              class="text-xs ml-2 p-2 w-20"
              variant="outline"
              :text="$t('Login')"
            />
          </div>
        </div>
        <div class="h-12 flex items-center justify-start">
          <span class="mx-4 h-full flex items-center">
            {{ $t('All') }}
          </span>
          <span
            class="mx-4 h-full flex items-center"
            v-for="incident in incidents"
            :key="incident.id"
          >
            {{ incident.name }}
          </span>
        </div>
        <div class="flex-grow grid grid-cols-4">
          <div class="col-span-3 flex flex-col">
            <div class="flex-grow">
              <div class="relative h-full">
                <div
                  id="map"
                  ref="map"
                  class="absolute top-0 left-0 right-0 bottom-0"
                ></div>
                <div
                  style="z-index: 1001;"
                  class="absolute left-0 bottom-0 right-0"
                >
                  <div
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
                            displayedWorkTypeSvgs = {
                              ...displayedWorkTypeSvgs,
                            };
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
                    class="w-auto h-auto bg-crisiscleanup-dark-400 p-2 bg-opacity-25 flex"
                  >
                    <div class="flex justify-center items-center mr-2">
                      <base-button
                        v-if="eventsInterval"
                        class="w-6 h-6 rounded-full focus:outline-none border p-3"
                        :action="pauseGeneratePoints"
                        icon="pause"
                        icon-size="xs"
                      >
                      </base-button>
                      <base-button
                        v-else
                        class="w-6 h-6 rounded-full focus:outline-none border p-3"
                        :action="generatePoints"
                        icon="play"
                        icon-size="xs"
                      >
                      </base-button>
                    </div>
                    <Slider class="w-120" @input="() => {}" :value="0"></Slider>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-1 border grid grid-rows-12">
            <div
              class="row-span-7 p-2"
              style="max-height: 450px; overflow: auto;"
            >
              <div class="text-lg">Organizations Activity</div>
              <div class="grid grid-cols-6">
                <div class="col-span-2 truncate">Organization Name</div>
                <div class="col-span-1 text-center truncate">Cases</div>
                <div class="col-span-1 text-center truncate">Claimed</div>
                <div class="col-span-1 text-center truncate">Calls</div>
                <div class="col-span-1 text-center truncate">Value</div>
              </div>

              <div
                v-for="(organization, index) in organizations"
                :key="index"
                class="p-2"
              >
                <OrganizationActivity
                  class="w-full mb-2"
                  :class="
                    colorMode === 'Dark Mode' ? 'bg-gray-800' : 'bg-gray-600'
                  "
                  v-if="organization.showAdvanced"
                  :organization-info="organization"
                  :organization-image="organization.image"
                  @close="organization.showAdvanced = false"
                />
                <div
                  class="grid grid-cols-6 p-2 rounded"
                  :class="
                    colorMode === 'Dark Mode'
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-200'
                  "
                  @click="organization.showAdvanced = true"
                  v-else
                >
                  <div class="col-span-2 truncate flex flex-row">
                    <img
                      :src="organization.avatar"
                      class="w-5 h-5 rounded-full mr-2"
                    />
                    {{ organization.name }}
                  </div>
                  <div class="col-span-1 text-center">
                    {{ organization.cases }}
                  </div>
                  <div class="col-span-1 text-center">
                    {{ organization.claimed }}
                  </div>
                  <div class="col-span-1 text-center">
                    {{ organization.calls / 1000 }}K
                  </div>
                  <div class="col-span-1 text-center">
                    {{ organization.value / 1000000 }}M
                  </div>
                </div>
              </div>
            </div>
            <div class="row-span-5">
              <tabs class="" ref="tabs" tab-classes="text-xs">
                <tab :name="$t('Completion Rate')">
                  <BarChart
                    v-if="charts.completion.options"
                    :chart-data="charts.completion.data"
                    :options="charts.completion.options"
                    class="h-56"
                  />
                </tab>
                <tab :name="$t('Total Cases')"></tab>
                <tab :name="$t('Case Status')"></tab>
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
import Newspost from '@/components/Newspost.vue';

import {
  calcWaypoints,
  degreesToRadians,
  findBezierPoints,
  getMarkerLayer,
  mapAttribution,
  mapTileLayerDark,
  mapTileLayer,
} from '@/utils/map';
import { HomeNavigation } from '@/components/home/SideNav';
import { getQueryString } from '@/utils/urls';
import BarChart from '@/components/charts/BarChart';
import { Sprite, Texture, Graphics, utils as pixiUtils } from 'pixi.js';
import Incident from '@/models/Incident';
import OrganizationActivity from "@/components/OrganizationActivity.vue";
import { orderBy } from 'lodash';
import Slider from '@/components/Slider';

export default {
  name: 'PewPew',
  components: { Table, BarChart, Newspost, OrganizationActivity, Newspost },
  data() {
    return {
      markers: [],
      events: {},
      incidents: [],
      organizations: [
        {
          avatar:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png',
          name: 'test 1',
          cases: '12',
          claimed: '13',
          calls: '14000',
          value: '15000000',
          showAdvanced: false,
          orgType: 'test',
          availability: 'test',
          address: 'test',
          type: 'test',
          role: 'test',
        },
        {
          avatar:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png',
          name: 'test 2',
          cases: '16',
          claimed: '17',
          calls: '4000',
          value: '14000000',
          showAdvanced: false,
          orgType: 'test',
          availability: 'test',
          address: 'test',
          type: 'test',
          role: 'test',
        },
        {
          avatar:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png',
          name: 'test 3',
          cases: '3',
          claimed: '17',
          calls: '1000',
          value: '5000000',
          showAdvanced: false,
          orgType: 'test',
          availability: 'test',
          address: 'test',
          type: 'test',
          role: 'test',
        },
        {
          avatar:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png',
          name: 'test 4',
          cases: '12',
          claimed: '13',
          calls: '14000',
          value: '15000000',
          showAdvanced: false,
          orgType: 'test',
          availability: 'test',
          address: 'test',
          type: 'test',
          role: 'test',
        },
      ],
      templates,
      colors,
      map: null,
      lastEventTimestamp: null,
      colorMode: 'Dark Mode',
      routes: HomeNavigation,
      currentEvent: null,
      currentEventIndex: 0,
      charts: {
        completion: {
          options: null,
          data: null,
        },
      },
      incidentId: 222,
      markerSpeed: 2000,
      incident: null,
      incidentStats: {},
      mapStatistics: [],
      displayedWorkTypeSvgs: [],
      orbTexture: null,
      eventsInterval: null,
      textureMap: {},
      newsposts: [
        {
          title: 'Test 1',
          userInfo: {
            name: 'Angelo Pablo',
            organization: 'ArroyoDev',
          },
          avatarIcon:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png',
          content: 'This is a test post',
          timeStamp: new Date(),
        },
        {
          title: 'Test 2',
          content: 'This is a test post',
          timeStamp: new Date('December 17, 1995 03:24:00'),
        },
        {
          title: 'Test 3',
          content: 'This is a test post',
          image:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png',
          timeStamp: new Date('November 11, 2020'),
        },
        {
          title: 'Test 4',
          userInfo: {
            name: 'Angelo Pablo',
            organization: 'ArroyoDev',
          },
          avatarIcon:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png',
          content: 'This is a test post',
          image:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png',
          timeStamp: new Date('July 19, 2021 11:00:00'),
        },
      ],
    };
  },
  async mounted() {
    await Incident.api().fetchById(this.incidentId);
    this.incident = Incident.find(this.incidentId);

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

    const svg = templates.orb
      .replace('{{fillColor}}', '#61D5F8')
      .replace('{{strokeColor}}', 'black');
    this.orbTexture = Texture.from(svg);
    await this.getIncidentStats();
    this.mapStatistics = [
      {
        count: this.incidentStats.worksite_count,
        style: `border-color: white`,
        title: this.$t('~~All Cases'),
      },
      {
        count: this.incidentStats.unclaimed_count,
        style: `border-color: #d0021b`,
        title: this.$t('~~Unclaimed'),
      },
      {
        count: this.incidentStats.claimed_count,
        style: `border-color: #fab92e`,
        title: this.$t('~~Claimed'),
      },
      {
        count: this.incidentStats.assigned_count,
        style: `border-color: #f0f032`,
        title: this.$t('~~Assinged'),
      },
      {
        count: this.incidentStats.partial_count,
        style: `border-color: #0054bb`,
        title: this.$t('~~Partly Done'),
      },
      {
        count: this.incidentStats.closed_count,
        style: `border-color: #0FA355`,
        title: this.$t('~~Closed'),
      },
      {
        count: this.incidentStats.overdue_count,
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
    const { options, data } = await this.getCompletionRateData();
    this.charts.completion.options = options;
    this.charts.completion.data = data;
    await this.loadMap();
  },
  methods: {
    async getRecentIncidents() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/incidents?fields=id,name,short_name,geofence,locations,turn_on_release&limit=8&sort=-start_at`,
      );
      const { results } = response.data;
      return results;
    },
    async getOrganizations() {
      const params = {
        limit: 20,
      };
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/incidents/${this.incidentId}/organizations?${queryString}`,
      );
      const { results } = response.data;
      return results;
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
      const params = {
        limit: 1500,
        event_key__in: Object.keys(this.events).join(','),
        sort: 'created_at',
        incident: this.incidentId,
      };
      const queryString = getQueryString(params);
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/event_stream?${queryString}`,
      );
      this.markers = response.data.results;
      [this.currentEvent] = this.markers;

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

      this.incidents = await this.getRecentIncidents();
      this.organizations = await this.getOrganizations();
      this.events = {
        user_join_wwwtsp_with_organization: 'patient',
        'user_join_work-type-status_with_wwwtsp': 'recipient',
        user_create_worksite: 'recipient',
      };
      await this.getAllEvents();
      this.lastEventTimestamp = this.$moment().toISOString();
      const worksiteLayer = getMarkerLayer([], map, this);
      worksiteLayer.addTo(map);

      map.attributionControl.setPosition('bottomright');
    },
    createCurve(actorMarkerSprite, patientMarkerSprite) {
      const x1 = actorMarkerSprite.x; // in pixels
      const y1 = actorMarkerSprite.y;
      const x2 = patientMarkerSprite.x;
      const y2 = patientMarkerSprite.y;
      const ang1 = degreesToRadians(30); // in radians
      const ang2 = degreesToRadians(30);

      const len = Math.hypot(x2 - x1, y2 - y1);
      const ax1 = Math.cos(ang1) * len * (1 / 3);
      const ay1 = Math.sin(ang1) * len * (1 / 3);

      const ax2 = Math.cos(ang2) * len * (1 / 3);
      const ay2 = Math.sin(ang2) * len * (1 / 3);
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
        if (layer.key === 'marker_layer') {
          const container = layer._pixiContainer;
          container.children.forEach((markerSprite) => {
            markerSprite.visible = this.getMarkerVisibility(markerSprite);
          });

          layer._renderer.render(container);
          layer.redraw();
        }
      });
    },
    generateMarker() {
      this.map.eachLayer((layer) => {
        if (layer.key === 'marker_layer') {
          const marker = this.markers[this.currentEventIndex];
          this.currentEvent = marker;
          this.currentEventIndex++;
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
            actorMarkerSprite.texture = this.orbTexture;
            actorMarkerSprite.visible = true;
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

            const detailedTemplate =
              templates[workTypeKey] || templates.unknown;
            const typeSvg = detailedTemplate
              .replace('{{fillColor}}', color)
              .replace('{{strokeColor}}', 'black');

            patientMarkerSprite.basicTexture = texture;
            patientMarkerSprite.detailedTexture = Texture.from(typeSvg);

            layer._pixiContainer.addChild(patientMarkerSprite);
          }

          layer._renderer.render(layer._pixiContainer);
          layer.redraw();

          if (actorMarkerSprite && patientMarkerSprite) {
            const linksGraphics = this.createCurve(
              actorMarkerSprite,
              patientMarkerSprite,
            );
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
    getDateDifference(date) {
      const dateDifference = Math.abs(new Date() - date);
      let difference;
      // convert it to different measurements based on how much time passed
      if (dateDifference < 1000) {
        difference = 'now';
      } else {
        difference = Math.floor(Math.abs(dateDifference / 1000));
        if (difference >= 60) {
          difference = Math.floor(Math.abs(difference / 60));
          if (difference >= 60) {
            difference = Math.floor(Math.abs(difference / 60));
            if (difference >= 24) {
              difference = Math.floor(Math.abs(difference / 24));
              if (difference >= 365) {
                difference = Math.floor(Math.abs(difference / 365));
                difference += ' years ago';
              } else {
                difference += ' days ago';
              }
            } else {
              difference += ' hours ago';
            }
          } else {
            difference += ' minutes ago';
          }
        } else {
          difference += ' seconds ago';
        }
      }
      return difference;
    },
    makeNewPost() {
      this.newsposts.splice(0, 0, {
        title: 'Test 2',
        content: 'This is a test post',
        timeStamp: new Date('December 17, 1995 03:24:00'),
      });
    },
    async getCompletionRateData() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/completion_rate?start_date=2021-06-15&end_date=2021-07-15`,
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
      return { options, data };
    },
    async getIncidentStats() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/incident_statistics?incident=${this.incidentId}`,
      );
      this.incidentStats = response.data;
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
  },
  computed: {
    visibleWorkTypes() {
      const selectedWorkTypes = Object.values(this.displayedWorkTypeSvgs)
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
        ['name', '2fr'],
        ['reported_count', '0.5fr', 'Cases'],
        ['claimed_count', '0.5fr', 'Claimed'],
        ['calls', '0.5fr'],
        ['value', '0.5fr'],
      ]);
      columns.forEach((column) => {
        column.titleClass = 'small-font';
        column.class = 'small-font';
      });
      return {
        columns,
      };
    },
  },
};
</script>

<style>
@import '~leaflet/dist/leaflet.css';

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

.site-items {
  position: relative;
}

@keyframes slidein {
  from {
    top: -20px;
    opacity: 0;
  }
  to {
    top: 0px;
    opacity: 1;
  }
}

.slide-leave-active,
.slide-enter-active {
  transition: 1s;
}
.slide-enter {
  transform: translate(100%, 0);
}
.slide-leave-to {
  transform: translate(-100%, 0);
}
</style>
