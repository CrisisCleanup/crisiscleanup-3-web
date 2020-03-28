<template>
  <form-select
    class="w-64 border border-crisiscleanup-dark-100"
    :value="selectedRoles"
    @changed="requestUserRole"
    multiple
    :options="roles"
    item-key="id"
    label="name_t"
    size="large"
    select-classes="bg-white border text-xs role-select p-1"
  >
    <template #selected-option="{ option }">
      {{ getRoleText(option) }}
    </template>
  </form-select>
</template>
<script>
import VueTypes from 'vue-types';
import Role from '@/models/Role';
import UserRole from '@/models/UserRole';

export default {
  name: 'UserRolesSelect',
  data() {
    return {
      userRoles: [],
    };
  },
  async mounted() {
    this.userRoles = await this.getUserRoles();
  },
  computed: {
    roles() {
      return Role.all();
    },
    selectedRoles() {
      return this.userRoles.map(userRole => userRole.role);
    },
  },
  methods: {
    async getUserRoles() {
      const results = await UserRole.api().get(
        `/user_roles?user=${this.user.id}`,
        {
          dataKey: 'results',
        },
      );
      const { user_roles } = results.entities || [];
      return user_roles;
    },
    getRoleText(option) {
      let text = option.name_t;
      const currentUserRole = this.userRoles.find(
        ur => ur.user_role === option.id,
      );
      if (currentUserRole && !currentUserRole.isApproved) {
        text = `${text} (${this.$t('userRolesSelect.pending')})`;
      }
      return text;
    },
    async requestUserRole(role) {
      const currentUserRole = this.userRoles.find(
        ur => ur.user_role === role[0],
      );
      if (currentUserRole) {
        //This is the deletion_case case
        await UserRole.api().delete(`/user_roles/${currentUserRole.id}`, {});
      } else {
        await UserRole.api().post(`/user_roles`, {
          user_role: role[0],
          user: this.user.id,
        });
      }

      this.userRoles = await this.getUserRoles();
    },
  },
  props: {
    user: VueTypes.object.required,
  },
};
</script>
