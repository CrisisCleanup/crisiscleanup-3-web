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
    <template #organization_name="slotProps">
      <base-link
        v-if="currentUser && currentUser.isAdmin"
        :href="`/admin/organization/${slotProps.item.organization}`"
        text-variant="bodysm"
        class="px-2"
        >{{ slotProps.item.organization_name }}</base-link
      >
    </template>
  </Table>
</template>

<script>
import Table from '@/components/Table';
import User from '@/models/User';

export default {
  name: 'GhostUsersTable',
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
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('ghostUserTable.id'),
          dataIndex: 'id',
          key: 'id',
          width: '0.5fr',
        },
        {
          title: this.$t('ghostUserTable.email'),
          dataIndex: 'email',
          key: 'email',
          width: '1.5fr',
        },
        {
          title: this.$t('ghostUserTable.first_name'),
          dataIndex: 'first_name',
          key: 'first_name',
          width: '1fr',
        },
        {
          title: this.$t('ghostUserTable.last_name'),
          dataIndex: 'last_name',
          key: 'last_name',
          width: '1.5fr',
        },
        {
          title: this.$t('ghostUserTable.mobile'),
          dataIndex: 'mobile',
          key: 'mobile',
          width: '1fr',
        },
        {
          title: this.$t('ghostUserTable.organization'),
          dataIndex: 'organization_name',
          key: 'organization_name',
          width: '2fr',
        },
        {
          title: this.$t('ghostUserTable.associated_user'),
          dataIndex: 'associated_user',
          key: 'associated_user',
          width: '1fr',
        },
      ],
    };
  },
};
</script>

<style scoped></style>
