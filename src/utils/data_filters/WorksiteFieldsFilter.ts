import { useI18n } from 'vue-i18n';
import { getWorkTypeName } from '../../filters';
import Filter from './Filter';

export default class WorksiteFieldsFilter extends Filter {
  packFunction() {
    const packed: Record<string, unknown> = {};
    const workTypeEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (workTypeEntries.length > 0) {
      packed.work_type__work_type__in = workTypeEntries
        .map(([workType]) => workType)
        .join(',');
    }

    return packed;
  }

  getCount() {
    if (!this.data) {
      return 0;
    }

    const filteredFields = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    return filteredFields.length;
  }

  getFilterLabels() {
    const labels: Record<string, unknown> = {};
    for (const [key] of Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    })) {
      labels[key] = `${useI18n().t(
        'worksiteFilters.work_type',
      )}: ${getWorkTypeName(key)}`;
    }

    return labels;
  }

  removeField(identifier: string) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
