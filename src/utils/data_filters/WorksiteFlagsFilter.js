import Filter from '@/utils/data_filters/Filter';

export default class WorksiteFlagsFilter extends Filter {
  packFunction() {
    const packed = {};
    const flagEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (flagEntries.length) {
      packed.flags = flagEntries.map(([flag]) => flag).join(',');
    }
    return packed;
  }

  getCount() {
    if (!this.data) {
      return 0;
    }
    const flagEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    return flagEntries.length;
  }

  getFilterLabels() {
    const labels = {};
    Object.entries(this.data)
      .filter(([, value]) => {
        return Boolean(value);
      })
      .forEach(([key]) => {
        labels[key] = `${window.vue.$i18n.t(
          'worksiteFilters.flag',
        )}: ${window.vue.$i18n.t(key)}`;
      });
    return labels;
  }

  removeField(identifier) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
