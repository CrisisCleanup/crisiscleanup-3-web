import { useI18n } from 'vue-i18n';
import { snakeToTitleCase } from '../../filters';
import Filter from './Filter';

export default class WorksiteStatusFilter extends Filter {
  packFunction() {
    const packed: Record<string, unknown> = {};
    const statusEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (statusEntries.length > 0) {
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
    const labels: Record<string, string> = {};
    for (const [key] of Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    })) {
      labels[key] = `${useI18n().t(
        'worksiteFilters.status',
      )}: ${snakeToTitleCase(key)}`;
    }

    return labels;
  }

  removeField(identifier: string) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
