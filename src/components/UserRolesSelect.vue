<template>
  <base-select
    :key="user.id"
    v-model="selectedRoleIds"
    class="border border-crisiscleanup-dark-100"
    multiple
    searchable
    :clearable="false"
    mode="tags"
    :options="roles"
    item-key="id"
    label="name_t"
    size="large"
    :loading="selectInputLoading"
    select-classes="bg-white border text-xs role-select p-1"
    @changed="updateUserRoles"
  >
    <template #selected-option="{ option }">
      {{ getRoleText(option) }}
    </template>
  </base-select>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { Collection } from '@vuex-orm/core';
import Role from '@/models/Role';
import UserRole from '@/models/UserRole';
import type User from '@/models/User';

export default defineComponent({
  name: 'UserRolesSelect',
  props: {
    user: {
      type: Object as PropType<User>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const selectInputLoading = ref(false);
    const userRoles = ref<Collection<UserRole>>([]);
    const selectedRoleIds = ref<number[]>([]);

    const roles = computed(() => {
      return Role.all();
    });

    onMounted(async () => {
      await updateUserRoleData();
    });

    async function updateUserRoleData() {
      userRoles.value = await getUserRoles();
      selectedRoleIds.value = userRoles.value
        .map((userRole) => userRole.role?.id)
        .filter(Boolean) as number[];
    }

    async function getUserRoles() {
      const results = await UserRole.api().get(
        `/user_roles?user=${props.user.id}`,
        { dataKey: 'results' },
      );
      console.log('results', results);
      return (results.entities?.user_roles || []) as Collection<UserRole>;
    }

    function getRoleText(option: Role) {
      let text = option.name_t;
      const currentUserRole = userRoles.value.find(
        (ur: UserRole) => ur.user_role === option.id,
      );
      if (currentUserRole && !currentUserRole.isApproved) {
        text = `${text} (${t('userRolesSelect.pending')})`;
      }

      return text;
    }

    async function updateUserRoles(roleIds: number[]) {
      const currentRoles = userRoles.value;
      const rolesToAdd = roleIds.filter(
        (id) => id && !currentRoles.map((ur) => ur.role?.id).includes(id),
      );
      const rolesToRemove = currentRoles
        .map((ur) => ur.role?.id)
        .filter((id) => id && !roleIds.includes(id));
      const payload: {
        method: 'post' | 'delete';
        url: string;
        data: Record<string, unknown>;
      }[] = [];
      for (const roleId of rolesToAdd) {
        payload.push({
          method: 'post',
          url: '/user_roles',
          data: {
            user_role: roleId,
            user: props.user.id,
          },
        });
      }

      for (const roleId of rolesToRemove) {
        payload.push({
          method: 'delete',
          url: `/user_roles/${
            currentRoles.find((ur) => ur.role?.id === roleId)?.id
          }`,
          data: {},
        });
      }

      console.log('payload', payload);
      selectInputLoading.value = true;
      await Promise.all(
        payload.map((p) => UserRole.api()[p.method](p.url, p.data)),
      );
      await updateUserRoleData();
      selectInputLoading.value = false;
    }

    return {
      selectInputLoading,
      userRoles,
      roles,
      selectedRoleIds,
      getUserRoles,
      getRoleText,
      updateUserRoles,
    };
  },
});
</script>

<style lang="postcss" scoped></style>
