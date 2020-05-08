<template>
  <Loader
    :loading="loading"
    class="p-6 bg-crisiscleanup-light-grey h-full overflow-auto"
  >
    <template #content>
      <div class="flex flex-col">
        <InviteUsers class="px-3" is-admin />
        <FileUpload class="mx-3 my-1" />
        <div class="flex">
          <WorksiteImport
            class="m-4 pt-2 shadow bg-white w-full"
          ></WorksiteImport>
        </div>
        <div class="flex">
          <div class="m-4 pt-2 shadow bg-white w-full">
            <div class="py-4 px-4 text-gray-500 border-b">
              {{ $t('Pending Organizations') }}
            </div>
            <div class="p-4">
              <OrganizationApprovalTable
                :organizations="organizations"
                @reload="getOrganizationsForApproval"
              ></OrganizationApprovalTable>
            </div>
          </div>
        </div>
        <div class="flex">
          <div class="m-4 pt-2 shadow bg-white w-full">
            <div class="py-4 px-4 text-gray-500 border-b">
              {{ $t('inviteTeammates.redeploy_requests') }}
            </div>
            <div class="p-4">
              <IncidentApprovalTable
                :requests="incident_requests"
                @reload="getIncidentRequests"
              ></IncidentApprovalTable>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Loader>
</template>

<script>
import { mapState } from 'vuex';
import User from '@/models/User';
import IncidentApprovalTable from '../../components/IncidentApprovalTable';
import OrganizationApprovalTable from '../../components/OrganizationApprovalTable';
import InviteUsers from '../organization/InviteUsers';
import { getQueryString } from '../../utils/urls';
import { getErrorMessage } from '../../utils/errors';
import Loader from '../../components/Loader';
import WorksiteImport from '../../components/WorksiteImport';
import FileUpload from '../../components/FileUpload';

export default {
  name: 'AdminDashboard',
  components: {
    FileUpload,
    WorksiteImport,
    IncidentApprovalTable,
    OrganizationApprovalTable,
    InviteUsers,
    Loader,
  },
  data() {
    return {
      usersToInvite: '',
      organizations: [],
      incident_requests: [],
      loading: false,
    };
  },
  computed: {
    ...mapState('incident', ['currentIncidentId']),
    ...mapState('enums', ['statuses']),
  },
  async mounted() {
    this.loading = true;
    await this.reloadDashBoard();
    this.loading = false;
  },
  methods: {
    async reloadDashBoard() {
      await Promise.all([
        this.getOrganizationsForApproval(),
        this.getIncidentRequests(),
      ]);
    },
    async getOrganizationsForApproval() {
      if (this.$can('approve_orgs_full')) {
        const params = {
          approved_by__isnull: true,
          rejected_by__isnull: true,
        };
        const queryString = getQueryString(params);

        const response = await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/admins/organizations?${queryString}`,
        );
        this.organizations = response.data.results;
      }
    },
    async getIncidentRequests() {
      if (this.$can('move_orgs')) {
        try {
          const response = await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/admins/incident_requests`,
          );
          if (response.data) {
            this.incident_requests = [...response.data.results];
          }
        } catch (e) {
          this.$log.debug(e);
        }
      }
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
  },
};
</script>

<style scoped></style>
