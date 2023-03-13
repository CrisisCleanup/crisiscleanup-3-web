<template>
  <Table
    :columns="columns"
    :data="organizations"
    :body-style="{ height: '300px' }"
    :pagination="meta.pagination"
    :loading="loading"
    @change="$emit('change', $event)"
    enable-pagination
  >
    <template #statuses="slotProps">
      <div class="w-full flex items-center">
        <font-awesome-icon
          class="mx-1 text-primary-dark"
          size="lg"
          icon="check-circle"
          v-if="slotProps.item.profile_completed"
        />
        <badge
          v-if="slotProps.item.is_verified"
          :title="$t('adminOrganization.org_verified')"
          width="18px"
          height="18px"
          class="text-white bg-green-500 mx-1"
          >V</badge
        >
        <badge
          v-if="slotProps.item.is_active"
          :title="$t('adminOrganization.org_active')"
          width="18px"
          height="18px"
          class="text-white bg-green-500 mx-1"
          >A</badge
        >
      </div>
    </template>
    <template #actions="slotProps">
      <div class="flex mr-2 w-full items-center">
        <base-button
          :text="$t('actions.approve')"
          :alt="$t('actions.approve')"
          variant="solid"
          size="small"
          class="mx-2"
          :action="
            () => {
              approveOrganization(slotProps.item.id);
            }
          "
          v-if="!slotProps.item.approved_by && !slotProps.item.rejected_by"
        />
        <base-button
          :text="$t('actions.reject')"
          :alt="$t('actions.reject')"
          variant="outline"
          size="small"
          class="mx-2"
          :action="
            () => {
              rejectOrganization(slotProps.item.id);
            }
          "
          v-if="!slotProps.item.approved_by && !slotProps.item.rejected_by"
        />
        <base-link
          v-if="currentUser && currentUser.isAdmin"
          :href="`/admin/organization/${slotProps.item.id}`"
          text-variant="bodysm"
          class="px-2"
          >{{ $t('actions.edit') }}</base-link
        >
      </div>
    </template>
    <template #approved_roles="slotProps">
      {{ getHighestRole(slotProps.item.approved_roles) }}
    </template>
    <template #approved_incidents="slotProps">
      {{ slotProps.item.approved_incidents.length }}
    </template>
  </Table>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';
import axios from 'axios';
import Table from '../Table.vue';
import Organization from '../../models/Organization';
import { cachedGet } from '../../utils/promise';
import useCurrentUser from '../../hooks/useCurrentUser';
import useDialogs from '../../hooks/useDialogs';
import { OrganizationRole } from '@/models/types';

export default defineComponent({
  name: 'OrganizationsTable',
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
  setup(props, { emit }) {
    const { t } = useI18n();
    const { currentUser } = useCurrentUser();
    const { organizationApproval } = useDialogs();
    const organizationRoles = ref<OrganizationRole[]>([]);

    function getHighestRole(roles: number[]) {
      if (roles.length > 0) {
        const orgRole = organizationRoles.value.find((role: OrganizationRole) => roles.includes(role.id));
        return orgRole ? orgRole.name_t: '';
      }
      return '';
    }
    async function getOrganizationContacts(organizationId: string) {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/ghost_users?organization=${organizationId}`,
      );
      return response.data.results;
    }
    async function approveOrganization(organizationId: string) {
      const result = await organizationApproval({
        title: t('actions.approve_organization'),
        content: t('orgTable.give_approve_reason'),
      });
      if (result && typeof(result) !== 'string') {
        await Organization.api().approve(organizationId, result.reason);
        emit('reload');
      }
    }
    async function rejectOrganization(organizationId: string) {
      const result = await organizationApproval({
        title: t('actions.reject_organization'),
        content: t('orgTable.give_reject_reason'),
      });
      if (result && typeof(result) !== 'string') {
        await Organization.api().reject(
          organizationId,
          result.reason,
          result.note,
        );
        emit('reload');
      }
    }

    onMounted(async () => {
      const organizationRolesResponse = await cachedGet(
        `${import.meta.env.VITE_APP_API_BASE_URL}/organization_roles`,
        {},
        'organizations_roles',
      );
      organizationRoles.value = organizationRolesResponse.data.results;
    });

    return {
      currentUser,
      organizationRoles,
      getHighestRole,
      approveOrganization,
      rejectOrganization,
      getOrganizationContacts,
      columns: [
        {
          title: t('orgTable.id'),
          dataIndex: 'id',
          key: 'id',
          width: '5%',
        },
        {
          title: t('orgTable.name'),
          dataIndex: 'name',
          key: 'name',
          width: '30%',
        },
        {
          title: t('orgApprovalTable.org_statuses'),
          dataIndex: 'statuses',
          key: 'statuses',
          width: '15%',
        },
        {
          title: t('orgTable.approved_roles'),
          dataIndex: 'approved_roles',
          key: 'approved_roles',
          width: '15%',
        },
        {
          title: t('orgTable.approved_incidents'),
          dataIndex: 'approved_incidents',
          key: 'approved_incidents',
          width: '15%',
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          width: '20%',
        },
      ],
    };
  },
});
</script>

<style scoped></style>
