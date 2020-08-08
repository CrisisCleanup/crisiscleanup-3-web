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
    <template #profile_completed="slotProps">
      <div class="w-full flex items-center text-primary-dark">
        <font-awesome-icon
          class="mx-1"
          size="lg"
          icon="check-circle"
          v-if="slotProps.item.profile_completed"
        />
      </div>
    </template>
    <template #incidents="slotProps">
      <div
        class="w-full flex items-center text-primary-dark link underline"
        @click="
          () => {
            showAssociatedIncidents(slotProps.item.incidents);
          }
        "
      >
        {{ slotProps.item.incidents.length }}
      </div>
    </template>
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
              approveOrganization(slotProps.item.id);
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
              rejectOrganization(slotProps.item.id);
            }
          "
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
  </Table>
</template>

<script>
import Table from '@/components/Table';
import Organization from '@/models/Organization';
import User from '@/models/User';
import OrganizationApprovalDialog from '@/components/dialogs/OrganizationApprovalDialog';
import { create } from 'vue-modal-dialogs';
import MessageBox from '@/components/dialogs/MessageBox';
import { DialogsMixin } from '../mixins';
import Incident from '../models/Incident';

const messageBox = create(MessageBox);
const responseDialog = create(OrganizationApprovalDialog);

export default {
  name: 'OrganizationApprovalTable',
  mixins: [DialogsMixin],
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
  methods: {
    async getOrganizationContacts(organizationId) {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/ghost_users?organization=${organizationId}`,
      );
      return response.data.results;
    },
    async showAssociatedIncidents(incidents) {
      await this.$component({
        title: this.$t('~~Associated Incidents'),
        component: 'IncidentList',
        classes: 'w-full h-48',
        props: {
          incidents: Incident.query().whereIdIn(incidents).get(),
        },
      });
    },
    async showContacts(organization) {
      const contacts = await this.getOrganizationContacts(organization.id);
      const contact = contacts.length ? contacts[0] : null;
      await messageBox({
        title: this.$t('adminOrganization.organization_contact'),
        content: `
          <div>${contact.first_name} ${contact.last_name}</div>
          <div>${contact.title ? contact.title : ''}</div>
          <div>${contact.email}</div>
          <div>${contact.mobile}</div>
          </p>
        `,
      });
    },
    async approveOrganization(organizationId) {
      const result = await responseDialog({
        title: this.$t('actions.approve_organization'),
        content: this.$t('orgApprovalTable.give_approve_reason'),
      });
      if (result) {
        await Organization.api().approve(organizationId, result);
        this.$emit('reload');
      }
    },
    async rejectOrganization(organizationId) {
      const result = await responseDialog({
        title: this.$t('actions.reject_organization'),
        content: this.$t('orgApprovalTable.give_reject_reason'),
      });
      if (result) {
        await Organization.api().reject(organizationId, result);
        this.$emit('reload');
      }
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('ID'),
          dataIndex: 'id',
          key: 'id',
          width: '0.5fr',
        },
        {
          title: this.$t('orgApprovalTable.name'),
          dataIndex: 'name',
          key: 'name',
          width: '1.5fr',
        },
        {
          title: this.$t('orgApprovalTable.profile_complete'),
          dataIndex: 'profile_completed',
          key: 'profile_completed',
          width: '1fr',
        },
        {
          title: this.$t('orgApprovalTable.website'),
          dataIndex: 'url',
          key: 'url',
          width: '1fr',
        },
        {
          title: this.$t('adminOrganization.admin_notes'),
          dataIndex: 'admin_notes',
          key: 'admin_notes',
          width: '2fr',
        },
        {
          title: this.$t('Associated Incidents'),
          dataIndex: 'incidents',
          key: 'incidents',
          width: '1fr',
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          width: '1.5fr',
        },
      ],
    };
  },
};
</script>

<style scoped></style>
