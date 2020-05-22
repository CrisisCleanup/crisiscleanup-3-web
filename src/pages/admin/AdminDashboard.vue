<template>
  <Loader
    :loading="loading"
    class="p-6 bg-crisiscleanup-light-grey h-full overflow-auto"
  >
    <template #content>
      <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <base-input
            :value="globalSearch"
            icon="search"
            class="w-72 mx-4"
            :placeholder="$t('actions.search_everywhere')"
            @input="
              (value) => {
                globalSearch = value;
                throttle(reloadDashBoard, 1000)();
              }
            "
          ></base-input>
          <div>
            <InviteUsers class="px-3" is-admin />
            <FileUpload class="mx-3 my-1" />
          </div>
        </div>
        <div class="flex">
          <div class="m-4 pt-2 shadow bg-white w-full">
            <div class="py-4 px-4 text-gray-500 border-b">
              {{ $t('Pending Organizations') }}
            </div>
            <div class="p-4">
              <OrganizationApprovalTable
                :organizations="organizationsForApproval"
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
        <div class="flex">
          <WorksiteImport
            class="m-4 pt-2 shadow bg-white w-full"
          ></WorksiteImport>
        </div>
        <div class="flex">
          <div class="m-4 pt-2 shadow bg-white w-full">
            <div class="p2-4 px-2 border-b flex items-center">
              <span class="flex items-center">
                <base-button
                  class="text-4xl mx-3"
                  :action="
                    () => {
                      organizations.visible = !organizations.visible;
                    }
                  "
                  >-</base-button
                >
                {{ $t('Organizations') }}
              </span>
              <base-input
                :value="organizations.search"
                icon="search"
                class="w-72 mx-4"
                :placeholder="$t('actions.search')"
                @input="
                  (value) => {
                    organizations.search = value;
                    throttle(getOrganizations, 1000)();
                  }
                "
              ></base-input>
            </div>
            <div class="p-4" v-if="organizations.visible">
              <OrganizationsTable
                :organizations="organizations.data"
                :meta="organizations.meta"
                @change="getOrganizations"
                @reload="getOrganizations"
              ></OrganizationsTable>
            </div>
          </div>
        </div>
        <div class="flex">
          <div class="m-4 pt-2 shadow bg-white w-full">
            <div class="p2-4 px-2 border-b flex items-center">
              <span class="flex items-center">
                <base-button
                  class="text-4xl mx-3"
                  :action="
                    () => {
                      users.visible = !users.visible;
                    }
                  "
                  >-</base-button
                >
                {{ $t('Users') }}
              </span>
              <base-input
                :value="users.search"
                icon="search"
                class="w-72 mx-4"
                :placeholder="$t('actions.search')"
                @input="
                  (value) => {
                    users.search = value;
                    throttle(getUsers, 1000)();
                  }
                "
              ></base-input>
            </div>
            <div class="p-4" v-if="users.visible">
              <UsersTable
                :users="users.data"
                :meta="users.meta"
                @change="getUsers"
                @reload="getUsers"
              ></UsersTable>
            </div>
          </div>
        </div>
        <div class="flex">
          <div class="m-4 pt-2 shadow bg-white w-full">
            <div class="p2-4 px-2 border-b flex items-center">
              <span class="flex items-center">
                <base-button
                  class="text-4xl mx-3"
                  :action="
                    () => {
                      ghostUsers.visible = !ghostUsers.visible;
                    }
                  "
                  >-</base-button
                >
                {{ $t('Ghost Users') }}
              </span>
              <base-input
                :value="ghostUsers.search"
                icon="search"
                class="w-72 mx-4"
                :placeholder="$t('actions.search')"
                @input="
                  (value) => {
                    ghostUsers.search = value;
                    throttle(getGhostUsers, 1000)();
                  }
                "
              ></base-input>
            </div>
            <div class="p-4" v-if="ghostUsers.visible">
              <GhostUsersTable
                :users="ghostUsers.data"
                :meta="ghostUsers.meta"
                @change="getGhostUsers"
                @reload="getGhostUsers"
              ></GhostUsersTable>
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
import { throttle } from 'lodash';
import IncidentApprovalTable from '../../components/IncidentApprovalTable';
import OrganizationApprovalTable from '../../components/OrganizationApprovalTable';
import InviteUsers from '../organization/InviteUsers';
import { getQueryString } from '../../utils/urls';
import { getErrorMessage } from '../../utils/errors';
import Loader from '../../components/Loader';
import WorksiteImport from '../../components/WorksiteImport';
import FileUpload from '../../components/FileUpload';
import OrganizationsTable from '../../components/admin/OrganizationsTable';
import UsersTable from '../../components/admin/UsersTable';
import GhostUsersTable from '../../components/admin/GhostUsersTable';

export default {
  name: 'AdminDashboard',
  components: {
    GhostUsersTable,
    UsersTable,
    OrganizationsTable,
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
      globalSearch: '',
      organizations: {
        data: [],
        meta: {
          pagination: {
            pageSize: 20,
            page: 1,
            current: 1,
          },
        },
        search: '',
        visible: true,
      },
      users: {
        data: [],
        meta: {
          pagination: {
            pageSize: 20,
            page: 1,
            current: 1,
          },
        },
        search: '',
        visible: true,
      },
      ghostUsers: {
        data: [],
        meta: {
          pagination: {
            pageSize: 20,
            page: 1,
            current: 1,
          },
        },
        search: '',
        visible: true,
      },
      organizationsForApproval: [],
      incident_requests: [],
      loading: false,
      defaultPagination: {
        pageSize: 20,
        page: 1,
        current: 1,
      },
      throttle,
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
        this.getOrganizations({ pagination: this.defaultPagination }),
        this.getUsers({ pagination: this.defaultPagination }),
        this.getGhostUsers({ pagination: this.defaultPagination }),
      ]);
    },
    async getOrganizationsForApproval() {
      if (this.$can('approve_orgs_full')) {
        const params = {
          approved_by__isnull: true,
          rejected_by__isnull: true,
        };
        if (this.globalSearch) {
          params.search = this.globalSearch;
        }

        const queryString = getQueryString(params);

        const response = await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/admins/organizations?${queryString}`,
        );
        this.organizationsForApproval = response.data.results;
      }
    },
    async getOrganizations(data = {}) {
      const pagination = data.pagination || this.organizations.meta.pagination;
      const params = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
      };
      if (this.organizations.search || this.globalSearch) {
        params.search = this.globalSearch || this.organizations.search;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/admins/organizations?${queryString}`,
      );
      this.organizations.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      this.organizations.meta = {
        pagination: newPagination,
      };
    },
    async getUsers(data = {}) {
      const pagination = data.pagination || this.users.meta.pagination;
      const params = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
      };
      if (this.users.search || this.globalSearch) {
        params.search = this.globalSearch || this.users.search;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/users?${queryString}`,
      );
      this.users.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      this.users.meta = {
        pagination: newPagination,
      };
    },
    async getGhostUsers(data = {}) {
      const pagination = data.pagination || this.ghostUsers.meta.pagination;
      const params = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
      };
      if (this.ghostUsers.search || this.globalSearch) {
        params.search = this.globalSearch || this.ghostUsers.search;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/ghost_users?${queryString}`,
      );
      this.ghostUsers.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      this.ghostUsers.meta = {
        pagination: newPagination,
      };
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
