<template>
  <div
    v-if="!loading"
    :key="currentIncidentId"
    class="flex flex-col mt-16 md:mt-0"
    data-testid="testDashboarddiv"
  >
    <div class="flex self-end mr-4 items-center">
      <RedeployRequest />
      <InviteUsers class="mx-1" />
    </div>

    <div
      class="grid grid-rows-4 grid-cols-1 md:grid-rows-2 md:grid-cols-2 xl:grid-rows-1 xl:grid-cols-4"
      data-testid="testMetricCardMyClaimedCasesDiv"
    >
      <div
        class="p-3 cursor-pointer h-full w-full"
        @click="$router.push(`/incident/${currentIncidentId}/work`)"
      >
        <!--Metric Card-->
        <div
          class="h-full bg-crisiscleanup-lightblue-100 rounded-lg shadow-lg p-5"
        >
          <div class="flex flex-row items-center">
            <div class="flex-shrink pr-4">
              <div class="rounded-full p-1 bg-crisiscleanup-lightblue-900">
                <img
                  src="../assets/icons/cases.svg"
                  data-testid="testMyClaimedCasesIcon"
                  style="height: 50px"
                  :alt="$t('dashboard.my_claimed_cases')"
                />
              </div>
            </div>
            <div
              class="flex-1 text-right md:text-center"
              data-testid="testMyClaimedCasesDiv"
            >
              <h5 class="uppercase text-grey-900">
                {{ $t('dashboard.my_claimed_cases') }} ({{
                  currentIncident.name
                }})
              </h5>
              <h3 class="text-3xl">
                {{ numeral(claimedWorksites.length) }}
              </h3>
            </div>
          </div>
        </div>
        <!--/Metric Card-->
      </div>

      <div
        class="p-3 cursor-pointer h-full w-full"
        @click="$router.push(`/incident/${currentIncidentId}/work`)"
      >
        <!--Metric Card-->
        <div
          class="h-full bg-crisiscleanup-yellow-100 rounded-lg shadow-lg relative"
          data-testid="testMetricCardTotalClaimedDiv"
        >
          <div class="flex flex-row items-center p-5">
            <div class="flex-shrink pr-4">
              <div class="rounded-full p-1 bg-crisiscleanup-yellow-900">
                <img
                  src="../assets/icons/cases.svg"
                  data-testid="testTotalClaimedIcon"
                  style="height: 50px"
                  :alt="$t('dashboard.total_claimed')"
                />
              </div>
            </div>
            <div
              class="flex-1 text-right md:text-center"
              data-testid="testMyClaimedCasesDiv"
            >
              <h5 class="uppercase text-grey-900">
                {{ $t('dashboard.total_claimed') }} ({{ currentIncident.name }})
              </h5>
              <h3 class="text-3xl">
                {{ numeral(totalClaimed) }}
                <span class="text-base">
                  ({{ numeral(totalClaimed / totalWorksites, 'percentage') }}
                  {{ $t('dashboard.of_total') }})
                </span>
              </h3>
            </div>
          </div>
          <div
            class="absolute bottom-0 left-0 border-b-4 rounded-b-lg border-yellow-600"
            :style="{ width: `${(totalClaimed / totalWorksites) * 100}%` }"
          ></div>
        </div>
        <!--/Metric Card-->
      </div>

      <div
        class="p-3 cursor-pointer h-full w-full"
        @click="$router.push(`/incident/${currentIncidentId}/work`)"
      >
        <!--Metric Card-->
        <div
          class="h-full bg-orange-400 rounded-lg shadow-lg relative"
          data-testid="testMetricCardInProgressDiv"
        >
          <div class="flex flex-row items-center p-5">
            <div class="flex-shrink pr-4">
              <div class="rounded-full p-1 bg-orange-600">
                <img
                  src="../assets/icons/cases.svg"
                  data-testid="testInProgressIcon"
                  style="height: 50px"
                  :alt="$t('dashboard.in_progress')"
                />
              </div>
            </div>
            <div
              class="flex-1 text-right md:text-center"
              data-testid="testInProgressDiv"
            >
              <h5 class="uppercase text-grey-900">
                {{ $t('dashboard.in_progress') }} ({{ currentIncident.name }})
              </h5>
              <h3 class="text-3xl">
                {{ numeral(totalInProgess) }}
                <span class="text-base">
                  ({{ numeral(totalInProgess / totalWorksites, 'percentage') }}
                  {{ $t('dashboard.of_total') }})
                </span>
              </h3>
            </div>
          </div>
          <div
            class="absolute bottom-0 left-0 border-b-4 rounded-b-lg border-orange-600"
            :style="{
              width: `${(totalInProgess / totalWorksites) * 100}%`,
            }"
          ></div>
        </div>
        <!--/Metric Card-->
      </div>

      <div
        class="p-3 cursor-pointer h-full w-full"
        @click="$router.push(`/incident/${currentIncidentId}/work`)"
      >
        <!--Metric Card-->
        <div
          class="h-full bg-crisiscleanup-green-100 rounded-lg shadow-lg relative"
          data-testid="testMetricCardClosedDiv"
        >
          <div class="flex flex-row items-center p-5">
            <div class="flex-shrink pr-4">
              <div class="rounded-full p-1 bg-crisiscleanup-green-900">
                <img
                  src="../assets/icons/cases.svg"
                  data-testid="testClosedIcon"
                  style="height: 50px"
                  :alt="$t('dashboard.closed')"
                />
              </div>
            </div>
            <div
              class="flex-1 text-right md:text-center"
              data-testid="testClosedDiv"
            >
              <h5 class="uppercase text-grey-900">
                {{ $t('dashboard.closed') }} ({{ currentIncident.name }})
              </h5>
              <h3 class="text-3xl">
                {{ numeral(totalClosed) }}
                <span class="text-base">
                  ({{ numeral(totalClosed / totalWorksites, 'percentage') }}
                  {{ $t('dashboard.of_total') }})
                </span>
              </h3>
            </div>
          </div>
          <div
            class="bottom-0 left-0 border-b-4 rounded-b-lg border-green-600 absolute"
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
            data-testid="testClaimedWorksitesTable"
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
                  :data-testid="`testWorkType${work_type.id}Div`"
                  class="mx-1"
                >
                  <WorksiteStatusDropdown
                    class="block"
                    :current-work-type="work_type"
                    use-icon
                    @input="
                      (value) => {
                        statusValueChange(value, work_type, slotProps.item.id);
                      }
                    "
                  />
                </div>
              </div>
            </template>
            <template #case_number="slotProps">
              <router-link
                class=""
                :data-testid="`testWorksiteCaseNumber${slotProps.item.id}Link`"
                :to="`/incident/${$route.params.incident_id}/work/${slotProps.item.id}?showOnMap=true`"
                tag="div"
              >
                {{ slotProps.item.case_number }}
              </router-link>
            </template>
            <template #phone="slotProps">
              <router-link
                class=""
                :data-testid="`testWorksitePhone${slotProps.item.id}Link`"
                :to="`/incident/${$route.params.incident_id}/work/${slotProps.item.id}?showOnMap=true`"
                tag="div"
              >
                {{ slotProps.item.phone }}
              </router-link>
            </template>
            <template #full_address="slotProps">
              <router-link
                class=""
                :data-testid="`testWorksiteFullAddress${slotProps.item.id}Link`"
                :to="`/incident/${$route.params.incident_id}/work/${slotProps.item.id}?showOnMap=true`"
                tag="div"
              >
                {{ slotProps.item.full_address }}
              </router-link>
            </template>
            <template #name="slotProps">
              <router-link
                class=""
                :data-testid="`testWorksiteName${slotProps.item.id}Link`"
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
                  :data-testid="`testWorksiteActions${slotProps.item.id}Link`"
                  :to="`/incident/${$route.params.incident_id}/work/${slotProps.item.id}?showOnMap=true`"
                  tag="div"
                >
                  <ccu-icon
                    :alt="$t('actions.jump_to_case')"
                    :data-testid="`testJumpToCase${slotProps.item.id}Icon`"
                    size="medium"
                    class="p-1 py-2 w-8"
                    type="go-case"
                    :linked="true"
                  />
                </router-link>
                <ccu-icon
                  :alt="$t('actions.print')"
                  :data-testid="`testPrint${slotProps.item.id}Icon`"
                  size="medium"
                  class="p-1 py-2 w-8"
                  type="print"
                  :action="() => printWorksite(slotProps.item.id)"
                />
              </div>
            </template>
          </Table>
        </div>
      </div>
    </div>
    <div class="flex">
      <div
        class="w-full m-4 pt-2 shadow bg-white flex-shrink"
        data-testid="testCaseTransferRequestsDiv"
      >
        <div class="py-4 px-4 text-gray-500 border-b">
          {{ $t('dashboard.case_transfer_requests') }}
        </div>
        <div class="py-4 px-4 border-b flex items-center">
          <base-button
            class="mr-2 border-r pr-2"
            data-testid="testInboundRequestsButton"
            size="medium"
            :text="$t('dashboard.inbound_requests')"
            :alt="$t('dashboard.inbound_requests')"
            :class="[pendingView === 'inbound' ? 'text-primary-dark' : '']"
            variant="text"
            @click="pendingView = 'inbound'"
          />

          <base-button
            class="mr-2 border-r pr-2"
            data-testid="testOutboundRequestsButton"
            size="medium"
            :text="$t('dashboard.outbound_requests')"
            :alt="$t('dashboard.outbound_requests')"
            :class="[pendingView === 'outbound' ? 'text-primary-dark' : '']"
            variant="text"
            @click="pendingView = 'outbound'"
          />

          <base-button
            class="mr-2"
            data-testid="testArchivedRequestsButton"
            size="medium"
            :text="$t('dashboard.archived_requests')"
            :alt="$t('dashboard.archived_requests')"
            :class="[pendingView === 'archived' ? 'text-primary-dark' : '']"
            variant="text"
            @click="pendingView = 'archived'"
          />
        </div>
        <div class="p-4">
          <Table
            class=""
            data-testid="testWorksiteRequestsTable"
            :data="worksiteRequests"
            :columns="pendingCasesColumns"
            :sorter="pendingSorter"
            :loading="pendingViewLoading"
            :body-style="{ height: '300px' }"
            @change="handlePendingTableChange"
          >
            <template #worksite_work_type="slotProps">
              <div
                class="flex items-center w-full"
                data-testid="testWorksiteWwtspDiv"
              >
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
                    v-html="getWorkTypeImage(slotProps.item.worksite_work_type)"
                  ></div>
                </div>
              </div>
            </template>
            <template #organization="slotProps">
              <div
                class="flex flex-col"
                data-testid="testWorksiteOrganizationDiv"
              >
                {{ slotProps.item.requested_to_org.name }}
              </div>
            </template>
            <template #work_type="slotProps">
              <div class="flex flex-col" data-testid="testWorksiteWorkTypeDiv">
                {{ slotProps.item.worksite_work_type }}
              </div>
            </template>
            <template #actions="slotProps">
              <div class="flex items-center justify-start">
                <div
                  v-if="pendingView === 'inbound'"
                  data-testid="testWorksiteActionsInboundDiv"
                  class="flex items-center justify-start"
                >
                  <base-button
                    class="px-2 py-1 mx-2 bg-crisiscleanup-green-700 text-white"
                    data-testid="testAcceptButton"
                    :text="$t('actions.accept')"
                    :alt="$t('actions.accept')"
                    :action="() => acceptRequest(slotProps.item.id)"
                  />
                  <base-button
                    class="px-2 py-1 mx-2 bg-crisiscleanup-red-700 text-white"
                    data-testid="testRejectButton"
                    :text="$t('actions.reject')"
                    :alt="$t('actions.reject')"
                    :action="() => rejectRequest(slotProps.item.id)"
                  />
                </div>
                <div v-if="pendingView === 'outbound'">
                  <base-button
                    class="px-2 py-1 mx-2 bg-crisiscleanup-red-700 text-white"
                    data-testid="testCancelButton"
                    :text="$t('actions.cancel')"
                    :alt="$t('actions.cancel')"
                    :action="() => cancelRequest(slotProps.item.id)"
                  />
                </div>
                <div v-if="pendingView !== 'archived'">
                  <base-button
                    class="px-2 py-1 mx-2 border-black border"
                    data-testid="testIgnoreButton"
                    :text="$t('actions.ignore')"
                    :alt="$t('actions.ignore')"
                    :action="() => archiveRequest(slotProps.item.id)"
                  />
                </div>
                <div v-if="pendingView === 'archived'">
                  <base-button
                    class="px-2 py-1 mx-2"
                    data-testid="testHistoryButton"
                    variant="solid"
                    :text="$t('actions.history')"
                    :alt="$t('actions.history')"
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
            :loading="loading"
            data-testid="testUserTransferRequestTable"
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
        <ReportWidget :current-filters="{}" :widget-key="key" :value="value" />
      </div>
    </div>
  </div>
  <div v-else class="flex h-full items-center justify-center">
    <spinner show-quote />
  </div>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  reactive,
  computed,
  watch,
  onMounted,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { useRouter, useRoute } from 'vue-router';
import { colors } from '../icons/icons_templates';
import {
  getColorForStatus,
  getWorkTypeImage,
  getWorkTypeName,
} from '../filters/index';
import User from '../models/User';
import Incident from '../models/Incident';
import WorksiteRequest from '../models/WorksiteRequest';
import Worksite from '../models/Worksite';
import { forceFileDownload } from '../utils/downloads';
import { getErrorMessage } from '../utils/errors';
import { getQueryString } from '../utils/urls';
import Table from '../components/Table.vue';
import WorksiteStatusDropdown from '../components/WorksiteStatusDropdown.vue';
import UserTransferRequestTable from '../components/UserTransferRequestTable.vue';
import RedeployRequest from '../components/modals/RedeployRequest.vue';
import InviteUsers from '../components/modals/InviteUsers.vue';
import useDialogs from '../hooks/useDialogs';
import ReportWidget from '@/components/reports/ReportWidget.vue';
import { transformWidgetData } from '@/utils/reports';
import { numeral } from '@/utils/helpers';
import BaseText from "@/components/BaseText.vue";

export default defineComponent({
  name: 'Dashboard',
  components: {
    BaseText,
    ReportWidget,
    UserTransferRequestTable,
    RedeployRequest,
    InviteUsers,
    Table,
    WorksiteStatusDropdown,
  },
  setup() {
    const { t } = useI18n();
    const store = useStore();
    const $toasted = useToast();
    const route = useRoute();
    const router = useRouter();
    const { prompt } = useDialogs();
    const usersToInvite = ref('');
    const totalWorksites = ref(0);
    const totalClaimed = ref(0);
    const totalClosed = ref(0);
    const totalInProgess = ref(0);
    const organizations = ref([]);
    const incident_requests = ref([]);
    const transferRequests = ref([]);
    const reportWidgets = ref([]);
    const widgetsData = ref({});
    const columnSearch = ref({});
    const loading = ref(false);
    const datacollection = ref(null);
    const pendingViewLoading = ref(false);
    const pendingView = ref('inbound');
    const sorter = ref({
      key: null,
      direction: null,
    });
    const pendingSorter = ref({
      key: null,
      direction: null,
    });
    const options = reactive({
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
    });
    const pendingCasesColumns = [
      {
        title: t('dashboard.no'),
        dataIndex: 'case_number',
        key: 'case_number',
        width: '80px',
        sortable: true,
      },
      {
        title: t('dashboard.work_type'),
        dataIndex: 'worksite_work_type',
        key: 'worksite_work_type',
        width: '10%',
      },
      {
        title: t('dashboard.status'),
        dataIndex: 'status',
        key: 'status',
        width: '0.5fr',
      },
      {
        title: t('dashboard.org_label'),
        dataIndex: 'organization',
        key: 'organization',
      },
      {
        title: t('dashboard.last_action'),
        dataIndex: 'last_action',
        key: 'last_action',
      },
      {
        title: t('dashboard.next_action'),
        dataIndex: 'next_action',
        key: 'next_action',
      },
      {
        title: '',
        dataIndex: 'actions',
        key: 'actions',
      },
    ];
    const columns = computed(() => [
      {
        title: t('dashboard.no'),
        dataIndex: 'case_number',
        key: 'case_number',
        width: '0.75fr',
        sortable: true,
        searchable: true,
        searchTitle: t('all'),
      },
      {
        title: t('dashboard.work_type'),
        dataIndex: 'work_types',
        key: 'work_types',
        scopedSlots: { customRender: 'work_types' },
        width: '2fr',
        searchable: true,
        searchSelect: true,
        getSelectValues(data) {
          const values = {};
          if (data && data.length > 0) {
            for (const item of data) {
              for (const wt of item.work_types) {
                values[wt.work_type] = true;
              }
            }

            return Object.keys(values).map((key) => {
              return {
                value: key,
                name_t: getWorkTypeName(key),
              };
            });
          }

          return [];
        },
        searchTitle: t('dashboard.all_time'),
      },
      {
        title: t('dashboard.name'),
        dataIndex: 'name',
        key: 'name',
        width: '1fr',
        sortable: true,
        searchable: true,
        searchTitle: t('all'),
      },
      {
        title: t('dashboard.full_address'),
        dataIndex: 'short_address',
        key: 'short_address',
        searchable: true,
        searchTitle: t('all'),
      },
      {
        title: t('dashboard.phone'),
        dataIndex: 'phone1',
        key: 'phone1',
        sortable: false,
        searchable: true,
        searchTitle: t('all'),
      },
      {
        title: '',
        dataIndex: 'actions',
        key: 'actions',
        sortable: false,
      },
    ]);
    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );
    const currentUser = computed(() =>
      User.find(User.store().getters['auth/userId']),
    );
    const currentIncident = computed(() =>
      Incident.find(currentIncidentId.value),
    );
    const worksiteRequests = computed(() => {
      const preferences = currentUser.value.preferences || {};
      const archivedRequests = preferences.archived_worksite_requests || [];
      const query = WorksiteRequest.query();
      if (pendingSorter.value.key) {
        let { key } = pendingSorter.value;
        if (key === 'case_number') {
          key = 'id';
        }

        query.orderBy(pendingSorter.value.key, pendingSorter.value.direction);
      }

      if (pendingView.value === 'inbound') {
        return query
          .where(
            (request) =>
              Number(request.requested_to_org.id) ===
                Number(currentUser.value.organization.id) &&
              !archivedRequests.includes(request.id) &&
              !request.has_response,
          )
          .get();
      }

      if (pendingView.value === 'outbound') {
        return query
          .where(
            (request) =>
              Number(request.requested_by_org.id) ===
                Number(currentUser.value.organization.id) &&
              !archivedRequests.value.includes(request.id) &&
              !request.has_response,
          )
          .get();
      }

      if (pendingView.value === 'archived') {
        return query
          .whereIdIn(archivedRequests)
          .orWhere('has_response', true)
          .get();
      }

      return [];
    });
    const statuses = computed(() => store.getters['enums/statuses']);
    const claimedWorksites = computed(() => {
      const query = Worksite.query().where((worksite) => {
        if (
          worksite.work_types &&
          currentIncidentId.value === worksite.incident
        ) {
          const claimed = worksite.work_types.find(
            (workType) =>
              workType.claimed_by === currentUser.value.organization.id,
          );
          return Boolean(claimed);
        }

        return false;
      });
      if (sorter.value.key) {
        let { key } = sorter.value;
        if (key === 'case_number') {
          key = 'id';
        }

        query.orderBy(key, sorter.value.direction);
      }

      if (Object.keys(columnSearch.value).length > 0) {
        for (const [key, value] of Object.entries(columnSearch.value)) {
          if (value) {
            query.where(key, (prop) =>
              JSON.stringify(prop).toLowerCase().includes(value.toLowerCase()),
            );
          }
        }
      }

      return query.get();
    });

    async function getClaimedWorksites() {
      const params = {
        incident: currentIncidentId.value,
        work_type__claimed_by: currentUser.value.organization.id,
        fields:
          'id,name,address,case_number,work_types,city,state,county,flags,location,incident,postal_code,reported_by,form_data',
      };

      Worksite.api().get(`/worksites?${getQueryString(params)}`, {
        dataKey: 'results',
      });
    }

    async function getReportedWorkSites() {
      const params = {
        incident: currentIncidentId.value,
        reported_by: currentUser.value.organization.id,
        fields:
          'id,name,address,case_number,work_types,city,state,county,flags,location,incident,postal_code,reported_by',
      };

      Worksite.api().get(`/worksites?${getQueryString(params)}`, {
        dataKey: 'results',
      });
    }

    async function getWorksiteRequests() {
      await WorksiteRequest.deleteAll();
      pendingViewLoading.value = true;
      await WorksiteRequest.api().get(`/worksite_requests`, {
        dataKey: 'results',
      });
      pendingViewLoading.value = false;
    }

    async function getUserTransferRequests() {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/transfer_requests`,
      );
      transferRequests.value = response.data.results;
    }

    async function getUserReportWidgets() {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/user_widgets`,
      );
      reportWidgets.value = response.data.results;

      const widgetPromises = [];
      for (const widget of reportWidgets.value) {
        widgetPromises.push(
          axios.get(
            `${import.meta.env.VITE_APP_API_BASE_URL}/report_widgets/${
              widget.widget
            }/data`,
            {
              params: {
                incident_id: currentIncidentId.value,
                ...widget.filters,
              },
            },
          ),
        );
      }

      Promise.all(widgetPromises).then((results) => {
        const graphData = {};
        for (const { data } of results) {
          graphData[data.key] = transformWidgetData(data);
        }

        widgetsData.value = graphData;
      });
    }

    async function getWorksiteCount() {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/worksites/count`,
        {
          params: {
            incident: currentIncidentId.value,
            limit: 1,
            fields: 'id',
          },
        },
      );
      totalWorksites.value = response.data.count;
    }

    async function getClaimedCount() {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/worksites/count`,
        {
          params: {
            incident: currentIncidentId.value,
            limit: 1,
            work_type__claimed_by__isnull: false,
            fields: 'id',
          },
        },
      );
      totalClaimed.value = response.data.count;
    }

    async function getInProgressCount() {
      const openStatuses = statuses.value.filter(
        (status) => status.primary_state === 'open',
      );

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/worksites/count`,
        {
          params: {
            incident: currentIncidentId.value,
            limit: 1,
            work_type__status__in: openStatuses
              .map((status) => status.status)
              .join(','),
            fields: 'id',
          },
        },
      );
      totalInProgess.value = response.data.count;
    }

    async function getClosedCount() {
      const closedStatuses = statuses.value.filter(
        (status) => status.primary_state === 'closed',
      );

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/worksites/count`,
        {
          params: {
            incident: currentIncidentId.value,
            limit: 1,
            work_type__status__in: closedStatuses
              .map((status) => status.status)
              .join(','),
            fields: 'id',
          },
        },
      );
      totalClosed.value = response.data.count;
    }

    async function statusValueChange(value, workType, worksiteId) {
      try {
        await Worksite.api().updateWorkTypeStatus(workType.id, value);
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        await Worksite.api().fetch(worksiteId);
      }
    }

    function handleTableChange({
      sorter: incomingSorter,
      columnSearch: incomingColumnSearch,
    }) {
      sorter.value = { ...incomingSorter };
      columnSearch.value = { ...incomingColumnSearch };
    }

    function handlePendingTableChange({ sorter: incomingSorter }) {
      pendingSorter.value = { ...incomingSorter };
    }

    async function printWorksite(worksiteId) {
      const pdf = await Worksite.api().printWorksite(worksiteId);
      forceFileDownload(pdf.response);
    }

    async function inviteUsers() {
      try {
        const emails = usersToInvite.value.split(',');
        await Promise.all(emails.map((email) => User.api().inviteUser(email)));
        await $toasted.success(t('inviteTeammates.invites_sent_success'));
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    async function archiveRequest(id) {
      const preferences = currentUser.value.preferences || {};
      const archivedRequests = preferences.archived_worksite_requests || [];
      await User.api().updateUserPreferences({
        archived_worksite_requests: [id, ...archivedRequests],
      });
      await getWorksiteRequests();
    }

    async function acceptRequest(id) {
      const result = await prompt({
        title: t('actions.approve_worksite_request'),
        content: t('dashboard.approve_worksite_request_reason'),
      });
      await WorksiteRequest.api().acceptRequest(id, result);
      await getWorksiteRequests();
    }

    async function rejectRequest(id) {
      const result = await prompt({
        title: t('actions.reject_worksite_request'),
        content: t('dashboard.reject_worksite_request_reason'),
      });
      await WorksiteRequest.api().rejectRequest(id, result);
      await getWorksiteRequests();
    }

    async function cancelRequest(id) {
      await WorksiteRequest.api().cancelRequest(id);
      await getWorksiteRequests();
    }

    async function reloadDashBoard() {
      await Promise.any([
        getClaimedWorksites(),
        getReportedWorkSites(),
        getWorksiteRequests(),
        getWorksiteCount(),
        getClaimedCount(),
        getInProgressCount(),
        getClosedCount(),
        getUserTransferRequests(),
        getUserReportWidgets(),
      ]);
    }

    watch(
      () => currentIncidentId.value,
      async () => {
        await Worksite.deleteAll();
        loading.value = true;
        await reloadDashBoard();
        loading.value = false;
      },
    );

    onMounted(async () => {
      if (currentIncidentId.value && !route.params.incident_id) {
        await router.replace(`/incident/${currentIncidentId.value}/dashboard`);
      }

      loading.value = true;
      await reloadDashBoard();
      loading.value = false;
    });

    return {
      usersToInvite,
      totalWorksites,
      totalClaimed,
      totalClosed,
      totalInProgess,
      organizations,
      incident_requests,
      transferRequests,
      reportWidgets,
      widgetsData,
      loading,
      datacollection,
      pendingViewLoading,
      pendingView,
      colors,
      sorter,
      columnSearch,
      pendingSorter,
      getColorForStatus,
      getWorkTypeImage,
      options,
      pendingCasesColumns,
      columns,
      currentIncidentId,
      currentIncident,
      currentUser,
      worksiteRequests,
      statuses,
      claimedWorksites,
      numeral,
      statusValueChange,
      handleTableChange,
      handlePendingTableChange,
      printWorksite,
      archiveRequest,
      acceptRequest,
      rejectRequest,
      cancelRequest,
      getUserTransferRequests,
    };
  },
});
</script>

<style scoped></style>
