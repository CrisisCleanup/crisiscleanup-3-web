import Filter from './Filter';
import { useI18n } from 'vue-i18n';

export default class FormDataFilter extends Filter {
  packFunction() {
    const packed: Record<any, any> = {};
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
    const labels: Record<any, any> = {};
    Object.entries(this.data)
      .filter(([, value]) => {
        return Boolean(value);
      })
      .forEach(([key]) => {
        const localeMessages = useI18n().t(`formLabels.${key}`);
        labels[key] = `${localeMessages}`;
      });
    return labels;
  }

  removeField(identifier: string) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
