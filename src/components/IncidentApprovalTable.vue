<template>
  <Table
    :columns="columns"
    :data="requests"
    :body-style="{ height: '300px' }"
    :pagination="meta.pagination"
    :loading="loading"
    @change="$emit('change', $event)"
  >
    <template #actions="slotProps">
      <div class="flex mr-2 justify-end w-full">
        <base-button
          :text="$t('~~Approve')"
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
          :text="$t('~~Reject')"
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
export default {
  name: 'IncidentApprovalTable',
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
  methods: {
    async approveRequest(requestId) {
      await this.$http.post(
        `${process.env.VUE_APP_API_BASE_URL}/incident_requests/${requestId}/respond`,
        {
          action: 'approve',
        },
      );
      this.$emit('reload');
    },
    async rejectRequest(requestId) {
      await this.$http.post(
        `${process.env.VUE_APP_API_BASE_URL}/incident_requests/${requestId}/respond`,
        {
          action: 'reject',
        },
      );
      this.$emit('reload');
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('~~Organization Name'),
          dataIndex: 'organization_name',
          key: 'organization_name',
        },
        {
          title: this.$t('~~Incident'),
          dataIndex: 'incident_name',
          key: 'incident_name',
        },
        {
          title: this.$t('~~Requested At'),
          dataIndex: 'created_at',
          key: 'created_at',
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
        },
      ],
    };
  },
};
</script>

<style scoped></style>
