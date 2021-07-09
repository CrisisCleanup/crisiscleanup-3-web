<template>
  <Loader :loading="loading" class="h-full overflow-auto py-4 px-6 bg-gray-100">
    <template #content>
      <modal
        v-if="showRequestAccessModal"
        title="Reports Activation"
        modal-classes="w-108"
        @close="showRequestAccessModal = false"
      >
        <div class="flex justify-around m-5">
          <base-text variant="body">
            <span v-html="$t('reportsVue.no_state_account_yet')"></span>
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
      <div class="report-grid">
        <div v-for="r in reports" :key="`${r.id}`">
          <div
            class="
              my-4
              mx-2
              bg-white
              shadow
              h-auto
              content-center
              flex-wrap
              cursor-pointer
            "
            @click="() => requestReport(r.name_t)"
          >
            <div class="flex flex-col justify-around">
              <div class="m-5">
                <div class="flex flex-row items-center">
                  <base-text variant="body" weight="700"
                    >{{ r.name_t }}
                  </base-text>
                  <img src="@/assets/greylockss.jpg" class="h-8 px-3" />
                </div>
                <base-text variant="bodysm">
                  {{ r.description_t }}
                </base-text>
                <ExampleReports
                  v-if="
                    $can('app_stage.development') ||
                    $can('app_stage.staging') ||
                    (currentUser && currentUser.isAdmin)
                  "
                  :formats="r.output_formats"
                  :files="r.files"
                  @download="(download) => requestReport(r.name_t, download)"
                />
              </div>
            </div>
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
import VueTypes from 'vue-types';
import EventLog from '../models/EventLog';
import Report from '../models/Report';
import ExampleReports from '../components/reports/ExampleReports';

export default {
  name: 'Reports',
  components: {
    ExampleReports,
    Loader,
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
    reports() {
      return Report.all();
    },
    ...mapState('incident', ['currentIncidentId']),
  },
  methods: {
    requestReport(reportType = null, downloadType = null) {
      if (!downloadType) {
        this.showRequestAccessModal = true;
      }
      EventLog.api().create(
        'request_report',
        this.currentIncidentId,
        this.$route.query.page,
        {
          report_type: reportType,
          download_type: downloadType,
        },
      );
    },
  },
  async mounted() {
    this.loading = true;
    await Report.api().get('/reports', {
      dataKey: 'results',
    });
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

<style>
.report-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
