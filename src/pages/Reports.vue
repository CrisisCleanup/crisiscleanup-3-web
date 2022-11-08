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
      <div v-for="sponsored in reportsKeys" :key="sponsored">
        <div
          class="text-lg font-bold m-2 ml-3 pt-1"
          v-if="sponsored === 'true'"
        >
          {{ $t('reportsVue.sponsored_reports') }}
        </div>
        <div class="text-lg font-bold m-2 ml-3 pt-1" v-else>
          {{ $t('reportsVue.other_reports') }}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3">
          <div v-for="r in reportsGrouped[sponsored]" :key="`${r.id}`">
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
              @click="() => requestReport(r, null, sponsored)"
            >
              <div class="flex flex-col justify-around">
                <div class="m-5">
                  <div class="flex flex-row items-center justify-between">
                    <base-text variant="body" weight="700"
                      >{{ r.name_t }}
                    </base-text>
                    <badge
                      v-if="
                        newReportIds.length &&
                        newReportIds.has(r.id) &&
                        sponsored === 'true'
                      "
                      width="2.5rem"
                      height="1rem"
                      class="text-white bg-crisiscleanup-red-700 mx-1 p-4"
                      :title="$t('reportsVue.new_badge')"
                      >{{ $t('reportsVue.new') }}</badge
                    >
                    <img
                      v-else-if="sponsored !== 'true'"
                      src="@/assets/greylockss.jpg"
                      class="h-8 px-3"
                    />
                  </div>
                  <base-text variant="bodysm">
                    {{ r.description_t }}
                  </base-text>
                  <ExampleReports
                    v-if="false"
                    :formats="r.output_formats"
                    :files="r.files"
                    @download="(download) => requestReport(r, download)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Loader>
</template>

<script>
import { mapState } from 'vuex';
import VueTypes from 'vue-types';
import User from '@/models/User';
import Loader from '@/components/Loader.vue';
import EventLog from '../models/EventLog';
import Report from '../models/Report';
import ExampleReports from '../components/reports/ExampleReports';
import { groupBy } from '@/utils/array';

export default {
  name: 'Reports',
  components: {
    ExampleReports,
    Loader,
  },
  data() {
    return {
      loading: false,
      newReportIds: [],
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
    reportsGrouped() {
      return groupBy(this.reports, 'isSponsored');
    },
    reportsKeys() {
      return [...Object.keys(this.reportsGrouped)].reverse();
    },
    ...mapState('incident', ['currentIncidentId']),
  },
  methods: {
    requestReport(report = null, downloadType = null, sponsored = false) {
      if (sponsored === 'true') {
        return this.$router.push(`/report/${report.id}`);
      }
      if (!downloadType) {
        this.showRequestAccessModal = true;
      }
      EventLog.api().create(
        'request_report',
        this.currentIncidentId,
        this.$route.query.page,
        {
          report_type: report.name_t,
          download_type: downloadType,
        },
      );
      return false;
    },
  },
  async mounted() {
    const newReports = Report.query()
      .where('created_at', (created_at) => {
        const reportsAccessed =
          this.currentUser?.states &&
          this.currentUser?.states.reports_last_accessed;
        return reportsAccessed
          ? this.$moment(created_at).isAfter(this.$moment(reportsAccessed))
          : true;
      })
      .get();
    this.newReportIds = new Set(newReports.map((r) => r.id));
    User.api().updateUserState({
      reports_last_accessed: this.$moment().toISOString(),
    });
  },
};
</script>
