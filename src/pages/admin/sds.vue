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
          <div class="flex items-center mr-4">
            <InviteUsers class="px-3" is-admin />
            <MergeOrganizations is-admin />
            <FileUpload class="mx-3 my-1" />
            <DatabaseAccess class="mx-3 my-1" />
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
                {{ $t('adminDashboard.organizations') }}
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
                {{ $t('adminDashboard.users') }}
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
                <!--                <base-button-->
                <!--                  class="text-4xl mx-3"-->
                <!--                  :action="-->
                <!--                    () => {-->
                <!--                      Tickets.visible = !Tickets.visible;-->
                <!--                    }-->
                <!--                  "-->
                <!--                  >-</base-button-->
                <!--                >-->
                {{ 'Tickets' }}
              </span>
            </div>

            <!--            <div class='p-4' v-if='Tickets.visible'>-->
            <!--              <TicketsTable-->
            <!--                :tickets='Tickets.data'-->
            <!--                :meta='Tickets.meta'-->
            <!--              ></TicketsTable>-->
            <!--            </div>-->
            <div>
              <table id="customers">
                <tr>
                  <th
                    :key="idx"
                    style="color: darkgrey"
                    v-for="(headers,idx )in [
                      'Ticket Id',
        'Requester Id',
        'Created',
        'Description',
        'Via',
        'Launch Ticket',
               ]"
                  >
                    {{ headers }}
                  </th>
                </tr>
                <tr :key="idx" class="text-" v-for="(items, idx) in newData">
                  <th style="width: 7%">{{ items.id }}</th>

                  <th style="width: 8%">{{ items.requester_id }}</th>

                  <th style="width: 10%">{{ items.created }}</th>

                  <th style="width: 65%">{{ items.description }}</th>

                  <th style="width: 5%">{{ items.via }}</th>

                  <th>
                    <div
                      class="text-center flex justify-center"
                      style="background-color: #fece09; padding: 2px"
                    >
                      <a
                        class="flex"
                        :href="
                          'http://crisiscleanup.zendesk.com/agent/tickets/' +
                          items.id
                        "
                        target="_blank"
                        >Launch Ticket</a
                      >
                    </div>
                  </th>
                </tr>
              </table>
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
                :value="invitationRequests.search"
                icon="search"
                class="w-72 mx-4"
                :placeholder="$t('actions.search')"
                @input="
                  (value) => {
                    invitationRequests.search = value;
                    throttle(getInvitationRequests, 1000)();
                  }
                "
              ></base-input>
            </div>
            <div class="p-4" v-if="invitationRequests.visible">
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
                :value="invitations.search"
                icon="search"
                class="w-72 mx-4"
                :placeholder="$t('actions.search')"
                @input="
                  (value) => {
                    invitations.search = value;
                    throttle(getInvitations, 1000)();
                  }
                "
              ></base-input>
            </div>
            <div class="p-4" v-if="invitations.visible">
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
    </template>
  </Loader>
</template>

<script>
import { mapState } from 'vuex';
import User from '@/models/User';
import { throttle } from 'lodash';
import InvitationRequestTable from '@/components/admin/InvitationRequestTable';
import InvitationTable from '@/components/admin/InvitationTable';
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
import MergeOrganizations from '../../components/MergeOrganizations';
import DatabaseAccess from '../../components/DatabaseAccess';

const axios = require('axios');

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
    Loader,
  },
  data() {
    return {
      ticketTableHeaders: [
        'Ticket Id',
        'Requester Id',
        'Created',
        'Description',
        'Via',
        'Launch Ticket',
      ],
      newData: [
        {
          id: 1,
          description: 'test',
          via: 'test web',
          url: 'http://crisiscleanup.zendesk.com',
          created: 'this date',
          requester_id: '8900',
        },
      ],
      dataFromApi: [],
      dataForApi: [
        {
          allow_attachments: true,
          allow_channelback: false,
          assignee_id: 484643688,
          brand_id: 1290926,
          collaborator_ids: [],
          created_at: '2016-03-30T01:59:26Z',
          description:
            'When I attempt to Edit a case file from the browse screen, there is no data shown on the form when it is displayed on the screen.  I am unable to update the address in a test case to see what is happening.  Frustrating for all my users.',
          due_at: null,
          email_cc_ids: [],
          external_id: null,
          follower_ids: [],
          followup_ids: [],
          forum_topic_id: null,
          group_id: 21259708,
          has_incidents: false,
          id: 308,
          is_public: true,
          organization_id: null,
          priority: null,
          problem_id: null,
          raw_subject:
            'error correcting on submitted data and reviewing submitted data in the dataenry screen',
          recipient: null,
          requester_id: 5257853367,
          result_type: 'ticket',
          satisfaction_rating: null,
          sharing_agreement_ids: [],
          status: 'closed',
          subject:
            'error correcting on submitted data and reviewing submitted data in the dataenry screen',
          submitter_id: 5257853367,
          tags: [],
          type: null,
          updated_at: '2016-04-03T05:02:26Z',
          url: 'https://crisiscleanup.zendesk.com/api/v2/tickets/308.json',
          via: { channel: 'web' },
        },
        {
          allow_attachments: true,
          allow_channelback: false,
          assignee_id: 234234234,
          brand_id: 1290926,
          collaborator_ids: [],
          created_at: '2016-03-30T01:59:26Z',
          description:
            'When I attempt to Edit a case file from the browse screen, there is no data shown on the form when it is displayed on the screen.  I am unable to update the address in a test case to see what is happening.  Frustrating for all my users.',
          due_at: null,
          email_cc_ids: [],
          external_id: null,
          follower_ids: [],
          followup_ids: [],
          forum_topic_id: null,
          group_id: 234234,
          has_incidents: false,
          id: 234234,
          is_public: true,
          organization_id: null,
          priority: null,
          problem_id: null,
          raw_subject:
            'error correcting on submitted data and reviewing submitted data in the dataenry screen',
          recipient: null,
          requester_id: 234234,
          result_type: 'ticket',
          satisfaction_rating: null,
          sharing_agreement_ids: [],
          status: 'closed',
          subject:
            'error correcting on submitted data and reviewing submitted data in the dataenry screen',
          submitter_id: 234234,
          tags: [],
          type: null,
          updated_at: '2016-04-03T05:02:26Z',
          url: 'https://crisiscleanup.zendesk.com/api/v2/tickets/308.json',
          via: { channel: 'web' },
        },
        {
          allow_attachments: true,
          allow_channelback: false,
          assignee_id: 484643688,
          brand_id: 1290926,
          collaborator_ids: [],
          created_at: '2016-03-30T01:59:26Z',
          description:
            'When I attempt to Edit a case file from the browse screen, there is no data shown on the form when it is displayed on the screen.  I am unable to update the address in a test case to see what is happening.  Frustrating for all my users.',
          due_at: null,
          email_cc_ids: [],
          external_id: null,
          follower_ids: [],
          followup_ids: [],
          forum_topic_id: null,
          group_id: 21259708,
          has_incidents: false,
          id: 8233,
          is_public: true,
          organization_id: null,
          priority: null,
          problem_id: null,
          raw_subject:
            'error correcting on submitted data and reviewing submitted data in the dataenry screen',
          recipient: null,
          requester_id: 5257853367,
          result_type: 'ticket',
          satisfaction_rating: null,
          sharing_agreement_ids: [],
          status: 'closed',
          subject:
            'error correcting on submitted data and reviewing submitted data in the dataenry screen',
          submitter_id: 5257853367,
          tags: [],
          type: null,
          updated_at: '2016-04-03T05:02:26Z',
          url: 'https://crisiscleanup.zendesk.com/api/v2/tickets/308.json',
          via: { channel: 'web' },
        },
      ],
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
      Tickets: {
        // data: [{ id: 1, first_name: 'Triston', last_name: 'Lewis', ticket_id: 6000, launch_ticket: 'wow' },{ id: 2, first_name: 'zach', last_name: 'Lewis', ticket_id: 6000, launch_ticket: 'wow' },{ id: 3, first_name: 'braden', last_name: 'Lewis', ticket_id: 6000, launch_ticket: 'wow' }],
        // data: this.dataConversion(),
        // data: this.newData,
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
      invitationRequests: {
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
      invitations: {
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
    await this.dataConversion();

    this.loading = false;
  },
  methods: {
    async dataConversion() {
      const headers = {
        Authorization:
          'Bearer 759bfc68240739458c76c58cf4ce7d8eb8b9336916eb32d953afaa34a4d2b676',
      };
      axios
        .get(
          'https://crisiscleanup.zendesk.com/api/v2/search.json?query=status<solved',
          { headers },
        )
        // eslint-disable-next-line no-return-assign
        .then((response) => (this.dataFromApi = response));
      for (let i = 0; i < this.dataFromApi.data.results.length; i++) {
        this.newData[i] = {
          id: this.dataFromApi.data.results[i].id,
          description: this.dataFromApi.data.results[i].description,
          via: this.dataFromApi.data.results[i].via.channel,
          url: this.dataFromApi.data.results[i].url,
          created: this.dataFromApi.data.results[i].created_at,
          requester_id: this.dataFromApi.data.results[i].requester_id,
        };
      }
      return this.newData;
    },
    async reloadDashBoard() {
      await Promise.all([
        this.getOrganizationsForApproval(),
        this.getIncidentRequests(),
        this.getOrganizations({ pagination: this.defaultPagination }),
        this.getUsers({ pagination: this.defaultPagination }),
        this.getGhostUsers({ pagination: this.defaultPagination }),
        this.getInvitationRequests({ pagination: this.defaultPagination }),
        this.getInvitations({ pagination: this.defaultPagination }),
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
    async getTickets(data = {}) {
      const pagination = data.pagination || this.Tickets.meta.pagination;
      const params = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
      };
      if (this.Tickets.search || this.globalSearch) {
        params.search = this.globalSearch || this.Tickets.search;
      }
      // const queryString = getQueryString(params);

      const response = this.dataFromApi;
      this.Tickets.data = response;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      this.Tickets.meta = {
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
    async getInvitationRequests(data = {}) {
      const pagination =
        data.pagination || this.invitationRequests.meta.pagination;
      const params = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
        approved_by__isnull: true,
        rejected_by__isnull: true,
      };
      if (this.invitationRequests.search || this.globalSearch) {
        params.search = this.globalSearch || this.invitationRequests.search;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/admins/invitation_requests?${queryString}`,
      );
      this.invitationRequests.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      this.invitationRequests.meta = {
        pagination: newPagination,
      };
    },
    async getInvitations(data = {}) {
      const pagination = data.pagination || this.invitations.meta.pagination;
      const params = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
        activated: false,
      };
      if (this.invitations.search || this.globalSearch) {
        params.search = this.globalSearch || this.invitations.search;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/admins/invitations?${queryString}`,
      );
      this.invitations.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      this.invitations.meta = {
        pagination: newPagination,
      };
    },
    async getIncidentRequests() {
      if (this.$can('move_orgs')) {
        try {
          const response = await this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/admins/incident_requests?organization__org_verified=true`,
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

<style scoped>
#customers {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

#customers td,
#customers th {
  border: 1px solid #ddd;
  padding: 8px;
}

#customers tr:nth-child(even) {
  background-color: #f2f2f2;
}

#customers tr:hover {
  background-color: #ddd;
}

#customers th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: white;
  color: black;
}
</style>
