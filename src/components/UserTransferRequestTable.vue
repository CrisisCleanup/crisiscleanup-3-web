<template>
  <Table
    :columns="columns"
    :data="requests"
    :body-style="{ height: '300px' }"
    :loading="loading"
  >
    <template #actions="slotProps">
      <div class="flex mr-2 justify-end w-full items-center">
        <base-button
          :text="$t('actions.approve')"
          :alt="$t('actions.approve')"
          :data-testid="`testApproveUser${slotProps.item.id}TransferRequestButton`"
          variant="solid"
          size="small"
          class="mx-2"
          :action="
            () => {
              approveRequest(slotProps.item.id);
            }
          "
        />
        <base-button
          :text="$t('actions.reject')"
          :alt="$t('actions.reject')"
          :data-testid="`testRejectUser${slotProps.item.id}TransferRequestButton`"
          variant="outline"
          size="small"
          class="mx-2"
          :action="
            () => {
              rejectRequest(slotProps.item.id);
            }
          "
        />
      </div>
    </template>
  </Table>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { onMounted, defineComponent } from 'vue';
import Organization from '../models/Organization';
import User from '../models/User';
import { getStatusName, getWorkTypeName } from '../filters';
import useDialogs from '../hooks/useDialogs';
import Table from './Table.vue';

export default defineComponent({
  name: 'UserTransferRequestTable',
  components: { Table },
  props: {
    requests: {
      type: Array,
      default: () => [],
    },
    loading: Boolean,
  },
  setup(props, { emit }) {
    const { confirm, prompt } = useDialogs();
    const { t } = useI18n();

    async function getChildRequests(childRequests, item) {
      const userIds = childRequests.map((request) => request.user);
      userIds.push(item.user);
      const results = await User.api().get(
        `/users?id__in=${userIds.join(',')}`,
        {
          dataKey: 'results',
        },
      );
      const { users } = results.entities;
      await confirm({
        title: t('userTransfer.transferring_users'),
        content: users
          .map(
            (user) => `
          <div>${user.first_name} ${user.last_name} - ${user.email} - ${user.mobile}</div>
        `,
          )
          .join(''),
        actions: {
          ok: {
            text: t('actions.ok'),
            type: 'solid',
          },
        },
      });
    }

    async function getTransferringRequests(requests) {
      const requestIds = requests.map((request) => request);
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/worksite_work_types?id__in=${requestIds.join(',')}`,
      );
      const { results } = response.data;
      await confirm({
        title: t('userTransfer.transferring_cases'),
        content: results
          .map(
            (work_type) => `
          <div>${work_type.case_number} - ${getWorkTypeName(
              work_type.work_type,
            )} - ${getStatusName(work_type.status)}</div>
        `,
          )
          .join(''),
        actions: {
          ok: {
            text: t('actions.ok'),
            type: 'solid',
          },
        },
      });
    }

    const columns = [
      {
        title: t('userTransfer.origin_organization'),
        dataIndex: 'origin_organization',
        key: 'origin_organization',
        width: '30%',
        transformer(field) {
          const organization = Organization.find(field);
          return organization && organization.name;
        },
      },
      {
        title: t('userTransfer.email'),
        dataIndex: 'email',
        key: 'email',
        width: '1.5fr',
        transformer(_, item) {
          const user = User.find(item.user);
          if (user) {
            return user.email;
          }

          return '';
        },
      },
      {
        title: t('userTransfer.requested_by'),
        dataIndex: 'full_name',
        key: 'full_name',
        width: '1.5fr',
        transformer(_, item) {
          const user = User.find(item.user);
          if (user) {
            return `${user.first_name} ${user.last_name}`;
          }

          return '';
        },
      },
      {
        title: t('userTransfer.user_count'),
        dataIndex: 'child_requests',
        key: 'child_requests',
        width: '1fr',
        class: 'text-primary-dark underline',
        transformer(field) {
          return field.length + 1;
        },
        action(field, item) {
          getChildRequests(field, item);
        },
      },
      {
        title: t('userTransfer.case_count'),
        dataIndex: 'transfering_wwwtsp_ids',
        key: 'transfering_wwwtsp_ids',
        width: '1fr',
        class: 'text-primary-dark underline',
        transformer(field) {
          return field.length;
        },
        action(field) {
          getTransferringRequests(field);
        },
      },
      {
        title: '',
        dataIndex: 'actions',
        key: 'actions',
        width: '2fr',
      },
    ];
    async function getUsers() {
      const userIds = props.requests.map((request) => request.user);
      await User.api().get(`/users?id__in=${userIds.join(',')}`, {
        dataKey: 'results',
      });
    }

    async function approveRequest(requestId) {
      const result = await prompt({
        title: t('userTransfer.approve_user_transfer'),
        content: t('userTransfer.please_give_approval_reason'),
      });
      if (result) {
        await axios.post(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/transfer_requests/${requestId}/respond`,
          {
            action: 'approve',
            accepted_rejected_reason: result,
          },
        );
        emit('reload');
      }
    }

    async function rejectRequest(requestId) {
      const result = await prompt({
        title: t('userTransfer.reject_user_transfer'),
        content: t('userTransfer.please_give_reject_reason'),
      });
      if (result) {
        await axios.post(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/transfer_requests/${requestId}/respond`,
          {
            action: 'reject',
            accepted_rejected_reason: result,
          },
        );
        emit('reload');
      }
    }

    onMounted(async () => {
      if (props.requests.length > 0) {
        const organizations = props.requests.map(
          (request) => request.origin_organization,
        );
        await Organization.api().get(
          `/organizations?id__in=${organizations.join(',')}`,
          {
            dataKey: 'results',
          },
        );
        await getUsers();
      }
    });

    return {
      columns,
      getUsers,
      getChildRequests,
      getTransferringRequests,
      approveRequest,
      rejectRequest,
    };
  },
});
</script>

<style scoped></style>
