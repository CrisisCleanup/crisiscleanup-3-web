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
          v-if="slotProps.item.org_verified"
          :title="$t('~~Org Verified')"
          width="18px"
          height="18px"
          class="text-white bg-green-500 mx-1"
          >V</badge
        >
        <badge
          v-if="slotProps.item.is_active"
          :title="$t('~~Active')"
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
          v-if="currentUser.isAdmin"
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

<script>
import Table from '@/components/Table';
import Organization from '@/models/Organization';
import User from '@/models/User';
import OrganizationApprovalDialog from '@/components/dialogs/OrganizationApprovalDialog';
import { create } from 'vue-modal-dialogs';

const responseDialog = create(OrganizationApprovalDialog);

export default {
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
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  async mounted() {
    const organizationRolesResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/organization_roles`,
    );
    this.organizationRoles = organizationRolesResponse.data.results;
  },
  methods: {
    getHighestRole(roles) {
      if (roles.length) {
        return this.organizationRoles.filter((role) =>
          roles.includes(role.id),
        )[0].name_t;
      }
      return '';
    },
    async getOrganizationContacts(organizationId) {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/ghost_users?organization=${organizationId}`,
      );
      return response.data.results;
    },
    async approveOrganization(organizationId) {
      const result = await responseDialog({
        title: this.$t('actions.approve_organization'),
        content: this.$t('orgTable.give_approve_reason'),
      });
      if (result) {
        await Organization.api().approve(organizationId, result);
        this.$emit('reload');
      }
    },
    async rejectOrganization(organizationId) {
      const result = await responseDialog({
        title: this.$t('actions.reject_organization'),
        content: this.$t('orgTable.give_reject_reason'),
      });
      if (result) {
        await Organization.api().reject(organizationId, result);
        this.$emit('reload');
      }
    },
  },
  data() {
    return {
      organizationRoles: [],
      columns: [
        {
          title: this.$t('orgTable.id'),
          dataIndex: 'id',
          key: 'id',
          width: '5%',
        },
        {
          title: this.$t('orgTable.name'),
          dataIndex: 'name',
          key: 'name',
          width: '30%',
        },
        {
          title: this.$t('~~Statuses'),
          dataIndex: 'statuses',
          key: 'statuses',
          width: '15%',
        },
        {
          title: this.$t('orgTable.approved_roles'),
          dataIndex: 'approved_roles',
          key: 'approved_roles',
          width: '15%',
        },
        {
          title: this.$t('orgTable.approved_incidents'),
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
};
</script>

<style scoped></style>
