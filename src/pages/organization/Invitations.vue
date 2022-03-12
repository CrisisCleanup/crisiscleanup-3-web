<template>
  <div class="flex h-full w-3/4 m-auto">
    <div class="mt-6 w-full">
      <div class="flex justify-between items-center my-6">
        <div>
          <div class="text-base">
            {{ $t('invitationsVue.current_requests') }}
          </div>
          <div class="text-xs text-crisiscleanup-dark-300">
            {{ $t('invitationsVue.sub_sections') }}
          </div>
        </div>
        <div class="flex">
          <InviteUsers class="mx-1" />
          <base-button
            size="small"
            :text="$t('actions.download')"
            :alt="$t('actions.download')"
            class="table-action-button"
            ccu-icon="download"
            icon-size="small"
            :action="exportInvitationRequestsTable"
          />
        </div>
      </div>
      <Table
        class="border text-xs"
        :data="invitationRequests"
        :columns="currentRequestsColumns"
        :loading="false"
        ref="invitationRequestsTable"
        :sorter="invitationRequestsSorter"
        @change="handleInvitationRequestsTableChange"
      >
        <template #actions="slotProps">
          <div class="flex mr-2 justify-end w-full">
            <base-button
              size="small"
              class="m-1 mx-2 text-xs px-3 py-1"
              :action="() => {}"
              :text="$t('actions.ignore')"
              :alt="$t('actions.ignore')"
            />
            <base-button
              size="small"
              type="bare"
              class="m-1 mx-2 border-2 border-black text-black px-3 py-1"
              :action="
                () => {
                  rejectInvitationRequest(slotProps.item);
                }
              "
              :text="$t('actions.reject')"
              :alt="$t('actions.reject')"
            />
            <base-button
              size="small"
              variant="solid"
              class="m-1 mx-2 text-black text-xs px-3 py-1"
              :action="
                () => {
                  acceptInvitationRequest(slotProps.item);
                }
              "
              :text="$t('actions.accept')"
              :alt="$t('actions.accept')"
            />
          </div>
        </template>
      </Table>

      <div class="flex justify-between items-center my-6">
        <div class="flex items-center">
          <div class="text-base">
            {{ $t('invitationsVue.incomplete_invitations') }}
          </div>
        </div>
        <div class="flex">
          <base-button
            size="small"
            :text="$t('actions.download')"
            :alt="$t('actions.download')"
            class="table-action-button"
            ccu-icon="download"
            icon-size="small"
            :action="exportInvitationsTable"
          />
          <base-button
            size="small"
            :text="$t('actions.delete_expired')"
            :alt="$t('actions.delete_expired')"
            class="table-action-button"
            ccu-icon="trash"
            icon-size="small"
            :action="deleteExpiredInvitations"
          />
        </div>
      </div>
      <Table
        class="border text-xs mt-4"
        :data="invitations"
        :columns="invitationsColumns"
        :loading="false"
        @change="handleInvitationsTableChange"
        :sorter="invitationSorter"
        ref="invitationsTable"
      >
        <template #actions="slotProps">
          <div class="flex mr-2 justify-center w-full">
            <base-button
              size="small"
              variant="solid"
              class="m-1 mx-2 text-black font-light text-xs py-1 px-3"
              :action="
                () => {
                  resendInvitation(slotProps.item);
                }
              "
              :text="$t('actions.re_invite')"
              :alt="$t('actions.re_invite')"
            />
          </div>
        </template>
        <template #delete="slotProps">
          <div class="flex mr-2 justify-center">
            <ccu-icon
              :alt="$t('actions.delete_invitation')"
              type="trash"
              size="small"
              @click.native="() => deleteInvitations([slotProps.item])"
            />
          </div>
        </template>
      </Table>
    </div>
  </div>
</template>

<script>
import Table from '@/components/Table';
import InvitationRequest from '@/models/InvitationRequest';
import Invitation from '@/models/Invitation';
import InviteUsers from './InviteUsers';

export default {
  name: 'Invitations',
  components: { InviteUsers, Table },
  data() {
    return {
      currentRequestsColumns: [
        {
          title: this.$t('invitationsVue.requestor'),
          dataIndex: 'requestor',
          key: 'full_name',
          sortable: true,
        },
        {
          title: this.$t('invitationsVue.email'),
          dataIndex: 'email',
          key: 'email',
          sortable: true,
        },
        {
          title: this.$t('invitationsVue.phone'),
          dataIndex: 'phone',
          key: 'mobile',
          sortable: true,
        },
        {
          title: this.$t('invitationsVue.request_date'),
          dataIndex: 'requested_at',
          key: 'requested_at',
          sortable: true,
          transformer: (requested_at) => {
            return this.$moment(requested_at).format('L');
          },
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          width: '2.5fr',
        },
      ],
      invitationsColumns: [
        {
          title: this.$t('invitationsVue.email'),
          dataIndex: 'email',
          key: 'invitee_email',
          width: '250px',
          sortable: true,
        },
        {
          title: this.$t('invitationsVue.invited_by'),
          dataIndex: 'inviter',
          key: 'inviter',
          width: '1fr',
          sortable: true,
        },
        {
          title: this.$t('invitationsVue.status'),
          dataIndex: 'status',
          key: 'status',
          width: '1fr',
          sortable: true,
        },
        {
          title: this.$t('invitationsVue.expiration_date'),
          dataIndex: 'expires_at',
          key: 'expires_at',
          width: '1fr',
          transformer: (expires_at) => {
            return this.$moment(expires_at).format('L');
          },
          sortable: true,
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          width: '1.5fr',
        },
        {
          title: '',
          dataIndex: 'delete',
          key: 'delete',
          width: '0.5fr',
        },
      ],
      invitationSorter: {},
      invitationRequestsSorter: {},
    };
  },
  computed: {
    invitationRequests() {
      const baseQuery = InvitationRequest.query()
        .where('approved_at', null)
        .where('rejected_at', null);

      if (this.invitationRequestsSorter.key) {
        const { key, direction } = this.invitationRequestsSorter;
        return baseQuery.orderBy(key, direction).get();
      }
      return baseQuery.orderBy('id', 'desc').get();
    },
    invitations() {
      if (this.invitationSorter.key) {
        const { key, direction } = this.invitationSorter;
        return Invitation.query().orderBy(key, direction).get();
      }
      return Invitation.query().orderBy('id', 'desc').get();
    },
  },
  async mounted() {
    await Promise.all([
      this.loadAllInvitationRequests(),
      this.loadAllInvitations(),
    ]);
  },
  methods: {
    async loadAllInvitationRequests() {
      await InvitationRequest.api().get(`/invitation_requests`, {
        dataKey: 'results',
      });
    },
    exportInvitationsTable() {
      this.$refs.invitationsTable.exportTableCSV();
    },
    exportInvitationRequestsTable() {
      this.$refs.invitationRequestsTable.exportTableCSV();
    },
    async deleteExpiredInvitations() {
      const invitations = Invitation.query().where(
        'status',
        (status) => status === 'Expired',
      );

      await this.deleteInvitations(invitations);
    },
    async loadAllInvitations() {
      await Invitation.api().get(`/invitations`, {
        dataKey: 'results',
      });
    },
    async acceptInvitationRequest(request) {
      await InvitationRequest.api().acceptInvitationRequest(request);
      await this.loadAllInvitationRequests();
      await this.$toasted.success(
        this.$t('invitationsVue.invitation_request_accepted'),
      );
    },
    async rejectInvitationRequest(request) {
      await InvitationRequest.api().rejectInvitationRequest(request);
      await this.loadAllInvitationRequests();
      await this.$toasted.success(
        this.$t('invitationsVue.invitation_request_declined'),
      );
    },
    async resendInvitation(invitation) {
      await Invitation.api().resendInvitation(invitation);
      await this.loadAllInvitations();
      await this.$toasted.success(this.$t('invitationsVue.invitation_resent'));
    },
    async deleteInvitations(invitations) {
      await Promise.all(
        invitations.map((invitation) =>
          Invitation.api().delete(`/invitations/${invitation.id}`, {
            delete: invitation.id,
          }),
        ),
      );

      await this.$toasted.success(this.$t('invitationsVue.invitation_deleted'));
    },
    handleInvitationsTableChange({ sorter }) {
      this.invitationSorter = { ...sorter };
    },
    handleInvitationRequestsTableChange({ sorter }) {
      this.invitationRequestsSorter = { ...sorter };
    },
  },
};
</script>

<style scoped>
.table-action-button {
  @apply mx-2 shadow bg-white px-3 p-1 text-xs text-crisiscleanup-dark-300 font-light;
}
</style>
