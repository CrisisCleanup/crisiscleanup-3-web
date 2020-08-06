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

<script>
import Table from '@/components/Table';
import { DialogsMixin } from '../mixins';
import Organization from '../models/Organization';
import User from '../models/User';
import { getStatusName, getWorkTypeName } from '../filters';

export default {
  name: 'UserTransferRequestTable',
  components: { Table },
  mixins: [DialogsMixin],
  props: {
    requests: {
      type: Array,
      default: () => [],
    },
    loading: Boolean,
  },
  async mounted() {
    if (this.requests.length) {
      const organizations = this.requests.map(
        (request) => request.origin_organization,
      );
      await Organization.api().get(
        `/organizations?id__in=${organizations.join(',')}`,
        {
          dataKey: 'results',
        },
      );
      await this.getUsers();
    }
  },
  methods: {
    async getUsers() {
      const userIds = this.requests.map((request) => request.user);
      await User.api().get(`/users?id__in=${userIds.join(',')}`, {
        dataKey: 'results',
      });
    },
    async getChildRequests(childRequests, item) {
      const userIds = childRequests.map((request) => request.user);
      userIds.push(item.user);
      const results = await User.api().get(
        `/users?id__in=${userIds.join(',')}`,
        {
          dataKey: 'results',
        },
      );
      const { users } = results.entities;
      await this.$confirm({
        title: this.$t('userTransfer.transferring_users'),
        content: users
          .map(
            (user) => `
          <div>${user.first_name} ${user.last_name} - ${user.email} - ${user.mobile}</div>
        `,
          )
          .join(''),
        actions: {
          ok: {
            text: this.$t('actions.ok'),
            type: 'solid',
          },
        },
      });
    },
    async getTransferringRequests(requests) {
      const requestIds = requests.map((request) => request);
      const response = await this.$http.get(
        `${
          process.env.VUE_APP_API_BASE_URL
        }/worksite_work_types?id__in=${requestIds.join(',')}`,
      );
      const { results } = response.data;
      await this.$confirm({
        title: this.$t('userTransfer.transferring_cases'),
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
            text: this.$t('actions.ok'),
            type: 'solid',
          },
        },
      });
    },
    async approveRequest(requestId) {
      const result = await this.$prompt({
        title: this.$t('userTransfer.approve_user_transfer'),
        content: this.$t(
          'userTransfer.please_give_approval_reason',
        ),
      });
      if (result) {
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/transfer_requests/${requestId}/respond`,
          {
            action: 'approve',
            accepted_rejected_reason: result,
          },
        );
        this.$emit('reload');
      }
    },
    async rejectRequest(requestId) {
      const result = await this.$prompt({
        title: this.$t('userTransfer.reject_user_transfer'),
        content: this.$t(
          'userTransfer.please_give_reject_reason',
        ),
      });
      if (result) {
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/transfer_requests/${requestId}/respond`,
          {
            action: 'reject',
            accepted_rejected_reason: result,
          },
        );
        this.$emit('reload');
      }
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('userTransfer.origin_organization'),
          dataIndex: 'origin_organization',
          key: 'origin_organization',
          width: '30%',
          transformer: (field) => {
            const organization = Organization.find(field);
            return organization && organization.name;
          },
        },
        {
          title: this.$t('userTransfer.email'),
          dataIndex: 'email',
          key: 'email',
          width: '1.5fr',
          transformer: (_, item) => {
            const user = User.find(item.user);
            return user.email;
          },
        },
        {
          title: this.$t('userTransfer.requested_by'),
          dataIndex: 'full_name',
          key: 'full_name',
          width: '1.5fr',
          transformer: (_, item) => {
            const user = User.find(item.user);
            return `${user.first_name} ${user.last_name}`;
          },
        },
        {
          title: this.$t('userTransfer.user_count'),
          dataIndex: 'child_requests',
          key: 'child_requests',
          width: '1fr',
          class: 'text-primary-dark underline',
          transformer: (field) => {
            return field.length + 1;
          },
          action: (field, item) => {
            this.getChildRequests(field, item);
          },
        },
        {
          title: this.$t('userTransfer.case_count'),
          dataIndex: 'transfering_wwwtsp_ids',
          key: 'transfering_wwwtsp_ids',
          width: '1fr',
          class: 'text-primary-dark underline',
          transformer: (field) => {
            return field.length;
          },
          action: (field) => {
            this.getTransferringRequests(field);
          },
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          width: '2fr',
        },
      ],
    };
  },
};
</script>

<style scoped></style>
