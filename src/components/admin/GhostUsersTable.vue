<template>
  <Table
    :columns="columns"
    :data="users"
    :body-style="{ height: '300px' }"
    :pagination="meta.pagination"
    :loading="loading"
    enable-pagination
    @change="$emit('change', $event)"
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

<script lang="ts">
import { useI18n } from 'vue-i18n';
import Table from '../Table.vue';
import useCurrentUser from '../../hooks/useCurrentUser';

export default defineComponent({
  name: 'GhostUsersTable',
  components: { Table },
  props: {
    users: {
      type: Array,
      default: () => [],
    },
    meta: {
      type: Object,
      default() {
        return {};
      },
    },
    loading: Boolean,
  },
  setup() {
    const { t } = useI18n();
    const { currentUser } = useCurrentUser();
    return {
      currentUser,
      columns: [
        {
          title: t('ghostUserTable.id'),
          dataIndex: 'id',
          key: 'id',
          width: '0.5fr',
        },
        {
          title: t('ghostUserTable.email'),
          dataIndex: 'email',
          key: 'email',
          width: '1.5fr',
        },
        {
          title: t('ghostUserTable.first_name'),
          dataIndex: 'first_name',
          key: 'first_name',
          width: '1fr',
        },
        {
          title: t('ghostUserTable.last_name'),
          dataIndex: 'last_name',
          key: 'last_name',
          width: '1.5fr',
        },
        {
          title: t('ghostUserTable.mobile'),
          dataIndex: 'mobile',
          key: 'mobile',
          width: '1fr',
        },
        {
          title: t('ghostUserTable.organization'),
          dataIndex: 'organization_name',
          key: 'organization_name',
          width: '2fr',
        },
        {
          title: t('ghostUserTable.associated_user'),
          dataIndex: 'associated_user',
          key: 'associated_user',
          width: '1fr',
        },
      ],
    };
  },
});
</script>

<style scoped></style>
