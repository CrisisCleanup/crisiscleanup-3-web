<template>
  <Loader :loading="loading" class="h-full overflow-auto py-4 px-6 bg-gray-100">
    <template #content>
      <!--      &lt;!&ndash; Intro &ndash;&gt;-->
      <!--      <base-text-->
      <!--        variant="h2"-->
      <!--        weight="300"-->
      <!--        class="text-crisiscleanup-dark-300 py-3 ml-3"-->
      <!--        >You have 2 paid report activate them to see more information about your-->
      <!--        team members</base-text-->
      <!--      >-->
      <!--      &lt;!&ndash; Included &ndash;&gt;-->
      <!--      <h1 class="text-xl font-bold m-2 ml-3">Included</h1>-->
      <!--      <div class="flex flex-row jusity-between">-->
      <!--        <div class="flex-col w-1/3">-->
      <!--          <div class="my-4 mx-2 bg-white shadow h-20 content-center flex-wrap">-->
      <!--            <DownloadCSV />-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
      <!-- Favorites -->
      <!--      <h1 class="text-xl font-bold m-2 ml-3 pt-5">Favorites</h1>-->
      <!-- <div class="flex flex-row justify-between">
        First Column
        <div class="flex-col w-1/3">
        </div>
        Second Column
        <div class="flex-col w-1/3">
        </div>
        Third Column
        <div class="flex-col w-1/3">
        </div>
      </div> -->
      <!-- Request Access Modal -->
      <modal
        v-if="showRequestAccessModal"
        title="Reports Activation"
        modal-classes="w-108"
        @close="showRequestAccessModal = false"
      >
        <div class="flex justify-around m-5">
          <base-text variant="body">
            We do not yet have an account set up with your state government.
            Please have someone from your state government contact
            <a
              href="mailto:help@crisiscleanup.org"
              class="text-crisiscleanup-yellow-900 underline"
              >help@crisiscleanup.org</a
            >
            to set up a paid account, so we can provide this report. to request
            more information on report access"
          </base-text>
        </div>
        <div slot="footer" class="flex p-1 justify-center">
          <base-button
            variant="outline"
            :action="() => (showRequestAccessModal = false)"
          ></base-button>
        </div>
      </modal>
      <!-- Report Library -->
      <h1 class="text-xl font-bold m-2 ml-3 pt-5">Report Library</h1>
      <div class="flex flex-row jusity-between">
        <!-- First Column -->
        <div class="flex-col w-1/3">
          <!-- Worksite Completion -->
          <div class="flex my-4 mx-2 bg-white shadow h-auto flex-wrap">
            <base-button
              :action="
                () => {
                  requestReport($t('~~Worksite Completion'));
                }
              "
              class="text-left"
            >
              <worksite-completion />
            </base-button>
          </div>
          <!-- Org Participation Status -->
          <div
            class="my-4 mx-2 bg-white shadow h-auto content-center flex-wrap"
          >
            <base-button
              :action="
                () => {
                  requestReport($t('~~Org Participation Status'));
                }
              "
              class="text-left"
            >
              <participation-stats />
            </base-button>
          </div>
          <!-- Incident Status Report -->
          <div
            class="my-4 mx-2 bg-white shadow h-auto content-center flex-wrap"
          >
            <base-button
              :action="
                () => {
                  requestReport($t('~~Incident Status Report'));
                }
              "
              class="text-left"
            >
              <incident-status-report />
            </base-button>
          </div>
          <!-- Unassigned Worksites -->
          <div
            class="my-4 mx-2 bg-white shadow h-auto content-center flex-wrap"
          >
            <base-button
              :action="
                () => {
                  requestReport($t('~~Unassigned Worksites'));
                }
              "
              class="text-left"
            >
              <unassigned-worksites />
            </base-button>
          </div>
        </div>
        <!-- Second Column -->
        <div class="flex-col w-1/3">
          <!-- Requests -->
          <div
            class="my-4 mx-2 bg-white shadow h-auto content-center flex-wrap"
          >
            <base-button
              :action="
                () => {
                  requestReport($t('~~Requests'));
                }
              "
              class="text-left"
            >
              <requests-card />
            </base-button>
          </div>
          <!-- Completed Worksites -->
          <div
            class="my-4 mx-2 bg-white shadow h-auto content-center flex-wrap"
          >
            <base-button
              :action="
                () => {
                  requestReport($t('~~Completed Worksites'));
                }
              "
              class="text-left"
            >
              <completion-summary />
            </base-button>
          </div>
          <!-- Call Center Flow -->
          <div
            class="my-4 mx-2 bg-white shadow h-auto content-center flex-wrap"
          >
            <base-button
              :action="
                () => {
                  requestReport($t('~~Call Center Flow'));
                }
              "
              class="text-left"
            >
              <call-center-flow />
            </base-button>
          </div>
          <!-- Estimated Commercial Values -->
          <div
            class="my-4 mx-2 bg-white shadow h-auto content-center flex-wrap"
          >
            <base-button
              :action="
                () => {
                  requestReport($t('~~Estimated Commercial Values'));
                }
              "
              class="text-left"
            >
              <est-commercial-value />
            </base-button>
          </div>
        </div>
        <!-- Third Column -->
        <div class="flex-col w-1/3">
          <!-- Volunteer Work Logs -->
          <div
            class="my-4 mx-2 bg-white shadow h-auto content-center flex-wrap"
          >
            <base-button
              :action="
                () => {
                  requestReport($t('~~Volunteer Work Logs'));
                }
              "
              class="text-left"
            >
              <volunteer-work-logs />
            </base-button>
          </div>
          <!-- teammate invitation -->
          <div
            class="my-4 mx-2 bg-white shadow h-auto content-center flex-wrap"
          >
            <base-button
              :action="
                () => {
                  requestReport($t('Team Member Invitation'));
                }
              "
              class="text-left"
            >
              <teammate-invitation />
            </base-button>
          </div>
        </div>
      </div>
    </template>
  </Loader>
</template>

<script>
import User from '@/models/User';
import { mapState } from 'vuex';
import Loader from '@/components/Loader.vue';
import TeammateInvitation from '@/components/reports/TeammateInvitation.vue';
import EstCommercialValue from '@/components/reports/EstCommercialValue.vue';
import UnassignedWorksites from '@/components/reports/UnassignedWorksites.vue';
import WorksiteCompletion from '@/components/reports/WorksiteCompletion.vue';
import VolunteerWorkLogs from '@/components/reports/VolunteerWorkLogs.vue';
import RequestsCard from '@/components/reports/RequestsCard.vue';
import CompletionSummary from '@/components/reports/CompletionSummary.vue';
import ParticipationStats from '@/components/reports/OrgParticipationStats.vue';
import IncidentStatusReport from '@/components/reports/IncidentStatusReport.vue';
import CallCenterFlow from '@/components/reports/CallCenterFlow.vue';
import VueTypes from 'vue-types';
import EventLog from '../models/EventLog';

export default {
  name: 'Reports',
  components: {
    Loader,
    TeammateInvitation,
    EstCommercialValue,
    UnassignedWorksites,
    WorksiteCompletion,
    VolunteerWorkLogs,
    RequestsCard,
    CompletionSummary,
    ParticipationStats,
    IncidentStatusReport,
    CallCenterFlow,
  },
  data() {
    return {
      loading: false,
    };
  },
  props: {
    showRequestAccessModal: VueTypes.bool.def(false),
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    ...mapState('incident', ['currentIncidentId']),
  },
  methods: {
    requestReport(reportType) {
      this.showRequestAccessModal = true;
      EventLog.api().create(
        'request_report',
        this.currentIncidentId,
        this.$route.query.page,
        {
          report_type: reportType,
        },
      );
    },
  },
  async mounted() {
    this.loading = true;
    EventLog.api().create(
      'list_report',
      this.currentIncidentId,
      this.$route.query.page,
      {},
    );
    this.loading = false;
  },
};
</script>
