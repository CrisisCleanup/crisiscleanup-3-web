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
        :text="$t('~~See Events')"
        :alt="$t('~~See Events')"
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
        v-if="currentUser && currentUser.isAdmin"
        :href="`/admin/organization/${slotProps.item.organization.id}`"
        text-variant="bodysm"
        class="px-2"
        >{{ slotProps.item.organization.name }}</base-link
      >
    </template>
  </Table>
</template>

<script>
import Table from '@/components/Table';
import User from '@/models/User';
import axios from 'axios';
import { mapMutations } from 'vuex';
import Role from '@/models/Role';
import { DialogsMixin } from '@/mixins';

export default {
  name: 'UsersTable',
  components: { Table },
  mixins: [DialogsMixin],
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
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  methods: {
    ...mapMutations('auth', ['setUser']),
    getHighestRole(roles) {
      const query = Role.query()
        .whereIdIn(roles)
        .orderBy('level', 'desc')
        .get();
      if (query.length) {
        return query[0].name_t;
      }
      return '';
    },
    async loginAs(userId) {
      const response = await axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/admins/users/login_as`,
        {
          user: userId,
        },
      );
      this.setUser(response.data);
      window.location.reload();
    },
    async showUserEvents(user) {
      await this.$component({
        title: `Events for User ${user.id}: ${user.first_name} ${user.last_name} ${user.email}`,
        component: 'AdminEventStream',
        classes: 'w-full h-96 overflow-auto',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          user: user.id,
          limit: 200,
        },
      });
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('userTable.id'),
          dataIndex: 'id',
          key: 'id',
          width: '0.5fr',
        },
        {
          title: this.$t('userTable.email'),
          dataIndex: 'email',
          key: 'email',
          width: '1.5fr',
        },
        {
          title: this.$t('userTable.first_name'),
          dataIndex: 'first_name',
          key: 'first_name',
          width: '1fr',
        },
        {
          title: this.$t('userTable.last_name'),
          dataIndex: 'last_name',
          key: 'last_name',
          width: '1fr',
        },
        {
          title: this.$t('userTable.mobile'),
          dataIndex: 'mobile',
          key: 'mobile',
          width: '1fr',
        },
        {
          title: this.$t('userTable.organization'),
          dataIndex: 'organization',
          key: 'organization',
          subKey: 'name',
          width: '2fr',
        },
        {
          title: this.$t('userTable.active_roles'),
          dataIndex: 'active_roles',
          key: 'active_roles',
          width: '1fr',
        },
        {
          title: this.$t('userTable.last_sign_in_at'),
          dataIndex: 'last_sign_in_at',
          key: 'last_sign_in_at',
          width: '1fr',
        },
        {
          title: this.$t('userTable.sign_in_count'),
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
};
</script>

<style scoped></style>
