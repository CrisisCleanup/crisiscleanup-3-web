<template>
  <Table
    :columns="columns"
    :data="organizations"
    :body-style="{ height: '300px' }"
    :pagination="meta.pagination"
    :loading="loading"
    @change="$emit('change', $event)"
    @rowClick="showContacts"
  >
    <template #statuses="slotProps">
      <div class="w-full flex items-center text-primary-dark">
        <font-awesome-icon
          v-if="slotProps.item.profile_completed"
          class="mx-1"
          size="lg"
          icon="check-circle"
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
      </div>
    </template>
    <template #incidents="slotProps">
      <div
        v-if="slotProps.item.incidents.length > 0"
        class="w-full flex items-center"
      >
        {{ getIncidentName(slotProps.item.incidents[0]) }}
      </div>
    </template>
    <template #actions="slotProps">
      <div class="flex mr-2 justify-end w-full items-center">
        <ccu-icon
          v-if="slotProps.item.approved_by"
          v-tooltip="{
            content: `
          <div>Approved by: ${slotProps.item.approved_by}</div>
          <div>Approved at: ${moment(slotProps.item.approved_at).format(
            'ddd MMMM Do YYYY',
          )}</div>
        `,
            triggers: ['hover'],
            popperClass: 'interactive-tooltip w-72',
            html: true,
          }"
          type="help"
          size="lg"
        />
        <ccu-icon
          v-if="slotProps.item.rejected_by"
          v-tooltip="{
            content: `
          <div>Rejected by: ${slotProps.item.rejected_by}</div>
          <div>Rejected at: ${moment(slotProps.item.rejected_at).format(
            'ddd MMMM Do YYYY',
          )}</div>
        `,
            triggers: ['hover'],
            popperClass: 'interactive-tooltip w-72',
            html: true,
          }"
          type="help"
          size="lg"
        />
        <base-button
          v-if="!slotProps.item.approved_by && !slotProps.item.rejected_by"
          :text="$t('actions.approve')"
          :alt="$t('actions.approve')"
          variant="solid"
          size="small"
          class="mx-1"
          :action="
            () => {
              approveOrganization(slotProps.item.id);
            }
          "
        />
        <base-button
          v-if="!slotProps.item.approved_by && !slotProps.item.rejected_by"
          :text="$t('actions.reject')"
          :alt="$t('actions.reject')"
          variant="outline"
          size="small"
          class="mx-1"
          :action="
            () => {
              rejectOrganization(slotProps.item.id);
            }
          "
        />
        <base-link
          v-if="currentUser && currentUser.isAdmin"
          :href="`/admin/organization/${slotProps.item.id}`"
          text-variant="bodysm"
          class="px-1"
          >{{ $t('actions.edit') }}</base-link
        >
      </div>
    </template>
  </Table>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import moment from 'moment/moment';
import Table from '../Table.vue';
import Organization from '../../models/Organization';
import Incident from '../../models/Incident';
import useCurrentUser from '@/hooks/useCurrentUser';
import useDialogs from '@/hooks/useDialogs';

export default defineComponent({
  name: 'OrganizationApprovalTable',
  components: { Table },
  props: {
    organizations: {
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
  emits: ['reload'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { currentUser } = useCurrentUser();
    const { confirm, organizationApproval } = useDialogs();

    async function getOrganizationContacts(organizationId: string) {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/ghost_users?organization=${organizationId}`,
      );
      return response.data.results;
    }
    function getIncidentName(id: string) {
      const incident = Incident.find(id);
      return incident && incident.name;
    }
    async function showContacts(organization: Organization) {
      const contacts = await getOrganizationContacts(organization.id);
      const contact = contacts.length > 0 ? contacts[0] : null;
      await confirm({
        title: t('adminOrganization.organization_contact'),
        content: `
          <div>${contact.first_name} ${contact.last_name}</div>
          <div>${contact.title ?? ''}</div>
          <div>${contact.email}</div>
          <div>${contact.mobile}</div>
          </p>
        `,
      });
    }
    async function approveOrganization(organizationId: string) {
      const result = await organizationApproval({
        title: t('actions.approve_organization'),
        content: t('orgApprovalTable.give_approve_reason'),
      });
      if (result && typeof result !== 'string') {
        await Organization.api().approve(organizationId, result.reason);
        emit('reload');
      }
    }
    async function rejectOrganization(organizationId: string) {
      const result = await organizationApproval({
        title: t('actions.reject_organization'),
        content: t('orgApprovalTable.give_reject_reason'),
      });
      if (result && typeof result !== 'string') {
        await Organization.api().reject(
          organizationId,
          result.reason,
          result.note,
        );
        emit('reload');
      }
    }

    return {
      currentUser,
      getIncidentName,
      showContacts,
      approveOrganization,
      rejectOrganization,
      moment,
      columns: [
        {
          title: t('ID'),
          dataIndex: 'id',
          key: 'id',
          width: 'minmax(75px, 4%)',
        },
        {
          title: t('orgApprovalTable.name'),
          dataIndex: 'name',
          key: 'name',
          width: 'minmax(200px, 12%)',
        },
        {
          title: t('orgApprovalTable.org_statuses'),
          dataIndex: 'statuses',
          key: 'statuses',
          width: 'minmax(75px, 7%)',
        },
        {
          title: t('orgApprovalTable.website'),
          dataIndex: 'url',
          key: 'url',
          class: 'break-all',
          width: 'minmax(125px, 14%)',
        },
        {
          title: t('adminOrganization.admin_notes'),
          dataIndex: 'admin_notes',
          key: 'admin_notes',
          width: 'minmax(200px, 20%)',
        },
        {
          title: t('incidentApprovalTable.incident'),
          dataIndex: 'incidents',
          key: 'incidents',
          width: 'minmax(120px, 15%)',
        },
        {
          title: t('incidentApprovalTable.requested_at'),
          dataIndex: 'created_at',
          key: 'created_at',
          width: 'minmax(120px, 10%)',
          transformer: (requested_at: Date) => {
            return moment(requested_at).fromNow();
          },
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          width: 'minmax(125px, 18%)',
        },
      ],
    };
  },
});
</script>

<style scoped></style>
