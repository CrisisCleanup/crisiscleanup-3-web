import Filter from './Filter';
import Role from '../../models/Role';

export default class UserRoleFilter extends Filter {
  packFunction() {
    const packed: Record<any, any> = {};
    const filteredRoles = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (filteredRoles.length) {
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
    Object.entries(this.data)
      .filter(([, value]) => {
        return Boolean(value);
      })
      .forEach(([key]) => {
        const { id, name_t } = Role.find(key);
        labels[id] = name_t;
      });
    return labels;
  }

  removeField(identifier: string) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
