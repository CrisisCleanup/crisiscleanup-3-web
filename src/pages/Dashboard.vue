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

        <div class="flex flex-wrap">
          <div
            class="w-full md:w-1/2 xl:w-1/4 p-3 cursor-pointer"
            @click="$router.push(`/incident/${currentIncidentId}/work`)"
          >
            <!--Metric Card-->
            <div
              class="bg-crisiscleanup-lightblue-100 rounded-lg shadow-lg p-5"
            >
              <div class="flex flex-row items-center">
                <div class="flex-shrink pr-4">
                  <div class="rounded-full p-1 bg-crisiscleanup-lightblue-900">
                    <img src="@/assets/icons/cases.svg" style="height: 50px" />
                  </div>
                </div>
                <div class="flex-1 text-right md:text-center">
                  <h5 class="uppercase text-grey-900">
                    {{ $t('dashboard.my_claimed_cases') }} ({{
                      currentIncident.name
                    }})
                  </h5>
                  <h3 class="text-3xl">
                    {{ claimedWorksites.length | numeral('0,0') }}
                    <span class="text-green"
                      ><i class="fas fa-caret-up"></i
                    ></span>
                  </h3>
                </div>
              </div>
            </div>
            <!--/Metric Card-->
          </div>

          <div
            class="w-full md:w-1/2 xl:w-1/4 p-3 cursor-pointer"
            @click="$router.push(`/incident/${currentIncidentId}/work`)"
          >
            <!--Metric Card-->
            <div class="bg-crisiscleanup-yellow-100 rounded-lg shadow-lg">
              <div class="flex flex-row items-center p-5">
                <div class="flex-shrink pr-4">
                  <div class="rounded-full p-1 bg-crisiscleanup-yellow-900">
                    <img src="@/assets/icons/cases.svg" style="height: 50px" />
                  </div>
                </div>
                <div class="flex-1 text-right md:text-center">
                  <h5 class="uppercase text-grey-900">
                    {{ $t('dashboard.total_claimed') }} ({{
                      currentIncident.name
                    }})
                  </h5>
                  <h3 class="text-3xl">
                    {{ totalClaimed | numeral('0,0') }}
                    <span class="text-base">
                      ({{ (totalClaimed / totalWorksites) | numeral('0%') }}
                      {{ $t('dashboard.of_total') }})
                    </span>
                    <span class="text-orange"
                      ><i class="fas fa-exchange-alt"></i
                    ></span>
                  </h3>
                </div>
              </div>
              <div
                class="
                  bottom-0
                  left-0
                  border-b-4
                  rounded-b-lg
                  border-yellow-600
                "
                :style="{ width: `${(totalClaimed / totalWorksites) * 100}%` }"
              ></div>
            </div>
            <!--/Metric Card-->
          </div>

          <div
            class="w-full md:w-1/2 xl:w-1/4 p-3 cursor-pointer"
            @click="$router.push(`/incident/${currentIncidentId}/work`)"
          >
            <!--Metric Card-->
            <div class="bg-orange-400 rounded-lg shadow-lg">
              <div class="flex flex-row items-center p-5">
                <div class="flex-shrink pr-4">
                  <div class="rounded-full p-1 bg-orange-600">
                    <img src="@/assets/icons/cases.svg" style="height: 50px" />
                  </div>
                </div>
                <div class="flex-1 text-right md:text-center">
                  <h5 class="uppercase text-grey-900">
                    {{ $t('dashboard.in_progress') }} ({{
                      currentIncident.name
                    }})
                  </h5>
                  <h3 class="text-3xl">
                    {{ totalInProgess | numeral('0,0') }}
                    <span class="text-base">
                      ({{ (totalInProgess / totalWorksites) | numeral('0%') }}
                      {{ $t('dashboard.of_total') }})
                    </span>
                    <span class="text-yellow-900"
                      ><i class="fas fa-caret-up"></i
                    ></span>
                  </h3>
                </div>
              </div>
              <div
                class="
                  bottom-0
                  left-0
                  border-b-4
                  rounded-b-lg
                  border-orange-600
                "
                :style="{
                  width: `${(totalInProgess / totalWorksites) * 100}%`,
                }"
              ></div>
            </div>
            <!--/Metric Card-->
          </div>

          <div
            class="w-full md:w-1/2 xl:w-1/4 p-3 cursor-pointer"
            @click="$router.push(`/incident/${currentIncidentId}/work`)"
          >
            <!--Metric Card-->
            <div class="bg-crisiscleanup-green-100 rounded-lg shadow-lg">
              <div class="flex flex-row items-center p-5">
                <div class="flex-shrink pr-4">
                  <div class="rounded-full p-1 bg-crisiscleanup-green-900">
                    <img src="@/assets/icons/cases.svg" style="height: 50px" />
                  </div>
                </div>
                <div class="flex-1 text-right md:text-center">
                  <h5 class="uppercase text-grey-900">
                    {{ $t('dashboard.closed') }} ({{ currentIncident.name }})
                  </h5>
                  <h3 class="text-3xl">
                    {{ totalClosed | numeral('0,0') }}
                    <span class="text-base">
                      ({{ (totalClosed / totalWorksites) | numeral('0%') }}
                      {{ $t('dashboard.of_total') }})
                    </span>
                  </h3>
                </div>
              </div>
              <div
                class="bottom-0 left-0 border-b-4 rounded-b-lg border-green-600"
                :style="{ width: `${(totalClosed / totalWorksites) * 100}%` }"
              ></div>
            </div>
            <!--/Metric Card-->
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
                enable-column-search
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
                      <WorksiteStatusDropdown
                        class="block"
                        :current-work-type="work_type"
                        use-icon
                        @input="
                          (value) => {
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
                <template #case_number="slotProps">
                  <router-link
                    class=""
                    :to="`/incident/${$route.params.incident_id}/work/${slotProps.item.id}?showOnMap=true`"
                    tag="div"
                  >
                    {{ slotProps.item.case_number }}
                  </router-link>
                </template>
                <template #phone="slotProps">
                  <router-link
                    class=""
                    :to="`/incident/${$route.params.incident_id}/work/${slotProps.item.id}?showOnMap=true`"
                    tag="div"
                  >
                    {{ slotProps.item.phone }}
                  </router-link>
                </template>
                <template #full_address="slotProps">
                  <router-link
                    class=""
                    :to="`/incident/${$route.params.incident_id}/work/${slotProps.item.id}?showOnMap=true`"
                    tag="div"
                  >
                    {{ slotProps.item.full_address }}
                  </router-link>
                </template>
                <template #name="slotProps">
                  <router-link
                    class=""
                    :to="`/incident/${$route.params.incident_id}/work/${slotProps.item.id}?showOnMap=true`"
                    tag="div"
                  >
                    {{ slotProps.item.name }}
                  </router-link>
                </template>
                <template #actions="slotProps">
                  <div class="flex">
                    <router-link
                      class=""
                      :to="`/incident/${$route.params.incident_id}/work/${slotProps.item.id}?showOnMap=true`"
                      tag="div"
                    >
                      <ccu-icon
                        :alt="$t('actions.jump_to_case')"
                        size="medium"
                        class="p-1 py-2 w-8"
                        type="go-case"
                        :linked="true"
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
              {{ $t('dashboard.case_transfer_requests') }}
            </div>
            <div class="py-4 px-4 border-b flex items-center">
              <base-button
                class="mr-2 border-r pr-2"
                size="medium"
                :text="$t('dashboard.inbound_requests')"
                :class="[pendingView === 'inbound' ? 'text-primary-dark' : '']"
                @click.native="pendingView = 'inbound'"
                variant="text"
              />

              <base-button
                class="mr-2 border-r pr-2"
                size="medium"
                :text="$t('dashboard.outbound_requests')"
                :class="[pendingView === 'outbound' ? 'text-primary-dark' : '']"
                @click.native="pendingView = 'outbound'"
                variant="text"
              />

              <base-button
                class="mr-2"
                size="medium"
                :text="$t('dashboard.archived_requests')"
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
                        class="
                          px-2
                          py-1
                          mx-2
                          bg-crisiscleanup-green-700
                          text-white
                        "
                        :text="$t('actions.accept')"
                        :action="() => acceptRequest(slotProps.item.id)"
                      />
                      <base-button
                        class="
                          px-2
                          py-1
                          mx-2
                          bg-crisiscleanup-red-700
                          text-white
                        "
                        :text="$t('actions.reject')"
                        :action="() => rejectRequest(slotProps.item.id)"
                      />
                    </div>
                    <div v-if="pendingView === 'outbound'">
                      <base-button
                        class="
                          px-2
                          py-1
                          mx-2
                          bg-crisiscleanup-red-700
                          text-white
                        "
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
        <div class="flex">
          <div class="w-full m-4 pt-2 shadow bg-white flex-shrink">
            <div class="py-4 px-4 text-gray-500 border-b">
              {{ $t('dashboard.user_transfer_requests') }}
            </div>
            <div class="p-4">
              <UserTransferRequestTable
                :requests="transferRequests"
                @reload="getUserTransferRequests"
              />
            </div>
          </div>
        </div>

        <div>
          <div
            v-for="[key, value] in Object.entries(widgetsData)"
            :key="key"
            class="items-center justify-center my-10 ml-8"
          >
            <ReportWidget
              :current-filters="{}"
              :widget-key="key"
              :value="value"
            />
          </div>
        </div>
      </div>
    </template>
  </Loader>
</template>

<script>
import { mapState } from 'vuex';
import Worksite from '@/models/Worksite';
import User from '@/models/User';
import { getQueryString } from '@/utils/urls';
import { getErrorMessage } from '@/utils/errors';
import { colors } from '@/icons/icons_templates';
import Incident from '@/models/Incident';
import WorksiteRequest from '@/models/WorksiteRequest';
import Table from '@/components/Table';
import {
  getColorForStatus,
  getWorkTypeImage,
  getWorkTypeName,
} from '@/filters';
import WorksiteStatusDropdown from '@/components/WorksiteStatusDropdown';
import { forceFileDownload } from '@/utils/downloads';
import Loader from '@/components/Loader';
import InviteUsers from './organization/InviteUsers';
import RedeployRequest from './RedeployRequest';
import { DialogsMixin } from '../mixins';
import UserTransferRequestTable from '../components/UserTransferRequestTable';
import { transformWidgetData } from '@/utils/reports';
import ReportWidget from '@/components/reports/ReportWidget';

export default {
  name: 'Dashboard',
  mixins: [DialogsMixin],
  components: {
    ReportWidget,
    UserTransferRequestTable,
    RedeployRequest,
    InviteUsers,
    Table,
    WorksiteStatusDropdown,
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
      incident_requests: [],
      transferRequests: [],
      reportWidgets: [],
      widgetsData: {},
      loading: false,
      datacollection: null,
      pendingViewLoading: false,
      pendingView: 'inbound',
      colors,
      sorter: {
        key: null,
        direction: null,
      },
      columnSearch: {},
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
          width: '0.75fr',
          sortable: true,
          searchable: true,
          searchTitle: this.$t('all'),
        },
        {
          title: this.$t('dashboard.work_type'),
          dataIndex: 'work_types',
          key: 'work_types',
          scopedSlots: { customRender: 'work_types' },
          width: '2fr',
          searchable: true,
          searchSelect: true,
          getSelectValues: (data) => {
            const values = {};
            if (data && data.length) {
              data.forEach((item) => {
                item.work_types.forEach((wt) => {
                  values[wt.work_type] = true;
                });
              });
              return Object.keys(values).map((key) => {
                return {
                  value: key,
                  name_t: getWorkTypeName(key),
                };
              });
            }
            return [];
          },
          searchTitle: this.$t('dashboard.all_time'),
        },
        {
          title: this.$t('dashboard.name'),
          dataIndex: 'name',
          key: 'name',
          width: '1fr',
          sortable: true,
          searchable: true,
          searchTitle: this.$t('all'),
        },
        {
          title: this.$t('dashboard.full_address'),
          dataIndex: 'short_address',
          key: 'short_address',
          searchable: true,
          searchTitle: this.$t('all'),
        },
        {
          title: this.$t('dashboard.phone'),
          dataIndex: 'phone1',
          key: 'phone1',
          sortable: false,
          searchable: true,
          searchTitle: this.$t('all'),
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
            (request) =>
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
            (request) =>
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
    ...mapState('enums', ['statuses']),
    claimedWorksites() {
      const query = Worksite.query().where((worksite) => {
        if (
          worksite.work_types &&
          this.currentIncidentId === worksite.incident
        ) {
          const claimed = worksite.work_types.find(
            (workType) =>
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

      if (Object.keys(this.columnSearch).length) {
        Object.entries(this.columnSearch).forEach(([key, value]) => {
          if (value) {
            query.where(key, (prop) =>
              JSON.stringify(prop).toLowerCase().includes(value.toLowerCase()),
            );
          }
        });
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
        this.getUserTransferRequests(),
        this.getUserReportWidgets(),
      ]);
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
    handleTableChange({ sorter, columnSearch }) {
      this.sorter = { ...sorter };
      this.columnSearch = { ...columnSearch };
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
        await Promise.all(emails.map((email) => User.api().inviteUser(email)));
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
      const result = await this.$prompt({
        title: this.$t('actions.approve_worksite_request'),
        content: this.$t('dashboard.approve_worksite_request_reason'),
      });
      await WorksiteRequest.api().acceptRequest(id, result);
      await this.getWorksiteRequests();
    },
    async rejectRequest(id) {
      const result = await this.$prompt({
        title: this.$t('actions.reject_worksite_request'),
        content: this.$t('dashboard.reject_worksite_request_reason'),
      });
      await WorksiteRequest.api().rejectRequest(id, result);
      await this.getWorksiteRequests();
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
    async getUserTransferRequests() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/transfer_requests`,
      );
      this.transferRequests = response.data.results;
    },
    async getUserReportWidgets() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/user_widgets`,
      );
      this.reportWidgets = response.data.results;

      const widgetPromises = [];
      this.reportWidgets.forEach((widget) => {
        widgetPromises.push(
          this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/report_widgets/${widget.widget}/data`,
            {
              params: {
                incident_id: this.currentIncidentId,
                ...widget.filters,
              },
            },
          ),
        );
      });
      Promise.all(widgetPromises).then((results) => {
        const graphData = {};
        results.forEach(({ data }) => {
          graphData[data.key] = transformWidgetData(data);
        });
        this.widgetsData = graphData;
      });
    },
    async getWorksiteCount() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites/count`,
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
        `${process.env.VUE_APP_API_BASE_URL}/worksites/count`,
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
      const openStatuses = this.statuses.filter(
        (status) => status.primary_state === 'open',
      );

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites/count`,
        {
          params: {
            incident: this.currentIncidentId,
            limit: 1,
            work_type__status__in: openStatuses
              .map((status) => status.status)
              .join(','),
            fields: 'id',
          },
        },
      );
      this.totalInProgess = response.data.count;
    },
    async getClosedCount() {
      const closedStatuses = this.statuses.filter(
        (status) => status.primary_state === 'closed',
      );

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites/count`,
        {
          params: {
            incident: this.currentIncidentId,
            limit: 1,
            work_type__status__in: closedStatuses
              .map((status) => status.status)
              .join(','),
            fields: 'id',
          },
        },
      );
      this.totalClosed = response.data.count;
    },
  },
};
</script>
