import Filter from '@/utils/data_filters/Filter';
import { snakeToTitleCase } from '@/filters';
import Status from '@/models/Status';
import User from '@/models/User';

export default class WorksiteStatusGroupFilter extends Filter {
  packFunction() {
    const currentUser = User.find(window.vue.$store.getters['auth/userId']);
    const packed = {};
    if (this.data.unclaimed) {
      packed.work_type__claimed_by__isnull = true;
    }

    if (this.data.claimed_by_org) {
      packed.work_type__claimed_by = currentUser.organization.id;
    }

    if (this.data.reported_by_org) {
      packed.reported_by = currentUser.organization.id;
    }

    if (this.data.open) {
      const openStatuses = Status.query()
        .where('primary_state', 'open')
        .get();
      packed.work_type__status__in = openStatuses
        .map(status => status.status)
        .join(',');
    }

    if (this.data.closed) {
      const closedStatuses = Status.query()
        .where('primary_state', 'closed')
        .get();
      packed.work_type__status__in = closedStatuses
        .map(status => status.status)
        .join(',');
    }
    return packed;
  }

  getCount() {
    if (!this.data) {
      return 0;
    }
    const statusGroupEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    return statusGroupEntries.length;
  }

  getFilterLabels() {
    const labels = {};
    Object.entries(this.data)
      .filter(([, value]) => {
        return Boolean(value);
      })
      .forEach(([key]) => {
        labels[key] = `${window.vue.$i18n.t(
          'worksiteFilters.status',
        )}: ${snakeToTitleCase(key)}`;
      });
    return labels;
  }

  removeField(identifier) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
