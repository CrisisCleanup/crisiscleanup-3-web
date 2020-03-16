import { Model } from '@vuex-orm/core';
import Role from './Role';

export default class UserRole extends Model {
  static entity = 'user_roles';

  static fields() {
    return {
      id: this.attr(),
      user_role: this.attr(null),
      user: this.attr(null),
      approve_rejected_notes: this.attr(null),
      approved_by: this.attr(null),
      rejected_by: this.attr(null),
    };
  }

  get role() {
    return Role.find(this.user_role);
  }

  get role_name() {
    return this.role.name_t;
  }

  get isApproved() {
    return Boolean(this.approved_by);
  }

  static apiConfig = {
    actions: {
      acceptRequest(userRole, reason) {
        return this.post(
          `/user_roles/${userRole.id}/respond`,
          {
            action: 'approve',
            approve_rejected_notes: reason,
          },
          { save: false },
        );
      },
      rejectRequest(userRole, reason) {
        return this.post(
          `/user_roles/${userRole.id}/respond`,
          {
            action: 'reject',
            approve_rejected_notes: reason,
          },
          { save: false },
        );
      },
    },
  };
}
