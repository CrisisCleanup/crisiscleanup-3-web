<template>
  <div class="p-10">
    <div
      class="
        sm:w-3/5
        border-primary-dark
        h-20
        border-2
        my-4
        flex
        items-center
        p-2
      "
    >
      <span class="text-5xl text-primary-dark mr-4">&#9888;</span>
      <div>
        <base-text variant="h2" :weight="600">
          {{ $t('otherOrganizations.do_not_share_public') }}
        </base-text>
        <base-text>
          {{ $t('otherOrganizations.do_not_abuse_contact_data') }}
        </base-text>
      </div>
    </div>

    <base-input
      :value="organizations.search"
      icon="search"
      class="sm:w-84 my-2"
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
      :body-style="{ height: '300px' }"
      enable-pagination
      :pagination="organizations.meta.pagination"
      :loading="loading"
      @change="getOrganizations"
      class="bg-white border"
      has-row-details
    >
      <template #rowDetails="slotProps">
        <div class="flex p-3">
          <div class="mr-4">
            <base-text variant="h2">
              {{ $t('otherOrganizations.primary_contacts') }}
            </base-text>
            <div
              style="
                display: grid;
                grid-template-columns: max-content max-content max-content;
                grid-column-gap: 10px;
              "
            >
              <template v-for="contact in slotProps.item.primary_contacts">
                <div :key="contact.email" class="my-1">
                  <strong class="font-bold"
                    >{{ contact.first_name }} {{ contact.last_name }}</strong
                  >
                  <div>{{ contact.title ? contact.title : '' }}</div>
                  <div>{{ contact.email }}</div>
                  <div>{{ contact.mobile }}</div>
                </div>
              </template>
            </div>
          </div>
          <div
            style="
              display: grid;
              grid-template-columns: max-content max-content max-content;
              grid-column-gap: 10px;
            "
          >
            <base-text
              variant="h2"
              v-if="slotProps.item.incident_primary_contacts.length"
            >
              {{ $t('otherOrganizations.incident_primary_contacts') }}
            </base-text>
            <div>
              <template
                v-for="contact in slotProps.item.incident_primary_contacts"
              >
                <div :key="contact.email">
                  <strong class="font-bold"
                    >{{ contact.first_name }} {{ contact.last_name }}</strong
                  >
                  <div>{{ contact.title ? contact.title : '' }}</div>
                  <div>{{ contact.email }}</div>
                  <div>{{ contact.mobile }}</div>
                </div>
              </template>
            </div>
          </div>
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
              {{ getHighestRole(slotProps.item.approved_roles).data_access_t }}
            </div>
            <div class="text-xs mb-2">
              {{ getHighestRole(slotProps.item.approved_roles).description_t }}
            </div>
            <div class="text-xs">
              {{ getHighestRole(slotProps.item.approved_roles).limitations_t }}
            </div>
          </div>
        </v-popover>
      </template>
      <template #overdue_count="slotProps">
        <base-button
          class="text-primary-dark underline"
          :action="
            () => {
              $router.push(
                `/incident/${currentIncidentId}/cases/new?showTable=true&work_type__claimed_by=${
                  slotProps.item.id
                }&work_type__status__in=${getOpenStatuses()}&created_at__lte=${$moment()
                  .subtract(6, 'd')
                  .toISOString()}`,
              );
            }
          "
        >
          {{ slotProps.item.overdue_count || 0 }}
        </base-button>
      </template>
    </Table>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { throttle } from 'lodash';
import Table from '@/components/Table';
import User from '@/models/User';
import { getQueryString } from '../utils/urls';
import enums from '../store/modules/enums';
import { cachedGet } from '@/utils/promise';

export default {
  name: 'OtherOrganizations',
  components: { Table },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    columns() {
      return [
        {
          title: this.$t('otherOrganizations.name'),
          dataIndex: 'name',
          key: 'name',
          width: this.isLandscape() ? '2fr' : '350px',
        },
        {
          title: this.$t('otherOrganizations.access_level'),
          dataIndex: 'approved_roles',
          key: 'approved_roles',
          width: '150px',
        },
        {
          title: this.$t('otherOrganizations.incidents'),
          dataIndex: 'incident_count',
          key: 'incident_count',
          transformer: (item) => {
            return item || 0;
          },
          class: 'justify-center',
          headerClass: 'justify-center',
        },
        {
          title: this.$t('otherOrganizations.cases_reported'),
          dataIndex: 'reported_count',
          key: 'reported_count',
          transformer: (item) => {
            return item || 0;
          },
          class: 'justify-center',
          headerClass: 'justify-center',
        },
        {
          title: this.$t('otherOrganizations.cases_claimed'),
          dataIndex: 'claimed_count',
          key: 'claimed_count',
          transformer: (item) => {
            return item || 0;
          },
          class: 'justify-center',
          headerClass: 'justify-center',
        },
        {
          title: this.$t('otherOrganizations.cases_closed'),
          dataIndex: 'closed_count',
          key: 'closed_count',
          transformer: (item) => {
            return item || 0;
          },
          class: 'justify-center',
          headerClass: 'justify-center',
        },
        {
          title: this.$t('otherOrganizations.cases_overdue'),
          dataIndex: 'overdue_count',
          key: 'overdue_count',
          class: 'justify-center',
          headerClass: 'justify-center',
        },
        {
          title: this.$t('otherOrganizations.last_login'),
          dataIndex: 'last_login',
          key: 'last_login',
          class: 'justify-center',
          headerClass: 'justify-center',
          width: '150px',
          transformer: (item) => {
            return this.$moment(item).fromNow();
          },
        },
      ];
    },
    ...mapState('incident', ['currentIncidentId']),
  },
  async mounted() {
    const organizationRolesResponse = await cachedGet(
      `${process.env.VUE_APP_API_BASE_URL}/organization_roles`,
      {},
      'organizations_roles',
    );
    this.organizationRoles = organizationRolesResponse.data.results;

    await this.getOrganizations(this.organizations.meta);
  },
  methods: {
    isLandscape() {
      return window.matchMedia(
        'only screen and (max-device-width: 1223px) and (orientation: landscape)',
      ).matches;
    },
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
    getOpenStatuses() {
      enums.state.statuses.filter((status) => status.primary_state === 'open');
      const openStatuses = enums.state.statuses.filter(
        (status) => status.primary_state === 'open',
      );
      return openStatuses.map((status) => status.status).join(',');
    },
    async getOrganizationContacts(organizationId) {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/ghost_users?organization=${organizationId}`,
      );
      return response.data.results;
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

