import Filter from './Filter';
import { snakeToTitleCase } from '../../filters';
import { useI18n } from 'vue-i18n';

export default class WorksiteStatusFilter extends Filter {
  packFunction() {
    const packed = {};
    const statusEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (statusEntries.length) {
      packed.work_type__status__in = statusEntries
        .map(([status]) => status)
        .join(',');
    }
    return packed;
  }

  getCount() {
    if (!this.data) {
      return 0;
    }
    const statusEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    return statusEntries.length;
  }

  getFilterLabels() {
    const labels = {};
    Object.entries(this.data)
      .filter(([, value]) => {
        return Boolean(value);
      })
      .forEach(([key]) => {
        labels[key] = `${useI18n().t(
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
