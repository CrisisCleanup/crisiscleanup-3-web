<template>
  <form-select
    :key="user.id"
    class="w-64 border border-crisiscleanup-dark-100"
    :value="selectedRoles"
    multiple
    :options="roles"
    item-key="id"
    label="name_t"
    size="large"
    select-classes="bg-white border text-xs role-select p-1"
    @changed="requestUserRole"
  >
    <template #selected-option="{ option }">
      {{ getRoleText(option) }}
    </template>
  </form-select>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { Collection } from '@vuex-orm/core';
import Role from '@/models/Role';
import UserRole from '@/models/UserRole';
import User from '@/models/User';

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
    const router = useRouter();
    const mutations = mapMutations('auth', ['setAcl']);
    const userRoles = ref<Collection<UserRole>>([]);

    const roles = computed(() => {
      return Role.all();
    });
    const selectedRoles = computed(() => {
      return userRoles.value.map((userRole) => userRole.role);
    });

    onMounted(async () => {
      userRoles.value = await getUserRoles();
    });

    async function getUserRoles() {
      const results = await UserRole.api().get(
        `/user_roles?user=${props.user.id}`,
        { dataKey: 'results' },
      );
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
    async function requestUserRole(role: unknown[]) {
      const currentUserRole = userRoles.value.find(
        (ur) => ur.user_role === role[0],
      );
      if (currentUserRole) {
        // This is the deletion_case case
        await UserRole.api().delete(`/user_roles/${currentUserRole.id}`, {});
      } else {
        await UserRole.api().post(`/user_roles`, {
          user_role: role[0],
          user: props.user.id,
        });
      }

      userRoles.value = await getUserRoles();
      await User.api().get('/users/me', {});
      mutations.setAcl(router);
    }

    return {
      userRoles,
      roles,
      selectedRoles,
      getUserRoles,
      getRoleText,
      requestUserRole,
    };
  },
});
</script>

<style lang="postcss" scoped></style>
