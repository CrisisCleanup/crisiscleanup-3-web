<template>
  <div class="flex flex-col">
    <div class="flex flex-col items-center justify-between">
      <base-input
        :model-value="globalSearch"
        icon="search"
        class="w-full mx-4"
        :placeholder="$t('actions.search_everywhere')"
        @update:modelValue="
          (value) => {
            globalSearch = value;
            debounce(reloadDashBoard, 1000)();
          }
        "
      ></base-input>
      <div class="flex flex-wrap mt-4 sm:mt-0 items-center mr-4">
        <InviteUsers class="px-3" is-admin />
        <MergeOrganizations is-admin />
        <FileUpload class="mx-3 my-1" />
        <DatabaseAccess class="mx-3 my-1" />
        <base-button
          :text="$t('adminDashboard.arcgis_upload')"
          variant="solid"
          size="medium"
          :action="showArcGisUploader"
        />
      </div>
    </div>
    <div class="flex">
      <div class="m-4 pt-2 shadow bg-white w-full">
        <div class="py-4 px-4 flex items-center justify-between border-b">
          <div class="text-gray-500">
            {{ $t('adminDashboard.pending_organizations') }}
          </div>
          <base-button icon="sync" :action="getOrganizationsForApproval" />
        </div>
        <div class="py-4 px-4 border-b flex items-center">
          <base-button
            class="mr-2 border-r pr-2"
            size="medium"
            :text="$t('adminDashboard.action_required')"
            :class="[
              organizationApprovalView === 'default' ? 'text-primary-dark' : '',
            ]"
            variant="text"
            :action="() => setApprovalView('default')"
          />

          <base-button
            class="mr-2 border-r pr-2"
            size="medium"
            :text="$t('adminDashboard.recently_approved')"
            :class="[
              organizationApprovalView === 'approved'
                ? 'text-primary-dark'
                : '',
            ]"
            variant="text"
            :action="() => setApprovalView('approved')"
          />

          <base-button
            class="mr-2"
            size="medium"
            :text="$t('adminDashboard.recently_rejected')"
            :class="[
              organizationApprovalView === 'rejected'
                ? 'text-primary-dark'
                : '',
            ]"
            variant="text"
            :action="() => setApprovalView('rejected')"
          />
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
        <div class="py-4 px-4 flex items-center justify-between border-b">
          <div class="text-gray-500">
            {{ $t('adminDashboard.redeploy_requests') }}
          </div>
          <base-button icon="sync" :action="getIncidentRequests" />
        </div>
        <div class="py-4 px-4 border-b flex items-center">
          <base-button
            class="mr-2 border-r pr-2"
            size="medium"
            :text="$t('adminDashboard.action_required')"
            :class="[redeployView === 'default' ? 'text-primary-dark' : '']"
            variant="text"
            :action="() => setRedeployViewView('default')"
          />

          <base-button
            class="mr-2 border-r pr-2"
            size="medium"
            :text="$t('adminDashboard.recently_approved')"
            :class="[redeployView === 'approved' ? 'text-primary-dark' : '']"
            variant="text"
            :action="() => setRedeployViewView('approved')"
          />

          <base-button
            class="mr-2"
            size="medium"
            :text="$t('adminDashboard.recently_rejected')"
            :class="[redeployView === 'rejected' ? 'text-primary-dark' : '']"
            variant="text"
            :action="() => setRedeployViewView('rejected')"
          />
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
      <WorksiteImport class="m-4 pt-2 shadow bg-white w-full"></WorksiteImport>
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
            {{ $t('adminDashboard.organizations') }}
          </span>
          <base-input
            :model-value="organizations.search"
            icon="search"
            class="w-72 mx-4"
            :placeholder="$t('actions.search')"
            @update:modelValue="
              (value) => {
                organizations.search = value;
                debounce(getOrganizations, 1000)();
              }
            "
          ></base-input>
        </div>
        <div v-if="organizations.visible" class="p-4">
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
            {{ $t('adminDashboard.users') }}
          </span>
          <base-input
            :model-value="users.search"
            icon="search"
            class="w-72 mx-4"
            :placeholder="$t('actions.search')"
            @update:modelValue="
              (value) => {
                users.search = value;
                debounce(getUsers, 1000)();
              }
            "
          ></base-input>
        </div>
        <div v-if="users.visible" class="p-4">
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
            {{ $t('adminDashboard.ghost_users') }}
          </span>
          <base-input
            :model-value="ghostUsers.search"
            icon="search"
            class="w-72 mx-4"
            :placeholder="$t('actions.search')"
            @update:modelValue="
              (value) => {
                ghostUsers.search = value;
                debounce(getGhostUsers, 1000)();
              }
            "
          ></base-input>
        </div>
        <div v-if="ghostUsers.visible" class="p-4">
          <GhostUsersTable
            :users="ghostUsers.data"
            :meta="ghostUsers.meta"
            @change="getGhostUsers"
            @reload="getGhostUsers"
          ></GhostUsersTable>
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
                  invitationRequests.visible = !invitationRequests.visible;
                }
              "
              >-</base-button
            >
            {{ $t('adminDashboard.invitation_requests') }}
          </span>
          <base-input
            :model-value="invitationRequests.search"
            icon="search"
            class="w-72 mx-4"
            :placeholder="$t('actions.search')"
            @update:modelValue="
              (value) => {
                invitationRequests.search = value;
                debounce(getInvitationRequests, 1000)();
              }
            "
          ></base-input>
        </div>
        <div v-if="invitationRequests.visible" class="p-4">
          <InvitationRequestTable
            :requests="invitationRequests.data"
            :meta="invitationRequests.meta"
            @change="getInvitationRequests"
            @reload="getInvitationRequests"
          ></InvitationRequestTable>
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
                  invitations.visible = !invitations.visible;
                }
              "
              >-</base-button
            >
            {{ $t('adminDashboard.invitations') }}
          </span>
          <base-input
            :model-value="invitations.search"
            icon="search"
            class="w-72 mx-4"
            :placeholder="$t('actions.search')"
            @update:modelValue="
              (value) => {
                invitations.search = value;
                debounce(getInvitations, 1000)();
              }
            "
          ></base-input>
        </div>
        <div v-if="invitations.visible" class="p-4">
          <InvitationTable
            :invitations="invitations.data"
            :meta="invitations.meta"
            @change="getInvitations"
            @reload="getInvitations"
          ></InvitationTable>
        </div>
      </div>
    </div>
  </div>
  <div v-if="false" class="flex h-screen items-center justify-center">
    <font-awesome-icon size="xl" icon="spinner" spin />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { debounce } from 'lodash';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import IncidentApprovalTable from '../../components/admin/IncidentApprovalTable.vue';
import OrganizationApprovalTable from '../../components/admin/OrganizationApprovalTable.vue';
import InviteUsers from '../../components/modals/InviteUsers.vue';
import { getQueryString } from '../../utils/urls';
import { getErrorMessage } from '../../utils/errors';
import WorksiteImport from '../../components/admin/WorksiteImport.vue';
import FileUpload from '../../components/FileUpload.vue';
import OrganizationsTable from '../../components/admin/OrganizationsTable.vue';
import UsersTable from '../../components/admin/UsersTable.vue';
import GhostUsersTable from '../../components/admin/GhostUsersTable.vue';
import MergeOrganizations from '../../components/admin/MergeOrganizations.vue';
import DatabaseAccess from '../../components/admin/DatabaseAccess.vue';
import InvitationTable from '../../components/admin/InvitationTable.vue';
import InvitationRequestTable from '../../components/admin/InvitationRequestTable.vue';
import User from '../../models/User';
import useAcl from '../../hooks/useAcl';
import useDialogs from '../../hooks/useDialogs';
import ArcGisUploader from '@/components/admin/ArcGisUploader.vue';

export default {
  name: 'AdminDashboard',
  components: {
    DatabaseAccess,
    MergeOrganizations,
    InvitationTable,
    InvitationRequestTable,
    GhostUsersTable,
    UsersTable,
    OrganizationsTable,
    FileUpload,
    WorksiteImport,
    IncidentApprovalTable,
    OrganizationApprovalTable,
    InviteUsers,
  },
  setup() {
    const { t } = useI18n();
    const store = useStore();
    const $toasted = useToast();
    const { $can } = useAcl();
    const { component } = useDialogs();

    const usersToInvite = ref('');
    const globalSearch = ref('');
    const organizations = ref({
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
    });
    const users = ref({
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
    });
    const ghostUsers = ref({
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
    });
    const invitationRequests = ref({
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
    });
    const invitations = ref({
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
    });
    const organizationsForApproval = ref([]);
    const organizationApprovalView = ref('default');
    const redeployView = ref('default');
    const incident_requests = ref([]);
    const loading = ref(false);
    const defaultPagination = ref({
      pageSize: 20,
      page: 1,
      current: 1,
    });

    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );
    const statuses = computed(() => store.getters['enums/statuses']);

    async function setApprovalView(view) {
      organizationApprovalView.value = view;
      return getOrganizationsForApproval();
    }
    async function setRedeployViewView(view) {
      redeployView.value = view;
      return getIncidentRequests();
    }
    async function getOrganizationsForApproval() {
      if ($can('approve_orgs_full')) {
        const parametersDict = {
          default: {
            approved_by__isnull: true,
            rejected_by__isnull: true,
          },
          approved: {
            approved_by__isnull: false,
            sort: '-approved_at',
            limit: 10,
          },
          rejected: {
            rejected_by__isnull: false,
            sort: '-rejected_at',
            limit: 10,
          },
        };

        const parameters = {
          ...parametersDict[organizationApprovalView.value],
        };

        if (globalSearch.value) {
          parameters.search = globalSearch.value;
        }

        const queryString = getQueryString(parameters);

        const response = await axios.get(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/admins/organizations?${queryString}`,
        );
        organizationsForApproval.value = response.data.results;
      }
    }
    async function getOrganizations(data = {}) {
      const pagination = data.pagination || organizations.value.meta.pagination;
      const parameters = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
        sort: '-updated_at',
      };
      if (organizations.value.search || globalSearch.value) {
        parameters.search = globalSearch.value || organizations.value.search;
      }
      const queryString = getQueryString(parameters);

      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/admins/organizations?${queryString}`,
      );
      organizations.value.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      organizations.value.meta = {
        pagination: newPagination,
      };
    }
    async function getUsers(data = {}) {
      const pagination = data.pagination || users.value.meta.pagination;
      const parameters = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
        sort: '-updated_at',
      };
      if (users.value.search || globalSearch.value) {
        parameters.search = globalSearch.value || users.value.search;
      }
      const queryString = getQueryString(parameters);

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/users?${queryString}`,
      );
      users.value.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      users.value.meta = {
        pagination: newPagination,
      };
    }
    async function getGhostUsers(data = {}) {
      const pagination = data.pagination || ghostUsers.value.meta.pagination;
      const parameters = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
        sort: '-updated_at',
      };
      if (ghostUsers.value.search || globalSearch.value) {
        parameters.search = globalSearch.value || ghostUsers.value.search;
      }
      const queryString = getQueryString(parameters);

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/ghost_users?${queryString}`,
      );
      ghostUsers.value.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      ghostUsers.value.meta = {
        pagination: newPagination,
      };
    }
    async function getInvitationRequests(data = {}) {
      const pagination =
        data.pagination || invitationRequests.value.meta.pagination;
      const parameters = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
        approved_by__isnull: true,
        rejected_by__isnull: true,
        sort: '-requested_at',
      };
      if (invitationRequests.value.search || globalSearch.value) {
        parameters.search =
          globalSearch.value || invitationRequests.value.search;
      }
      const queryString = getQueryString(parameters);

      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/admins/invitation_requests?${queryString}`,
      );
      invitationRequests.value.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      invitationRequests.value.meta = {
        pagination: newPagination,
      };
    }
    async function getInvitations(data = {}) {
      const pagination = data.pagination || invitations.value.meta.pagination;
      const parameters = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
        activated: false,
        sort: '-created_at',
      };
      if (invitations.value.search || globalSearch.value) {
        parameters.search = globalSearch.value || invitations.value.search;
      }
      const queryString = getQueryString(parameters);

      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/admins/invitations?${queryString}`,
      );
      invitations.value.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      invitations.value.meta = {
        pagination: newPagination,
      };
    }
    async function getIncidentRequests() {
      if ($can('move_orgs')) {
        const parametersDict = {
          default: {
            approved_by__isnull: true,
            rejected_by__isnull: true,
            organization__is_verified: true,
            sort: '-updated_at',
          },
          approved: {
            approved_by__isnull: false,
            sort: '-approved_at',
            limit: 10,
          },
          rejected: {
            rejected_by__isnull: false,
            sort: '-rejected_at',
            limit: 10,
          },
        };

        const parameters = {
          ...parametersDict[redeployView.value],
        };

        const queryString = getQueryString(parameters);
        try {
          const response = await axios.get(
            `${
              import.meta.env.VITE_APP_API_BASE_URL
            }/admins/incident_requests?${queryString}`,
          );
          if (response.data) {
            incident_requests.value = [...response.data.results];
          }
        } catch {
          // this.$log.debug(error);
        }
      }
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
    async function reloadDashBoard() {
      await Promise.all([
        getOrganizationsForApproval(),
        getIncidentRequests(),
        getOrganizations({ pagination: defaultPagination.value }),
        getUsers({ pagination: defaultPagination.value }),
        getGhostUsers({ pagination: defaultPagination.value }),
        getInvitationRequests({ pagination: defaultPagination.value }),
        getInvitations({ pagination: defaultPagination.value }),
      ]);
    }
    async function showArcGisUploader() {
      await component({
        title: t('adminDashboard.arcgis_upload'),
        component: ArcGisUploader,
        classes: 'w-full h-56 p-3',
      });
    }

    onMounted(async () => {
      loading.value = true;
      await reloadDashBoard();
      loading.value = false;
    });

    return {
      getOrganizationsForApproval,
      getOrganizations,
      getUsers,
      getGhostUsers,
      getInvitationRequests,
      getIncidentRequests,
      inviteUsers,
      reloadDashBoard,
      showArcGisUploader,
      getInvitations,
      usersToInvite,
      globalSearch,
      organizations,
      users,
      ghostUsers,
      invitationRequests,
      invitations,
      organizationsForApproval,
      incident_requests,
      loading,
      defaultPagination,
      currentIncidentId,
      statuses,
      debounce,
      organizationApprovalView,
      redeployView,
      setApprovalView,
      setRedeployViewView,
    };
  },
};
</script>

<style scoped></style>
