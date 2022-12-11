import { useI18n } from 'vue-i18n';
import Filter from './Filter';

export default class FormDataFilter extends Filter {
  packFunction() {
    const packed: Record<any, any> = {};
    const dataEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (dataEntries.length > 0) {
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
    for (const [key] of Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    })) {
      const localeMessages = useI18n().t(`formLabels.${key}`);
      labels[key] = `${localeMessages}`;
    }

    return labels;
  }

  removeField(identifier: string) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
