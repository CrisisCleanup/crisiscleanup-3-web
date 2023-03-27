<template>
  <Table
    :columns="columns"
    :data="users"
    :body-style="{ height: '300px' }"
    :pagination="meta.pagination"
    :loading="loading"
    @change="$emit('change', $event)"
    enable-pagination
  >
    <template #actions="slotProps">
      <base-button
        :text="$t('actions.login_as')"
        :alt="$t('actions.login_as')"
        variant="solid"
        size="small"
        class="mx-2"
        :action="
          () => {
            loginAs(slotProps.item.id);
          }
        "
      />
      <base-button
        :text="$t('actions.see_events')"
        :alt="$t('actions.see_events')"
        variant="solid"
        size="small"
        class="mx-2"
        :action="
          () => {
            showUserEvents(slotProps.item);
          }
        "
      />
    </template>
    <template #active_roles="slotProps">
      {{ getHighestRole(slotProps.item.active_roles) }}
    </template>
    <template #organization="slotProps">
      <base-link
        v-if="currentUser && currentUser.isAdmin && slotProps.item.organization"
        :href="`/admin/organization/${slotProps.item.organization.id}`"
        text-variant="bodysm"
        class="px-2"
        >{{ slotProps.item.organization.name }}</base-link
      >
    </template>
  </Table>
</template>

<script lang="ts">
import axios from 'axios';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import Table from '../Table.vue';
import Role from '../../models/Role';
import useCurrentUser from '../../hooks/useCurrentUser';
import useDialogs from '../../hooks/useDialogs';
import AdminEventStream from './AdminEventStream.vue';
import User from '@/models/User';

export default defineComponent({
  name: 'UsersTable',
  components: { Table },
  props: {
    users: {
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
  setup() {
    const { t } = useI18n();
    const { currentUser } = useCurrentUser();
    const { component } = useDialogs();
    const store = useStore();

    function getHighestRole(roles: number[]) {
      const query = Role.query()
        .whereIdIn(roles)
        .orderBy('level', 'desc')
        .get();
      if (query.length > 0) {
        return query[0].name_t;
      }
      return '';
    }
    async function loginAs(userId: string) {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/admins/users/login_as`,
        {
          user: userId,
        },
      );
      store.commit('auth/setUser', response.data);
      window.location.replace('/');
    }
    async function showUserEvents(user: User) {
      await component({
        title: `Events for User ${user.id}: ${user.first_name} ${user.last_name} ${user.email}`,
        component: AdminEventStream,
        classes: 'w-full h-96 overflow-auto',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          user: user.id,
          limit: 200,
        },
      });
    }

    return {
      currentUser,
      getHighestRole,
      loginAs,
      showUserEvents,
      columns: [
        {
          title: t('userTable.id'),
          dataIndex: 'id',
          key: 'id',
          width: '0.5fr',
        },
        {
          title: t('userTable.email'),
          dataIndex: 'email',
          key: 'email',
          width: '1.5fr',
        },
        {
          title: t('userTable.first_name'),
          dataIndex: 'first_name',
          key: 'first_name',
          width: '1fr',
        },
        {
          title: t('userTable.last_name'),
          dataIndex: 'last_name',
          key: 'last_name',
          width: '1fr',
        },
        {
          title: t('userTable.mobile'),
          dataIndex: 'mobile',
          key: 'mobile',
          width: '1fr',
        },
        {
          title: t('userTable.organization'),
          dataIndex: 'organization',
          key: 'organization',
          subKey: 'name',
          width: '2fr',
        },
        {
          title: t('userTable.active_roles'),
          dataIndex: 'active_roles',
          key: 'active_roles',
          width: '1fr',
        },
        {
          title: t('userTable.last_sign_in_at'),
          dataIndex: 'last_sign_in_at',
          key: 'last_sign_in_at',
          width: '1fr',
        },
        {
          title: t('userTable.sign_in_count'),
          dataIndex: 'sign_in_count',
          key: 'sign_in_count',
          width: '0.5fr',
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
});
</script>

<style scoped></style>
