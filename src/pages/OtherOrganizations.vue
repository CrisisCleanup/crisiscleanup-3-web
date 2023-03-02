<template>
  <div class="p-10">
    <div
      class="sm:w-3/5 border-primary-dark h-20 border-2 my-4 flex items-center p-2"
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
      v-model="organizations.search"
      icon="search"
      class="sm:w-84 my-2"
      :placeholder="$t('actions.search')"
      @update:modelValue="onSearchInput"
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
              <template
                v-for="contact in slotProps.item.primary_contacts"
                :key="contact.email"
              >
                <div class="my-1">
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
              v-if="slotProps.item.incident_primary_contacts.length > 0"
            >
              {{ $t('otherOrganizations.incident_primary_contacts') }}
            </base-text>
            <div>
              <template
                v-for="contact in slotProps.item.incident_primary_contacts"
                :key="contact.email"
              >
                <div>
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
          <template #popper>
            <div>
              <div class="text-base">
                {{
                  getHighestRole(slotProps.item.approved_roles).data_access_t
                }}
              </div>
              <div class="text-xs mb-2">
                {{
                  getHighestRole(slotProps.item.approved_roles).description_t
                }}
              </div>
              <div class="text-xs">
                {{
                  getHighestRole(slotProps.item.approved_roles).limitations_t
                }}
              </div>
            </div>
          </template>
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
                }&work_type__status__in=${getOpenStatuses()}&created_at__lte=${getCreatedAtLteFilter()}`,
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

<script lang="ts">
import { throttle } from 'lodash';
import moment from 'moment';
import axios from 'axios';
import enums from '../store/modules/enums';
import Table from '@/components/Table.vue';
import { getQueryString } from '@/utils/urls';
import { cachedGet } from '@/utils/promise';
import type Role from '@/models/Role';

export default defineComponent({
  name: 'OtherOrganizations',
  components: { Table },
  setup(props) {
    const store = useStore();
    const { t, locale } = useI18n();

    const loading = ref(false);
    const organizations = reactive({
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
    });
    const organizationRoles = ref<Role[]>([]);

    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );
    const currentUser = computed(() => store.getters['auth/userId']);
    const columns = computed(() => [
      {
        title: t('otherOrganizations.name'),
        dataIndex: 'name',
        key: 'name',
        width: isLandscape() ? '2fr' : '350px',
      },
      {
        title: t('otherOrganizations.access_level'),
        dataIndex: 'approved_roles',
        key: 'approved_roles',
        width: '150px',
      },
      {
        title: t('otherOrganizations.incidents'),
        dataIndex: 'incident_count',
        key: 'incident_count',
        transformer: (item: number) => {
          return item || 0;
        },
        class: 'justify-center',
        headerClass: 'justify-center',
      },
      {
        title: t('otherOrganizations.cases_reported'),
        dataIndex: 'reported_count',
        key: 'reported_count',
        transformer: (item: number) => {
          return item || 0;
        },
        class: 'justify-center',
        headerClass: 'justify-center',
      },
      {
        title: t('otherOrganizations.cases_claimed'),
        dataIndex: 'claimed_count',
        key: 'claimed_count',
        transformer: (item: number) => {
          return item || 0;
        },
        class: 'justify-center',
        headerClass: 'justify-center',
      },
      {
        title: t('otherOrganizations.cases_closed'),
        dataIndex: 'closed_count',
        key: 'closed_count',
        transformer: (item: number) => {
          return item || 0;
        },
        class: 'justify-center',
        headerClass: 'justify-center',
      },
      {
        title: t('otherOrganizations.cases_overdue'),
        dataIndex: 'overdue_count',
        key: 'overdue_count',
        class: 'justify-center',
        headerClass: 'justify-center',
      },
      {
        title: t('otherOrganizations.last_login'),
        dataIndex: 'last_login',
        key: 'last_login',
        class: 'justify-center',
        headerClass: 'justify-center',
        width: '150px',
        transformer: (item: Date) => {
          return moment(item).fromNow();
        },
      },
    ]);

    onMounted(async () => {
      const organizationRolesResponse = await cachedGet(
        `${import.meta.env.VITE_APP_API_BASE_URL}/organization_roles`,
        {},
        `organizations_roles:${locale.value}`,
      );
      organizationRoles.value = organizationRolesResponse.data.results;

      await getOrganizations(organizations.meta);
    });

    const getCreatedAtLteFilter = () => moment().subtract(6, 'd').toISOString();
    function isLandscape() {
      return window.matchMedia(
        'only screen and (max-device-width: 1223px) and (orientation: landscape)',
      ).matches;
    }
    async function getOrganizations(data: Record<string, any> = {}) {
      loading.value = true;
      const pagination = data.pagination || organizations.meta.pagination;
      const params: Record<string, unknown> = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
      };
      if (organizations.search) {
        params.search = organizations.search;
      }
      const queryString = getQueryString(params);

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/incidents/${
          currentIncidentId.value
        }/organizations?${queryString}`,
      );
      organizations.data = response.data.results;
      const newPagination = {
        ...pagination,
        total: response.data.count,
      };
      organizations.meta = {
        pagination: newPagination,
      };
      loading.value = false;
    }
    function getOpenStatuses() {
      enums.state.statuses.filter(
        (status: Record<string, unknown>) => status.primary_state === 'open',
      );
      const openStatuses = enums.state.statuses.filter(
        (status: Record<string, unknown>) => status.primary_state === 'open',
      );
      return openStatuses
        .map((status: Record<string, unknown>) => status.status)
        .join(',');
    }
    async function getOrganizationContacts(organizationId: number) {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/ghost_users?organization=${organizationId}`,
      );
      return response.data.results;
    }
    function getHighestRole(roles: number[]) {
      if (roles.length > 0) {
        return organizationRoles.value.find((role) => roles.includes(role.id));
      }
      return {};
    }
    function onSearchInput() {
      throttle(getOrganizations, 1000)();
    }

    return {
      loading,
      organizations,
      columns,
      organizationRoles,
      currentIncidentId,
      currentUser,
      throttle,
      getCreatedAtLteFilter,
      isLandscape,
      getOrganizations,
      getOpenStatuses,
      getOrganizationContacts,
      getHighestRole,
      onSearchInput,
    };
  },
});
</script>

<style lang="postcss" scoped>
.org-role-popover {
  @apply bg-black text-white p-3 outline-none;
  width: 230px;
  z-index: 1000;
}
</style>
