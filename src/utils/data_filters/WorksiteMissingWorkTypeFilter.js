import Filter from '@/utils/data_filters/Filter';
import { snakeToTitleCase } from '@/filters';

export default class WorksiteMissingWorkTypeFilter extends Filter {
  packFunction() {
    const packed = {};
    if (this.data.missing_work_type) {
      packed.missing_work_type = true;
    }
    return packed;
  }

  getCount() {
    if (!this.data) {
      return 0;
    }
    const entries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    return entries.length;
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
