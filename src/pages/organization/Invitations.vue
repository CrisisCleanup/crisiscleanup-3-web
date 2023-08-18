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
            data-testid="testExportInvitationRequestsButton"
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
        ref="invitationRequestsTable"
        data-testid="testInvitationRequestsTable"
        class="border text-xs"
        :data="invitationRequests"
        :columns="currentRequestsColumns"
        :loading="false"
        :sorter="invitationRequestsSorter"
        @change="handleInvitationRequestsTableChange"
        :body-style="{ height: '200px' }"
      >
        <template #actions="slotProps">
          <div class="flex mr-2 justify-end w-full">
            <base-button
              size="small"
              data-testid="testIgnoreButton"
              class="m-1 mx-2 text-xs px-3 py-1"
              :action="() => {}"
              :text="$t('actions.ignore')"
              :alt="$t('actions.ignore')"
            />
            <base-button
              size="small"
              :data-testid="`testReject${slotProps.item}Button`"
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
              :data-testid="`testAccept${slotProps.item}Button`"
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
            data-testid="testExportInvitationsButton"
            :text="$t('actions.download')"
            :alt="$t('actions.download')"
            class="table-action-button"
            ccu-icon="download"
            icon-size="small"
            :action="exportInvitationsTable"
          />
          <base-button
            size="small"
            data-testid="testDeleteExpiredInvitationsButton"
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
        ref="invitationsTable"
        data-testid="testInvitationsTable"
        class="border text-xs mt-4"
        :data="invitations"
        :columns="invitationsColumns"
        :loading="false"
        :sorter="invitationSorter"
        :body-style="{ height: '200px' }"
        @change="handleInvitationsTableChange"
      >
        <template #actions="slotProps">
          <div class="flex mr-2 justify-center w-full">
            <base-button
              size="small"
              :data-testid="`testReInvite${slotProps.item}Button`"
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
          <div class="flex mr-2 justify-center items-center w-full">
            <ccu-icon
              :alt="$t('actions.delete_invitation')"
              :data-testid="`testDeleteInvitation${slotProps.item}Button`"
              type="trash"
              size="small"
              @click="() => deleteInvitations([slotProps.item])"
            />
          </div>
        </template>
      </Table>

      <div class="flex justify-between items-center my-6">
        <div class="flex items-center">
          <div class="text-base">
            {{ $t('~~Persistent Invitations') }}
          </div>
        </div>
        <div class="flex">
          <base-button
            size="small"
            data-testid="testCreateNewPersistentInvitationButton"
            :text="$t('actions.create_new')"
            :alt="$t('actions.create_new')"
            class="table-action-button"
            :action="createNewPersistentInvitation"
          />
        </div>
      </div>
      <AjaxTable
        :body-style="{ height: '200px' }"
        :url="persistentInvitationsUrl"
        :columns="persistentInvitationColumns"
        class="border text-xs"
        ref="persistentInvitationsTable"
      >
        <template #actions="slotProps">
          <div class="flex mr-2 justify-center w-full">
            <base-button
              size="small"
              :data-testid="`testShowQRCode${slotProps.item}Button`"
              variant="solid"
              class="m-1 mx-2 text-black text-xs px-3 py-1"
              :action="
                () => {
                  showQRCode(slotProps.item);
                }
              "
              :text="$t('~~Show QR Code')"
              :alt="$t('~~Show QR Code')"
            />
          </div>
        </template>
        <template #delete="slotProps">
          <div class="flex mr-2 justify-center items-center w-full">
            <ccu-icon
              :alt="$t('actions.delete_persistent_invitation')"
              :data-testid="`testDeletePersistentInvitation${slotProps.item}Button`"
              type="trash"
              size="small"
              @click="() => deletePersistentInvitation(slotProps.item)"
            />
          </div>
        </template>
      </AjaxTable>
    </div>
  </div>
</template>

<script lang="ts">
import moment from 'moment';
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import InviteUsers from './InviteUsers.vue';
import Table from '@/components/Table.vue';
import type { TableSorterObject } from '@/components/Table.vue';
import InvitationRequest from '@/models/InvitationRequest';
import Invitation from '@/models/Invitation';
import AjaxTable from '@/components/AjaxTable.vue';
import { makeTableColumns } from '@/utils/table';
import { get } from 'lodash';
import useDialogs from '@/hooks/useDialogs';
import QRCode from '@/components/QRCode.vue';
import CreateNewPersistentInvitation from '@/components/CreateNewPersistentInvitation.vue';
import * as L from 'leaflet';
import axios from 'axios';
import { getErrorMessage } from '@/utils/errors';

type TableInstance = InstanceType<typeof Table>;

export default defineComponent({
  name: 'Invitations',
  components: { AjaxTable, InviteUsers, Table },
  setup() {
    const { t } = useI18n();
    const $toasted = useToast();
    const { component } = useDialogs();

    const invitationsTable = ref<TableInstance | null>(null);
    const invitationRequestsTable = ref<TableInstance | null>(null);
    const invitationSorter = ref<TableSorterObject<Invitation>>({});
    const invitationRequestsSorter = ref<TableSorterObject<Invitation>>({});

    const currentRequestsColumns = reactive([
      {
        title: t('invitationsVue.requestor'),
        dataIndex: 'requestor',
        key: 'full_name',
        sortable: true,
      },
      {
        title: t('invitationsVue.email'),
        dataIndex: 'email',
        key: 'email',
        sortable: true,
      },
      {
        title: t('invitationsVue.phone'),
        dataIndex: 'phone',
        key: 'mobile',
        sortable: true,
      },
      {
        title: t('invitationsVue.request_date'),
        dataIndex: 'requested_at',
        key: 'requested_at',
        sortable: true,
        transformer(requested_at: Date) {
          return moment(requested_at).format('L');
        },
      },
      {
        title: '',
        dataIndex: 'actions',
        key: 'actions',
        width: '2.5fr',
      },
    ]);
    const invitationsColumns = reactive([
      {
        title: t('invitationsVue.email'),
        dataIndex: 'email',
        key: 'invitee_email',
        width: '250px',
        sortable: true,
      },
      {
        title: t('invitationsVue.invited_by'),
        dataIndex: 'inviter',
        key: 'inviter',
        width: '1fr',
        sortable: true,
      },
      {
        title: t('invitationsVue.status'),
        dataIndex: 'status',
        key: 'status',
        width: '1fr',
        sortable: true,
      },
      {
        title: t('invitationsVue.expiration_date'),
        dataIndex: 'expires_at',
        key: 'expires_at',
        width: '1fr',
        transformer(expires_at: Date) {
          return moment(expires_at).format('L');
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
    ]);
    const persistentInvitationsTable = ref(null);

    const persistentInvitationColumns = makeTableColumns([
      ['model', '1fr', 'Model'],
      ['object_id', '1fr', 'Object ID'],
      [
        'requires_approval',
        '1fr',
        'Requires Approval',
        {
          transformer: (_: string, item) =>
            get(item, 'requires_approval', false) ? 'Yes' : 'No',
        },
      ],
      [
        'expires_at',
        '1fr',
        'Expires At',
        {
          transformer(expires_at: string) {
            return moment(expires_at).format('L');
          },
        },
      ],
      ['actions', '1fr', 'actions'],
      ['delete', '1fr', 'delete'],
    ]);

    const invitationRequests = computed(() => {
      const baseQuery = InvitationRequest.query()
        .where('approved_at', null)
        .where('rejected_at', null);

      if (invitationRequestsSorter.value.key) {
        const { key, direction } = invitationRequestsSorter.value;
        return baseQuery.orderBy(key, direction).get();
      }

      return baseQuery.orderBy('id', 'desc').get();
    });
    const invitations = computed(() => {
      if (invitationSorter.value.key) {
        const { key, direction } = invitationSorter.value;
        return Invitation.query().orderBy(key, direction).get();
      }

      return Invitation.query().orderBy('id', 'desc').get();
    });
    const persistentInvitationsUrl = `${
      import.meta.env.VITE_APP_API_BASE_URL
    }/persistent_invitations`;

    async function deletePersistentInvitation(persistentInvitation) {
      try {
        await axios.delete(
          `${persistentInvitationsUrl}/${persistentInvitation.token}`,
        );
        await $toasted.success(t('~~Persistent Invitation Deleted'));
        await persistentInvitationsTable.value.getData();
      } catch (error) {
        debugger;
        await $toasted.error(getErrorMessage(error));
      }
    }

    function showQRCode(persistentInvitation) {
      return component({
        title: t('~~Join the team'),
        component: QRCode,
        classes: 'w-full h-84 overflow-auto p-3',
        modalClasses: 'bg-white max-w-sm shadow',
        props: {
          value: window.location.origin + '/i/' + persistentInvitation.token,
        },
      });
    }

    async function createNewPersistentInvitation() {
      const response = await component({
        id: 'persistent_invitation_modal',
        title: t('~~Create New Persistent Invitation'),
        component: CreateNewPersistentInvitation,
        classes: 'w-full h-72 overflow-auto p-3',
        modalClasses: 'bg-white max-w-sm shadow',
        hideFooter: true,
      });

      if (response === 'ok') {
        await persistentInvitationsTable.value.getData();
      }

    }

    async function loadAllInvitationRequests() {
      await InvitationRequest.api().get(`/invitation_requests`, {
        dataKey: 'results',
      });
    }

    function exportInvitationsTable() {
      if (invitationsTable.value) {
        invitationsTable.value.exportTableCSV();
      } else {
        console.error('Invitations table ref not found');
      }
    }

    function exportInvitationRequestsTable() {
      if (invitationRequestsTable.value) {
        invitationRequestsTable.value.exportTableCSV();
      } else {
        console.error('Invitation Requests table ref not found');
      }
    }

    async function deleteExpiredInvitations() {
      const invitations = Invitation.query()
        .where('status', (status: string) => status === 'Expired')
        .get();
      await deleteInvitations(invitations);
    }

    async function loadAllInvitations() {
      await Invitation.api().get(`/invitations`, {
        dataKey: 'results',
      });
    }

    async function acceptInvitationRequest(request: Invitation) {
      await InvitationRequest.api().acceptInvitationRequest(request);
      await loadAllInvitationRequests();
      await $toasted.success(t('invitationsVue.invitation_request_accepted'));
    }

    async function rejectInvitationRequest(request: Invitation) {
      await InvitationRequest.api().rejectInvitationRequest(request);
      await loadAllInvitationRequests();
      await $toasted.success(t('invitationsVue.invitation_request_declined'));
    }

    async function resendInvitation(invitation: Invitation) {
      await Invitation.api().resendInvitation(invitation);
      await loadAllInvitations();
      await $toasted.success(t('invitationsVue.invitation_resent'));
    }

    async function deleteInvitations(invitations: Invitation[]) {
      await Promise.all(
        invitations.map((invitation) =>
          Invitation.api().delete(`/invitations/${invitation.id}`, {
            delete: invitation.id,
          }),
        ),
      );

      await $toasted.success(t('invitationsVue.invitation_deleted'));
    }

    function handleInvitationsTableChange({
      sorter,
    }: {
      sorter: SorterObject;
    }) {
      invitationSorter.value = { ...sorter };
    }

    function handleInvitationRequestsTableChange({
      sorter,
    }: {
      sorter: SorterObject;
    }) {
      invitationRequestsSorter.value = { ...sorter };
    }

    onMounted(async () => {
      await Promise.all([loadAllInvitationRequests(), loadAllInvitations()]);
    });

    return {
      invitationRequestsTable,
      invitationsTable,
      currentRequestsColumns,
      invitationsColumns,
      persistentInvitationColumns,
      invitationSorter,
      invitationRequestsSorter,
      invitationRequests,
      invitations,
      exportInvitationsTable,
      exportInvitationRequestsTable,
      deleteExpiredInvitations,
      persistentInvitationsTable,
      acceptInvitationRequest,
      rejectInvitationRequest,
      resendInvitation,
      deleteInvitations,
      handleInvitationsTableChange,
      handleInvitationRequestsTableChange,
      createNewPersistentInvitation,
      showQRCode,
      deletePersistentInvitation,
      persistentInvitationsUrl,
    };
  },
});
</script>

<style lang="postcss" scoped>
.table-action-button {
  @apply mx-2 shadow bg-white px-3 p-1 text-xs text-crisiscleanup-dark-300 font-light;
}
</style>
