<template>
  <div class="p-10">
    <base-input
      :value="organizations.search"
      icon="search"
      class="w-84 my-2"
      :placeholder="$t('actions.search')"
      @input="
        (value) => {
          organizations.search = value;
          throttle(getOrganizations, 1000)();
        }
      "
    ></base-input>

    <Table
      :columns="columns"
      :data="organizations.data"
      :body-style="{ height: '350px' }"
      enable-pagination
      :pagination="organizations.meta.pagination"
      :loading="loading"
      @change="getOrganizations"
      class="bg-white border"
    >
      <template #actions="slotProps">
        <div class="flex mr-2 w-full items-center">
          <base-button
            :text="$t('~~Show Contacts')"
            :alt="$t('~~Show Contacts')"
            variant="solid"
            size="small"
            class="mx-2"
            :action="
              () => {
                showContacts(slotProps.item);
              }
            "
          />
        </div>
      </template>
      <template #approved_roles="slotProps">
        <v-popover popover-class="org-role-popover">
          <base-text class="details-name" variant="body">
            <span :class="`tooltip-target cursor-pointer text-primary-dark`">{{
              getHighestRole(slotProps.item.approved_roles).name_t
            }}</span>
          </base-text>
          <div slot="popover">
            <div class="text-base">
              {{ getHighestRole(slotProps.item.approved_roles).description_t }}
            </div>
            <div class="text-xs">
              {{ getHighestRole(slotProps.item.approved_roles).limitations_t }}
            </div>
          </div>
        </v-popover>
      </template>
    </Table>
  </div>
</template>

<script>
import Table from '@/components/Table';
import Organization from '@/models/Organization';
import User from '@/models/User';
import OrganizationApprovalDialog from '@/components/dialogs/OrganizationApprovalDialog';
import { create } from 'vue-modal-dialogs';
import MessageBox from '@/components/dialogs/MessageBox';
import { mapState } from 'vuex';
import { throttle } from 'lodash';
import { getQueryString } from '../utils/urls';

const messageBox = create(MessageBox);
const responseDialog = create(OrganizationApprovalDialog);

export default {
  name: 'OtherOrganizations',
  components: { Table },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    ...mapState('incident', ['currentIncidentId']),
  },
  async mounted() {
    const organizationRolesResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/organization_roles`,
    );
    this.organizationRoles = organizationRolesResponse.data.results;

    await this.getOrganizations(this.organizations.meta);
  },
  methods: {
    async getOrganizations(data = {}) {
      this.loading = true;
      const pagination = data.pagination || this.organizations.meta.pagination;
      const params = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
      };
      if (this.organizations.search) {
        params.search = this.organizations.search;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/incidents/${this.currentIncidentId}/organizations?${queryString}`,
      );
      this.organizations.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      this.organizations.meta = {
        pagination: newPagination,
      };
      this.loading = false;
    },
    async getOrganizationContacts(organizationId) {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/ghost_users?organization=${organizationId}`,
      );
      return response.data.results;
    },
    async showContacts(organization) {
      const { primary_contacts, incident_primary_contacts } = organization;
      let content = '';

      primary_contacts.forEach((contact) => {
        content = `${content}<strong class="font-bold">${contact.first_name} ${
          contact.last_name
        }</strong>
          <div>${contact.title ? contact.title : ''}</div>
          <div>${contact.email}</div>
          <div>${contact.mobile}</div>
          </p>`;
      });

      incident_primary_contacts.forEach((contact) => {
        content = `${content}<strong class="font-bold">${contact.first_name} ${
          contact.last_name
        }</strong>
          <div>${contact.title ? contact.title : ''}</div>
          <div>${contact.email}</div>
          <div>${contact.mobile}</div>
          </p>`;
      });

      await messageBox({
        title: this.$t('adminOrganization.organization_contact'),
        content,
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
    getHighestRole(roles) {
      if (roles.length) {
        return this.organizationRoles.filter((role) =>
          roles.includes(role.id),
        )[0];
      }
      return {};
    },
  },
  data() {
    return {
      throttle,
      columns: [
        {
          title: this.$t('~~Name'),
          dataIndex: 'name',
          key: 'name',
          width: '350px',
        },
        {
          title: this.$t('~~Organization Role'),
          dataIndex: 'approved_roles',
          key: 'approved_roles',
          width: '150px',
          class: 'justify-center',
        },
        {
          title: this.$t('~~Cases Reported'),
          dataIndex: 'reported_count',
          key: 'reported_count',
          class: 'justify-center',
        },
        {
          title: this.$t('~~Incidents'),
          dataIndex: 'incident_count',
          key: 'incident_count',
          class: 'justify-center',
        },
        {
          title: this.$t('~~Cases Claimed'),
          dataIndex: 'claimed_count',
          key: 'claimed_count',
          class: 'justify-center',
        },
        {
          title: this.$t('~~Cases Closed'),
          dataIndex: 'closed_count',
          key: 'closed_count',
          class: 'justify-center',
        },
        {
          title: this.$t('~~Cases Overdue'),
          dataIndex: 'overdue_count',
          key: 'overdue_count',
          class: 'justify-center',
        },
        {
          title: this.$t('~~Last Login'),
          dataIndex: 'last_login',
          key: 'last_login',
          class: 'justify-center',
          width: '150px',
          formatter: (item) => {
            return this.$moment(item).fromNow();
          },
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          width: '175px',
        },
      ],
      loading: false,
      organizations: {
        data: [],
        meta: {
          pagination: {
            pageSize: 50,
            page: 1,
            current: 1,
          },
        },
        search: '',
        visible: true,
      },
      organizationRoles: [],
    };
  },
};
</script>

<style>
.org-role-popover {
  @apply bg-black text-white p-3 outline-none;
  width: 230px;
  z-index: 1000;
}
</style>
