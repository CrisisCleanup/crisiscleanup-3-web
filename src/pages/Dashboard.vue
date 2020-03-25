<template>
  <Loader
    :loading="loading"
    class="p-6 bg-crisiscleanup-light-grey h-full overflow-auto"
  >
    <template #content>
      <div class="flex flex-col">
        <div class="flex self-end mr-4">
          <RedeployRequest />
          <InviteUsers class="mx-1" />
        </div>
        <div class="flex">
          <div class="w-1/4 m-4 p-6 shadow text-base bg-white">
            <div>
              {{ $t('dashboard.my_claimed_cases') }} ({{
                currentIncident.name
              }})
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
          <div class="m-4 pt-2 shadow bg-white w-full">
            <div class="py-4 px-4 text-gray-500 border-b">
              {{ $t('dashboard.my_cases') }}
            </div>
            <div class="p-4">
              <Table
                class=""
                :data="claimedWorksites"
                :columns="columns"
                :sorter="sorter"
                :loading="loading"
                :body-style="{ height: '300px' }"
                @change="handleTableChange"
              >
                <template #work_types="slotProps">
                  <div class="flex flex-wrap w-full">
                    <div
                      v-for="work_type in slotProps.item.work_types"
                      :key="work_type.id"
                      class="mx-1"
                    >
                      <StatusDropDown
                        class="block"
                        :current-work-type="work_type"
                        use-icon
                        @input="
                          value => {
                            statusValueChange(
                              value,
                              work_type,
                              slotProps.item.id,
                            );
                          }
                        "
                      />
                    </div>
                  </div>
                </template>
                <template #actions="slotProps">
                  <div class="flex">
                    <router-link
                      class=""
                      :to="
                        `/incident/${$route.params.incident_id}/cases/${slotProps.item.id}/edit?showOnMap=true`
                      "
                      tag="div"
                    >
                      <ccu-icon
                        :alt="$t('actions.jump_to_case')"
                        size="medium"
                        class="p-1 py-2 w-8"
                        type="go-case"
                      />
                    </router-link>
                    <ccu-icon
                      :alt="$t('actions.print')"
                      size="medium"
                      class="p-1 py-2 w-8"
                      type="print"
                      @click.native="
                        () => {
                          printWorksite(slotProps.item.id);
                        }
                      "
                    />
                  </div>
                </template>
              </Table>
            </div>
          </div>
        </div>
        <div class="flex">
          <div class="w-full m-4 pt-2 shadow bg-white flex-shrink">
            <div class="py-4 px-4 text-gray-500 border-b">
              {{ $t('dashboard.pending_cases') }}
            </div>
            <div class="py-4 px-4 border-b flex items-center">
              <base-button
                v-if="
                  $can('approve_work_type_transfers') ||
                    $can('receive_work_type_transfer_requests')
                "
                class="mr-2 border-r pr-2"
                size="medium"
                text="Inbound Requests"
                :class="[pendingView === 'inbound' ? 'text-primary-dark' : '']"
                @click.native="pendingView = 'inbound'"
                variant="text"
              />

              <base-button
                class="mr-2 border-r pr-2"
                size="medium"
                text="Outbound Requests"
                :class="[pendingView === 'outbound' ? 'text-primary-dark' : '']"
                @click.native="pendingView = 'outbound'"
                variant="text"
              />

              <base-button
                class="mr-2"
                size="medium"
                text="Archived Requests"
                :class="[pendingView === 'archived' ? 'text-primary-dark' : '']"
                @click.native="pendingView = 'archived'"
                variant="text"
              />
            </div>
            <div class="p-4">
              <Table
                class=""
                :data="worksiteRequests"
                :columns="pendingCasesColumns"
                :sorter="pendingSorter"
                :loading="pendingViewLoading"
                :body-style="{ height: '300px' }"
                @change="handlePendingTableChange"
              >
                <template #worksite_work_type="slotProps">
                  <div class="flex items-center w-full">
                    <div
                      class="flex p-1 items-center justify-center"
                      :style="{
                        backgroundColor: `${getColorForStatus(
                          slotProps.item.worksite_work_type.status,
                          Boolean(slotProps.item.worksite_work_type.claimed_by),
                        )}3D`,
                      }"
                    >
                      <div
                        class="case-svg-container"
                        v-html="
                          getWorkTypeImage(slotProps.item.worksite_work_type)
                        "
                      ></div>
                    </div>
                  </div>
                </template>
                <template #organization="slotProps">
                  <div class="flex flex-col">
                    {{ slotProps.item.requested_to_org.name }}
                  </div>
                </template>
                <template #work_type="slotProps">
                  <div class="flex flex-col">
                    {{ slotProps.item.worksite_work_type }}
                  </div>
                </template>
                <template #actions="slotProps">
                  <div class="flex items-center justify-start">
                    <div
                      v-if="pendingView === 'inbound'"
                      class="flex items-center justify-start"
                    >
                      <base-button
                        class="px-2 py-1 mx-2 bg-crisiscleanup-green-700 text-white"
                        :text="$t('actions.accept')"
                        :action="() => acceptRequest(slotProps.item.id)"
                      />
                      <base-button
                        class="px-2 py-1 mx-2 bg-crisiscleanup-red-700 text-white"
                        :text="$t('actions.reject')"
                        :action="() => rejectRequest(slotProps.item.id)"
                      />
                    </div>
                    <div v-if="pendingView === 'outbound'">
                      <base-button
                        class="px-2 py-1 mx-2 bg-crisiscleanup-red-700 text-white"
                        :text="$t('actions.cancel')"
                        :action="() => cancelRequest(slotProps.item.id)"
                      />
                    </div>
                    <div v-if="pendingView !== 'archived'">
                      <base-button
                        class="px-2 py-1 mx-2 border-black border"
                        :text="$t('actions.ignore')"
                        :action="() => archiveRequest(slotProps.item.id)"
                      />
                    </div>
                    <div v-if="pendingView === 'archived'">
                      <base-button
                        class="px-2 py-1 mx-2"
                        variant="solid"
                        :text="$t('actions.history')"
                      />
                    </div>
                  </div>
                </template>
              </Table>
            </div>
          </div>
        </div>
        <div class="flex" v-can="['approve_orgs_full']">
          <div class="m-4 pt-2 shadow bg-white w-full">
            <div class="py-4 px-4 text-gray-500 border-b">
              {{ $t('dashboard.pending_affiliates') }}
            </div>
            <div class="p-4">
              <OrganizationApprovalTable
                :organizations="organizations"
                @reload="getOrganizationsForApproval"
              ></OrganizationApprovalTable>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Loader>
</template>

<script>
import { mapState } from 'vuex';
import { create } from 'vue-modal-dialogs';
import Worksite from '@/models/Worksite';
import Organization from '@/models/Organization';
import User from '@/models/User';
import Status from '@/models/Status';
import { getQueryString } from '@/utils/urls';
import { getErrorMessage } from '@/utils/errors';
import { rand } from '@/utils/charts';
import { colors } from '@/icons/icons_templates';
import Incident from '@/models/Incident';
import WorksiteRequest from '@/models/WorksiteRequest';
import Table from '@/components/Table';
import { getColorForStatus, getWorkTypeImage } from '@/filters';
import StatusDropDown from '@/components/StatusDropDown';
import { forceFileDownload } from '@/utils/downloads';
import MessageResponseDialog from '@/components/dialogs/MessageResponseDialog';
import Loader from '@/components/Loader';
import InviteUsers from './organization/InviteUsers';
import OrganizationApprovalTable from '../components/OrganizationApprovalTable';
import RedeployRequest from './RedeployRequest';

const responseDialog = create(MessageResponseDialog);

export default {
  name: 'Dashboard',
  components: {
    RedeployRequest,
    OrganizationApprovalTable,
    InviteUsers,
    Table,
    StatusDropDown,
    Loader,
  },
  data() {
    return {
      usersToInvite: '',
      totalWorksites: 0,
      totalClaimed: 0,
      totalClosed: 0,
      totalInProgess: 0,
      organizations: [],
      loading: false,
      datacollection: null,
      pendingViewLoading: false,
      pendingView:
        this.$can('approve_work_type_transfers') ||
        this.$can('receive_work_type_transfer_requests')
          ? 'inbound'
          : 'outbound',
      colors,
      sorter: {
        key: null,
        direction: null,
      },
      pendingSorter: {
        key: null,
        direction: null,
      },
      getColorForStatus,
      getWorkTypeImage,
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
      pendingCasesColumns: [
        {
          title: this.$t('dashboard.no'),
          dataIndex: 'case_number',
          key: 'case_number',
          width: '80px',
          sortable: true,
        },
        {
          title: this.$t('dashboard.work_type'),
          dataIndex: 'worksite_work_type',
          key: 'worksite_work_type',
          width: '10%',
        },
        {
          title: this.$t('dashboard.status'),
          dataIndex: 'status',
          key: 'status',
          width: '0.5fr',
        },
        {
          title: this.$t('dashboard.org_label'),
          dataIndex: 'organization',
          key: 'organization',
        },
        {
          title: this.$t('dashboard.last_action'),
          dataIndex: 'last_action',
          key: 'last_action',
        },
        {
          title: this.$t('dashboard.next_action'),
          dataIndex: 'next_action',
          key: 'next_action',
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
        },
      ],
    };
  },
  computed: {
    columns() {
      return [
        {
          title: this.$t('dashboard.no'),
          dataIndex: 'case_number',
          key: 'case_number',
          width: '0.5fr',
          sortable: true,
        },
        {
          title: this.$t('dashboard.work_type'),
          dataIndex: 'work_types',
          key: 'work_types',
          scopedSlots: { customRender: 'work_types' },
          width: '2fr',
        },
        {
          title: this.$t('dashboard.name'),
          dataIndex: 'name',
          key: 'name',
          width: '1fr',
          sortable: true,
        },
        {
          title: this.$t('dashboard.full_address'),
          dataIndex: 'short_address',
          key: 'short_address',
        },
        {
          title: this.$t('dashboard.phone'),
          dataIndex: 'phone1',
          key: 'phone1',
          sortable: false,
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          sortable: false,
        },
      ];
    },
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
    worksiteRequests() {
      const preferences = this.currentUser.preferences || {};
      const archivedRequests = preferences.archived_worksite_requests || [];
      const query = WorksiteRequest.query();
      if (this.pendingSorter.key) {
        let { key } = this.pendingSorter;
        if (key === 'case_number') {
          key = 'id';
        }
        query.orderBy(this.pendingSorter.key, this.pendingSorter.direction);
      }
      if (this.pendingView === 'inbound') {
        return query
          .where(
            request =>
              Number(request.requested_to_org.id) ===
                Number(this.currentUser.organization.id) &&
              !archivedRequests.includes(request.id) &&
              !request.has_response,
          )
          .get();
      }
      if (this.pendingView === 'outbound') {
        return query
          .where(
            request =>
              Number(request.requested_by_org.id) ===
                Number(this.currentUser.organization.id) &&
              !archivedRequests.includes(request.id) &&
              !request.has_response,
          )
          .get();
      }
      if (this.pendingView === 'archived') {
        return query
          .whereIdIn(archivedRequests)
          .orWhere('has_response', true)
          .get();
      }
      return [];
    },
    ...mapState('incident', ['currentIncidentId']),
    claimedWorksites() {
      const query = Worksite.query().where(worksite => {
        if (
          worksite.work_types &&
          this.currentIncidentId === worksite.incident
        ) {
          const claimed = worksite.work_types.find(
            workType =>
              workType.claimed_by === this.currentUser.organization.id,
          );
          return Boolean(claimed);
        }
        return false;
      });
      if (this.sorter.key) {
        let { key } = this.sorter;
        if (key === 'case_number') {
          key = 'id';
        }
        query.orderBy(this.sorter.key, this.sorter.direction);
      }
      return query.get();
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
    if (this.currentIncidentId && !this.$route.params.incident_id) {
      await this.$router.replace(
        `/incident/${this.currentIncidentId}/dashboard`,
      );
    }
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
        this.getWorksiteRequests(),
        this.getWorksiteCount(),
        this.getClaimedCount(),
        this.getInProgessCount(),
        this.getClosedCount(),
        this.getOrganizationsForApproval(),
      ]);
    },
    async getOrganizationsForApproval() {
      const params = {
        approved_by__isnull: true,
        rejected_by__isnull: true,
      };
      const queryString = getQueryString(params);

      const results = await Organization.api().get(
        `/organizations?${queryString}`,
        {
          dataKey: 'results',
        },
      );
      if (results.entities.organizations) {
        this.organizations = [...results.entities.organizations];
      }
    },
    async statusValueChange(value, workType, worksiteId) {
      try {
        await Worksite.api().updateWorkTypeStatus(workType.id, value);
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        await Worksite.api().fetch(worksiteId);
      }
    },
    handleTableChange({ sorter }) {
      this.sorter = { ...sorter };
    },
    handlePendingTableChange({ sorter }) {
      this.pendingSorter = { ...sorter };
    },
    async printWorksite(worksiteId) {
      this.spinning = true;
      const pdf = await Worksite.api().printWorksite(worksiteId);
      forceFileDownload(pdf.response);
      this.spinning = false;
    },
    async inviteUsers() {
      try {
        const emails = this.usersToInvite.split(',');
        await Promise.all(emails.map(email => User.api().inviteUser(email)));
        await this.$toasted.success(
          this.$t('inviteTeammates.invites_sent_success'),
        );
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async archiveRequest(id) {
      const preferences = this.currentUser.preferences || {};
      const archivedRequests = preferences.archived_worksite_requests || [];
      User.api().updateUserPreferences({
        archived_worksite_requests: [id, ...archivedRequests],
      });
      await this.getWorksiteRequests();
    },
    async acceptRequest(id) {
      const result = await responseDialog({
        title: this.$t('actions.approve_worksite_request'),
        content: this.$t('dashboard.approve_worksite_request_reason'),
      });
      if (result) {
        await WorksiteRequest.api().acceptRequest(id, result);
        await this.getWorksiteRequests();
      }
    },
    async rejectRequest(id) {
      const result = await responseDialog({
        title: this.$t('actions.reject_worksite_request'),
        content: this.$t('dashboard.reject_worksite_request_reason'),
      });
      if (result) {
        await WorksiteRequest.api().rejectRequest(id, result);
        await this.getWorksiteRequests();
      }
    },
    async cancelRequest(id) {
      await WorksiteRequest.api().cancelRequest(id);
      await this.getWorksiteRequests();
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
    async getWorksiteRequests() {
      WorksiteRequest.deleteAll();
      this.pendingViewLoading = true;
      await WorksiteRequest.api().get(`/worksite_requests`, {
        dataKey: 'results',
      });
      this.pendingViewLoading = false;
    },
    async getWorksiteCount() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites`,
        {
          params: {
            incident: this.currentIncidentId,
            limit: 1,
            fields: 'id',
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
    getPrimaryWorkType(workTypes) {
      return Worksite.getWorkType(
        workTypes,
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
            label: this.$t('dashboard.closed'),
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
