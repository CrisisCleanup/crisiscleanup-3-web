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
    <template #created_at="slotProps">
      <div :title="slotProps.item.created_at">
        {{ slotProps.item.created_at | moment('from', 'now') }}
      </div>
    </template>
    <template #organization_statuses="slotProps">
      <div class="w-full flex items-center">
        <font-awesome-icon
          class="mx-1 text-primary-dark"
          size="lg"
          icon="check-circle"
          v-if="slotProps.item.organization_profile_completed"
        />
        <badge
          v-if="slotProps.item.is_verified"
          width="18px"
          height="18px"
          class="text-white bg-green-500 mx-1"
          :title="$t('adminOrganization.org_verified')"
          >V</badge
        >
        <badge
          v-if="slotProps.item.is_active"
          width="18px"
          height="18px"
          class="text-white bg-green-500 mx-1"
          :title="$t('adminOrganization.org_active')"
          >A</badge
        >
        <badge
          v-if="slotProps.item.is_auto_request"
          width="18px"
          height="18px"
          class="text-white bg-blue-500 mx-1"
          :title="$t('adminOrganization.auto_request_new_case')"
          >A</badge
        >
      </div>
    </template>
    <template #actions="slotProps">
      <div class="flex mr-2 justify-end w-full items-center">
        <base-button
          :text="$t('actions.approve')"
          :alt="$t('actions.approve')"
          v-if="slotProps.item.is_verified"
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
          v-if="slotProps.item.is_verified"
          :action="
            () => {
              rejectRequest(slotProps.item.id);
            }
          "
        />
        <base-link
          :href="`/admin/organization/${slotProps.item.organization}`"
          text-variant="bodysm"
        >
          {{ $t('actions.edit_organization') }}
        </base-link>
      </div>
    </template>
  </Table>
</template>

<script>
import { create } from 'vue-modal-dialogs';
import Table from '@/components/Table';
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
        title: this.$t('incidentApprovalTable.requester'),
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
          title: this.$t('orgApprovalTable.org_statuses'),
          dataIndex: 'organization_statuses',
          key: 'organization_statuses',
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
