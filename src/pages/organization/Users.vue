<template>
  <div class="flex h-full p-8 m-auto">
    <div class="w-full">
      <div class="flex items-center justify-between w-full">
        <div class="flex py-2">
          <base-input
            v-model="currentSearch"
            icon="search"
            class="w-84 mr-4"
            :placeholder="$t('actions.search')"
            @input="onSearch"
          ></base-input>
          <v-popover
            :auto-hide="false"
            popover-class=""
            placement="bottom-start"
          >
            <div
              class="flex items-center bg-white border p-1 px-4 cursor-pointer mr-64 h-10"
              @click="() => {}"
            >
              Filters
              <font-awesome-icon icon="sort" class="ml-20" />
            </div>
            <div
              slot="popover"
              class="bg-white shadow w-96"
              style="z-index: 1001;"
            >
              <div
                class="flex items-center justify-between bg-crisiscleanup-light-grey p-1 px-2 h-8 w-full"
              >
                Tags
              </div>
              <div class="flex">
                <div class="w-2/5">
                  <div
                    class="p-3 px-4 cursor-pointer"
                    :class="{
                      'border-l-2 border-l-black':
                        currentFilterSection === 'role',
                    }"
                    @click="currentFilterSection = 'role'"
                  >
                    {{ $t('Role') }}
                  </div>
                </div>
                <div class="w-3/5">
                  <div v-if="currentFilterSection === 'role'">
                    Role
                    <div v-for="role in roles">
                      <base-checkbox
                        v-model="filters.roles[role.id]"
                        class="block my-1"
                        @input="onFilter"
                        >{{ role.name_t }}
                      </base-checkbox>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-popover>
        </div>
        <base-button
          :text="$t('~~Invite New User')"
          type="primary"
          class="px-3 py-1"
        />
      </div>
      <div class="flex">
        <div class="w-96">
          <Table
            class="border text-xs"
            :data="users"
            :columns="columns"
            :loading="false"
            hide-header
            @rowClick="
              user => {
                $router.push(`/organization/users/${user.id}`);
              }
            "
          >
            <template #data="slotProps">
              <div class="p-2 flex items-center">
                <img
                  class="rounded-full mr-2 user-image"
                  :src="slotProps.item.profilePictureUrl"
                  :alt="$t('Profile Picture')"
                />
                <div>
                  {{ slotProps.item.full_name }}
                  <div class="text-crisiscleanup-grey-700">
                    {{ slotProps.item.currentRole.name_t }}
                  </div>
                </div>
              </div>
            </template>
            <template #actions="slotProps">
              <div class="flex items-center justify-end w-full">
                <a :href="`mailto:${slotProps.item.email}`">
                  <ccu-icon
                    :alt="$t('actions.chat')"
                    type="chat"
                    class="mx-1"
                    size="large"
                  />
                </a>
                <a :href="`tel:${slotProps.item.mobile}`">
                  <ccu-icon
                    :alt="$t('actions.call')"
                    type="call"
                    class="mx-1"
                    size="small"
                  />
                </a>
                <ccu-icon
                  :alt="$t('actions.find')"
                  type="pin"
                  class="mx-1"
                  size="small"
                />
              </div>
            </template>
          </Table>
        </div>
        <div class="flex-grow">
          <div class="h-full flex flex-col bg-white shadow">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { throttle } from 'lodash';
import User from '@/models/User';
import Role from '@/models/Role';
import Table from '@/components/Table';
import { getQueryString } from '@/utils/urls';

export default {
  name: 'Users',
  components: { Table },
  data() {
    return {
      currentFilterSection: 'role',
      currentSearch: '',
      currentFilter: '',
      filters: {
        roles: {},
      },
      users: [],
      columns: [
        {
          title: '',
          dataIndex: 'data',
          key: 'data',
          width: '2fr',
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          width: '1fr',
        },
      ],
    };
  },
  computed: {
    roles() {
      return Role.all();
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  async mounted() {
    const results = await User.api().get(
      `/users?organization=${this.currentUser.organization.id}`,
      {
        dataKey: 'results',
      },
    );
    this.users = results.entities.users;
  },
  methods: {
    onSearch: throttle(async function(search) {
      const queryParams = {
        search,
        organization: this.currentUser.organization.id,
      };
      const results = await User.api().get(
        `/users?${getQueryString(queryParams)}`,
        {
          dataKey: 'results',
        },
      );
      this.users = results.entities.users;
    }, 300),
    async onFilter() {
      this.currentFilter = {};
      const filteredRoles = Object.entries(this.filters.roles).filter(
        ([, value]) => {
          return Boolean(value);
        },
      );
      if (filteredRoles.length) {
        this.currentFilter.roles__id__in = filteredRoles
          .map(([roleId]) => roleId)
          .join(',');
      }

      const queryParams = {
        organization: this.currentUser.organization.id,
        ...this.currentFilter,
      };

      if (this.currentSearch) {
        queryParams.search = this.currentSearch;
      }

      const results = await User.api().get(
        `/users?${getQueryString(queryParams)}`,
        {
          dataKey: 'results',
        },
      );
      this.users = results.entities.users;
    },
  },
};
</script>

<style scoped>
.layer-action-popover {
  @apply bg-white text-crisiscleanup-dark-100 outline-none w-full border w-auto;
  left: 1px !important;
  z-index: 50000;
}

.map-button.selected {
  @apply bg-gray-300;
}

.user-image {
  width: 50px;
  height: 50px;
}
</style>
