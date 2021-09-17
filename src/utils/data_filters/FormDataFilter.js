import Filter from '@/utils/data_filters/Filter';

export default class FormDataFilter extends Filter {
  packFunction() {
    const packed = {};
    const dataEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (dataEntries.length) {
      packed.form_data = dataEntries.map(([data]) => `${data}:true`).join(',');
    }
    return packed;
  }

  getCount() {
    if (!this.data) {
      return 0;
    }
    const dataEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    return dataEntries.length;
  }

  getFilterLabels() {
    const labels = {};
    Object.entries(this.data)
      .filter(([, value]) => {
        return Boolean(value);
      })
      .forEach(([key]) => {
        const localeMessages = window.vue.$i18n.t(`formLabels.${key}`);
        labels[key] = `${localeMessages}`;
      });
    return labels;
  }

  removeField(identifier) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
