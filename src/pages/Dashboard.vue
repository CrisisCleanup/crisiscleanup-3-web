<template>
  <div class="p-6 bg-gray-100 h-full overflow-auto relative">
    <div v-if="!loading">
      <div class="flex">
        <div class="w-1/4 m-4 p-6 shadow text-base bg-white">
          <div>
            {{ $t('dashboard.my_claimed_cases') }} ({{ currentIncident.name }})
          </div>
          <div class="font-bold">
            {{ claimedWorksites.length | numeral('0,0') }}
          </div>
        </div>
        <div class="w-1/4 m-4 p-6 shadow text-base bg-white relative">
          <div>
            {{ $t('dashboard.total_claimed') }} ({{ currentIncident.name }})
          </div>
          <div class="font-bold">
            {{ totalClaimed | numeral('0,0') }} ({{
              (totalClaimed / totalWorksites) | numeral('0%')
            }}
            of Total)
          </div>
          <div
            class="bottom-0 left-0 absolute border-b-4 border-blue-600"
            :style="{ width: `${(totalClaimed / totalWorksites) * 100}%` }"
          ></div>
        </div>
        <div class="w-1/4 m-4 p-6 shadow text-base bg-white relative">
          <div>
            {{ $t('dashboard.in_progress') }} ({{ currentIncident.name }})
          </div>
          <div class="font-bold">
            {{ totalInProgess | numeral('0,0') }} ({{
              (totalInProgess / totalWorksites) | numeral('0%')
            }}
            of Claimed)
          </div>
          <div
            class="bottom-0 left-0 absolute border-b-4 border-blue-600"
            :style="{ width: `${(totalInProgess / totalWorksites) * 100}%` }"
          ></div>
        </div>
        <div class="w-1/4 m-4 p-6 shadow text-base bg-white relative">
          <div>{{ $t('dashboard.closed') }} ({{ currentIncident.name }})</div>
          <div class="font-bold">
            {{ totalClosed | numeral('0,0') }} ({{
              (totalClosed / totalWorksites) | numeral('0%')
            }}
            {{ $t('of Claimed') }})
          </div>
          <div
            class="bottom-0 left-0 absolute border-b-4 border-green-600"
            :style="{ width: `${(totalClosed / totalWorksites) * 100}%` }"
          ></div>
        </div>
      </div>
      <div class="flex">
        <div class="w-3/5 m-4 pt-2 shadow bg-white flex-shrink">
          <div class="py-4 px-4 text-gray-500 border-b">
            {{ $t('MY CASES') }}
          </div>
          <div class="p-4">
            <template v-for="worksite in claimedWorksites">
              <template>
                <div
                  :key="worksite.id"
                  class="flex justify-between items-center border-b last:border-b-0 py-2"
                >
                  <div class="badge-holder flex items-center w-20">
                    <badge
                      class="mx-1"
                      :color="
                        getPrimaryWorkType(worksite.work_types)
                          | getColorForWorkType
                      "
                    />
                    {{ worksite.case_number }}
                  </div>
                  <div class="w-4/12">
                    <template v-for="(work_type, index) in worksite.work_types">
                      <span
                        v-if="
                          work_type.claimed_by === currentUser.organization.id
                        "
                        :key="work_type.id"
                        >{{ work_type.work_type | getWorkTypeName }}
                        <span v-if="index !== worksite.work_types.length - 1"
                          >,</span
                        ></span
                      >
                    </template>
                  </div>
                  <span class="w-3/12">{{ worksite.name }}</span>
                  <span class="w-3/12">{{
                    worksite.form_fields && worksite.form_fields.phone1
                  }}</span>
                  <router-link
                    class="w-1/12 self-end"
                    :to="
                      `/incident/${$route.params.incident_id}/cases/${worksite.id}/edit?showOnMap=true`
                    "
                    tag="div"
                  >
                    <ccu-icon
                      alt="Jump to Case"
                      size="medium"
                      class="p-1 py-2"
                      type="go-case"
                    />
                  </router-link>
                </div>
              </template>
            </template>
          </div>
        </div>
        <div class="w-2/5 m-4 p-6 shadow bg-white">
          <div class="flex flex-col items-center justify-around">
            <div class="text-center text-2xl w-2/3 my-3">
              {{ $t('dashboard.invite_teammates') }}
            </div>
            <div class="text-justify w-5/6 my-3">
              <div class="my-3">
                {{ $t('inviteTeammates.invite_teammates_instructions') }}
              </div>
              <base-input
                v-model="usersToInvite"
                size="large"
                class="flex-grow my-3"
                :placeholder="$t('Emails')"
              />
            </div>
            <base-button
              :text="$t('inviteTeammates.send_invites')"
              type="primary"
              class="px-8 py-3"
              :action="inviteUsers"
            />
          </div>
        </div>
      </div>
      <div class="flex">
        <div class="w-full m-4 pt-2 shadow bg-white flex-shrink">
          <div class="py-4 px-4 text-gray-500 border-b">
            {{ $t('dashboard.worksite_completion') }}
          </div>
          <div class="p-4">
            <div class="small">
              <line-chart :chart-data="datacollection" :options="options" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="loading"
      style="z-index: 1001;"
      class="absolute bottom-0 left-0 right-0 top-0 bg-gray-100 opacity-75 flex items-center justify-center"
    >
      <div class="flex flex-col items-center">
        <spinner :message="$t('Loading...')" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Worksite from '@/models/Worksite';
import User from '@/models/User';
import Status from '@/models/Status';
import { getQueryString } from '@/utils/urls';
import { getErrorMessage } from '@/utils/errors';
import LineChart from '@/components/charts/LineChart';
import { rand } from '@/utils/charts';
import { colors } from '@/icons/icons_templates';
import Incident from '@/models/Incident';

export default {
  name: 'Dashboard',
  components: { LineChart },
  data() {
    return {
      usersToInvite: '',
      totalWorksites: 0,
      totalClaimed: 0,
      totalClosed: 0,
      totalInProgess: 0,
      loading: false,
      datacollection: null,
      colors,
      options: {
        responsive: true,
        hoverMode: 'index',
        stacked: false,
        title: {
          display: true,
        },
        legend: {
          align: 'end',
        },
        scales: {
          yAxes: [
            {
              type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
              display: true,
              position: 'left',
              ticks: {
                beginAtZero: true,
                stepSize: 50,
              },
              scaleLabel: {
                labelString: 'Cases',
                display: true,
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              scaleLabel: {
                labelString: 'Date',
                display: true,
              },
            },
          ],
        },
      },
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    currentIncident() {
      const incident = Incident.find(this.currentIncidentId);
      if (incident) {
        return incident;
      }
      return {};
    },
    ...mapState('incident', ['currentIncidentId']),
    claimedWorksites() {
      return Worksite.query()
        .where(worksite => {
          if (
            worksite.work_types &&
            this.currentIncidentId === worksite.incident
          ) {
            return worksite.work_types.find(
              work_type =>
                work_type.claimed_by === this.currentUser.organization.id,
            );
          }
          return false;
        })
        .get();
    },
  },
  watch: {
    async currentIncidentId() {
      await Worksite.deleteAll();
      this.loading = true;
      await this.reloadDashBoard();
      this.loading = false;
    },
  },
  async mounted() {
    this.loading = true;
    await this.reloadDashBoard();
    this.fillData();
    this.loading = false;
  },
  methods: {
    async reloadDashBoard() {
      await Promise.all([
        this.getClaimedWorksites(),
        this.getReportedWorkSites(),
        this.getWorksiteCount(),
        this.getClaimedCount(),
        this.getInProgessCount(),
        this.getClosedCount(),
      ]);
    },
    async inviteUsers() {
      try {
        const emails = this.usersToInvite.split(',');
        await Promise.all(emails.map(email => User.api().inviteUser(email)));
        await this.$message.success(this.$t('inviteTeammates.invites_sent_success'));
      } catch (error) {
        await this.$message.error(getErrorMessage(error));
      }
    },
    async getClaimedWorksites() {
      const params = {
        incident: this.currentIncidentId,
        work_type__claimed_by: this.currentUser.organization.id,
        fields:
          'id,name,address,case_number,work_types,city,state,county,flags,location,incident,postal_code,reported_by,form_data',
      };

      Worksite.api().get(`/worksites?${getQueryString(params)}`, {
        dataKey: 'results',
      });
    },
    async getReportedWorkSites() {
      const params = {
        incident: this.currentIncidentId,
        reported_by: this.currentUser.organization.id,
        fields:
          'id,name,address,case_number,work_types,city,state,county,flags,location,incident,postal_code,reported_by',
      };

      Worksite.api().get(`/worksites?${getQueryString(params)}`, {
        dataKey: 'results',
      });
    },
    async getWorksiteCount() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites`,
        {
          params: {
            incident: this.currentIncidentId,
            limit: 1,
          },
        },
      );
      this.totalWorksites = response.data.count;
    },
    async getClaimedCount() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites`,
        {
          params: {
            incident: this.currentIncidentId,
            limit: 1,
            work_type__claimed_by__isnull: false,
            fields: 'id',
          },
        },
      );
      this.totalClaimed = response.data.count;
    },
    async getInProgessCount() {
      const openStatuses = Status.query()
        .where('primary_state', 'open')
        .get();

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites`,
        {
          params: {
            incident: this.currentIncidentId,
            limit: 1,
            work_type__status__in: openStatuses
              .map(status => status.status)
              .join(','),
            fields: 'id',
          },
        },
      );
      this.totalInProgess = response.data.count;
    },
    async getClosedCount() {
      const closedStatuses = Status.query()
        .where('primary_state', 'closed')
        .get();

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites`,
        {
          params: {
            incident: this.currentIncidentId,
            limit: 1,
            work_type__status__in: closedStatuses
              .map(status => status.status)
              .join(','),
            fields: 'id',
          },
        },
      );
      this.totalClosed = response.data.count;
    },
    getPrimaryWorkType(work_types) {
      return Worksite.getWorkType(
        work_types,
        null,
        this.currentUser.organization,
      );
    },
    fillData() {
      const date = new Date();
      let chckDates = Array(44).fill(1);
      chckDates = chckDates.map(i => {
        date.setDate(date.getDate() + i);
        return date.getDate();
      });
      this.datacollection = {
        labels: chckDates,
        datasets: [
          {
            label: this.$t('dashboard.total_claimed'),
            borderColor: '#00bbe7',
            borderWidth: '2',
            pointRadius: 0,
            backgroundColor: 'rgba(0, 187, 230, 0.1)',
            fill: true,
            data: chckDates.map(() => this.randomScalingFactor(150, 230)),
          },
          {
            label: this.$t('dashboard.total_reported'),
            borderColor: '#13e768',
            borderWidth: '2',
            pointRadius: 0,
            fill: false,
            data: chckDates.map(() => this.randomScalingFactor(100, 170)),
          },
          {
            label: this.$t('dashboard.what_is_this'),
            borderColor: 'red',
            borderWidth: '1',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            data: chckDates.map(() => 60),
          },
        ],
      };
    },
    randomScalingFactor(x, y) {
      return Math.round(rand(x, y));
    },
  },
};
</script>

<style scoped></style>
