import CCUModel from '@/models/base';

export default class Role extends CCUModel {
  static entity = 'roles';

  id!: number;
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
