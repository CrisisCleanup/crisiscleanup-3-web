import Filter from './Filter';
import { getWorkTypeName } from '../../filters';
import { useI18n } from 'vue-i18n';

export default class WorksiteFieldsFilter extends Filter {
  packFunction() {
    const packed = {};
    const workTypeEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (workTypeEntries.length) {
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
    const labels = {};
    Object.entries(this.data)
      .filter(([, value]) => {
        return Boolean(value);
      })
      .forEach(([key]) => {
        labels[key] = `${useI18n().t(
          'worksiteFilters.work_type',
        )}: ${getWorkTypeName(key)}`;
      });
    return labels;
  }

  removeField(identifier) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
