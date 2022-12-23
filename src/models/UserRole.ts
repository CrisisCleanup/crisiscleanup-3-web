import { Model } from '@vuex-orm/core';
import type { Config } from '@vuex-orm/plugin-axios';
import Role from './Role';
import type User from './User';

export default class UserRole extends Model {
  static entity = 'user_roles';

  id!: string;
  user_role!: string;
  user!: User;
  approve_rejected_notes!: string;
  approved_by!: User;
  rejected_by!: User;

  static fields() {
    return {
      id: this.attr(''),
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
    return this.role?.name_t;
  }

  get isApproved() {
    return Boolean(this.approved_by);
  }

  static apiConfig: Config = {
    actions: {
      acceptRequest(userRole: UserRole, reason: string): any {
        return this.post(
          `/user_roles/${userRole.id}/respond`,
          {
            action: 'approve',
            approve_rejected_notes: reason,
          },
          { save: false },
        );
      },
      rejectRequest(userRole: UserRole, reason: string): any {
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
