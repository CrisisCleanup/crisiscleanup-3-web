import { useI18n } from 'vue-i18n';
import Filter from './Filter';

export default class WorksiteFlagsFilter extends Filter {
  packFunction() {
    const packed = {};
    const flagEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (flagEntries.length > 0) {
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
    for (const [key] of Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    })) {
      labels[key] = `${useI18n().t('worksiteFilters.flag')}: ${useI18n().t(
        key,
      )}`;
    }

    return labels;
  }

  removeField(identifier) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
