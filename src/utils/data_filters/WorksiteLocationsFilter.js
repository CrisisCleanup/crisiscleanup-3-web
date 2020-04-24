import Filter from '@/utils/data_filters/Filter';
import User from '@/models/User';

export default class UserLocationsFilter extends Filter {
  packFunction() {
    const currentUser = User.find(window.vue.$store.getters['auth/userId']);
    const packed = {};
    if (this.data.organization_bounds) {
      packed.organization_bounds = currentUser.organization.id;
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
        labels[key] = key;
        if (key === 'organization_bounds') {
          labels[key] = window.vue.$t('~~Within My Organization Response Area');
        }
      });
    return labels;
  }

  removeField(identifier) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
