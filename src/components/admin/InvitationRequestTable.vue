<template>
  <Table
    :columns="columns"
    :data="requests"
    :body-style="{ height: '300px' }"
    :pagination="meta.pagination"
    :loading="loading"
    @change="$emit('change', $event)"
    enable-pagination
  >
    <template #actions="slotProps">
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
    </template>
  </Table>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import Table from '../Table.vue';
import InvitationRequest from '../../models/InvitationRequest';
import useCurrentUser from '../../hooks/useCurrentUser';

export default defineComponent({
  name: 'InvitationRequestTable',
  components: { Table },
  props: {
    requests: {
      type: Array,
      default: () => [],
    },
    meta: {
      type: Object,
      default: () => {
        return {};
      },
    },
    loading: Boolean,
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const { currentUser } = useCurrentUser();
    const $toasted = useToast();

    async function loadAllInvitationRequests() {
      await InvitationRequest.api().get(`/invitation_requests`, {
        dataKey: 'results',
      });
    }

    async function acceptInvitationRequest(request: InvitationRequest) {
      await InvitationRequest.api().acceptInvitationRequest(request);
      await loadAllInvitationRequests();
      await $toasted.success(t('invitationsVue.invitation_request_accepted'));
      emit('reload');
    }
    async function rejectInvitationRequest(request: InvitationRequest) {
      await InvitationRequest.api().rejectInvitationRequest(request);
      await loadAllInvitationRequests();
      await $toasted.success(t('invitationsVue.invitation_request_declined'));
      emit('reload');
    }

    return {
      currentUser,
      acceptInvitationRequest,
      rejectInvitationRequest,
      columns: [
        {
          title: t('invitationTables.id'),
          dataIndex: 'id',
          key: 'id',
          width: '0.5fr',
        },
        {
          title: t('invitationTables.email'),
          dataIndex: 'email',
          key: 'email',
          width: '1fr',
        },
        {
          title: t('invitationTables.full_name'),
          dataIndex: 'full_name',
          key: 'full_name',
          width: '1fr',
          transformer: (field: string, item: InvitationRequest) => {
            return `${item.first_name} ${item.last_name}`;
          },
        },
        {
          title: t('invitationTables.mobile'),
          dataIndex: 'mobile',
          key: 'mobile',
          width: '1fr',
        },
        {
          title: t('invitationTables.requested_to'),
          dataIndex: 'requested_to',
          key: 'requested_to',
          width: '1fr',
        },
        {
          title: t('invitationTables.organization'),
          dataIndex: 'requested_to_organization',
          key: 'requested_to_organization',
          width: '2fr',
        },
        {
          title: t(''),
          dataIndex: 'actions',
          key: 'actions',
          width: '2fr',
        },
      ],
    };
  },
});
</script>

<style scoped></style>
