import Filter from './Filter';
import User from '../../models/User';
import { useI18n } from 'vue-i18n';
import { store } from '../../store';

export default class UserLocationsFilter extends Filter {
  packFunction() {
    const currentUser = User.find(store.getters['auth/userId']);
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
            'worksiteFilters.in_primary_response_area',
          );
        }
        if (key === 'organization_secondary_location') {
          labels[key] = window.vue.$t(
            'worksiteFilters.in_secondary_response_area',
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
