import { Model } from '@vuex-orm/core';

export default class OrganizationRole extends Model {
  static entity = 'organization_roles';

  static fields() {
    return {
      id: this.attr(),
      name_t: this.string(''),
    };
  }
}
