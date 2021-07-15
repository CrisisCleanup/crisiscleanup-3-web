<template>
  <div class="h-screen">
    <div class="grid grid-cols-5">
      <div
        class="col-span-1 shadow-lg h-screen flex flex-col"
        style="z-index: 1000;"
      >
        <div class="h-32 px-4 py-2 border-b">
          <img
            src="@/assets/ccu-logo-black-500w.png"
            alt="Crisis Cleanup"
            class="h-16"
          />
          <div class="mt-2 font-semibold">
            {{ $t('~~We help volunteers to help more people after disasters') }}
          </div>
        </div>
        <div class="flex-grow">
          <div class="flex flex-col mb-5">
            <div class="p-3">
              <base-text variant="h1">$1.1 billion</base-text>
              <div>Total Big Number</div>
            </div>
            <hr />
            <div class="flex flex-col">
              <div
                v-for="x in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                :key="x"
                class="flex px-2 py-3 items-center justify-between text-xs border-b"
              >
                <div>{{ $t('Volunteer Hours') }}</div>
                <div>{{ x }}</div>
              </div>
              <div class="grid grid-cols-2 border-b">
                <div class="p-2 border-r">
                  <div class="underline text-primary-dark">
                    {{ $t('More Statistics') }}
                  </div>
                </div>
                <div class="p-2 flex items-start justify-center">
                  <font-awesome-icon size="lg" icon="question-circle" />
                  <a class="ml-2">FAQ</a>
                </div>
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
      <div class="col-span-4 h-screen flex flex-col">
        <div class="h-12 border-b grid grid-cols-10">
          <div class="col-span-2 flex items-center">
            <form-select
              :value="colorMode"
              indicator-icon="caret-down"
              :options="['Dark Mode', 'Light Mode']"
              :clearable="false"
              select-classes="w-40 ml-2 text-xs"
              @input="
                (value) => {
                  colorMode = value;
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
        <div class="h-12 border-b flex items-center justify-start">
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
            <div class="h-10">
              <base-button
                :action="pauseGeneratePoints"
                :text="$t('~~Pause')"
              ></base-button>
              <base-button
                :action="generatePoints"
                :text="$t('~~Start')"
              ></base-button>
            </div>
            <div class="flex-grow">
              <div class="relative h-full">
                <div
                  id="map"
                  ref="map"
                  class="absolute top-0 left-0 right-0 bottom-0"
                ></div>
                <div
                  style="z-index: 1001;"
                  class="legend absolute left-0 bottom-0 w-72 h-40 bg-white opacity-25 border-2 p-1"
                >
                  <div class="text-base font-bold my-1">{{ $t('Legend') }}</div>
                  <div class="flex flex-wrap justify-between">
                    <div
                      v-for="entry in displayedWorkTypeSvgs"
                      :key="entry.key"
                      class="flex items-center w-1/2 mb-1"
                    >
                      <div class="map-svg-container" v-html="entry.svg"></div>
                      <span class="text-xs ml-1">{{
                        entry.key | getWorkTypeName
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="h-32 border-t grid grid-rows-2 grid-cols-6"
              style="grid-gap: 1px;"
            >
              <div class="border-b border-r">
                <div
                  class="p-1 flex flex-col items-start justify-center h-full"
                >
                  <base-text variant="h3">{{
                    incidentStats.worksite_count
                  }}</base-text>
                  <div class="text-xs">All Cases</div>
                </div>
              </div>
              <div class="border-b border-r">
                <div
                  class="p-1 flex flex-col items-start justify-center h-full"
                >
                  <base-text variant="h3"
                    >{{ incidentStats.unclaimed_count }}
                  </base-text>
                  <div class="text-xs">Unclaimed</div>
                </div>
              </div>
              <div class="border-b border-r">
                <div
                  class="p-1 flex flex-col items-start justify-center h-full"
                >
                  <base-text variant="h3"
                    >{{ incidentStats.claimed_count }}
                  </base-text>
                  <div class="text-xs">Claimed</div>
                </div>
              </div>
              <div class="border-b border-r">
                <div
                  class="p-1 flex flex-col items-start justify-center h-full"
                >
                  <base-text variant="h3"
                    >{{ incidentStats.assigned_count }}
                  </base-text>
                  <div class="text-xs">Assinged</div>
                </div>
              </div>
              <div class="border-b border-r">
                <div
                  class="p-1 flex flex-col items-start justify-center h-full"
                >
                  <base-text variant="h3"
                    >{{ incidentStats.partial_count }}
                  </base-text>
                  <div class="text-xs">Partly Completed</div>
                </div>
              </div>
              <div class="border-b border-r">
                <div
                  class="p-1 flex flex-col items-start justify-center h-full"
                >
                  <base-text variant="h3"
                    >{{ incidentStats.closed_count }}
                  </base-text>
                  <div class="text-xs">Closed</div>
                </div>
              </div>
              <div class="border-b border-r">
                <div
                  class="p-1 flex flex-col items-start justify-center h-full"
                >
                  <base-text variant="h3"
                    >{{ incidentStats.overdue_count }}
                  </base-text>
                  <div class="text-xs">Overdue</div>
                </div>
              </div>
              <div class="border-b border-r">
                <div
                  class="p-1 flex flex-col items-start justify-center h-full"
                >
                  <base-text variant="h3">
                    {{ organizations.length }}</base-text
                  >
                  <div class="text-xs">Total Orgs</div>
                </div>
              </div>
              <div class="border-b border-r">
                <div
                  class="p-1 flex flex-col items-start justify-center h-full"
                >
                  <base-text variant="h3">0</base-text>
                  <div class="text-xs">Counties</div>
                </div>
              </div>
              <div class="border-b border-r">
                <div
                  class="p-1 flex flex-col items-start justify-center h-full"
                >
                  <base-text variant="h3">0</base-text>
                  <div class="text-xs">Volunteers</div>
                </div>
              </div>
              <div class="border-b border-r">
                <div
                  class="p-1 flex flex-col items-start justify-center h-full"
                >
                  <base-text variant="h3">0</base-text>
                  <div class="text-xs">Households</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-1 border grid grid-rows-12">
            <div class="row-span-7">
              <Table
                :columns="orgTable.columns"
                :data="organizations"
                style="height: 450px;"
                :body-style="{ maxHeight: '450px' }"
              ></Table>
            </div>
            <div class="row-span-5 border">
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

import {
  calcWaypoints,
  degreesToRadians,
  findBezierPoints,
  getMarkerLayer,
  mapAttribution,
  mapTileLayerDark as mapTileLayer,
} from '@/utils/map';
import { HomeNavigation } from '@/components/home/SideNav';
import Table from '@/components/Table';
import { getQueryString } from '@/utils/urls';
import BarChart from '@/components/charts/BarChart';
import { Sprite, Texture, Graphics, utils as pixiUtils } from 'pixi.js';
import Incident from '@/models/Incident';

export default {
  name: 'PewPew',
  components: { Table, BarChart },
  data() {
    return {
      markers: [],
      events: {},
      incidents: [],
      organizations: [],
      templates,
      colors,
      map: null,
      lastEventTimestamp: null,
      colorMode: 'Light Mode',
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
      incident: null,
      incidentStats: {},
      displayedWorkTypeSvgs: [],
      defaultWorkTypeSvgs: [
        {
          svg: templates.important.replace('{{fillColor}}', 'black'),
          name: this.$t(`worksiteMap.high_priority`),
        },
        {
          svg: templates.favorite.replace('{{fillColor}}', 'black'),
          name: this.$t(`worksiteMap.member_of_my_organization`),
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
          .replace('{{fillColor}}', 'black')
          .replace('{{strokeColor}}', 'black')
          .replace('{{multiple}}', '');
        return {
          svg,
          key: workType,
        };
      },
    );
    await this.getIncidentStats();
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
        limit: 500,
        event_key__in: Object.keys(this.events).join(','),
        sort: '-created_at',
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

      L.tileLayer(mapTileLayer, {
        // tileSize: 512,
        // zoomOffset: -1,
        attribution: mapAttribution,
        detectRetina: false,
        maxZoom: 18,
        noWrap: false,
      }).addTo(map);

      this.incidents = await this.getRecentIncidents();
      this.organizations = await this.getOrganizations();
      this.events = {
        user_join_wwwtsp_with_organization: 'patient',
        'user_join_work-type-status_with_wwwtsp': 'recipient',
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
      linksGraphics.currentPoint = 0;
      return linksGraphics;
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
          if (marker.actor_location) {
            const actorCoords = layer.utils.latLngToLayerPoint([
              marker.actor_location.coordinates[1],
              marker.actor_location.coordinates[0],
            ]);

            actorMarkerSprite = new Sprite();
            actorMarkerSprite.x = actorCoords.x;
            actorMarkerSprite.y = actorCoords.y;
            actorMarkerSprite.x0 = actorCoords.x;
            actorMarkerSprite.y0 = actorCoords.y;
            actorMarkerSprite.interactive = true;
            actorMarkerSprite.anchor.set(0.5, 0.5);
            actorMarkerSprite.type = 'actor';
            const svg = templates.orb
              .replace('{{fillColor}}', '#61D5F8')
              .replace('{{strokeColor}}', 'black');
            actorMarkerSprite.texture = Texture.from(svg);
            actorMarkerSprite.visible = true;
            layer._pixiContainer.addChild(actorMarkerSprite);
          }

          if (marker.recipient_location || marker.patient_location) {
            const location =
              marker[`${this.events[marker.event_key]}_location`];
            const patientCoords = layer.utils.latLngToLayerPoint([
              location.coordinates[1],
              location.coordinates[0],
            ]);

            const wwtsp = marker.attr[`${this.events[marker.event_key]}_wwtsp`];
            let color = 'red';
            if (wwtsp && wwtsp.length > 0) {
              const workType = wwtsp[0];
              const colorsKey = `${workType.status}_${
                workType.claimed_by ? 'claimed' : 'unclaimed'
              }`;
              // const worksiteTemplate = templates.circle;
              const spriteColors = colors[colorsKey];
              color = spriteColors.fillColor;
            } else if (
              marker.attr.recipient_status ||
              marker.attr.patient_status
            ) {
              const statusProp =
                marker.attr[`${this.events[marker.event_key]}_status`];
              const colorsKey = `${statusProp}_${'unclaimed'}`;
              const spriteColors = colors[colorsKey];
              color = spriteColors.fillColor;
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
            patientMarkerSprite.texture = Texture.from(svg);
            patientMarkerSprite.visible = true;
            patientMarkerSprite.color = color;
            layer._pixiContainer.addChild(patientMarkerSprite);
          }

          layer._renderer.render(layer._pixiContainer);
          layer.redraw();

          if (actorMarkerSprite && patientMarkerSprite) {
            const linksGraphics = this.createCurve(
              actorMarkerSprite,
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
      this.eventsInterval = setInterval(this.generateMarker, 1000);
    },
    pauseGeneratePoints() {
      clearInterval(this.eventsInterval);
      this.eventsInterval = null;
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
  },
  computed: {
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
</style>
