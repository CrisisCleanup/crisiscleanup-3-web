<template>
  <Table
    :columns="columns"
    :data="requests"
    :body-style="{ height: '300px' }"
    :pagination="meta.pagination"
    :loading="loading"
    @change="$emit('change', $event)"
    @rowClick="showContacts"
  >
    <template #actions="slotProps">
      <div class="flex mr-2 justify-end w-full">
        <base-button
          :text="$t('actions.approve')"
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
          variant="outline"
          size="small"
          class="mx-2"
          :action="
            () => {
              rejectRequest(slotProps.item.id);
            }
          "
        />
        <base-button
          :text="$t('~~Edit Organization')"
          variant="outline"
          size="small"
          class="mx-2"
          :action="
            () => {
              $router.push(
                `/admin/organization/${slotProps.item.organization}`,
              );
            }
          "
        />
      </div>
    </template>
  </Table>
</template>

<script>
import Table from '@/components/Table';
import { create } from 'vue-modal-dialogs';
import MessageBox from '@/components/dialogs/MessageBox';

const messageBox = create(MessageBox);
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
    async showContacts(request) {
      const contact = request.requested_by_contact;
      await messageBox({
        title: this.$t('~~Requester'),
        content: `
          <div>${contact.first_name} ${contact.last_name}</div>
          <div>${contact.email}</div>
          <div>${contact.mobile}</div>
          </p>
        `,
      });
    },
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
          title: this.$t('incidentApprovalTable.organization_name'),
          dataIndex: 'organization_name',
          key: 'organization_name',
          width: '1fr',
        },
        {
          title: this.$t('incidentApprovalTable.incident'),
          dataIndex: 'incident_name',
          key: 'incident_name',
          width: '1fr',
        },
        {
          title: this.$t('incidentApprovalTable.requested_at'),
          dataIndex: 'created_at',
          key: 'created_at',
          width: '1fr',
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
