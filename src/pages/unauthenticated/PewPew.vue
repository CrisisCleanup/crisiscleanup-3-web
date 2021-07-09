<template>
  <div class="h-screen">
    <div class="grid grid-cols-5">
      <div
        class="col-span-1 shadow-lg h-screen flex flex-col"
        style="z-index: 1000"
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
                class="
                  flex
                  px-2
                  py-3
                  items-center
                  justify-between
                  text-xs
                  border-b
                "
              >
                <div>{{ $t('Volunteer Hours') }}</div>
                <div>{{ x }}</div>
              </div>
              <div class="flex grid grid-cols-2 border-b">
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
            <div class="h-10"></div>
            <div class="flex-grow">
              <div class="relative h-full">
                <div
                  id="map"
                  ref="map"
                  class="absolute top-0 left-0 right-0 bottom-0"
                ></div>
              </div>
            </div>
            <div
              class="h-32 border-t grid grid-rows-2 grid-cols-6"
              style="grid-gap: 1px"
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
                style="height: 450px"
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

import { getMarkerLayer, mapAttribution, mapTileLayer } from '@/utils/map';
import { HomeNavigation } from '@/components/home/SideNav';
import Table from '@/components/Table';
import { getQueryString } from '@/utils/urls';
import BarChart from '@/components/charts/BarChart';

export default {
  name: 'PewPew',
  components: { Table, BarChart },
  data() {
    return {
      markers: [],
      incidents: [],
      organizations: [],
      templates,
      colors,
      map: null,
      colorMode: 'Light Mode',
      routes: HomeNavigation,
      currentEvent: null,
      charts: {
        completion: {
          options: null,
          data: null,
        },
      },
      incidentStats: null,
    };
  },
  async mounted() {
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
        `${process.env.VUE_APP_API_BASE_URL}/incidents/60/organizations?${queryString}`,
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
    async renderMap() {
      if (!this.map) {
        this.map = L.map('map', {
          zoomControl: false,
        }).setView([35.7465122599185, -96.41150963125656], 10);
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
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/event_stream?limit=500`,
      );
      this.markers = response.data.results;
      [this.currentEvent] = this.markers;
      const worksiteLayer = getMarkerLayer(response.data.results, map, this);
      worksiteLayer.addTo(map);

      map.attributionControl.setPosition('bottomright');
    },
    async getCompletionRateData() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/completion_rate?start_date=2017-8-27&end_date=2017-10-27`,
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
        `${process.env.VUE_APP_API_BASE_URL}/reports_data/incident_statistics?incident=60`,
      );
      this.incidentStats = response.data;
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
