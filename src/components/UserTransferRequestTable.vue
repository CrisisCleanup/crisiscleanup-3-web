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
  methods: {
    async approveRequest(requestId) {
      const result = await this.$prompt({
        title: this.$t('~~Approve User Transfer'),
        content: this.$t(
          '~~Please provide a reason for approving this transfer',
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
        title: this.$t('~~Reject User Transfer'),
        content: this.$t(
          '~~Please provide a reason for rejecting this transfer',
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
          title: this.$t('~~Origin Organization'),
          dataIndex: 'origin_organization',
          key: 'origin_organization',
          width: '1fr',
        },
        {
          title: this.$t('~~No of Users'),
          dataIndex: 'child_requests',
          key: 'child_requests',
          width: '1fr',
          transformer: (field) => {
            return field.length;
          },
        },
        {
          title: this.$t('~~No of Cases'),
          dataIndex: 'transfering_wwwtsp_ids',
          key: 'transfering_wwwtsp_ids',
          width: '1fr',
          transformer: (field) => {
            return field.length;
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
