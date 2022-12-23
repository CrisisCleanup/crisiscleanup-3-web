import { Model } from '@vuex-orm/core';

export default class Role extends Model {
  static entity = 'roles';

  id!: string;
  name_t!: string;
  description_t!: string;
  is_active!: boolean;
  permissions!: Record<string, unknown>;
  is_default!: boolean;
  level!: number;
  list_order!: number;
  is_public!: boolean;
  history!: any;

  static fields() {
    return {
      id: this.attr(''),
      name_t: this.string(''),
      description_t: this.string(''),
      level: this.attr(null),
      is_default: this.attr(null),
    };
  }
}
