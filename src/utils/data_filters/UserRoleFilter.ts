import Role from '../../models/Role';
import Filter from './Filter';

export default class UserRoleFilter extends Filter {
  packFunction() {
    const packed: Record<any, any> = {};
    const filteredRoles = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (filteredRoles.length > 0) {
      packed.role = filteredRoles.map(([roleId]) => roleId).join(',');
    }

    return packed;
  }

  getCount() {
    const filteredRoles = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    return filteredRoles.length;
  }

  getFilterLabels() {
    const labels = {};
    for (const [key] of Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    })) {
      const { id, name_t } = Role.find(key);
      labels[id] = name_t;
    }

    return labels;
  }

  removeField(identifier: string) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
