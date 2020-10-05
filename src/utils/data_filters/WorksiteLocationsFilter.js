import Filter from '@/utils/data_filters/Filter';
import User from '@/models/User';

export default class UserLocationsFilter extends Filter {
  packFunction() {
    const currentUser = User.find(window.vue.$store.getters['auth/userId']);
    const packed = {};
    if (this.data.organization_primary_location) {
      packed.organization_primary_location = currentUser.organization.id;
    }
    if (this.data.organization_secondary_location) {
      packed.organization_secondary_location = currentUser.organization.id;
    }
    const locationEntries = Object.entries(this.data).filter(([key, value]) => {
      return (
        Boolean(value) &&
        ![
          'organization_primary_location',
          'organization_secondary_location',
        ].includes(key)
      );
    });
    if (locationEntries.length) {
      packed.locations = locationEntries.map(([id]) => id).join(',');
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
        labels[key] = `Location: ${key}`;
        if (key === 'organization_primary_location') {
          labels[key] = window.vue.$t(
            '~~Within My Organization Primary Response Area',
          );
        }
        if (key === 'organization_secondary_location') {
          labels[key] = window.vue.$t(
            '~~Within My Organization Secondary Response Area',
          );
        }
      });
    return labels;
  }

  removeField(identifier) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
